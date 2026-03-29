import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { RedirectParamsSchema, LinkStatsResponseSchema, HTTP_STATUS } from '@tiny-link/shared';
import { LinkRepository } from './link.repository';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';

export const statsRoutes: FastifyPluginAsyncTypebox = async (server) => {
	const { prisma, analyticsManager, redis } = server;

	// Wire up dependencies using decorated server instances
	const repository = new LinkRepository(prisma);
	const service = new LinkService(repository, analyticsManager, redis);
	const controller = new LinkController(service);

	// Stats API Route (Prefixed by master router)
	server.post(
		'/:code',
		{
			schema: {
				tags: ['Analytics'],
				summary: 'Get Link Analytics',
				description:
					'Retrieves aggregated click analytics and geographic distribution for a specific link. Requires password if the link is protected.',
				params: RedirectParamsSchema,
				body: Type.Optional(Type.Object({ password: Type.Optional(Type.String()) })),
				response: {
					[HTTP_STATUS.OK]: LinkStatsResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: {
						type: 'object',
						properties: {
							statusCode: { type: 'number' },
							error: { type: 'string' },
							code: { type: 'string' },
							message: { type: 'string' },
						},
					},
				},
			},
		},
		controller.getStats,
	);
};
