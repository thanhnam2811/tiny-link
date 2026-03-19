import { PrismaClient, Link } from '@prisma/client';

export class LinkRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(
		originalUrl: string,
		shortCode: string,
		maxClicks?: number,
		expiresAt?: Date,
		passwordHash?: string,
	): Promise<Link> {
		return this.prisma.link.create({
			data: {
				originalUrl,
				shortCode,
				maxClicks,
				expiresAt,
				passwordHash,
			},
		});
	}

	async findByShortCode(shortCode: string): Promise<Link | null> {
		return this.prisma.link.findUnique({
			where: { shortCode },
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

	async updateMetadata(
		id: string,
		metadata: { metaTitle: string | null; metaDescription: string | null; metaImage: string | null },
	): Promise<Link> {
		return this.prisma.link.update({
			where: { id },
			data: metadata,
		});
	}
}
