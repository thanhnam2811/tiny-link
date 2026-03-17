import http from 'node:http';
import { FastifyError, FastifyReply, FastifyRequest, FastifySchemaValidationError } from 'fastify';
import { AppError } from './app-error';
import { HTTP_STATUS, ERROR_MESSAGES } from '@tiny-link/shared';

export const globalErrorHandler = (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
	// 429 — Rate limit (headers already set on reply by @fastify/rate-limit)
	if ('statusCode' in error && error.statusCode === HTTP_STATUS.TOO_MANY_REQUESTS) {
		return reply.status(HTTP_STATUS.TOO_MANY_REQUESTS).send({
			statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
			error: 'Too Many Requests',
			code: ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
			message: error.message,
		});
	}

	// 400 — Validation error (TypeBox/AJV populates error.validation)
	if ('validation' in error && Array.isArray(error.validation) && error.validation.length > 0) {
		const details = error.validation.map((v: FastifySchemaValidationError) => ({
			field:
				(v.instancePath as string)?.replace(/^\//, '') ||
				(v.params as Record<string, string> | undefined)?.missingProperty ||
				'unknown',
			message: v.message ?? 'Invalid value',
		}));

		return reply.status(HTTP_STATUS.BAD_REQUEST).send({
			statusCode: HTTP_STATUS.BAD_REQUEST,
			error: 'Bad Request',
			code: ERROR_MESSAGES.VALIDATION_ERROR,
			message: 'Validation failed',
			details,
		});
	}

	// Known application error
	if (error instanceof AppError) {
		return reply.status(error.statusCode).send({
			statusCode: error.statusCode,
			error: http.STATUS_CODES[error.statusCode] ?? 'Error',
			code: error.code,
			message: error.message,
		});
	}

	// Unknown / unexpected error — log full details, mask from client
	request.log.error(error);
	return reply.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).send({
		statusCode: HTTP_STATUS.INTERNAL_SERVER_ERROR,
		error: 'Internal Server Error',
		code: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
		message: 'An unexpected error occurred',
	});
};

export const notFoundHandler = (_request: FastifyRequest, reply: FastifyReply) => {
	return reply.status(HTTP_STATUS.NOT_FOUND).send({
		statusCode: HTTP_STATUS.NOT_FOUND,
		error: 'Not Found',
		code: ERROR_MESSAGES.ROUTE_NOT_FOUND,
		message: 'Route not found',
	});
};
