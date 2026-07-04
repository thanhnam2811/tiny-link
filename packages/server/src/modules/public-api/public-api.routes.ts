import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { FastifyRequest } from 'fastify';
import {
	PublicCreateLinkBodySchema,
	LinkResponseSchema,
	PublicGetLinksQuerySchema,
	PublicGetLinksResponseSchema,
	PublicLinkIdParamsSchema,
	ErrorResponseSchema,
	ValidationErrorResponseSchema,
	AdminSuccessResponseSchema,
	HTTP_STATUS,
	SYSTEM_CONFIG,
} from '@tiny-link/shared';
import { LinkRepository } from '../link/link.repository';
import { LinkService } from '../link/link.service';
import { PublicApiController } from './public-api.controller';
import { apiKeyAuthMiddleware } from '../../shared/api-key-auth.middleware';

// Buckets are keyed by API key id (not IP), so each integrator is rate-limited
// independently of the internal M2M channel and of other API keys.
const rateLimitKeyGenerator = (request: FastifyRequest) => request.apiKeyId ?? request.ip;

export const publicApiRoutes: FastifyPluginAsyncTypebox = async (server) => {
	const { prisma, analyticsManager, redis } = server;

	const repository = new LinkRepository(prisma);
	const service = new LinkService(repository, analyticsManager, redis);
	const controller = new PublicApiController(service);

	server.addHook('preHandler', apiKeyAuthMiddleware);

	server.post(
		'/links',
		{
			config: {
				rateLimit: {
					max: SYSTEM_CONFIG.RATE_LIMIT_PUBLIC_API_CREATE_LINK,
					timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
					keyGenerator: rateLimitKeyGenerator,
				},
			},
			schema: {
				tags: ['Public API'],
				summary: 'Create a Short Link',
				description: "Creates a new short link owned by the API key's account.",
				security: [{ apiKeyAuth: [] }],
				body: PublicCreateLinkBodySchema,
				response: {
					[HTTP_STATUS.CREATED]: LinkResponseSchema,
					[HTTP_STATUS.BAD_REQUEST]: ValidationErrorResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
					[HTTP_STATUS.CONFLICT]: ErrorResponseSchema,
				},
			},
		},
		controller.createLink,
	);

	server.get(
		'/links',
		{
			config: {
				rateLimit: {
					max: SYSTEM_CONFIG.RATE_LIMIT_PUBLIC_API_GLOBAL,
					timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
					keyGenerator: rateLimitKeyGenerator,
				},
			},
			schema: {
				tags: ['Public API'],
				summary: 'List Links',
				description: "Retrieves a paginated list of links owned by the API key's account.",
				security: [{ apiKeyAuth: [] }],
				querystring: PublicGetLinksQuerySchema,
				response: {
					[HTTP_STATUS.OK]: PublicGetLinksResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
				},
			},
		},
		controller.getLinks,
	);

	server.delete(
		'/links/:id',
		{
			config: {
				rateLimit: {
					max: SYSTEM_CONFIG.RATE_LIMIT_PUBLIC_API_GLOBAL,
					timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
					keyGenerator: rateLimitKeyGenerator,
				},
			},
			schema: {
				tags: ['Public API'],
				summary: 'Delete a Link',
				params: PublicLinkIdParamsSchema,
				security: [{ apiKeyAuth: [] }],
				response: {
					[HTTP_STATUS.OK]: AdminSuccessResponseSchema,
					[HTTP_STATUS.NOT_FOUND]: ErrorResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
				},
			},
		},
		controller.deleteLink,
	);
};
