import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@prisma/client';

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
			payload: {
				originalUrl: 'https://secret.dev',
				password: 'my-super-secret-password',
			},
		});

		expect(response.statusCode).toBe(201);
		const body = response.json();
		expect(body.shortCode).toBeDefined();

		// Verify DB state
		const dbLink = await prisma.link.findUnique({ where: { id: body.id } });
		expect(dbLink?.passwordHash).toBeDefined();
	});

	it('should block direct redirection of a protected link with 401', async () => {
		// 1. Create link
		const createRes = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: { originalUrl: 'https://secret2.dev', password: 'test' },
		});
		const { shortCode } = createRes.json();

		// 2. Attempt redirect
		const response = await app.inject({
			method: 'GET',
			url: `/${shortCode}`,
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
			payload: { originalUrl: 'https://verify-me.dev', password: 'correct-horse-battery-staple' },
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
		expect(correctRes.json().originalUrl).toBe('https://verify-me.dev');
	});

	it('should enforce strict rate limit on the verify endpoint', async () => {
		// 1. Create link
		const createRes = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: { originalUrl: 'https://brute.dev', password: 'brute' },
		});
		const { shortCode } = createRes.json();

		// 2. Fire 5 requests (Limit is 5 per min)
		for (let i = 0; i < 5; i++) {
			await app.inject({
				method: 'POST',
				url: `/api/links/${shortCode}/verify`,
				payload: { password: 'wrong' },
				remoteAddress: '10.0.0.99', // mock specific IP
			});
		}

		// 3. The 6th request should hit 429 Too Many Requests
		const rateLimitedRes = await app.inject({
			method: 'POST',
			url: `/api/links/${shortCode}/verify`,
			payload: { password: 'wrong' },
			remoteAddress: '10.0.0.99',
		});

		expect(rateLimitedRes.statusCode).toBe(429);
	});
});
