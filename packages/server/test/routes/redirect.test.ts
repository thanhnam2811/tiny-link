import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@prisma/client';
import { AnalyticsManager } from '../../src/modules/analytics/analytics_manager';

describe('GET /:code Redirect API', () => {
	let app: FastifyInstance;
	const prisma = new PrismaClient();

	let analyticsManager: AnalyticsManager;

	beforeAll(async () => {
		const { server, analyticsManager: manager } = await buildServer();
		app = server;
		analyticsManager = manager;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
		await prisma.$disconnect();
	});

	it('should redirect to the original URL and track a click', async () => {
		// Mock a link in DB first
		const testLink = await prisma.link.create({
			data: {
				originalUrl: 'https://vitest.dev',
				shortCode: 'vitest-redir',
			},
		});

		// Execute redirect
		const response = await app.inject({
			method: 'GET',
			url: `/${testLink.shortCode}`,
			remoteAddress: '10.0.0.1', // The Proxy's IP
			headers: {
				'user-agent': 'vitest-test-agent',
				'X-Forwarded-For': '192.168.1.100', // The real client IP
			},
		});

		// Assert Redirect logic
		expect(response.statusCode).toBe(302);
		expect(response.headers.location).toBe('https://vitest.dev');

		// Wait for the background tracking (Fire-and-forget in service)
		// Since we use AnalyticsManager with queue, we need to manually flush for test
		await analyticsManager.flush();

		// Assert Analytics logic
		const clicks = await prisma.click.findMany({
			where: { linkId: testLink.id },
		});
		expect(clicks.length).toBe(1);
		expect(clicks[0].ipAddress).toBe('10.0.0.1'); // Matches the mock remoteAddress
		expect(clicks[0].userAgent).toBe('vitest-test-agent');
	});

	it('should return 404 for a non-existent short code', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/not-found-code',
		});

		expect(response.statusCode).toBe(404);
	});
});
