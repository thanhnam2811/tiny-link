import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@prisma/client';

describe('GET /api/stats/:code Stats API', () => {
	let app: FastifyInstance;
	const prisma = new PrismaClient();

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
		await prisma.$disconnect();
	});

	it('should return 404 for non-existent link', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/stats/missing-code',
		});

		expect(response.statusCode).toBe(404);
	});

	it('should return correct click stats with direct DB seeding', async () => {
		const shortCode = 'stats-test-code';

		// 1. Create Link
		const link = await prisma.link.create({
			data: {
				originalUrl: 'https://example.com/stats',
				shortCode,
			},
		});

		// 2. Direct Seeding: Insert 3 clicks via Prisma
		await prisma.click.createMany({
			data: [
				{ linkId: link.id, userAgent: 'test-1', ipAddress: '1.1.1.1', country: 'US', city: 'Los Angeles' },
				{ linkId: link.id, userAgent: 'test-2', ipAddress: '2.2.2.2', country: 'US', city: 'New York' },
				{ linkId: link.id, userAgent: 'test-3', ipAddress: '3.3.3.3', country: 'VN', city: 'Ho Chi Minh City' },
			],
		});

		// 2b. Manually update clicksCount since we are bypassing the application logic (AnalyticsManager)
		await prisma.link.update({
			where: { id: link.id },
			data: { clicksCount: 3 },
		});

		// 3. Call Stats API
		const response = await app.inject({
			method: 'GET',
			url: `/api/stats/${shortCode}`,
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();

		expect(body.shortCode).toBe(shortCode);
		expect(body.totalClicks).toBe(3);
		expect(body.originalUrl).toBe('https://example.com/stats');
		expect(body.createdAt).toBeTypeOf('string');

		// Assert Geo Stats
		expect(body.geo.countries['US']).toBe(2);
		expect(body.geo.countries['VN']).toBe(1);
		expect(body.geo.cities['Los Angeles']).toBe(1);
		expect(body.geo.cities['New York']).toBe(1);
		expect(body.geo.cities['Ho Chi Minh City']).toBe(1);
	});
});
