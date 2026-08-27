import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
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
	AdminHealthResponseSchema,
	AdminHealthResponseType,
	ErrorResponseSchema,
	ErrorResponseType,
} from '@tiny-link/shared';
import { AdminRepository } from './admin.repository';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';

export const adminRoutes: FastifyPluginAsyncTypebox = async (server) => {
	const { prisma, analyticsManager, redis } = server;

	const adminRepository = new AdminRepository(prisma);
	const adminService = new AdminService(adminRepository, redis, analyticsManager);
	const adminController = new AdminController(adminService);

	// Public routes
	server.post<{ Body: AdminLoginBodyType }>(
		'/login',
		{
			config: {
				rateLimit: {
					max: 5,
					timeWindow: 60000,
				},
			},
			schema: {
				body: AdminLoginBodySchema,
				response: {
					200: AdminLoginResponseSchema,
				},
				tags: ['Admin'],
				description: 'Authenticate as admin using a password',
			},
		},
		adminController.login,
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
			'/stats',
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
			adminController.getStats,
		);

		protectedServer.get<{ Reply: AdminHealthResponseType }>(
			'/health',
			{
				schema: {
					response: {
						200: AdminHealthResponseSchema,
					},
					tags: ['Admin'],
					description: 'Get live health of Redis, Postgres, and the in-memory analytics queue',
					security: [{ bearerAuth: [] }],
				},
			},
			adminController.getHealth,
		);

		protectedServer.get<{
			Querystring: AdminGetLinksQueryType;
			Reply: AdminGetLinksResponseType;
		}>(
			'/links',
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
			adminController.getLinks,
		);

		protectedServer.patch<{
			Params: AdminLinkIdParamsType;
			Body: AdminUpdateLinkStatusBodyType;
			Reply: AdminSuccessResponseType | ErrorResponseType;
		}>(
			'/links/:id/status',
			{
				schema: {
					params: AdminLinkIdParamsSchema,
					body: AdminUpdateLinkStatusBodySchema,
					response: {
						200: AdminSuccessResponseSchema,
						404: ErrorResponseSchema,
					},
					tags: ['Admin'],
					description: 'Update the active status of a link',
					security: [{ bearerAuth: [] }],
				},
			},
			adminController.updateLinkStatus,
		);

		protectedServer.delete<{
			Params: AdminLinkIdParamsType;
			Reply: AdminSuccessResponseType | ErrorResponseType;
		}>(
			'/links/:id',
			{
				schema: {
					params: AdminLinkIdParamsSchema,
					response: {
						200: AdminSuccessResponseSchema,
						404: ErrorResponseSchema,
					},
					tags: ['Admin'],
					description: 'Delete a link permanently',
					security: [{ bearerAuth: [] }],
				},
			},
			adminController.deleteLink,
		);

		protectedServer.get<{
			Querystring: AdminAnalyticsQueryType;
			Reply: AdminAnalyticsResponseType;
		}>(
			'/analytics',
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
			adminController.getAnalytics,
		);
	});
};
