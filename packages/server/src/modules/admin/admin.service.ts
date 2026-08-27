import { AdminRepository } from './admin.repository';
import {
	AdminStatsResponseType,
	AdminHealthResponseType,
	AdminGetLinksQueryType,
	AdminGetLinksResponseType,
	AdminAnalyticsResponseType,
} from '@tiny-link/shared';
import { getEnv } from '../../shared/env';
import { AppError } from '../../shared/app-error';
import crypto from 'node:crypto';
import type { Redis } from 'ioredis';
import type { AnalyticsManager } from '../analytics/analytics_manager';

export class AdminService {
	constructor(
		private readonly adminRepository: AdminRepository,
		private readonly redis?: Redis | null,
		private readonly analyticsManager?: AnalyticsManager,
	) {}

	validatePassword(password: string): boolean {
		const adminPassword = getEnv('ADMIN_PASSWORD', 'admin123');
		const inputHash = crypto.createHash('sha256').update(password).digest();
		const expectedHash = crypto.createHash('sha256').update(adminPassword).digest();

		return crypto.timingSafeEqual(inputHash, expectedHash);
	}

	async getStats(): Promise<AdminStatsResponseType> {
		const [totalLinks, totalClicks] = await Promise.all([
			this.adminRepository.countAllLinks(),
			this.adminRepository.sumTotalClicks(),
		]);

		return {
			totalLinks,
			totalClicks,
		};
	}

	async getHealth(): Promise<AdminHealthResponseType> {
		const timed = async (check: () => Promise<unknown>) => {
			const start = Date.now();
			try {
				await check();
				return { status: 'up' as const, latencyMs: Date.now() - start };
			} catch {
				return { status: 'down' as const };
			}
		};

		const [redisResult, postgresResult] = await Promise.all([
			timed(async () => {
				if (!this.redis) throw new Error('Redis not configured');
				await this.redis.ping();
			}),
			timed(() => this.adminRepository.pingDatabase()),
		]);

		const queueStats = this.analyticsManager ? this.analyticsManager.getQueueStats() : { depth: 0, maxSize: 0 };

		return {
			redis: redisResult,
			postgres: postgresResult,
			queue: {
				...queueStats,
				processMemoryMb: Math.round(process.memoryUsage().rss / (1024 * 1024)),
			},
		};
	}

	async getLinks(query: AdminGetLinksQueryType): Promise<AdminGetLinksResponseType> {
		const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = query;
		const skip = (page - 1) * limit;

		const where = search
			? {
					OR: [
						{ shortCode: { contains: search, mode: 'insensitive' as const } },
						{ originalUrl: { contains: search, mode: 'insensitive' as const } },
					],
				}
			: {};

		const [links, totalCount] = await Promise.all([
			this.adminRepository.findLinks({
				where,
				skip,
				take: limit,
				orderBy: { [sortBy]: sortOrder },
			}),
			this.adminRepository.countLinks(where),
		]);

		return {
			links: links.map((link) => ({
				id: link.id,
				originalUrl: link.originalUrl,
				shortCode: link.shortCode,
				createdAt: link.createdAt.toISOString(),
				clicksCount: link.clicksCount,
				isActive: link.isActive,
			})),
			totalCount,
			totalPages: Math.ceil(totalCount / limit),
			currentPage: page,
		};
	}

	async updateLinkStatus(id: string, isActive: boolean): Promise<void> {
		try {
			const updatedLink = await this.adminRepository.updateLinkStatus(id, isActive);
			if (this.redis) {
				await this.redis.del(`link:${updatedLink.shortCode}`);
			}
		} catch {
			throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found');
		}
	}

	async deleteLink(id: string): Promise<void> {
		try {
			const deletedLink = await this.adminRepository.deleteLink(id);
			if (this.redis) {
				await this.redis.del(`link:${deletedLink.shortCode}`);
			}
		} catch {
			throw new AppError(404, 'LINK_NOT_FOUND', 'Link not found');
		}
	}

	async getAnalytics(range = '7d'): Promise<AdminAnalyticsResponseType> {
		const now = new Date();
		let startDate = new Date();
		if (range === '7d') startDate.setDate(now.getDate() - 7);
		else if (range === '30d') startDate.setDate(now.getDate() - 30);
		else startDate = new Date(0); // All time

		startDate.setHours(0, 0, 0, 0);

		// Query timeline and distribution in parallel
		const [timelineRaw, countryGroups, uaGroups] = await Promise.all([
			this.adminRepository.getTimelineClicks(startDate),
			this.adminRepository.getCountryClicks(startDate, 10),
			this.adminRepository.getUserAgentClicks(startDate),
		]);

		// Build zero-padded timeline
		const timelineMap = new Map<string, number>();
		timelineRaw.forEach((row) => {
			timelineMap.set(row.date.toISOString().split('T')[0], Number(row.count));
		});

		const timeline: { date: string; clicks: number }[] = [];
		if (range !== 'all') {
			const days = range === '7d' ? 7 : 30;
			for (let i = 0; i <= days; i++) {
				const d = new Date(startDate);
				d.setDate(d.getDate() + i);
				if (d > now) break;
				const dateStr = d.toISOString().split('T')[0];
				timeline.push({ date: dateStr, clicks: timelineMap.get(dateStr) || 0 });
			}
		} else {
			if (timelineRaw.length > 0) {
				const firstDate = timelineRaw[0].date;
				const diffTime = Math.abs(now.getTime() - firstDate.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				for (let i = 0; i <= diffDays; i++) {
					const d = new Date(firstDate);
					d.setDate(d.getDate() + i);
					if (d > now) break;
					const dateStr = d.toISOString().split('T')[0];
					timeline.push({ date: dateStr, clicks: timelineMap.get(dateStr) || 0 });
				}
			}
		}

		// Group country results
		const countryData = countryGroups.map((g) => ({
			name: g.country || 'Unknown',
			count: g._count.id,
		}));

		// Parse user agents
		const osCount = new Map<string, number>();
		const browserCount = new Map<string, number>();

		const { UAParser } = await import('ua-parser-js');

		uaGroups.forEach((g) => {
			const parser = new UAParser(g.userAgent || '');
			const osName = parser.getOS().name || 'Unknown';
			const browserName = parser.getBrowser().name || 'Unknown';

			osCount.set(osName, (osCount.get(osName) || 0) + g._count.id);
			browserCount.set(browserName, (browserCount.get(browserName) || 0) + g._count.id);
		});

		const osData = Array.from(osCount.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		const browserData = Array.from(browserCount.entries())
			.map(([name, count]) => ({ name, count }))
			.sort((a, b) => b.count - a.count)
			.slice(0, 10);

		return {
			timeline,
			os: osData,
			browser: browserData,
			country: countryData,
		};
	}
}
