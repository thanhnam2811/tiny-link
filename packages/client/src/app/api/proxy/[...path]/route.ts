import { auth } from '@/auth';
import { INTERNAL_AUTH } from '@tiny-link/shared';
import { NextRequest, NextResponse } from 'next/server';

const FASTIFY_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

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
	const session = await auth();
	const path = pathSegments.join('/');
	const searchParams = req.nextUrl.searchParams.toString();
	const url = `${FASTIFY_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

	const headers = new Headers(req.headers);
	headers.delete('host'); // Let fetch handle Host header
	headers.set(INTERNAL_AUTH.HEADER, INTERNAL_API_KEY || '');

	if (session?.user?.id) {
		headers.set(INTERNAL_AUTH.USER_ID_HEADER, session.user.id);
	}

	try {
		const body = req.method !== 'GET' && req.method !== 'HEAD' ? await req.text() : undefined;

		const response = await fetch(url, {
			method: req.method,
			headers,
			body,
			cache: 'no-store',
		});

		const data = await response.text();

		return new NextResponse(data, {
			status: response.status,
			headers: {
				'Content-Type': response.headers.get('Content-Type') || 'application/json',
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
