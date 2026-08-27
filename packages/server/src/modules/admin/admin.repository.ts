import { PrismaClient, Link } from '@tiny-link/db';

export class AdminRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async countAllLinks(): Promise<number> {
		return this.prisma.link.count();
	}

	async sumTotalClicks(): Promise<number> {
		const aggregate = await this.prisma.link.aggregate({
			_sum: { clicksCount: true },
		});
		return aggregate._sum.clicksCount || 0;
	}

	async pingDatabase(): Promise<void> {
		await this.prisma.$queryRaw`SELECT 1`;
	}

	async findLinks(params: {
		where: Record<string, unknown>;
		skip: number;
		take: number;
		orderBy: Record<string, string>;
	}): Promise<Link[]> {
		return this.prisma.link.findMany({
			where: params.where,
			skip: params.skip,
			take: params.take,
			orderBy: params.orderBy,
		});
	}

	async countLinks(where: Record<string, unknown>): Promise<number> {
		return this.prisma.link.count({ where });
	}

	async updateLinkStatus(id: string, isActive: boolean): Promise<Link> {
		return this.prisma.link.update({
			where: { id },
			data: { isActive },
		});
	}

	async deleteLink(id: string): Promise<Link> {
		return this.prisma.link.delete({
			where: { id },
		});
	}

	async getTimelineClicks(startDate: Date): Promise<Array<{ date: Date; count: bigint }>> {
		return this.prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
			SELECT DATE_TRUNC('day', "clickedAt") as date, COUNT(*) as count 
			FROM "Click" 
			WHERE "clickedAt" >= ${startDate}
			GROUP BY DATE_TRUNC('day', "clickedAt") 
			ORDER BY date ASC
		`;
	}

	async getCountryClicks(
		startDate: Date,
		take = 10,
	): Promise<Array<{ country: string | null; _count: { id: number } }>> {
		return this.prisma.click.groupBy({
			by: ['country'],
			where: { clickedAt: { gte: startDate } },
			_count: { id: true },
			orderBy: { _count: { id: 'desc' } },
			take,
		});
	}

	async getUserAgentClicks(startDate: Date): Promise<Array<{ userAgent: string | null; _count: { id: number } }>> {
		return this.prisma.click.groupBy({
			by: ['userAgent'],
			where: { clickedAt: { gte: startDate } },
			_count: { id: true },
		});
	}
}
