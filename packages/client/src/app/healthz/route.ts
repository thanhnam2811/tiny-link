import { NextResponse } from 'next/server';

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://localhost:3001';

/**
 * Proper Health Check Route for the Client (BFF)
 * This prevents 'healthz' from being matched by the dynamic [code] route redirection logic.
 * Pre-refactor: HIT /healthz
 * Post-refactor: HIT /api/healthz (as standardized for the REST prefix)
 */
export async function GET() {
	try {
		const response = await fetch(`${INTERNAL_API_URL}/api/healthz`, {
			cache: 'no-store',
		});

		if (!response.ok) {
			return NextResponse.json({ status: 'error', message: 'Upstream server unhealthy' }, { status: 503 });
		}

		const data = await response.json();
		return NextResponse.json({
			status: 'ready',
			upstream: data,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('[Health Check Error]:', error);
		return NextResponse.json({ status: 'error', message: 'Failed to connect to upstream server' }, { status: 503 });
	}
}
