import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';

describe('Security Headers & CORS Protection (TL-SEC-07)', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		const { server } = await buildServer();
		app = server;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it('returns standard Helmet security headers on HTTP responses', async () => {
		const res = await app.inject({
			method: 'GET',
			url: '/healthz',
		});

		expect(res.statusCode).toBe(200);
		// Helmet security headers
		expect(res.headers['x-content-type-options']).toBe('nosniff');
		expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
		expect(res.headers['x-dns-prefetch-control']).toBe('off');
		expect(res.headers['referrer-policy']).toBe('no-referrer');
	});

	it('matches valid Vercel preview URLs with hyphenated branch names and rejects unhyphenated suffix spoofing', () => {
		const rawProjectName = 'tiny-link-client';
		const vercelProjectName = rawProjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		const vercelRegex = new RegExp(`^(https?:\\/\\/)?${vercelProjectName}(-[a-z0-9-]+)?\\.vercel\\.app$`);

		// Valid preview URLs
		expect(vercelRegex.test('https://tiny-link-client.vercel.app')).toBe(true);
		expect(vercelRegex.test('https://tiny-link-client-git-feature-123.vercel.app')).toBe(true);
		expect(vercelRegex.test('http://tiny-link-client-preview.vercel.app')).toBe(true);

		// Invalid spoofed URLs (attacker accounts)
		expect(vercelRegex.test('https://tiny-link-clientattacker.vercel.app')).toBe(false);
		expect(vercelRegex.test('https://tiny-link-client.evil.com')).toBe(false);
		expect(vercelRegex.test('https://not-tiny-link-client.vercel.app')).toBe(false);
	});
});
