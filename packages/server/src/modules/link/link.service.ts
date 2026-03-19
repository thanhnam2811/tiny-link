import { nanoid } from 'nanoid';
import { LinkRepository } from './link.repository';
import { AnalyticsManager } from '../analytics/analytics_manager';
import { Redis } from 'ioredis';
import { AppError } from '../../shared/app-error';
import * as argon2 from 'argon2';
import { SYSTEM_CONFIG, HTTP_STATUS, ERROR_MESSAGES } from '@tiny-link/shared';
import { scrapeUrlMetadata } from './metadata.scraper';

// Sentinel values used to distinguish edge cases from "cache miss"
// This protects against Cache Penetration attacks
const NOT_FOUND_SENTINEL = '__NOT_FOUND__';
const GONE_SENTINEL = '__GONE_SENTINEL__';

export class LinkService {
	// Promise Coalescing (Singleflight): prevents Cache Stampede
	// Maps a shortCode -> in-flight DB promise to deduplicate concurrent misses
	private readonly inflightRequests = new Map<string, Promise<void>>();

	constructor(
		private readonly linkRepository: LinkRepository,
		private readonly analyticsManager: AnalyticsManager,
		private readonly redis: Redis,
	) {}

	async createShortLink(
		originalUrl: string,
		customCode?: string,
		maxClicks?: number,
		expiresAt?: Date,
		password?: string,
	) {
		let shortCode = customCode;
		const maxRetries = SYSTEM_CONFIG.SHORT_LINK_MAX_RETRIES;

		let passwordHash: string | undefined = undefined;
		if (password) {
			passwordHash = await argon2.hash(password);
		}

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			if (!shortCode) {
				shortCode = nanoid(SYSTEM_CONFIG.SHORT_LINK_LENGTH);
			}

			try {
				const link = await this.linkRepository.create(
					originalUrl,
					shortCode,
					maxClicks,
					expiresAt,
					passwordHash,
				);

				// Fire-and-forget: Scrape OpenGraph metadata in background
				scrapeUrlMetadata(originalUrl).then(async (metadata) => {
					if (metadata.metaTitle || metadata.metaDescription || metadata.metaImage) {
						await this.linkRepository.updateMetadata(link.id, metadata).catch((err) => {
							console.error(`[Scraper] Failed to save DB metadata for ${link.id}:`, err);
						});
					}
				});

				return link;
			} catch (error: unknown) {
				// P2002 is Prisma's error code for "Unique constraint failed"
				if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
					if (customCode) {
						// If custom code is taken, throw immediately
						throw new AppError(
							HTTP_STATUS.CONFLICT,
							ERROR_MESSAGES.LINK_CODE_CONFLICT,
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

		// Step 1: Check Redis cache first using Hash
		const cachedLink = await this.redis.hgetall(cacheKey);

		if (cachedLink && Object.keys(cachedLink).length > 0) {
			// Cache Penetration guard: hit but it's a "not found" or "gone" sentinel
			if (cachedLink.status === NOT_FOUND_SENTINEL) {
				throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.LINK_NOT_FOUND, 'Link not found or inactive');
			}
			if (cachedLink.status === GONE_SENTINEL) {
				throw new AppError(HTTP_STATUS.GONE, ERROR_MESSAGES.LINK_GONE, 'Link has self-destructed');
			}

			// Valid Link Check
			if (cachedLink.originalUrl) {
				// Password Requirement Check
				if (cachedLink.isProtected === 'true') {
					throw new AppError(
						HTTP_STATUS.UNAUTHORIZED,
						ERROR_MESSAGES.LINK_UNAUTHORIZED,
						'This link is password protected.',
					);
				}
				// Enforce expiration
				if (cachedLink.expiresAt) {
					const expiresAt = new Date(cachedLink.expiresAt);
					if (expiresAt < new Date()) {
						await this.redis.hset(cacheKey, 'status', GONE_SENTINEL);
						await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
						throw new AppError(
							HTTP_STATUS.GONE,
							ERROR_MESSAGES.LINK_GONE,
							'Link has self-destructed due to expiration',
						);
					}
				}

				// Enforce click limit using Hardware Atomic INCR
				if (cachedLink.maxClicks) {
					const maxClicks = parseInt(cachedLink.maxClicks, 10);
					const currentClicks = await this.redis.hincrby(cacheKey, 'currentClicks', 1);

					if (currentClicks > maxClicks) {
						await this.redis.hset(cacheKey, 'status', GONE_SENTINEL);
						await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
						throw new AppError(
							HTTP_STATUS.GONE,
							ERROR_MESSAGES.LINK_GONE,
							'Link has self-destructed due to reaching max clicks',
						);
					}
				}

				// Cache HIT: valid hit -> push to real-time analytics
				this.analyticsManager.push({ linkId: cachedLink.id, ipAddress, userAgent });
				return cachedLink.originalUrl;
			}
		}

		// Step 2: Cache MISS — use Promise Coalescing to prevent Stampede
		// If there's already an in-flight DB query for this code, wait for it
		if (this.inflightRequests.has(code)) {
			await this.inflightRequests.get(code);
			// After the concurrent query completes, recursively retry to hit the updated Redis Hash
			// This absolutely fixes concurrency bypass where awaiting the Promise skips the `hincrby` step!
			return this.getOriginalUrlAndTrack(code, ipAddress, userAgent);
		}

		// Step 3: First request for this code — query DB (and register in-flight)
		const dbQuery = this.linkRepository.findByShortCode(code).then(async (link) => {
			if (!link || !link.isActive) {
				await this.redis.hset(cacheKey, 'status', NOT_FOUND_SENTINEL);
				await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
				throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.LINK_NOT_FOUND, 'Link not found or inactive');
			}

			// Calculate early self-destruction to prevent saving invalid stuff
			if (link.expiresAt && link.expiresAt < new Date()) {
				await this.redis.hset(cacheKey, 'status', GONE_SENTINEL);
				await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
				throw new AppError(
					HTTP_STATUS.GONE,
					ERROR_MESSAGES.LINK_GONE,
					'Link has self-destructed due to expiration',
				);
			}

			// If link is already maxed out
			if (link.maxClicks && link.clicksCount >= link.maxClicks) {
				await this.redis.hset(cacheKey, 'status', GONE_SENTINEL);
				await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
				// MUST THROW HERE!
				// The previous code had a bug where it just returned undefined, resulting in NO response!
				throw new AppError(
					HTTP_STATUS.GONE,
					ERROR_MESSAGES.LINK_GONE,
					'Link has self-destructed due to reaching max clicks',
				);
			}

			// Block Redirect if password protected (Cache MISS initial load)
			// We MUST throw here so the 1st request doesn't bypass the password!
			if (link.passwordHash) {
				// We still cache the metadata first so subsequent requests hit the Redis HIT 401 block
				await this.redis.hset(cacheKey, {
					id: link.id,
					originalUrl: link.originalUrl,
					isProtected: 'true',
					...(link.expiresAt && { expiresAt: link.expiresAt.toISOString() }),
					...(link.maxClicks && {
						maxClicks: link.maxClicks.toString(),
						currentClicks: link.clicksCount.toString(),
					}),
				});
				await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_CACHE_TTL_SECONDS);

				// Throw immediately so this specific request doesn't leak the URL
				throw new AppError(
					HTTP_STATUS.UNAUTHORIZED,
					ERROR_MESSAGES.LINK_UNAUTHORIZED,
					'This link is password protected.',
				);
			}

			// Store metadata in Redis Hash
			const hashData: Record<string, string | number> = {
				id: link.id,
				originalUrl: link.originalUrl,
			};

			if (link.expiresAt) {
				hashData.expiresAt = link.expiresAt.toISOString();
			}

			if (link.maxClicks) {
				hashData.maxClicks = link.maxClicks.toString();
				hashData.currentClicks = link.clicksCount.toString(); // Initialize tracking
			}

			if (link.passwordHash) {
				hashData.isProtected = 'true';
			}

			// We only reach here if the link is NOT password protected
			await this.redis.hset(cacheKey, hashData);
			await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_CACHE_TTL_SECONDS);
		});

