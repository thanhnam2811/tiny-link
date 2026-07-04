import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES } from '@tiny-link/shared';
import { hashApiKey } from './api-key.util';

const BEARER_PREFIX = 'Bearer ';

/**
 * Authenticates public API requests via `Authorization: Bearer <key>`.
 * Fully independent from internalAuthMiddleware — the resolved userId is the
 * only source of identity here, never trusted from a client-supplied header.
 */
export const apiKeyAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers.authorization;

	if (!authHeader || !authHeader.startsWith(BEARER_PREFIX)) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			error: 'Unauthorized',
			code: ERROR_MESSAGES.API_KEY_INVALID,
			message: 'Missing or malformed Authorization header. Expected "Bearer <key>".',
		});
	}

	const plaintext = authHeader.slice(BEARER_PREFIX.length).trim();
	const keyHash = hashApiKey(plaintext);

	const apiKey = await request.server.prisma.apiKey.findUnique({ where: { keyHash } });

	if (!apiKey || apiKey.revokedAt) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			error: 'Unauthorized',
			code: ERROR_MESSAGES.API_KEY_INVALID,
			message: 'Invalid or revoked API key.',
		});
	}

	request.apiKeyId = apiKey.id;
	request.apiKeyUserId = apiKey.userId;

	// Fire-and-forget: don't let a lastUsedAt write failure block the request.
	request.server.prisma.apiKey
		.update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
		.catch((err) => request.log.error({ err }, 'Failed to update apiKey.lastUsedAt'));
};
