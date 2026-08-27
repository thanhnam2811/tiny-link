import * as cheerio from 'cheerio';
import dns from 'node:dns/promises';
import net from 'node:net';

export interface ScrapedMetadata {
	metaTitle: string | null;
	metaDescription: string | null;
	metaImage: string | null;
}

/**
 * Validates if an IP address belongs to private/internal/loopback/link-local/cloud-metadata subnets.
 */
export function isPrivateIp(ip: string): boolean {
	if (net.isIPv4(ip)) {
		const parts = ip.split('.').map(Number);
		if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
			return true; // invalid IP structure -> reject as unsafe
		}
		const [a, b] = parts;
		return (
			a === 0 || // 0.0.0.0/8 (Current network)
			a === 10 || // 10.0.0.0/8 (Private)
			a === 127 || // 127.0.0.0/8 (Loopback)
			(a === 172 && b >= 16 && b <= 31) || // 172.16.0.0/12 (Private)
			(a === 192 && b === 168) || // 192.168.0.0/16 (Private)
			(a === 169 && b === 254) || // 169.254.0.0/16 (Link-local / Cloud metadata IMDS)
			(a === 100 && b >= 64 && b <= 127) || // 100.64.0.0/10 (CGNAT / Shared address space)
			a >= 224 // 224.0.0.0/4 (Multicast & Reserved)
		);
	}

	if (net.isIPv6(ip)) {
		const normalized = ip.toLowerCase();
		return (
			normalized === '::' ||
			normalized === '::1' ||
			normalized.startsWith('::ffff:127.') ||
			normalized.startsWith('::ffff:10.') ||
			normalized.startsWith('::ffff:192.168.') ||
			normalized.startsWith('::ffff:172.') ||
			normalized.startsWith('::ffff:169.254.') ||
			normalized.startsWith('fc') || // fc00::/7 (Unique local)
			normalized.startsWith('fd') || // fd00::/8 (Unique local)
			normalized.startsWith('fe80') // fe80::/10 (Link-local)
		);
	}

	return true; // If not valid IPv4 or IPv6, treat as unsafe
}

/**
 * Checks whether a given URL hostname resolves to a private or disallowed IP address.
 */
export async function isUnsafeUrl(urlStr: string): Promise<boolean> {
	try {
		const parsed = new URL(urlStr);
		if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
			return true;
		}

		// Normalize hostname and strip IPv6 brackets if present
		const hostname = parsed.hostname.replace(/^\[|\]$/g, '').toLowerCase();

		// Immediate check for common loopback/internal names
		if (
			hostname === 'localhost' ||
			hostname.endsWith('.localhost') ||
			hostname.endsWith('.local') ||
			hostname.endsWith('.internal')
		) {
			return true;
		}

		// If hostname is directly an IP literal
		if (net.isIP(hostname)) {
			return isPrivateIp(hostname);
		}

		// DNS resolution pre-flight check
		const lookupResults = await dns.lookup(hostname, { all: true });
		if (!lookupResults || lookupResults.length === 0) {
			return true;
		}

		return lookupResults.some((result) => isPrivateIp(result.address));
	} catch {
		return true; // If DNS resolution fails or URL is invalid, fail-safe (unsafe)
	}
}

export async function scrapeUrlMetadata(url: string): Promise<ScrapedMetadata> {
	try {
		// SSRF Guard: Verify that the target is a valid, public, non-private endpoint
		if (await isUnsafeUrl(url)) {
			return { metaTitle: null, metaDescription: null, metaImage: null };
		}

		// AbortSignal.timeout bounds entire connection + headers + body read
		const response = await fetch(url, {
			headers: { 'User-Agent': 'TinyLinkBot/1.0 (+https://tinylink.dev)' },
			signal: AbortSignal.timeout(2000),
			redirect: 'error', // Prevent SSRF bypass via open redirect on external server
		});

		if (!response.ok) {
			return { metaTitle: null, metaDescription: null, metaImage: null };
		}

		// Cheerio parsing
		const html = await response.text();
		const $ = cheerio.load(html);

		// Title strategies
		const metaTitle =
			$('meta[property="og:title"]').attr('content') ||
			$('meta[name="twitter:title"]').attr('content') ||
			$('title').text() ||
			null;

		// Description strategies
		const metaDescription =
			$('meta[property="og:description"]').attr('content') ||
			$('meta[name="twitter:description"]').attr('content') ||
			$('meta[name="description"]').attr('content') ||
			null;

		// Image strategies
		const metaImage =
			$('meta[property="og:image"]').attr('content') || $('meta[name="twitter:image"]').attr('content') || null;

		return { metaTitle, metaDescription, metaImage };
	} catch (error) {
		console.error(`[Scraper] Failed to scrape metadata for ${url}:`, error);
		return { metaTitle: null, metaDescription: null, metaImage: null };
	}
}
