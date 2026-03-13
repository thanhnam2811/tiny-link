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
}
