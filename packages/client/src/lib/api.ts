import {
	ERROR_MESSAGES,
	CreateLinkBodyType,
	LinkResponseType,
	LinkPreviewResponseType,
	VerifyPasswordResponseType,
	TrackPublicResponseType,
} from '@tiny-link/shared';

import { getEnv } from './env';

const isServer = typeof window === 'undefined';
const BASE_URL = isServer ? getEnv('INTERNAL_API_URL') + '/api' : '/api/proxy';

export class ApiError extends Error {
	constructor(
		public statusCode: number,
		public code: string,
		public message: string,
		public details?: unknown[],
	) {
		super(message);
		this.name = 'ApiError';
	}
}

async function fetcher<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
	const url = `${BASE_URL}${endpoint}`;
	const headers = {
		'Content-Type': 'application/json',
		...options.headers,
	};

	const response = await fetch(url, { ...options, headers, cache: 'no-store' });

	let data: unknown;
	try {
		data = await response.json();
	} catch {
		if (!response.ok) {
			throw new ApiError(response.status, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, 'An unexpected error occurred.');
		}
		return {} as T;
	}

	if (!response.ok) {
		const errData = data as { statusCode?: number; code?: string; message?: string; details?: unknown[] };
		throw new ApiError(
			errData.statusCode || response.status,
			errData.code || 'UNKNOWN_ERROR',
			errData.message || 'An error occurred during the request.',
			errData.details,
		);
	}

	return data as T;
}

export const api = {
	links: {
		/**
		 * Create a new short link
		 */
		create: (payload: CreateLinkBodyType) =>
			fetcher<LinkResponseType>('/links', {
				method: 'POST',
				body: JSON.stringify(payload),
			}),
		/**
		 * Get stats for a short link
		 */
		getStats: (code: string, password?: string) =>
			fetcher<unknown>(`/stats/${code}`, {
				method: 'POST',
				body: JSON.stringify({ password }),
			}),
		/**
		 * Track a public link click
		 */
		track: (code: string) =>
			fetcher<TrackPublicResponseType>(`/links/${code}/track`, {
				method: 'POST',
			}),
		/**
		 * Verify password for a protected link
		 */
		verify: (code: string, password: string) =>
			fetcher<VerifyPasswordResponseType>(`/links/${code}/verify`, {
				method: 'POST',
				body: JSON.stringify({ password }),
			}),
		/**
		 * Get preview metadata for a link
		 */
		getPreview: (code: string) =>
			fetcher<LinkPreviewResponseType>(`/links/${code}/preview`, {
				method: 'GET',
			}),
		/**
		 * Claim guest links (called automatically on login)
		 */
		claim: (guestId: string) =>
			fetcher<{ success: boolean; claimedCount: number }>('/links/claim', {
				method: 'POST',
				body: JSON.stringify({ guestId }),
			}),
		/**
		 * Get links for the authenticated user
		 */
		getUserLinks: (page: number = 1, limit: number = 10, search?: string) => {
			const query = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
				...(search && { search }),
			});
			return fetcher<{
				links: LinkResponseType[];
				totalCount: number;
				totalPages: number;
				currentPage: number;
			}>(`/links/user?${query.toString()}`, {
				method: 'GET',
			});
		},
		/**
		 * Delete (Soft Delete) a link
		 */
		delete: (id: string) =>
			fetcher<{ success: boolean }>(`/links/${id}`, {
				method: 'DELETE',
			}),
	},
};
