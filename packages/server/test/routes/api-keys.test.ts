import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { prisma } from '@tiny-link/db';
import { INTERNAL_AUTH } from '@tiny-link/shared';

const INTERNAL_KEY = INTERNAL_AUTH.TEST_KEY;

describe('Phase 12 Stage 1: Public API + API Keys', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		process.env.INTERNAL_API_KEY = INTERNAL_AUTH.TEST_KEY;
		process.env.NODE_ENV = 'test';

		const { server } = await buildServer();
		app = server;
		await app.ready();

		await prisma.apiKey.deleteMany({});
		await prisma.link.deleteMany({});
		await prisma.user.deleteMany({});
	});

	afterAll(async () => {
		await app.close();
	});

	afterEach(async () => {
		await prisma.apiKey.deleteMany({});
		await prisma.link.deleteMany({});
		await prisma.user.deleteMany({});
	});

	const createUser = async (id: string) => prisma.user.create({ data: { id, email: `${id}@example.com` } });

	const issueKey = async (userId: string, name = 'Test Key') => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/keys',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: userId },
			payload: { name },
		});
		expect(response.statusCode).toBe(201);
		return response.json().plaintext as string;
	};

	describe('API key management (/api/keys)', () => {
		it('creates a key and returns the plaintext exactly once', async () => {
			await createUser('key-owner-1');

			const response = await app.inject({
				method: 'POST',
				url: '/api/keys',
				headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: 'key-owner-1' },
				payload: { name: 'CI pipeline' },
			});

			expect(response.statusCode).toBe(201);
			const body = response.json();
			expect(body.plaintext).toMatch(/^tlk_live_/);
			expect(body.keyPrefix).toBe(body.plaintext.slice(0, 12));

			const dbKey = await prisma.apiKey.findUnique({ where: { id: body.id } });
			expect(dbKey?.keyHash).not.toBe(body.plaintext);
		});

		it('lists keys without ever exposing the plaintext or hash', async () => {
			await createUser('key-owner-2');
			await issueKey('key-owner-2');

			const response = await app.inject({
				method: 'GET',
				url: '/api/keys',
				headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: 'key-owner-2' },
			});

			expect(response.statusCode).toBe(200);
			const { apiKeys } = response.json();
			expect(apiKeys).toHaveLength(1);
			expect(apiKeys[0]).not.toHaveProperty('plaintext');
			expect(apiKeys[0]).not.toHaveProperty('keyHash');
			expect(apiKeys[0].keyPrefix).toMatch(/^tlk_live_/);
		});

		it('revokes a key so it can no longer authenticate', async () => {
			await createUser('key-owner-3');
			const plaintext = await issueKey('key-owner-3');

			const listRes = await app.inject({
				method: 'GET',
				url: '/api/keys',
				headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: 'key-owner-3' },
			});
			const keyId = listRes.json().apiKeys[0].id;

			const revokeRes = await app.inject({
				method: 'DELETE',
				url: `/api/keys/${keyId}`,
				headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: 'key-owner-3' },
			});
			expect(revokeRes.statusCode).toBe(200);

			const publicRes = await app.inject({
				method: 'GET',
				url: '/api/v1/links',
				headers: { authorization: `Bearer ${plaintext}` },
			});
			expect(publicRes.statusCode).toBe(401);
		});
	});

	describe('Public API (/api/v1)', () => {
		it('rejects requests without a valid Authorization header', async () => {
			const noHeaderRes = await app.inject({ method: 'GET', url: '/api/v1/links' });
			expect(noHeaderRes.statusCode).toBe(401);

			const badKeyRes = await app.inject({
				method: 'GET',
				url: '/api/v1/links',
				headers: { authorization: 'Bearer tlk_live_not-a-real-key' },
			});
			expect(badKeyRes.statusCode).toBe(401);
		});

		it('creates, lists, and deletes a link scoped to the key owner', async () => {
			await createUser('public-api-user');
			const plaintext = await issueKey('public-api-user');

			const createRes = await app.inject({
				method: 'POST',
				url: '/api/v1/links',
				headers: { authorization: `Bearer ${plaintext}` },
				payload: { originalUrl: 'https://example.com/public-api' },
			});
			expect(createRes.statusCode).toBe(201);
			const link = createRes.json();
			expect(link.shortCode).toBeTypeOf('string');

			const dbLink = await prisma.link.findUnique({ where: { id: link.id } });
			expect(dbLink?.userId).toBe('public-api-user');

			const listRes = await app.inject({
				method: 'GET',
				url: '/api/v1/links',
				headers: { authorization: `Bearer ${plaintext}` },
			});
			expect(listRes.statusCode).toBe(200);
			expect(listRes.json().links).toHaveLength(1);

			const deleteRes = await app.inject({
				method: 'DELETE',
				url: `/api/v1/links/${link.id}`,
				headers: { authorization: `Bearer ${plaintext}` },
			});
			expect(deleteRes.statusCode).toBe(200);
			// deleteLink is a soft delete (sets isActive: false), same as the internal-auth dashboard route.
			expect((await prisma.link.findUnique({ where: { id: link.id } }))?.isActive).toBe(false);
		});

		it("cannot see or delete another account's links", async () => {
			await createUser('account-a');
			await createUser('account-b');
			const keyA = await issueKey('account-a');
			const keyB = await issueKey('account-b');

			const createRes = await app.inject({
				method: 'POST',
				url: '/api/v1/links',
				headers: { authorization: `Bearer ${keyA}` },
				payload: { originalUrl: 'https://example.com/account-a-link' },
			});
			const linkId = createRes.json().id;

			const listAsB = await app.inject({
				method: 'GET',
				url: '/api/v1/links',
				headers: { authorization: `Bearer ${keyB}` },
			});
			expect(listAsB.json().links).toHaveLength(0);

			const deleteAsB = await app.inject({
				method: 'DELETE',
				url: `/api/v1/links/${linkId}`,
				headers: { authorization: `Bearer ${keyB}` },
			});
			expect(deleteAsB.statusCode).toBe(404);

			expect(await prisma.link.findUnique({ where: { id: linkId } })).not.toBeNull();
		});

		it('rate-limits create-link independently per API key', async () => {
			await createUser('rate-limit-user');
			const plaintext = await issueKey('rate-limit-user');

			// Limit is SYSTEM_CONFIG.RATE_LIMIT_PUBLIC_API_CREATE_LINK (20) per minute for this key.
			const attempts = Array.from({ length: 21 }, (_, i) =>
				app.inject({
					method: 'POST',
					url: '/api/v1/links',
					headers: { authorization: `Bearer ${plaintext}` },
					payload: { originalUrl: `https://example.com/rl-${i}` },
				}),
			);

			const responses = await Promise.all(attempts);
			const statusCodes = responses.map((r) => r.statusCode);
			expect(statusCodes).toContain(429);
		});
	});
});
