import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { AnalyticsManager } from '../../src/modules/analytics/analytics_manager';
import { buildServer } from '../../src/index';

describe('Phase 12 Stage 2: Admin System Health', () => {
	let app: FastifyInstance;
	let analyticsManager: AnalyticsManager;
	let adminToken: string;

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';

		const built = await buildServer();
		app = built.server;
		analyticsManager = built.analyticsManager;
		await app.ready();

		// Mint an admin JWT directly (same claim /admin/login issues) so this test
		// doesn't depend on ADMIN_PASSWORD, which CI's generated .env.test omits.
		adminToken = app.jwt.sign({ role: 'admin' });
	});

	afterAll(async () => {
		await app.close();
	});

	it('rejects requests without a valid admin JWT', async () => {
		const response = await app.inject({ method: 'GET', url: '/api/admin/health' });
		expect(response.statusCode).toBe(401);
	});

	it('reports live Redis/Postgres status and queue stats', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/admin/health',
			headers: { authorization: `Bearer ${adminToken}` },
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();

		expect(body.redis.status).toBe('up');
		expect(body.redis.latencyMs).toBeTypeOf('number');
		expect(body.postgres.status).toBe('up');
		expect(body.postgres.latencyMs).toBeTypeOf('number');

		expect(body.queue.maxSize).toBe(10000);
		expect(body.queue.processMemoryMb).toBeGreaterThan(0);
	});

	it('reflects queue backlog when events are pushed', async () => {
		const before = analyticsManager.getQueueStats().depth;

		analyticsManager.push({ linkId: 'health-test-link-1' });
		analyticsManager.push({ linkId: 'health-test-link-2' });

		const response = await app.inject({
			method: 'GET',
			url: '/api/admin/health',
			headers: { authorization: `Bearer ${adminToken}` },
		});

		expect(response.json().queue.depth).toBe(before + 2);
	});
});
