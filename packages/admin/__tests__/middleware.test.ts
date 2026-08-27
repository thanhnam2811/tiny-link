import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware, config } from '../middleware';

describe('Admin Middleware Route Protection (TL-ADM-01)', () => {
	it('redirects unauthenticated user from / to /login', () => {
		const req = new NextRequest('http://localhost:3002/');
		const res = middleware(req);

		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3002/login');
	});

	it('redirects unauthenticated user from /links to /login', () => {
		const req = new NextRequest('http://localhost:3002/links');
		const res = middleware(req);

		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3002/login');
	});

	it('redirects unauthenticated user from /health to /login', () => {
		const req = new NextRequest('http://localhost:3002/health');
		const res = middleware(req);

		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3002/login');
	});

	it('allows unauthenticated user to access /login', () => {
		const req = new NextRequest('http://localhost:3002/login');
		const res = middleware(req);

		expect(res.status).toBe(200);
		expect(res.headers.get('x-middleware-rewrite')).toBeNull();
		expect(res.headers.get('location')).toBeNull();
	});

	it('redirects authenticated user from /login to /', () => {
		const req = new NextRequest('http://localhost:3002/login', {
			headers: {
				cookie: 'admin_token=valid-jwt-token',
			},
		});
		const res = middleware(req);

		expect(res.status).toBe(307);
		expect(res.headers.get('location')).toBe('http://localhost:3002/');
	});

	it('allows authenticated user to access protected / route', () => {
		const req = new NextRequest('http://localhost:3002/', {
			headers: {
				cookie: 'admin_token=valid-jwt-token',
			},
		});
		const res = middleware(req);

		expect(res.status).toBe(200);
		expect(res.headers.get('location')).toBeNull();
	});

	it('allows authenticated user to access protected /links route', () => {
		const req = new NextRequest('http://localhost:3002/links', {
			headers: {
				cookie: 'admin_token=valid-jwt-token',
			},
		});
		const res = middleware(req);

		expect(res.status).toBe(200);
		expect(res.headers.get('location')).toBeNull();
	});

	it('allows authenticated user to access protected /health route', () => {
		const req = new NextRequest('http://localhost:3002/health', {
			headers: {
				cookie: 'admin_token=valid-jwt-token',
			},
		});
		const res = middleware(req);

		expect(res.status).toBe(200);
		expect(res.headers.get('location')).toBeNull();
	});

	it('exports valid Next.js middleware matcher config', () => {
		expect(config).toBeDefined();
		expect(config.matcher).toBeDefined();
		expect(Array.isArray(config.matcher)).toBe(true);
		expect(config.matcher.length).toBeGreaterThan(0);
	});
});
