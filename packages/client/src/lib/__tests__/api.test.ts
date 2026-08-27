import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { INTERNAL_AUTH } from '@tiny-link/shared';

describe('Client API Fetcher (TL-FE-02)', () => {
	const originalWindow = global.window;
	const originalEnv = process.env;

	beforeEach(() => {
		vi.resetModules();
		vi.clearAllMocks();
		process.env = { ...originalEnv };
	});

	afterEach(() => {
		global.window = originalWindow;
		process.env = originalEnv;
	});

	describe('Browser Environment (isServer === false)', () => {
		it('attaches Content-Type and uses proxy base URL', async () => {
			const { api } = await import('../api');
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ id: 'link-123', originalUrl: 'https://example.com' }),
			});

			const result = await api.links.getPreview('link-123');

			expect(global.fetch).toHaveBeenCalledTimes(1);
			const [url, options] = vi.mocked(global.fetch).mock.calls[0];

			expect(url).toBe('/api/proxy/links/link-123/preview');
			const headers = options?.headers as Headers;
			expect(headers.get('Content-Type')).toBe('application/json');
			expect(headers.get(INTERNAL_AUTH.HEADER)).toBeNull();
			expect(result).toEqual({ id: 'link-123', originalUrl: 'https://example.com' });
		});

		it('preserves and merges custom options.headers', async () => {
			const { api } = await import('../api');
			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ success: true }),
			});

			await api.links.delete('link-999');

			const [, options] = vi.mocked(global.fetch).mock.calls[0];
			const headers = options?.headers as Headers;
			expect(headers.get('Content-Type')).toBe('application/json');
		});
	});

	describe('Server-Side RSC Environment (isServer === true)', () => {
		it('targets INTERNAL_API_URL and injects INTERNAL_AUTH.HEADER', async () => {
			// Simulate Server Environment
			// @ts-expect-error mutating window for test isolation
			delete global.window;
			process.env.INTERNAL_API_URL = 'http://127.0.0.1:3001';
			process.env.INTERNAL_API_KEY = 'super-secret-m2m-key';

			const { api } = await import('../api');

			global.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: async () => ({ id: 'link-456', originalUrl: 'https://example.org' }),
			});

			const result = await api.links.getPreview('link-456');

			expect(global.fetch).toHaveBeenCalledTimes(1);
			const [url, options] = vi.mocked(global.fetch).mock.calls[0];

			expect(url).toBe('http://127.0.0.1:3001/api/links/link-456/preview');
			const headers = options?.headers as Headers;
			expect(headers.get('Content-Type')).toBe('application/json');
			expect(headers.get(INTERNAL_AUTH.HEADER)).toBe('super-secret-m2m-key');
			expect(result).toEqual({ id: 'link-456', originalUrl: 'https://example.org' });
		});
	});

	describe('Error Handling', () => {
		it('throws structured ApiError when response is not ok', async () => {
			const { api, ApiError } = await import('../api');
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				json: async () => ({
					statusCode: 404,
					code: 'LINK_NOT_FOUND',
					message: 'Link does not exist',
				}),
			});

			await expect(api.links.getPreview('missing-code')).rejects.toThrow('Link does not exist');
			try {
				await api.links.getPreview('missing-code');
			} catch (err) {
				expect(err).toBeInstanceOf(ApiError);
				const apiErr = err as InstanceType<typeof ApiError>;
				expect(apiErr.statusCode).toBe(404);
				expect(apiErr.code).toBe('LINK_NOT_FOUND');
			}
		});

		it('handles non-JSON error payloads gracefully', async () => {
			const { api, ApiError } = await import('../api');
			global.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 502,
				json: async () => {
					throw new Error('Invalid JSON');
				},
			});

			await expect(api.links.getPreview('server-down')).rejects.toThrow(ApiError);
		});
	});
});