		this.inflightRequests.set(code, dbQuery);

		try {
			await dbQuery;
		} finally {
			// Always clean up the in-flight map
			this.inflightRequests.delete(code);
		}

		// Recurse to pass through the newly established Redis Cache step above
		// This ensures they are properly logged in the AnalyticsQueue and correctly trigger `HINCRBY`
		// Also ensures that if it's password protected, the recursive call will catch it in the HIT flow and throw 401.
		return await this.getOriginalUrlAndTrack(code, ipAddress, userAgent);
	}

	async getLinkStats(code: string, password?: string) {
		const linkData = await this.linkRepository.getStats(code);

		if (!linkData) {
			throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.LINK_NOT_FOUND, 'Link not found');
		}

		if (linkData.passwordHash) {
			if (!password) {
				throw new AppError(
					HTTP_STATUS.UNAUTHORIZED,
					ERROR_MESSAGES.LINK_UNAUTHORIZED,
					'Password required to view statistics',
				);
			}
			const isMatch = await argon2.verify(linkData.passwordHash, password);
			if (!isMatch) {
				throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.LINK_UNAUTHORIZED, 'Incorrect password');
			}
		}

		const geoStatsRaw = await this.linkRepository.getGeoStats(linkData.id);
		const timeSeriesRaw = await this.linkRepository.getTimeSeriesStats(linkData.id, 7);

		// Format into a clean dictionary
		const countries = geoStatsRaw.countryStats.reduce(
			(acc, curr) => {
				if (curr.country) acc[curr.country] = curr._count._all;
				return acc;
			},
			{} as Record<string, number>,
		);

		const cities = geoStatsRaw.cityStats.reduce(
			(acc, curr) => {
				if (curr.city) acc[curr.city] = curr._count._all;
				return acc;
			},
			{} as Record<string, number>,
		);

		// Pad TimeSeries for Recharts to ensure every day exists without blanks
		const timeSeries = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date();
			d.setHours(0, 0, 0, 0);
			d.setDate(d.getDate() - i);
			const dateStr = d.toISOString().split('T')[0];

			const existing = timeSeriesRaw.find((t) => {
				const td = new Date(t.date);
				return td.toISOString().split('T')[0] === dateStr;
			});

			timeSeries.push({
				date: dateStr,
				count: existing ? Number(existing.count) : 0,
			});
		}

		return {
			originalUrl: linkData.originalUrl,
			shortCode: linkData.shortCode,
			totalClicks: linkData.clicksCount,
			createdAt: linkData.createdAt,
			geo: {
				countries,
				cities,
			},
			timeSeries,
		};
	}

	async getPreview(code: string) {
		const link = await this.linkRepository.findByShortCode(code);

		if (!link || !link.isActive) {
			throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.LINK_NOT_FOUND, 'Link not found');
		}

		if (link.expiresAt && link.expiresAt < new Date()) {
			throw new AppError(HTTP_STATUS.GONE, ERROR_MESSAGES.LINK_GONE, 'Link has expired');
		}

		if (link.maxClicks && link.clicksCount >= link.maxClicks) {
			throw new AppError(HTTP_STATUS.GONE, ERROR_MESSAGES.LINK_GONE, 'Link max clicks reached');
		}

		if (link.passwordHash) {
			return {
				title: 'Secured Link - TinyLink',
				description: 'This link is protected by a password.',
				isProtected: true,
			};
		}

		return {
			title: link.metaTitle || `TinyLink Redirect`,
			description: link.metaDescription || `Redirecting to ${link.originalUrl}`,
			image: link.metaImage || undefined,
			originalUrl: link.originalUrl,
		};
	}

	async verifyPassword(code: string, password: string, ipAddress?: string, userAgent?: string): Promise<string> {
		const link = await this.linkRepository.findByShortCode(code);
		if (!link || !link.isActive) {
			throw new AppError(HTTP_STATUS.NOT_FOUND, ERROR_MESSAGES.LINK_NOT_FOUND, 'Link not found');
		}

		if (!link.passwordHash) {
			// Weird edge case, link is not protected
			return link.originalUrl;
		}

		const isMatch = await argon2.verify(link.passwordHash, password);
		if (!isMatch) {
			throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.LINK_UNAUTHORIZED, 'Incorrect password');
		}

		// Proceed to run the standard original URL fetch & track which handles HINCRBY maxClicks, etc.
		// We can safely bypass the isProtected flag in cache by forcing the analytics recording then returning URL

		// To track it elegantly bypassing the 401 check, we trigger a direct AnalyticsManager push
		// Because the caching layer threw AppError(401), we can't easily recurse getOriginalUrlAndTrack
		// unless we pass a bypass flag. Direct hit is simpler here:
		this.analyticsManager.push({ linkId: link.id, ipAddress, userAgent });

		// We still need to manually bump Redis HINCRBY tracking since we bypassed it by not calling getOriginalUrlAndTrack!
		const cacheKey = `link:${code}`;
		const cachedLink = await this.redis.hgetall(cacheKey);

		if (cachedLink && cachedLink.maxClicks) {
			const maxClicks = parseInt(cachedLink.maxClicks, 10);
			const currentClicks = await this.redis.hincrby(cacheKey, 'currentClicks', 1);

			if (currentClicks > maxClicks) {
				await this.redis.hset(cacheKey, 'status', GONE_SENTINEL);
				await this.redis.expire(cacheKey, SYSTEM_CONFIG.REDIS_NOT_FOUND_TTL_SECONDS);
				throw new AppError(
					HTTP_STATUS.GONE,
					ERROR_MESSAGES.LINK_GONE,
					'Link has self-destructed due to reaching max clicks',
				);
			}
		}

		if (link.expiresAt && link.expiresAt < new Date()) {
			throw new AppError(
				HTTP_STATUS.GONE,
				ERROR_MESSAGES.LINK_GONE,
				'Link has self-destructed due to expiration',
			);
		}

		return link.originalUrl;
	}
}
