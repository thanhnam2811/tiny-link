import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { PrismaClient } from '@prisma/client';
import {
	AdminLoginBodySchema,
	AdminLoginResponseSchema,
	AdminLoginBodyType,
	AdminStatsResponseSchema,
	AdminStatsResponseType,
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
		});
	};
