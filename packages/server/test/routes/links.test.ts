import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { PrismaClient } from '@prisma/client';

describe('POST /api/links', () => {
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

	it('should create a short link successfully', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: {
				originalUrl: 'https://github.com/fastify',
			},
			remoteAddress: '127.0.0.3',
		});

		expect(response.statusCode).toBe(201);
		const body = response.json();

		expect(body.originalUrl).toBe('https://github.com/fastify');
		expect(body.shortCode.length).toBe(7);
		expect(body.shortUrl).toContain(body.shortCode);
		expect(body.id).toBeTypeOf('string');

		// Verify Database State
		const dbLink = await prisma.link.findUnique({
			where: { shortCode: body.shortCode },
		});
		expect(dbLink).not.toBeNull();
		expect(dbLink?.originalUrl).toBe('https://github.com/fastify');
	});

	it('should return 400 for invalid URLs', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: {
				originalUrl: 'not-a-url',
			},
			remoteAddress: '127.0.0.3',
		});

		expect(response.statusCode).toBe(400);
	});

	it('should create a short link with a custom code', async () => {
		const customCode = 'my-custom-event';
		const response = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: {
				originalUrl: 'https://example.com/event',
				customCode,
			},
			remoteAddress: '127.0.0.3',
		});

		expect(response.statusCode).toBe(201);
		const body = response.json();
		expect(body.shortCode).toBe(customCode);
	});

	it('should return 409 Conflict if custom code is already taken', async () => {
		const customCode = 'taken-code';

		// 1. Create the first link
		await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: {
				originalUrl: 'https://example.com/one',
				customCode,
			},
			remoteAddress: '127.0.0.3',
		});

		// 2. Attempt to create another link with the exact same custom code
		const response2 = await app.inject({
			method: 'POST',
			url: '/api/links',
			payload: {
				originalUrl: 'https://example.com/two',
				customCode,
			},
			remoteAddress: '127.0.0.3',
		});

		expect(response2.statusCode).toBe(409);
		expect(response2.json().message).toContain('already in use');
		expect(response2.json().code).toBe('LINK_CODE_CONFLICT');
	});
});
