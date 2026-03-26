import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// Regex for common bots, crawlers, and social media preview fetchers
const BOT_REGEX =
	/bot|crawler|spider|crawling|facebookexternalhit|slurp|WhatsApp|Viber|TelegramBot|Discordbot|Twitterbot|Applebot/i;

export default auth((req) => {
	const { pathname } = req.nextUrl;
	const isAuth = !!req.auth;

	// 1. Dashboard Protection (PRIORITY)
	if (pathname.startsWith('/dashboard') && !isAuth) {
		console.log(`[Middleware] Unauthorized access to ${pathname}, redirecting to /login`);
		return NextResponse.redirect(new URL('/login', req.nextUrl));
	}

	// 2. Bot Detection & Context Injection
	const userAgent = req.headers.get('user-agent') || '';
	const isBot = BOT_REGEX.test(userAgent);
	const requestHeaders = new Headers(req.headers);
	requestHeaders.set('x-is-bot', isBot ? 'true' : 'false');

	const shortCode = pathname.replace(/^\//, '');
	// Only inject short-code for non-internal routes
	const isInternal =
		pathname.startsWith('/api') ||
		pathname.startsWith('/_next') ||
		pathname.startsWith('/login') ||
		pathname.startsWith('/dashboard') ||
		pathname.startsWith('/stats');

	if (shortCode && !isInternal) {
		requestHeaders.set('x-short-code', shortCode);
	}

	return NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
});

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - _next/data (data fetching)
		 * - favicon.ico, sitemap.xml, robots.txt (metadata files)
		 */
		'/((?!api|_next/static|_next/image|_next/data|favicon.ico|sitemap.xml|robots.txt).*)',
	],
};
