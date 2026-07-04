import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';
import { prisma } from '@tiny-link/db';
import { INTERNAL_AUTH } from '@tiny-link/shared';

const INTERNAL_KEY = INTERNAL_AUTH.TEST_KEY;

async function buildMultipartPayload(csvContent: string, filename = 'links.csv') {
	const form = new FormData();
	form.append('file', new Blob([csvContent], { type: 'text/csv' }), filename);

	const request = new Request('http://localhost', { method: 'POST', body: form });
	const payload = Buffer.from(await request.arrayBuffer());
	const contentType = request.headers.get('content-type') as string;

	return { payload, contentType };
}

describe('POST /api/links/bulk-import', () => {
	let app: FastifyInstance;
	const userId = 'bulk-import-user';

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	// The global afterEach hook (test/setup.ts) wipes Link + User after every test,
	// and Link.userId has a foreign key constraint against User.id, so each test
	// must re-create its own owning User row.
	beforeEach(async () => {
		await prisma.user.create({ data: { id: userId, email: `${userId}@example.com` } });
	});

	it('creates all links when every row is valid', async () => {
		const csv = 'originalUrl\nhttps://example.com/a\nhttps://example.com/b\n';
		const { payload, contentType } = await buildMultipartPayload(csv);

		const response = await app.inject({
			method: 'POST',
			url: '/api/links/bulk-import',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
				'content-type': contentType,
			},
			payload,
			remoteAddress: '127.0.10.1',
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.totalRows).toBe(2);
		expect(body.successCount).toBe(2);
		expect(body.failureCount).toBe(0);
		expect(body.results.every((r: { success: boolean }) => r.success)).toBe(true);

		const dbLink = await prisma.link.findUnique({ where: { shortCode: body.results[0].shortCode } });
		expect(dbLink?.userId).toBe(userId);
	});

	it('reports per-row errors without aborting the rest of the batch', async () => {
		const customCode = `bulk-taken-${Date.now()}`;
		await prisma.link.create({
			data: { originalUrl: 'https://example.com/existing', shortCode: customCode },
		});

		const rows = [
			['originalUrl', 'customCode', 'maxClicks', 'expiresAt'],
			['https://example.com/conflict', customCode, '', ''],
			['', '', '', ''], // missing originalUrl
			['https://example.com/bad-clicks', '', 'not-a-number', ''],
			['https://example.com/valid-row', '', '', ''],
		];
		const csv = rows.map((row) => row.join(',')).join('\n');
		const { payload, contentType } = await buildMultipartPayload(csv);

		const response = await app.inject({
			method: 'POST',
			url: '/api/links/bulk-import',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
				'content-type': contentType,
			},
			payload,
			remoteAddress: '127.0.10.2',
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.totalRows).toBe(4);
		expect(body.successCount).toBe(1);
		expect(body.failureCount).toBe(3);
		expect(body.results[0].success).toBe(false);
		expect(body.results[0].error).toContain('already in use');
		expect(body.results[1].success).toBe(false);
		expect(body.results[2].success).toBe(false);
		expect(body.results[3].success).toBe(true);
	});

	it('rejects requests with no file', async () => {
		const form = new FormData();
		const request = new Request('http://localhost', { method: 'POST', body: form });
		const payload = Buffer.from(await request.arrayBuffer());
		const contentType = request.headers.get('content-type') as string;

		const response = await app.inject({
			method: 'POST',
			url: '/api/links/bulk-import',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
				'content-type': contentType,
			},
			payload,
			remoteAddress: '127.0.10.3',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().code).toBe('BULK_IMPORT_NO_FILE');
	});

	it('rejects requests that are not multipart at all (no content-type, no body)', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/links/bulk-import',
			headers: {
				[INTERNAL_AUTH.HEADER]: INTERNAL_KEY,
				[INTERNAL_AUTH.USER_ID_HEADER]: userId,
			},
			remoteAddress: '127.0.10.5',
		});

		expect(response.statusCode).toBe(400);
		expect(response.json().code).toBe('BULK_IMPORT_NO_FILE');
	});

	it('rejects requests without an authenticated user', async () => {
		const { payload, contentType } = await buildMultipartPayload('originalUrl\nhttps://example.com/x\n');

		const response = await app.inject({
			method: 'POST',
			url: '/api/links/bulk-import',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, 'content-type': contentType },
			payload,
			remoteAddress: '127.0.10.4',
		});

		expect(response.statusCode).toBe(401);
	});
});

describe('GET /api/links/export', () => {
	let app: FastifyInstance;
	const userId = 'export-user';

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	beforeEach(async () => {
		await prisma.user.create({ data: { id: userId, email: `${userId}@example.com` } });
	});

	it('downloads a CSV file with the user"s links', async () => {
		await prisma.link.create({
			data: { originalUrl: 'https://example.com/export-me', shortCode: `export-code-${Date.now()}`, userId },
		});

		const response = await app.inject({
			method: 'GET',
			url: '/api/links/export',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY, [INTERNAL_AUTH.USER_ID_HEADER]: userId },
		});

		expect(response.statusCode).toBe(200);
		expect(response.headers['content-type']).toContain('text/csv');
		expect(response.headers['content-disposition']).toContain('attachment');

		const [header, ...rows] = response.body.trim().split('\r\n');
		expect(header).toBe('originalUrl,shortCode,shortUrl,createdAt,expiresAt,maxClicks,clicksCount,isActive');
		expect(rows.some((row) => row.startsWith('https://example.com/export-me'))).toBe(true);
	});

	it('rejects requests without an authenticated user', async () => {
		const response = await app.inject({
			method: 'GET',
			url: '/api/links/export',
			headers: { [INTERNAL_AUTH.HEADER]: INTERNAL_KEY },
		});

		expect(response.statusCode).toBe(401);
	});
});
