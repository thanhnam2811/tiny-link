import {
	ERROR_MESSAGES,
	INTERNAL_AUTH,
	CreateLinkBodyType,
	LinkResponseType,
	LinkPreviewResponseType,
	LinkStatsResponseType,
	VerifyPasswordResponseType,
	TrackPublicResponseType,
	BulkImportResponseType,
} from '@tiny-link/shared';

import { getEnv } from './env';

const isServer = typeof window === 'undefined';
const getBaseUrl = () => (isServer ? `${getEnv('INTERNAL_API_URL').replace(/\/+$/, '')}/api` : '/api/proxy');

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
	const url = `${getBaseUrl()}${endpoint}`;

	const headers = new Headers(options.headers);
	if (!headers.has('Content-Type')) {
		headers.set('Content-Type', 'application/json');
	}
	if (isServer) {
		headers.set(INTERNAL_AUTH.HEADER, getEnv('INTERNAL_API_KEY'));
	}

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
		 * Retrieve analytics and stats for a short link
		 */
		getStats: (code: string, password?: string) =>
			fetcher<LinkStatsResponseType>(`/stats/${code}`, {
				method: 'POST',
				body: JSON.stringify({ password }),
			}),

		/**
		 * Track a click and retrieve the target URL
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
		 * Fetch link preview metadata
		 */
		getPreview: (code: string) =>
			fetcher<LinkPreviewResponseType>(`/links/${code}/preview`, {
				method: 'GET',
			}),

		/**
		 * Claim guest links for the authenticated user
		 */
		claim: (guestId: string) =>
			fetcher<{ success: boolean; claimedCount: number }>('/links/claim', {
				method: 'POST',
				body: JSON.stringify({ guestId }),
			}),

		/**
		 * Get links created by current authenticated user
		 */
		getUserLinks: (page: number = 1, limit: number = 10, search?: string, signal?: AbortSignal) => {
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
				signal,
			});
		},

		/**
		 * Delete a link by ID
		 */
		delete: (id: string) =>
			fetcher<{ success: boolean }>(`/links/${id}`, {
				method: 'DELETE',
			}),

		/**
		 * Bulk import links via CSV upload
		 */
		bulkImport: async (file: File): Promise<BulkImportResponseType> => {
			const formData = new FormData();
			formData.append('file', file);

			const headers = new Headers();
			if (isServer) {
				headers.set(INTERNAL_AUTH.HEADER, getEnv('INTERNAL_API_KEY'));
			}

			const response = await fetch(`${getBaseUrl()}/links/bulk-import`, {
				method: 'POST',
				body: formData,
				headers,
				cache: 'no-store',
			});

			const data = await response.json();

			if (!response.ok) {
				throw new ApiError(
					data.statusCode || response.status,
					data.code || 'UNKNOWN_ERROR',
					data.message || 'Bulk import failed',
					data.details,
				);
			}

			return data as BulkImportResponseType;
		},

		/**
		 * Export the authenticated user's links as a CSV file
		 */
		exportCsv: async (): Promise<Blob> => {
			const headers = new Headers();
			if (isServer) {
				headers.set(INTERNAL_AUTH.HEADER, getEnv('INTERNAL_API_KEY'));
			}

			const response = await fetch(`${getBaseUrl()}/links/export`, {
				method: 'GET',
				headers,
				cache: 'no-store',
			});

			if (!response.ok) {
				let message = 'Failed to export links';
				try {
					const data = await response.json();
					message = data.message || message;
				} catch {
					// Non-JSON error body; keep the generic message.
				}
				throw new ApiError(response.status, ERROR_MESSAGES.INTERNAL_SERVER_ERROR, message);
			}

			return response.blob();
		},
	},

	health: {
		/**
		 * Check whether the backend is up (used to gate the landing page while a
		 * free-tier backend spins up).
		 */
		check: (signal?: AbortSignal) => fetcher<{ status: string }>('/healthz', { method: 'GET', signal }),
	},
};
