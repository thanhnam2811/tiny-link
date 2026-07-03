import { NextRequest, NextResponse } from 'next/server';
import { auth0 } from '@/lib/auth0';

// Regex for common bots, crawlers, and social media preview fetchers
const BOT_REGEX =
	/bot|crawler|spider|crawling|facebookexternalhit|slurp|WhatsApp|Viber|TelegramBot|Discordbot|Twitterbot|Applebot/i;

export default async function middleware(req: NextRequest) {
	// Let the Auth0 SDK handle its own /auth/* routes and refresh the session cookie.
	const authResponse = await auth0.middleware(req);
	if (req.nextUrl.pathname.startsWith('/auth')) {
		return authResponse;
	}

	const { pathname } = req.nextUrl;
	const session = await auth0.getSession(req);
	const isAuth = !!session;

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

	// Preserve Auth0's refreshed session cookies on the passthrough response.
	const response = NextResponse.next({
		request: {
			headers: requestHeaders,
		},
	});
	authResponse.cookies.getAll().forEach((cookie) => response.cookies.set(cookie));

	return response;
}

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
