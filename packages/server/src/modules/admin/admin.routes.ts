import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@tiny-link/db';
import {
	AdminLoginBodySchema,
	AdminLoginResponseSchema,
	AdminLoginBodyType,
	AdminStatsResponseSchema,
	AdminStatsResponseType,
	AdminGetLinksQuerySchema,
	AdminGetLinksQueryType,
	AdminGetLinksResponseSchema,
	AdminGetLinksResponseType,
	AdminUpdateLinkStatusBodySchema,
	AdminUpdateLinkStatusBodyType,
	AdminLinkIdParamsSchema,
	AdminLinkIdParamsType,
	AdminSuccessResponseSchema,
	AdminSuccessResponseType,
	AdminAnalyticsQuerySchema,
	AdminAnalyticsQueryType,
	AdminAnalyticsResponseSchema,
	AdminAnalyticsResponseType,
} from '@tiny-link/shared';

export const adminRoutes =
	(prisma: PrismaClient): FastifyPluginAsync =>
	async (server: FastifyInstance) => {
		// Public routes
		server.post<{ Body: AdminLoginBodyType }>(
			'/admin/login',
			{
				schema: {
					body: AdminLoginBodySchema,
					response: {
						200: AdminLoginResponseSchema,
					},
					tags: ['Admin'],
					description: 'Authenticate as admin using a password',
				},
			},
			async (request, reply) => {
				const { password } = request.body;
				const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

				if (password !== adminPassword) {
					return reply.code(401).send({
						error: 'Unauthorized',
						message: 'Invalid admin password',
					});
				}

				// Sign JWT token
				const token = server.jwt.sign({ role: 'admin' });

				return { token };
			},
		);

		// Protected routes (Encapsulated)
		await server.register(async (protectedServer) => {
			protectedServer.addHook('onRequest', async (request, reply) => {
				try {
					await request.jwtVerify();
				} catch (err) {
					reply.send(err);
				}
			});

			protectedServer.get<{ Reply: AdminStatsResponseType }>(
				'/admin/stats',
				{
					schema: {
						response: {
							200: AdminStatsResponseSchema,
						},
						tags: ['Admin'],
						description: 'Get system-wide statistics for the admin dashboard',
						security: [{ bearerAuth: [] }],
					},
				},
				async () => {
					const totalLinks = await prisma.link.count();
					const aggregateResult = await prisma.link.aggregate({
						_sum: { clicksCount: true },
					});
					const totalClicks = aggregateResult._sum.clicksCount || 0;

					return {
						totalLinks,
						totalClicks,
					};
				},
			);

			protectedServer.get<{
				Querystring: AdminGetLinksQueryType;
				Reply: AdminGetLinksResponseType;
			}>(
				'/admin/links',
				{
					schema: {
						querystring: AdminGetLinksQuerySchema,
						response: {
							200: AdminGetLinksResponseSchema,
						},
						tags: ['Admin'],
						description: 'Get a paginated list of all links',
						security: [{ bearerAuth: [] }],
					},
				},
				async (request) => {
					const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = request.query;
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
						prisma.link.findMany({
							where,
							skip,
							take: limit,
							orderBy: { [sortBy]: sortOrder },
						}),
						prisma.link.count({ where }),
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
				},
			);

			protectedServer.patch<{
				Params: AdminLinkIdParamsType;
				Body: AdminUpdateLinkStatusBodyType;
				Reply: AdminSuccessResponseType;
			}>(
				'/admin/links/:id/status',
				{
					schema: {
						params: AdminLinkIdParamsSchema,
						body: AdminUpdateLinkStatusBodySchema,
						response: {
							200: AdminSuccessResponseSchema,
						},
						tags: ['Admin'],
						description: 'Update the active status of a link',
						security: [{ bearerAuth: [] }],
					},
				},
				async (request, reply) => {
					const { id } = request.params;
					const { isActive } = request.body;

					try {
						await prisma.link.update({
							where: { id },
							data: { isActive },
						});
						return { success: true };
					} catch (error) {
						return reply.code(404).send({ error: 'Not Found', message: 'Link not found' } as any);
					}
				},
			);

			protectedServer.delete<{
				Params: AdminLinkIdParamsType;
				Reply: AdminSuccessResponseType;
			}>(
				'/admin/links/:id',
				{
					schema: {
						params: AdminLinkIdParamsSchema,
						response: {
							200: AdminSuccessResponseSchema,
						},
						tags: ['Admin'],
						description: 'Delete a link permanently',
						security: [{ bearerAuth: [] }],
					},
				},
				async (request, reply) => {
					const { id } = request.params;

					try {
						await prisma.link.delete({
							where: { id },
						});
						return { success: true };
					} catch (error) {
						return reply.code(404).send({ error: 'Not Found', message: 'Link not found' } as any);
					}
				},
			);

			protectedServer.get<{
				Querystring: AdminAnalyticsQueryType;
				Reply: AdminAnalyticsResponseType;
			}>(
				'/admin/analytics',
				{
					schema: {
						querystring: AdminAnalyticsQuerySchema,
						response: {
							200: AdminAnalyticsResponseSchema,
						},
						tags: ['Admin'],
						description: 'Get detailed system analytics (timeline, OS, browser, country)',
						security: [{ bearerAuth: [] }],
					},
				},
				async (request) => {
					const { range = '7d' } = request.query;

					// 1. Determine Date Range
					const now = new Date();
					let startDate = new Date();
					if (range === '7d') startDate.setDate(now.getDate() - 7);
					else if (range === '30d') startDate.setDate(now.getDate() - 30);
					else startDate = new Date(0); // All time

					startDate.setHours(0, 0, 0, 0);

					// 2. Query Timeline using $queryRaw for performance (PostgreSQL DATE_TRUNC)
					const timelineRaw = await prisma.$queryRaw<{ date: Date; count: bigint }[]>`
						SELECT DATE_TRUNC('day', "clickedAt") as date, COUNT(*) as count 
						FROM "Click" 
						WHERE "clickedAt" >= ${startDate}
						GROUP BY DATE_TRUNC('day', "clickedAt") 
						ORDER BY date ASC
					`;

					// 3. Zero-padding Timeline
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

					// 4. Query Grouped Data
					const countryGroups = await prisma.click.groupBy({
						by: ['country'],
						where: { clickedAt: { gte: startDate } },
						_count: { id: true },
						orderBy: { _count: { id: 'desc' } },
						take: 10,
					});

					const countryData = countryGroups.map((g) => ({
						name: g.country || 'Unknown',
						count: g._count.id,
					}));

					const uaGroups = await prisma.click.groupBy({
						by: ['userAgent'],
						where: { clickedAt: { gte: startDate } },
						_count: { id: true },
					});

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
				},
			);
		});
	};
