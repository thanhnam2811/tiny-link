/**
 * Base URL for constructing short links and displaying the alias prefix.
 * Prefers the build-time `NEXT_PUBLIC_CLIENT_URL` (works during SSR, avoids a
 * hydration mismatch); falls back to the browser's own origin when unset.
 */
export function getClientBaseUrl(): string {
	const rawBase = process.env.NEXT_PUBLIC_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : '');
	return rawBase.replace(/\/+$/, '');
}
