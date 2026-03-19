import * as cheerio from 'cheerio';

export interface ScrapedMetadata {
	metaTitle: string | null;
	metaDescription: string | null;
	metaImage: string | null;
}

export async function scrapeUrlMetadata(url: string): Promise<ScrapedMetadata> {
	try {
		// Use AbortController for a strict 2s timeout
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 2000);

		const response = await fetch(url, {
			headers: { 'User-Agent': 'TinyLinkBot/1.0 (+https://tinylink.dev)' },
			signal: controller.signal,
		});
		clearTimeout(timeoutId);

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
