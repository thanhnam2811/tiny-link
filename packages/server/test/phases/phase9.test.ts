import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { prisma } from '@tiny-link/db';
import { INTERNAL_AUTH, ERROR_MESSAGES } from '@tiny-link/shared';

const INTERNAL_KEY = INTERNAL_AUTH.TEST_KEY;

describe('Phase 9: Auth, Claiming & User Links', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		// Ensure environment is set BEFORE building server
		process.env.INTERNAL_API_KEY = INTERNAL_AUTH.TEST_KEY;
		process.env.NODE_ENV = 'test';

		const { server } = await buildServer();
		app = server;
		await app.ready();

		// Final cleanup before starting
		await prisma.link.deleteMany({});
		await prisma.user.deleteMany({});
	});

	afterAll(async () => {
		await app.close();
	});

	afterEach(async () => {
		await prisma.link.deleteMany({});
		await prisma.user.deleteMany({});
	});

	it('should claim guest links for a user', async () => {
		const guestId = 'test-guest-123';
		const userId = 'test-user-456';

		// 0. Create User
		await prisma.user.create({ data: { id: userId, email: 'claim-test@example.com' } });

		// 1. Create orphan links for guest
		await prisma.link.createMany({
			data: [
				{ originalUrl: 'https://guest1.com', shortCode: 'g1', guestId },
				{ originalUrl: 'https://guest2.com', shortCode: 'g2', guestId },
			],
		});

		// 2. Trigger claim
		const response = await app.inject({
			method: 'POST',
			url: '/api/links/claim',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
			},
			payload: { guestId },
		});

		expect(response.statusCode).toBe(200);
		expect(response.json().claimedCount).toBe(2);

		// 3. Verify in DB
		const links = await prisma.link.findMany({ where: { userId } });
		expect(links.length).toBe(2);
	});

	it('should retrieve only authenticated user links', async () => {
		const userId = 'dashboard-user';

		// 0. Create Users
		await prisma.user.create({ data: { id: userId, email: 'user-dash-A@example.com' } });
		await prisma.user.create({ data: { id: 'other-user', email: 'user-dash-B@example.com' } });

		// 1. Create links for user A and user B
		await prisma.link.create({
			data: { originalUrl: 'https://userA.com', shortCode: 'ua1', userId },
		});
		await prisma.link.create({
			data: { originalUrl: 'https://userB.com', shortCode: 'ub1', userId: 'other-user' },
		});

		// 2. Fetch for user A
		const response = await app.inject({
			method: 'GET',
			url: '/api/links/user',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
			},
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.links.length).toBe(1);
		expect(body.links[0].shortCode).toBe('ua1');
		expect(body.totalCount).toBe(1);
	});

	it('should soft-delete a link for the correct user', async () => {
		const userId = 'delete-user';
		// 0. Create User
		await prisma.user.create({ data: { id: userId, email: 'delete-test@example.com' } });

		const link = await prisma.link.create({
			data: { originalUrl: 'https://delete-me.com', shortCode: 'del1', userId },
		});

		// Try to delete without correct userId (even with internal key)
		const failRes = await app.inject({
			method: 'DELETE',
			url: `/api/links/${link.id}`,
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: 'wrong-user',
			},
		});
		expect(failRes.statusCode).toBe(404); // Should be 404 since it's filtered by userId

		// Correct delete
		const successRes = await app.inject({
			method: 'DELETE',
			url: `/api/links/${link.id}`,
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
			},
		});
		expect(successRes.statusCode).toBe(200);

		// Verify soft delete
		const dbLink = await prisma.link.findUnique({ where: { id: link.id } });
		expect(dbLink?.isActive).toBe(false);
	});

	it('should reject requests with invalid internal key', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/links/claim',
			headers: { [INTERNAL_AUTH.HEADER]: 'wrong-key' },
			payload: { guestId: 'any' },
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().code).toBe(ERROR_MESSAGES.UNAUTHORIZED);
	});

	it('should reject requests with missing internal key', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/links/user',
		});

		expect(response.statusCode).toBe(401);
		expect(response.json().code).toBe(ERROR_MESSAGES.UNAUTHORIZED);
	});
});
