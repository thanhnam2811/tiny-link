import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST, DELETE } from '../route';
import { INTERNAL_AUTH } from '@tiny-link/shared';

const mockGetSession = vi.fn();
vi.mock('@/lib/auth0', () => ({
	auth0: {
		getSession: () => mockGetSession(),
	},
}));

vi.mock('@/lib/env', () => ({
	getEnv: (key: string) => {
		if (key === 'INTERNAL_API_URL') return 'http://127.0.0.1:3001';
		if (key === 'INTERNAL_API_KEY') return 'secret-internal-key';
		return undefined;
	},
}));

describe('BFF Proxy Route (TL-SEC-01)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn().mockResolvedValue({
			status: 200,
			headers: new Headers({ 'Content-Type': 'application/json' }),
			text: async () => JSON.stringify({ success: true }),
		});
	});

	it('strips caller-supplied x-user-id header when user is unauthenticated', async () => {
		mockGetSession.mockResolvedValue(null);

		const req = new NextRequest('http://localhost:3000/api/proxy/links/user', {
			method: 'GET',
			headers: {
				[INTERNAL_AUTH.USER_ID_HEADER]: 'victim-user-id',
				'x-custom-header': 'test-value',
			},
		});

		const params = Promise.resolve({ path: ['links', 'user'] });
		const response = await GET(req, { params });

		expect(response.status).toBe(200);
		expect(global.fetch).toHaveBeenCalledTimes(1);

		const fetchMock = vi.mocked(global.fetch);
		const [fetchUrl, fetchOptions] = fetchMock.mock.calls[0];
		expect(fetchUrl).toBe('http://127.0.0.1:3001/api/links/user');

		const forwardedHeaders = fetchOptions?.headers as Headers;
		expect(forwardedHeaders.get(INTERNAL_AUTH.HEADER)).toBe('secret-internal-key');
		// Crucial verification: x-user-id MUST be stripped and undefined/null
		expect(forwardedHeaders.get(INTERNAL_AUTH.USER_ID_HEADER)).toBeNull();
	});

	it('overrides spoofed x-user-id with verified session user sub when authenticated', async () => {
		mockGetSession.mockResolvedValue({
			user: { sub: 'auth0|authenticated-user-sub' },
		});

		const req = new NextRequest('http://localhost:3000/api/proxy/links/user', {
			method: 'GET',
			headers: {
				[INTERNAL_AUTH.USER_ID_HEADER]: 'spoofed-victim-id',
			},
		});

		const params = Promise.resolve({ path: ['links', 'user'] });
		const response = await GET(req, { params });

		expect(response.status).toBe(200);
		expect(global.fetch).toHaveBeenCalledTimes(1);

		const fetchMock = vi.mocked(global.fetch);
		const [, fetchOptions] = fetchMock.mock.calls[0];
		const forwardedHeaders = fetchOptions?.headers as Headers;
		expect(forwardedHeaders.get(INTERNAL_AUTH.HEADER)).toBe('secret-internal-key');
		expect(forwardedHeaders.get(INTERNAL_AUTH.USER_ID_HEADER)).toBe('auth0|authenticated-user-sub');
	});

	it('forwards POST request body with stripped x-user-id when unauthenticated', async () => {
		mockGetSession.mockResolvedValue(null);

		const req = new NextRequest('http://localhost:3000/api/proxy/links', {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				[INTERNAL_AUTH.USER_ID_HEADER]: 'attacker-spoofed-id',
			},
			body: JSON.stringify({ originalUrl: 'https://example.com' }),
		});

		const params = Promise.resolve({ path: ['links'] });
		const response = await POST(req, { params });

		expect(response.status).toBe(200);
		const fetchMock = vi.mocked(global.fetch);
		const [, fetchOptions] = fetchMock.mock.calls[0];
		const forwardedHeaders = fetchOptions?.headers as Headers;
		expect(forwardedHeaders.get(INTERNAL_AUTH.USER_ID_HEADER)).toBeNull();
		expect(forwardedHeaders.get(INTERNAL_AUTH.HEADER)).toBe('secret-internal-key');
	});

	it('handles upstream errors gracefully with 502 status', async () => {
		mockGetSession.mockResolvedValue(null);
		global.fetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));

		const req = new NextRequest('http://localhost:3000/api/proxy/health', {
			method: 'DELETE',
		});

		const params = Promise.resolve({ path: ['health'] });
		const response = await DELETE(req, { params });

		expect(response.status).toBe(502);
		const body = await response.json();
		expect(body.error).toBe('BFF_PROXY_ERROR');
	});
});
