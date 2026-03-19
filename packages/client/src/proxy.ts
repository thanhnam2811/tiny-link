import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Regex for common bots, crawlers, and social media preview fetchers
const BOT_REGEX =
	/bot|crawler|spider|crawling|facebookexternalhit|slurp|WhatsApp|Viber|TelegramBot|Discordbot|Twitterbot|Applebot/i;

export function proxy(request: NextRequest) {
	const userAgent = request.headers.get('user-agent') || '';
	const isBot = BOT_REGEX.test(userAgent);

	// Extract the short code from the pathname (e.g., "/xyz" -> "xyz")
	const pathname = request.nextUrl.pathname;
	const shortCode = pathname.replace(/^\//, '');

	// Clone headers to inject our custom context
	const requestHeaders = new Headers(request.headers);
	requestHeaders.set('x-is-bot', isBot ? 'true' : 'false');

	// Only inject x-short-code if it's not the root path
	if (shortCode) {
		requestHeaders.set('x-short-code', shortCode);
	}

	// Next.js convention to log in edge runtime: console.log works correctly
	console.log(`[Middleware] Path: ${pathname} | User-Agent: ${userAgent} | isBot: ${isBot}`);

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
}

// See "Matching Paths" below to learn more
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - _next/data (data fetching)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 * - stats (statistics pages)
		 */
		'/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt|stats).*)',
	],
};
