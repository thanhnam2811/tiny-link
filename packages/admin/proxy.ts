import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function proxy(request: NextRequest) {
	const token = request.cookies.get('admin_token')?.value;
	const { pathname } = request.nextUrl;

	// 1. If trying to access login page while already authenticated
	if (pathname === '/login' && token) {
		return NextResponse.redirect(new URL('/', request.url));
	}

	// 2. If trying to access protected pages without token
	// Add other protected paths to the condition if needed
	if (pathname === '/' && !token) {
		return NextResponse.redirect(new URL('/login', request.url));
	}

	return NextResponse.next();
}

export const proxyConfig = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		'/((?!api|_next/static|_next/image|favicon.ico).*)',
	],
};
