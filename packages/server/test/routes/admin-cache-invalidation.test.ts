import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { prisma } from '@tiny-link/db';
import type { Redis } from 'ioredis';

describe('Admin Cache Invalidation (TL-BE-05)', () => {
	let app: FastifyInstance;
	let redis: Redis;
	let adminToken: string;

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
		redis = app.redis as Redis;

		// Authenticate admin to get token
		const loginRes = await app.inject({
			method: 'POST',
			url: '/api/admin/login',
			payload: { password: 'test-admin-password' },
		});
		adminToken = loginRes.json().token;
	});

	afterAll(async () => {
		await redis.flushdb();
		await app.close();
	});

	beforeEach(async () => {
		await redis.flushdb();
	});

	it('evicts Redis cache key link:shortCode when admin updates link status to inactive', async () => {
		const link = await prisma.link.create({
			data: {
				originalUrl: 'https://cached-link-test.com',
				shortCode: 'admin-cache-evict-status',
				isActive: true,
			},
		});

		// Populate cache via /track
		const trackRes = await app.inject({
			method: 'POST',
			url: `/api/links/${link.shortCode}/track`,
		});
		expect(trackRes.statusCode).toBe(200);

		// Verify cache exists in Redis
		const cachedBefore = await redis.exists(`link:${link.shortCode}`);
		expect(cachedBefore).toBe(1);

		// Admin updates link status to inactive
		const patchRes = await app.inject({
			method: 'PATCH',
			url: `/api/admin/links/${link.id}/status`,
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
			payload: {
				isActive: false,
			},
		});
		expect(patchRes.statusCode).toBe(200);
		expect(patchRes.json().success).toBe(true);

		// Verify Redis cache key is evicted
		const cachedAfter = await redis.exists(`link:${link.shortCode}`);
		expect(cachedAfter).toBe(0);
	});

	it('evicts Redis cache key link:shortCode when admin deletes link permanently', async () => {
		const link = await prisma.link.create({
			data: {
				originalUrl: 'https://cached-link-delete.com',
				shortCode: 'admin-cache-evict-delete',
				isActive: true,
			},
		});

		// Populate cache via /track
		const trackRes = await app.inject({
			method: 'POST',
			url: `/api/links/${link.shortCode}/track`,
		});
		expect(trackRes.statusCode).toBe(200);

		// Verify cache exists in Redis
		const cachedBefore = await redis.exists(`link:${link.shortCode}`);
		expect(cachedBefore).toBe(1);

		// Admin deletes link
		const deleteRes = await app.inject({
			method: 'DELETE',
			url: `/api/admin/links/${link.id}`,
			headers: {
				authorization: `Bearer ${adminToken}`,
			},
		});
		expect(deleteRes.statusCode).toBe(200);
		expect(deleteRes.json().success).toBe(true);

		// Verify Redis cache key is evicted
		const cachedAfter = await redis.exists(`link:${link.shortCode}`);
		expect(cachedAfter).toBe(0);
	});
});
