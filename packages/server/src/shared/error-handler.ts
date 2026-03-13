import http from 'node:http';
import { FastifyError, FastifyReply, FastifyRequest, FastifySchemaValidationError } from 'fastify';
import { AppError } from './app-error';

export const globalErrorHandler = (error: FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
	// 429 — Rate limit (headers already set on reply by @fastify/rate-limit)
	if ('statusCode' in error && error.statusCode === 429) {
		return reply.status(429).send({
			statusCode: 429,
			error: 'Too Many Requests',
			code: 'RATE_LIMIT_EXCEEDED',
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

		return reply.status(400).send({
			statusCode: 400,
			error: 'Bad Request',
			code: 'VALIDATION_ERROR',
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
	return reply.status(500).send({
		statusCode: 500,
		error: 'Internal Server Error',
		code: 'INTERNAL_ERROR',
		message: 'An unexpected error occurred',
	});
};

export const notFoundHandler = (_request: FastifyRequest, reply: FastifyReply) => {
	return reply.status(404).send({
		statusCode: 404,
		error: 'Not Found',
		code: 'NOT_FOUND',
		message: 'Route not found',
	});
};
