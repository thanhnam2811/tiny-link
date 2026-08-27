import { describe, it, expect, vi, beforeEach } from 'vitest';
import dns from 'node:dns/promises';
import { isPrivateIp, isUnsafeUrl, scrapeUrlMetadata } from '../../src/modules/link/metadata.scraper';

describe('SSRF Protection in Metadata Scraper (TL-SEC-02)', () => {
	describe('isPrivateIp', () => {
		it('identifies IPv4 loopback addresses as private', () => {
			expect(isPrivateIp('127.0.0.1')).toBe(true);
			expect(isPrivateIp('127.255.255.254')).toBe(true);
		});

		it('identifies RFC 1918 private subnets as private', () => {
			expect(isPrivateIp('10.0.0.1')).toBe(true);
			expect(isPrivateIp('10.254.1.10')).toBe(true);
			expect(isPrivateIp('172.16.0.1')).toBe(true);
			expect(isPrivateIp('172.31.255.255')).toBe(true);
			expect(isPrivateIp('192.168.0.1')).toBe(true);
			expect(isPrivateIp('192.168.1.100')).toBe(true);
		});

		it('identifies cloud metadata and link-local addresses as private', () => {
			expect(isPrivateIp('169.254.169.254')).toBe(true);
			expect(isPrivateIp('169.254.1.1')).toBe(true);
		});

		it('identifies CGNAT (100.64.0.0/10) as private', () => {
			expect(isPrivateIp('100.64.0.1')).toBe(true);
			expect(isPrivateIp('100.127.255.254')).toBe(true);
			expect(isPrivateIp('100.63.255.255')).toBe(false);
			expect(isPrivateIp('100.128.0.1')).toBe(false);
		});

		it('identifies 0.0.0.0 and multicast/reserved as private', () => {
			expect(isPrivateIp('0.0.0.0')).toBe(true);
			expect(isPrivateIp('224.0.0.1')).toBe(true);
			expect(isPrivateIp('240.0.0.1')).toBe(true);
		});

		it('identifies IPv6 loopback, link-local, and unique-local as private', () => {
			expect(isPrivateIp('::1')).toBe(true);
			expect(isPrivateIp('::')).toBe(true);
			expect(isPrivateIp('fe80::1')).toBe(true);
			expect(isPrivateIp('fc00::1')).toBe(true);
			expect(isPrivateIp('fd12:3456::1')).toBe(true);
			expect(isPrivateIp('::ffff:127.0.0.1')).toBe(true);
		});

		it('allows legitimate public IP addresses', () => {
			expect(isPrivateIp('8.8.8.8')).toBe(false);
			expect(isPrivateIp('1.1.1.1')).toBe(false);
			expect(isPrivateIp('140.82.121.4')).toBe(false);
			expect(isPrivateIp('172.32.0.1')).toBe(false);
		});
	});

	describe('isUnsafeUrl', () => {
		it('detects localhost and private IP URLs as unsafe', async () => {
			expect(await isUnsafeUrl('http://localhost:3000')).toBe(true);
			expect(await isUnsafeUrl('http://127.0.0.1:3001')).toBe(true);
			expect(await isUnsafeUrl('http://[::1]:3001')).toBe(true);
			expect(await isUnsafeUrl('http://169.254.169.254/latest/meta-data/')).toBe(true);
			expect(await isUnsafeUrl('http://192.168.1.1/router')).toBe(true);
			expect(await isUnsafeUrl('http://10.0.0.5:8080/')).toBe(true);
		});

		it('rejects non-http/https protocols', async () => {
			expect(await isUnsafeUrl('ftp://example.com')).toBe(true);
			expect(await isUnsafeUrl('file:///etc/passwd')).toBe(true);
			expect(await isUnsafeUrl('javascript:alert(1)')).toBe(true);
		});

		it('detects domains resolving to private IPs via DNS lookup mock', async () => {
			vi.spyOn(dns, 'lookup').mockResolvedValueOnce([
				{ address: '192.168.1.50', family: 4 },
			] as unknown as dns.LookupAddress[]);

			expect(await isUnsafeUrl('http://malicious-domain.com')).toBe(true);
		});
	});

	describe('scrapeUrlMetadata', () => {
		beforeEach(() => {
			vi.restoreAllMocks();
		});

		it('safely skips scraping for private/SSRF target URLs without making fetch calls', async () => {
			const fetchSpy = vi.spyOn(global, 'fetch');

			const privateTargets = [
				'http://127.0.0.1:3001/api/admin/metrics',
				'http://localhost:3000/secret',
				'http://[::1]:3000/secret',
				'http://169.254.169.254/latest/meta-data/',
				'http://10.0.0.1/admin',
			];

			for (const target of privateTargets) {
				const result = await scrapeUrlMetadata(target);
				expect(result).toEqual({ metaTitle: null, metaDescription: null, metaImage: null });
			}

			expect(fetchSpy).not.toHaveBeenCalled();
		});

		it('handles non-200 responses gracefully with null metadata', async () => {
			vi.spyOn(global, 'fetch').mockResolvedValue(
				new Response('Not Found', { status: 404, statusText: 'Not Found' }),
			);

			const result = await scrapeUrlMetadata('https://example.com/not-found');
			expect(result).toEqual({ metaTitle: null, metaDescription: null, metaImage: null });
		});

		it('parses OpenGraph and HTML meta tags properly for public URLs', async () => {
			const mockHtml = `
				<!DOCTYPE html>
				<html>
				<head>
					<title>Fallback Title</title>
					<meta property="og:title" content="OpenGraph Title" />
					<meta property="og:description" content="OpenGraph Description" />
					<meta property="og:image" content="https://example.com/og-image.png" />
				</head>
				<body></body>
				</html>
			`;

			vi.spyOn(global, 'fetch').mockResolvedValue(
				new Response(mockHtml, {
					status: 200,
					headers: { 'Content-Type': 'text/html' },
				}),
			);

			const result = await scrapeUrlMetadata('https://example.com/article');
			expect(result).toEqual({
				metaTitle: 'OpenGraph Title',
				metaDescription: 'OpenGraph Description',
				metaImage: 'https://example.com/og-image.png',
			});
		});
	});
});
