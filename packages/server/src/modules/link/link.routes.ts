import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import { CreateLinkBodySchema, LinkResponseSchema } from './link.schema';
import { LinkRepository } from './link.repository';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { Type } from '@sinclair/typebox';

// This is where we wire up our dependencies (IoC)
export const linkRoutes = (prisma: PrismaClient): FastifyPluginAsyncTypebox => {
	const repository = new LinkRepository(prisma);
	const service = new LinkService(repository);
	const controller = new LinkController(service);

	return async (server) => {
		server.post(
			'/links', // Sub-route, will be prefixed when registered
			{
				schema: {
					body: CreateLinkBodySchema,
					response: {
						201: LinkResponseSchema,
						400: Type.Object({
							statusCode: Type.Number(),
							error: Type.String(),
							message: Type.String(),
						}),
						409: Type.Object({
							statusCode: Type.Number(),
							error: Type.String(),
							message: Type.String(),
						}),
					},
				},
			},
			controller.createLink,
		);
	};
};
