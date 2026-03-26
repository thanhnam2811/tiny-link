import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES, INTERNAL_AUTH } from '@tiny-link/shared';

/**
 * Middleware to protect internal M2M (Machine-to-Machine) routes.
 * Requires an x-internal-key header that matches the server's INTERNAL_API_KEY.
 */
export const internalAuthMiddleware = async (request: FastifyRequest, reply: FastifyReply) => {
	const authHeader = request.headers[INTERNAL_AUTH.HEADER];

	// In test mode, we use a fixed key as a fallback if not provided in env
	const isTest = !!process.env.VITEST || process.env.NODE_ENV === 'test' || process.env.NODE_ENV?.includes('test');
	const expectedKey = process.env.INTERNAL_API_KEY || (isTest ? INTERNAL_AUTH.TEST_KEY : undefined);

	if (!expectedKey) {
		request.log.error('INTERNAL_API_KEY is not set in environment variables');
		if (isTest) {
			return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'Internal API Key missing (Test Mode)',
			});
		}
		return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
			statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
			error: 'Configuration Error',
			code: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
			message: 'Internal Auth Key missing on server',
		});
	}

	if (authHeader !== expectedKey) {
		return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
			statusCode: HTTP_STATUS.UNAUTHORIZED,
			error: 'Unauthorized',
			code: ERROR_MESSAGES.UNAUTHORIZED,
			message: 'Invalid Internal API Key',
		});
	}
};
