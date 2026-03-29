import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES, INTERNAL_AUTH } from '@tiny-link/shared';
import { getEnv, isProduction, isTest } from './env';

/**
 * Middleware to protect internal M2M (Machine-to-Machine) routes.
 * Requires an x-internal-key header that matches the server's INTERNAL_API_KEY.
 */
export const internalAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers[INTERNAL_AUTH.HEADER];

	// In test mode, we use a fixed key as a fallback if not provided in env.
	// In production/dev, we REQUIRE the environment variable to be set.
	const expectedKey = getEnv('INTERNAL_API_KEY', isTest ? INTERNAL_AUTH.TEST_KEY : undefined);

	if (!expectedKey) {
		// This path is technically unreachable in production because getEnv() throws,
		// but we keep it for defense-in-depth and specific dev-mode messaging.
		request.log.error('INTERNAL_API_KEY is not set in environment variables');

		if (isProduction) {
			return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'Unauthorized', // Generic message for PROD
			});
		}

		return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			error: 'Configuration Error',
			code: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			message: isTest ? 'Internal API Key missing (Test Mode)' : 'Internal Auth Key missing on server',
		});
	}

	if (authHeader !== expectedKey) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			error: 'Unauthorized',
			code: ERROR_MESSAGES.UNAUTHORIZED,
			message: isProduction ? 'Unauthorized' : 'Invalid Internal API Key',
		});
	}
};
