import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@prisma/client';
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
					payload: { originalUrl: 'https://example.com' },
				}),
			);

			const responses = await Promise.all(requests);
			const statusCodes = responses.map((r) => r.statusCode);

			// At least one of the 11 requests should be rate-limited with 429
			expect(statusCodes).toContain(429);
		});
	});

	// ─── Negative Caching Tests ──────────────────────────────────────────────

	describe('GET /:code - Negative Caching (Cache Penetration protection)', () => {
		it('should return 404 for a non-existent code', async () => {
			const response = await app.inject({
				method: 'GET',
				url: '/definitely-does-not-exist',
			});
			expect(response.statusCode).toBe(404);
		});

		it('should cache NOT_FOUND sentinel and prevent DB hit on second request', async () => {
			const code = 'ghost-code-test';

			// First request: cache miss, DB returns 404, sentinel cached
			const res1 = await app.inject({ method: 'GET', url: `/${code}` });
			expect(res1.statusCode).toBe(404);

			// Verify the sentinel is in Redis
			const cached = await redis.hgetall(`link:${code}`);
			expect(cached.status).toBe('__NOT_FOUND__');

			// Second request: should be served from cache (no DB hit needed)
			const res2 = await app.inject({ method: 'GET', url: `/${code}` });
			expect(res2.statusCode).toBe(404);
		});
	});

	// ─── Cache Hit Tests ─────────────────────────────────────────────────────

	describe('GET /:code - Cache Hit', () => {
		it('should cache a valid link and return it on subsequent requests', async () => {
			// Seed a link in DB
			const link = await prisma.link.create({
				data: { originalUrl: 'https://cached.example.com', shortCode: 'cache-hit-test' },
			});

			// First request: cache miss, fetches from DB, caches it
			const res1 = await app.inject({ method: 'GET', url: `/${link.shortCode}` });
			expect(res1.statusCode).toBe(302);
			expect(res1.headers.location).toBe('https://cached.example.com');

			// Verify the entry is now in Redis
			const cached = await redis.hgetall(`link:${link.shortCode}`);
			expect(cached).toBeDefined();
			expect(cached.status).toBeUndefined(); // Should not have a NOT_FOUND or GONE status
			expect(cached.originalUrl).toBe('https://cached.example.com');

			// Second request: should be served from cache
			const res2 = await app.inject({ method: 'GET', url: `/${link.shortCode}` });
			expect(res2.statusCode).toBe(302);
			expect(res2.headers.location).toBe('https://cached.example.com');
		});
	});
});
