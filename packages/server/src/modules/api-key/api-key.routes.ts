import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import {
	CreateApiKeyBodySchema,
	CreateApiKeyResponseSchema,
	ListApiKeysResponseSchema,
	ApiKeyIdParamsSchema,
	ErrorResponseSchema,
	ValidationErrorResponseSchema,
	HTTP_STATUS,
	AdminSuccessResponseSchema,
} from '@tiny-link/shared';
import { ApiKeyRepository } from './api-key.repository';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { internalAuthMiddleware } from '../../shared/internal-auth.middleware';

export const apiKeyRoutes: FastifyPluginAsyncTypebox = async (server) => {
	const { prisma } = server;

	const repository = new ApiKeyRepository(prisma);
	const service = new ApiKeyService(repository);
	const controller = new ApiKeyController(service);

	server.post(
		'/',
		{
			preHandler: [internalAuthMiddleware],
			schema: {
				tags: ['API Keys'],
				summary: 'Issue a new public API key',
				description:
					'Creates a new public API key for the authenticated account. The plaintext key is returned only once — store it securely.',
				body: CreateApiKeyBodySchema,
				response: {
					[HTTP_STATUS.CREATED]: CreateApiKeyResponseSchema,
					[HTTP_STATUS.BAD_REQUEST]: ValidationErrorResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
				},
			},
		},
		controller.createKey,
	);

	server.get(
		'/',
		{
			preHandler: [internalAuthMiddleware],
			schema: {
				tags: ['API Keys'],
				summary: "List the authenticated account's public API keys",
				description: 'Returns masked key metadata only — never the plaintext key or its hash.',
				response: {
					[HTTP_STATUS.OK]: ListApiKeysResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
				},
			},
		},
		controller.listKeys,
	);

	server.delete(
		'/:id',
		{
			preHandler: [internalAuthMiddleware],
			schema: {
				tags: ['API Keys'],
				summary: 'Revoke a public API key',
				params: ApiKeyIdParamsSchema,
				response: {
					[HTTP_STATUS.OK]: AdminSuccessResponseSchema,
					[HTTP_STATUS.NOT_FOUND]: ErrorResponseSchema,
					[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
				},
			},
		},
		controller.revokeKey,
	);
};
