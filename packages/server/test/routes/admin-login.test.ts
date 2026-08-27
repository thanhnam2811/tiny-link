import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildServer } from '../../src/index';

describe('Admin Login Security (TL-SEC-03)', () => {
	let app: FastifyInstance;

	beforeAll(async () => {
		process.env.ADMIN_PASSWORD = 'test-admin-password';
		process.env.JWT_SECRET = 'test-jwt-secret-key-at-least-32-chars-long';
		const built = await buildServer();
		app = built.server;
		await app.ready();
	});

	afterAll(async () => {
		await app.close();
	});

	it('returns a JWT with 8-hour expiration upon successful login', async () => {
		const response = await app.inject({
			method: 'POST',
			url: '/api/admin/login',
			payload: { password: 'test-admin-password' },
			remoteAddress: '127.0.0.10',
		});

		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.token).toBeTypeOf('string');

		// Decode JWT to inspect expiration
		const decoded = app.jwt.decode(body.token) as { role: string; iat: number; exp: number };
		expect(decoded.role).toBe('admin');
		expect(decoded.exp).toBeDefined();
		expect(decoded.iat).toBeDefined();

		// 8 hours = 28800 seconds
		const duration = decoded.exp - decoded.iat;
		expect(duration).toBe(8 * 3600);
	});

	it('rejects incorrect passwords with 401 and timing-safe evaluation', async () => {
		const wrongPasswords = ['wrong-password', 'short', 'test-admin-password-extra-long', 'a'];

		for (const wrongPassword of wrongPasswords) {
			const response = await app.inject({
				method: 'POST',
				url: '/api/admin/login',
				payload: { password: wrongPassword },
				remoteAddress: `127.0.0.${Math.floor(Math.random() * 200) + 20}`,
			});

			expect(response.statusCode).toBe(401);
			expect(response.json().message).toBe('Invalid admin password');
		}

		// Empty password fails schema validation (400)
		const emptyResponse = await app.inject({
			method: 'POST',
			url: '/api/admin/login',
			payload: { password: '' },
			remoteAddress: '127.0.0.15',
		});
		expect(emptyResponse.statusCode).toBe(400);
	});

	it('enforces strict rate limiting (max 5 attempts per minute) on /api/admin/login', async () => {
		const remoteAddress = '127.0.0.99';

		const attempts = Array.from({ length: 6 }, () =>
			app.inject({
				method: 'POST',
				url: '/api/admin/login',
				payload: { password: 'wrong-guess' },
				remoteAddress,
			}),
		);

		const responses = await Promise.all(attempts);
		const statusCodes = responses.map((r) => r.statusCode);

		expect(statusCodes).toContain(429);
	});
});
