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
				'X-Forwarded-For': '8.8.8.8', // The real client IP (Google DNS -> US)
			},
		});

		// Assert Redirect logic
		expect(response.statusCode).toBe(302);
		expect(response.headers.location).toBe('https://vitest.dev');

		// Wait for the background tracking (Fire-and-forget in service)
		// Since we use AnalyticsManager with queue, we need to manually flush for test
		await new Promise((resolve) => setTimeout(resolve, 50));
		await analyticsManager.flush();

		// Assert Analytics logic
		const clicks = await prisma.click.findMany({
			where: { linkId: testLink.id },
		});
		expect(clicks.length).toBe(1);
		expect(clicks[0].ipAddress).toBe('8.8.8.8'); // Handled by trustProxy
		expect(clicks[0].userAgent).toBe('vitest-test-agent');
		expect(clicks[0].country).toBe('US'); // Handled by geoip-lite in AnalyticsManager
	});

	it('should return 404 for a non-existent short code', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/not-found-code',
		});

		expect(response.statusCode).toBe(404);
	});

	it('should strictly limit redirects and return 410 Gone when maxClicks is reached', async () => {
		// Mock a link in DB with maxClicks = 2
		const testLink = await prisma.link.create({
			data: {
				originalUrl: 'https://strict-limit.dev',
				shortCode: 'limited-link',
				maxClicks: 2,
			},
		});

		// 1st request -> Success
		const response1 = await app.inject({ method: 'GET', url: `/${testLink.shortCode}` });
		expect(response1.statusCode).toBe(302);

		// 2nd request -> Success
		const response2 = await app.inject({ method: 'GET', url: `/${testLink.shortCode}` });
		expect(response2.statusCode).toBe(302);

		// 3rd request -> Should be 410 Gone
		const response3 = await app.inject({ method: 'GET', url: `/${testLink.shortCode}` });
		expect(response3.statusCode).toBe(410);
		expect(response3.json().message).toBe('Link has self-destructed due to reaching max clicks');
	});

	it('should return 410 Gone when a link expires based on expiresAt', async () => {
		// Mock an expired link in DB
		const pastDate = new Date();
		pastDate.setDate(pastDate.getDate() - 1); // 1 day ago

		const testLink = await prisma.link.create({
			data: {
				originalUrl: 'https://expired.dev',
				shortCode: 'expired-link',
				expiresAt: pastDate,
			},
		});

		// 1st request -> Should be 410 Gone immediately
		const response1 = await app.inject({ method: 'GET', url: `/${testLink.shortCode}` });
		expect(response1.statusCode).toBe(410);
		expect(response1.json().message).toBe('Link has self-destructed');

		// 2nd request -> Should still be 410 Gone (Negative Caching test)
		const response2 = await app.inject({ method: 'GET', url: `/${testLink.shortCode}` });
		expect(response2.statusCode).toBe(410);
		expect(response2.json().message).toBe('Link has self-destructed');
	});
});
