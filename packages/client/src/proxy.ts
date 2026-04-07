import { auth } from './auth';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

// Next.js 16 expects an exported function named 'proxy' and a config named 'proxyConfig'
export const proxy = auth((req) => {
	const isAuth = !!req.auth;
	const { pathname } = req.nextUrl;

	// Check if we're on an auth page or dashboard, regardless of locale prefix
	const isLogin = pathname.endsWith('/login');
	const isDashboard = pathname.includes('/dashboard');

	if (isLogin && isAuth) {
		// Already logged in, redirect to localized dashboard
		const locale = pathname.startsWith('/vi') ? 'vi' : 'en';
		return Response.redirect(new URL(`/${locale}/dashboard`, req.url));
	}

	if (isDashboard && !isAuth) {
		// Not logged in, redirect to localized login
		const locale = pathname.startsWith('/vi') ? 'vi' : 'en';
		return Response.redirect(new URL(`/${locale}/login`, req.url));
	}

	// Use next-intl to handle locale detection and routing
	return intlMiddleware(req);
});

export const proxyConfig = {
	// Match all pathnames except for:
	// - api routes
	// - next assets
	// - static files (favicon, icon, etc.)
	matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
