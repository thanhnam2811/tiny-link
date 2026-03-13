import { nanoid } from 'nanoid';
import { LinkRepository } from './link.repository';
import { AnalyticsManager } from '../analytics/analytics_manager';
import { Redis } from 'ioredis';
import { AppError } from '../../shared/app-error';

// Sentinel value used to distinguish "not found" from "cache miss"
// This protects against Cache Penetration attacks
const NOT_FOUND_SENTINEL = '__NOT_FOUND__';
const CACHE_TTL_SECONDS = 60 * 60 * 24; // 24 hours for valid links
const NOT_FOUND_TTL_SECONDS = 60 * 3; // 3 minutes for invalid codes (negative caching)

export class LinkService {
	// Promise Coalescing (Singleflight): prevents Cache Stampede
	// Maps a shortCode -> in-flight DB promise to deduplicate concurrent misses
	private readonly inflightRequests = new Map<string, Promise<string | null>>();

	constructor(
		private readonly linkRepository: LinkRepository,
		private readonly analyticsManager: AnalyticsManager,
		private readonly redis: Redis,
	) {}

	async createShortLink(originalUrl: string, customCode?: string) {
		let shortCode = customCode;
		const maxRetries = 3;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			if (!shortCode) {
				shortCode = nanoid(7);
			}

			try {
				const link = await this.linkRepository.create(originalUrl, shortCode);
				return link;
			} catch (error: unknown) {
				// P2002 is Prisma's error code for "Unique constraint failed"
				if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
					if (customCode) {
						// If custom code is taken, throw immediately
						throw new AppError(
							409,
							'LINK_CODE_CONFLICT',
							`The custom code '${customCode}' is already in use.`,
						);
					} else {
						// Auto-generated collision, retry
						shortCode = undefined;
						if (attempt === maxRetries) {
							throw new Error('Internal Server Error: Could not generate unique short code.', {
								cause: error,
							});
						}
						continue;
					}
				}
				throw error;
			}
		}

		throw new Error('Failed to create short link due to unknown error.');
	}

	async getOriginalUrlAndTrack(code: string, ipAddress?: string, userAgent?: string): Promise<string> {
		const cacheKey = `link:${code}`;

		// Step 1: Check Redis cache first
		const cached = await this.redis.get(cacheKey);

		if (cached !== null) {
			// Cache Penetration guard: hit but it's a "not found" sentinel
			if (cached === NOT_FOUND_SENTINEL) {
				throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found or inactive');
			}

			// Cache HIT (valid link): always track analytics even on cache hit
			this.analyticsManager.push({ linkId: cached.split(':')[0], ipAddress, userAgent });
			return cached.split(':').slice(1).join(':'); // url stored as "id:originalUrl"
		}

		// Step 2: Cache MISS — use Promise Coalescing to prevent Stampede
		// If there's already an in-flight DB query for this code, wait for it
		if (this.inflightRequests.has(code)) {
			const originalUrl = await this.inflightRequests.get(code)!;
			if (!originalUrl) {
				throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found or inactive');
			}
			return originalUrl;
		}

		// Step 3: First request for this code — query DB (and register in-flight)
		const dbQuery = this.linkRepository.findByShortCode(code).then(async (link) => {
			if (!link || !link.isActive) {
				// Negative Caching: cache NOT_FOUND to block future Penetration attempts
				await this.redis.set(cacheKey, NOT_FOUND_SENTINEL, 'EX', NOT_FOUND_TTL_SECONDS);
				return null;
			}
			// Cache the valid entry: store as "id:url" so we have both pieces
			const cacheValue = `${link.id}:${link.originalUrl}`;
			await this.redis.set(cacheKey, cacheValue, 'EX', CACHE_TTL_SECONDS);
			return link.originalUrl;
		});

		this.inflightRequests.set(code, dbQuery);

		try {
			const originalUrl = await dbQuery;
			if (!originalUrl) {
				throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found or inactive');
			}

			// Track analytics on miss too (we now have the link data)
			const cached2 = await this.redis.get(cacheKey);
			if (cached2 && cached2 !== NOT_FOUND_SENTINEL) {
				this.analyticsManager.push({ linkId: cached2.split(':')[0], ipAddress, userAgent });
			}

			return originalUrl;
		} finally {
			// Always clean up the in-flight map
			this.inflightRequests.delete(code);
		}
	}

	async getLinkStats(code: string) {
		const linkData = await this.linkRepository.getStats(code);

		if (!linkData) {
			throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found');
		}

		return {
			originalUrl: linkData.originalUrl,
			shortCode: linkData.shortCode,
			totalClicks: linkData.clicksCount,
			createdAt: linkData.createdAt,
		};
	}
}
