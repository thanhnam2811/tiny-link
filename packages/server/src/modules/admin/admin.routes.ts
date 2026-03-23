import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
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
} from '@tiny-link/shared';

export const adminRoutes =
	(prisma: PrismaClient): FastifyPluginAsync =>
	async (server: FastifyInstance) => {
		// Public routes
		server.post<{ Body: AdminLoginBodyType }>(
			'/api/admin/login',
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
				'/api/admin/stats',
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
				'/api/admin/links',
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
				'/api/admin/links/:id/status',
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
				'/api/admin/links/:id',
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
		});
	};
