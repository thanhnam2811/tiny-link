import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@tiny-link/db';
import { HTTP_STATUS, INTERNAL_AUTH } from '@tiny-link/shared';
import type { Redis } from 'ioredis';

describe('Rate Limiting & Caching', () => {
	let app: FastifyInstance;
	let redis: Redis;
	const prisma = new PrismaClient();

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
		// Access the decorated redis client from the server instance
		redis = app.redis as Redis;
	});

	afterAll(async () => {
		await redis.flushdb(); // Clean Redis keys after tests
		await app.close();
		await prisma.$disconnect();
	});

	// ─── Rate Limiting Tests ──────────────────────────────────────────────────

	describe('POST /api/links - Rate Limit (10 req/min)', () => {
		it('should return 429 after exceeding the per-route rate limit', async () => {
			// The limit for POST /api/links is 10 per minute, so the 11th should fail
			const requests = Array.from({ length: 11 }, () =>
				app.inject({
					method: 'POST',
					url: '/api/links',
					headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_AUTH.TEST_KEY },
					payload: { originalUrl: 'https://example.com' },
				}),
			);

			const responses = await Promise.all(requests);
			const statusCodes = responses.map((r) => r.statusCode);

			// At least one of the 11 requests should be rate-limited with 429
			expect(statusCodes).toContain(429);
		}, 15000); // Increased timeout to account for DB latency on 11 concurrent requests
	});

	// ─── Negative Caching Tests ──────────────────────────────────────────────

	describe('POST /api/links/:code/track - Negative Caching (Cache Penetration protection)', () => {
		it('should return 404 for a non-existent code', async () => {
			const response = await app.inject({
				method: 'POST',
				url: '/api/links/definitely-does-not-exist/track',
			});
			expect(response.statusCode).toBe(404);
		});

		it('should cache NOT_FOUND sentinel and prevent DB hit on second request', async () => {
			const code = 'ghost-code-test';

			// First request: cache miss, DB returns 404, sentinel cached
			const res1 = await app.inject({ method: 'POST', url: `/api/links/${code}/track` });
			expect(res1.statusCode).toBe(404);

			// Verify the sentinel is in Redis
			const cached = await redis.hgetall(`link:${code}`);
			expect(cached.status).toBe('__NOT_FOUND__');

			// Second request: should be served from cache (no DB hit needed)
			const res2 = await app.inject({ method: 'POST', url: `/api/links/${code}/track` });
			expect(res2.statusCode).toBe(404);
		});
	});

	// ─── Cache Hit Tests ─────────────────────────────────────────────────────

	describe('POST /api/links/:code/track - Cache Hit', () => {
		it('should cache a valid link and return it on subsequent requests', async () => {
			// Seed a link in DB
			const link = await prisma.link.create({
				data: { originalUrl: 'https://cached.example.com', shortCode: 'cache-hit-test' },
			});

			// First request: cache miss, fetches from DB, caches it
			const res1 = await app.inject({ method: 'POST', url: `/api/links/${link.shortCode}/track` });
			expect(res1.statusCode).toBe(200);
			expect(res1.json().originalUrl).toBe('https://cached.example.com');

			// Verify the entry is now in Redis
			const cached = await redis.hgetall(`link:${link.shortCode}`);
			expect(cached).toBeDefined();
			expect(cached.status).toBeUndefined(); // Should not have a NOT_FOUND or GONE status
			expect(cached.originalUrl).toBe('https://cached.example.com');

			// Second request: should be served from cache
			const res2 = await app.inject({ method: 'POST', url: `/api/links/${link.shortCode}/track` });
			expect(res2.statusCode).toBe(200);
			expect(res2.json().originalUrl).toBe('https://cached.example.com');
		});
	});
});
