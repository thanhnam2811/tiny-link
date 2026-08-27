import { auth0 } from '@/lib/auth0';
import { INTERNAL_AUTH } from '@tiny-link/shared';
import { NextRequest, NextResponse } from 'next/server';
import { getEnv } from '@/lib/env';

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	const { path } = await params;
	return handleProxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	const { path } = await params;
	return handleProxy(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	const { path } = await params;
	return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
	const { path } = await params;
	return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathSegments: string[]) {
	const FASTIFY_URL = getEnv('INTERNAL_API_URL');
	const INTERNAL_API_KEY = getEnv('INTERNAL_API_KEY');

	const session = await auth0.getSession();
	const path = pathSegments.join('/');
	const searchParams = req.nextUrl.searchParams.toString();
	const url = `${FASTIFY_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

	const headers = new Headers(req.headers);
	headers.delete('host'); // Let fetch handle Host header
	headers.delete(INTERNAL_AUTH.USER_ID_HEADER); // Prevent identity spoofing
	headers.set(INTERNAL_AUTH.HEADER, INTERNAL_API_KEY || '');

	if (session?.user?.sub) {
		headers.set(INTERNAL_AUTH.USER_ID_HEADER, session.user.sub);
	}

	try {
		// Read as raw bytes (not text) so binary/multipart payloads (e.g. CSV file uploads) survive the proxy unmangled.
		const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.arrayBuffer() : undefined;

		// If body is empty, remove content-type to avoid Fastify errors
		if (!body || body.byteLength === 0) {
			headers.delete('content-type');
		}

		const response = await fetch(url, {
			method: req.method,
			headers,
			body: body && body.byteLength > 0 ? body : undefined,
			cache: 'no-store',
		});

		const contentType = response.headers.get('Content-Type') || 'application/json';

		// Binary/CSV responses (e.g. link export) must also be forwarded as raw bytes, not decoded text.
		if (!contentType.includes('application/json') && !contentType.includes('text/')) {
			const data = await response.arrayBuffer();
			return new NextResponse(data, { status: response.status, headers: { 'Content-Type': contentType } });
		}

		const data = await response.text();

		return new NextResponse(data, {
			status: response.status,
			headers: {
				'Content-Type': contentType,
				...(response.headers.get('Content-Disposition') && {
					'Content-Disposition': response.headers.get('Content-Disposition') as string,
				}),
			},
		});
	} catch (error) {
		console.error('[BFF Proxy Error]:', error);
		return NextResponse.json(
			{ error: 'BFF_PROXY_ERROR', message: 'Failed to communicate with upstream server' },
			{ status: 502 },
		);
	}
}
