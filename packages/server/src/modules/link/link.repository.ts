import { PrismaClient, Link } from '@prisma/client';

export class LinkRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(originalUrl: string, shortCode: string): Promise<Link> {
		return this.prisma.link.create({
			data: {
				originalUrl,
				shortCode,
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
}
