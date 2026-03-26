import { PrismaClient, Link } from '@tiny-link/db';

export class LinkRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(
		originalUrl: string,
		shortCode: string,
		maxClicks?: number,
		expiresAt?: Date,
		passwordHash?: string,
		userId?: string,
		guestId?: string,
	): Promise<Link> {
		return this.prisma.link.create({
			data: {
				originalUrl,
				shortCode,
				maxClicks,
				expiresAt,
				passwordHash,
				userId,
				guestId,
			},
		});
	}

	async findByShortCode(shortCode: string): Promise<Link | null> {
		return this.prisma.link.findUnique({
			where: { shortCode },
		});
	}

	async findById(id: string): Promise<Link | null> {
		return this.prisma.link.findUnique({
			where: { id },
		});
	}

	async trackClick(linkId: string, ipAddress?: string, userAgent?: string): Promise<void> {
		await this.prisma.click.create({
			data: {
				linkId,
				ipAddress,
				userAgent,
			},
		});
	}

	async getStats(shortCode: string) {
		return this.prisma.link.findUnique({
			where: { shortCode },
		});
	}

	async getGeoStats(linkId: string) {
		const [countryStats, cityStats] = await Promise.all([
			this.prisma.click.groupBy({
				by: ['country'],
				_count: { _all: true },
				where: { linkId, country: { not: null } },
				orderBy: { _count: { country: 'desc' } },
			}),
			this.prisma.click.groupBy({
				by: ['city'],
				_count: { _all: true },
				where: { linkId, city: { not: null } },
				orderBy: { _count: { city: 'desc' } },
			}),
		]);

		return { countryStats, cityStats };
	}

	async getTimeSeriesStats(linkId: string, days: number = 7) {
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - days);

		return this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
			SELECT DATE_TRUNC('day', "clickedAt") as date, COUNT(*)::bigint as count
			FROM "Click"
			WHERE "linkId" = ${linkId}
			  AND "clickedAt" >= ${startDate}
			GROUP BY DATE_TRUNC('day', "clickedAt")
			ORDER BY date ASC;
		`;
	}

	async updateMetadata(
		id: string,
		metadata: { metaTitle: string | null; metaDescription: string | null; metaImage: string | null },
	): Promise<Link> {
		return this.prisma.link.update({
			where: { id },
			data: metadata,
		});
	}

	async findByUserId(userId: string, skip: number, take: number, search?: string) {
		return this.prisma.link.findMany({
			where: {
				userId,
				isActive: true,
				...(search && {
					OR: [
						{ originalUrl: { contains: search, mode: 'insensitive' } },
						{ shortCode: { contains: search, mode: 'insensitive' } },
					],
				}),
			},
			orderBy: { createdAt: 'desc' },
			skip,
			take,
		});
	}

	async countByUserId(userId: string, search?: string) {
		return this.prisma.link.count({
			where: {
				userId,
				isActive: true,
				...(search && {
					OR: [
						{ originalUrl: { contains: search, mode: 'insensitive' } },
						{ shortCode: { contains: search, mode: 'insensitive' } },
					],
				}),
			},
		});
	}

	async claimLinks(guestId: string, userId: string) {
		const result = await this.prisma.link.updateMany({
			where: {
				guestId,
				userId: null,
			},
			data: {
				userId,
			},
		});
		return result.count;
	}

	async delete(id: string, userId: string): Promise<boolean> {
		const result = await this.prisma.link.updateMany({
			where: { id, userId },
			data: { isActive: false },
		});
		return result.count > 0;
	}
}
