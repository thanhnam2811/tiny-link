import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@tiny-link/db';
import { INTERNAL_AUTH } from '@tiny-link/shared';

const INTERNAL_KEY = INTERNAL_AUTH.TEST_KEY;

describe('Password Protected Links API', () => {
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

	it('should create a password protected link', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/links',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY },
			payload: {
				originalUrl: 'https://google.com',
				password: 'my-super-secret-password',
			},
			remoteAddress: '127.0.0.1',
		});

		expect(response.statusCode).toBe(201);
		const body = response.json();
		expect(body.shortCode).toBeTypeOf('string');

		// Verify in DB
		const dbLink = await prisma.link.findUnique({ where: { shortCode: body.shortCode } });
		expect(dbLink?.passwordHash).not.toBeNull();
	});

	it('should block direct redirection of a protected link with 401', async () => {
		// 1. Create link
		const createRes = await app.inject({
			method: 'POST',
			url: '/api/links',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY },
			payload: { originalUrl: 'https://google.com', password: 'test' },
			remoteAddress: '127.0.0.2',
		});
		const { shortCode } = createRes.json();

		// 2. Try to track (which would usually redirect)
		const response = await app.inject({
			method: 'POST',
			url: `/api/links/${shortCode}/track`,
		});

		// 3. Expect 401 Unauthorized
		expect(response.statusCode).toBe(401);
		expect(response.json().message).toBe('This link is password protected.');
	});

	it('should verify password and return originalUrl', async () => {
		// 1. Create link
		const createRes = await app.inject({
			method: 'POST',
			url: '/api/links',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY },
			payload: { originalUrl: 'https://google.com', password: 'correct-horse-battery-staple' },
			remoteAddress: '127.0.0.2',
		});
		const { shortCode } = createRes.json();

		// 2. Verify with wrong password
		const wrongRes = await app.inject({
			method: 'POST',
			url: `/api/links/${shortCode}/verify`,
			payload: { password: 'wrong' },
		});
		expect(wrongRes.statusCode).toBe(401);

		// 3. Verify with correct password
		const correctRes = await app.inject({
			method: 'POST',
			url: `/api/links/${shortCode}/verify`,
			payload: { password: 'correct-horse-battery-staple' },
		});

		expect(correctRes.statusCode).toBe(200);
		expect(correctRes.json().originalUrl).toBe('https://google.com');
	});

	it('should enforce strict rate limit on the verify endpoint', async () => {
		// 1. Create link
		const createRes = await app.inject({
			method: 'POST',
			url: '/api/links',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY },
			payload: { originalUrl: 'https://google.com', password: 'brute' },
			remoteAddress: '127.0.0.2',
		});
		const { shortCode } = createRes.json();

		// 2. Brute force (limit is 5 per minute)
		const attempts = Array.from({ length: 6 }, () =>
			app.inject({
				method: 'POST',
				url: `/api/links/${shortCode}/verify`,
				payload: { password: 'wrong' },
				remoteAddress: '127.0.0.9', // Use same IP
			}),
		);

		const responses = await Promise.all(attempts);
		const statusCodes = responses.map((r) => r.statusCode);
		expect(statusCodes).toContain(429);
	});
});
