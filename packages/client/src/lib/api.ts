import { ERROR_MESSAGES, CreateLinkBodyType, LinkResponseType } from '@tiny-link/shared';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

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

	const response = await fetch(url, { ...options, headers });

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
			fetcher<LinkResponseType>('/proxy/links', {
				method: 'POST',
				body: JSON.stringify(payload),
			}),
		/**
		 * Get stats for a short link
		 */
		getStats: (code: string) =>
			fetcher<unknown>(`/stats/${code}`, {
				method: 'GET',
			}),
		/**
		 * Claim guest links (called automatically on login)
		 */
		claim: (guestId: string) =>
			fetcher<{ success: boolean; claimedCount: number }>('/proxy/links/claim', {
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
			}>(`/proxy/links/user?${query.toString()}`, {
				method: 'GET',
			});
		},
		/**
		 * Delete (Soft Delete) a link
		 */
		delete: (id: string) =>
			fetcher<{ success: boolean }>(`/proxy/links/${id}`, {
				method: 'DELETE',
			}),
	},
};
