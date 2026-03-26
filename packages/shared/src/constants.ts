import { Type, Static } from '@sinclair/typebox';

/**
 * Shared constants for HTTP Status Codes
 */
export const HTTP_STATUS = {
	OK: 200,
	CREATED: 201,
	ACCEPTED: 202,
	NO_CONTENT: 204,
	BAD_REQUEST: 400,
	UNAUTHORIZED: 401,
	FORBIDDEN: 403,
	NOT_FOUND: 404,
	CONFLICT: 409,
	GONE: 410,
	TOO_MANY_REQUESTS: 429,
	INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * System configuration limits
 */
export const SYSTEM_CONFIG = {
	RATE_LIMIT_GLOBAL: 100,
	RATE_LIMIT_WINDOW: 60000, // 1 minute
	RATE_LIMIT_CREATE_LINK: 10,
	RATE_LIMIT_VERIFY_PASSWORD: 5,
	DEFAULT_REDIRECT_TYPE: 302,
	SHORT_LINK_MAX_RETRIES: 5,
	SHORT_LINK_LENGTH: 6,
	REDIS_CACHE_TTL_SECONDS: 3600, // 1 hour
	REDIS_NOT_FOUND_TTL_SECONDS: 60, // 1 minute
} as const;

/**
 * Shared error messages for consistent UI/API feedback
 */
export const ERROR_MESSAGES = {
	LINK_NOT_FOUND: 'LINK_NOT_FOUND',
	LINK_GONE: 'LINK_GONE',
	LINK_UNAUTHORIZED: 'LINK_UNAUTHORIZED',
	LINK_CODE_CONFLICT: 'LINK_CODE_CONFLICT',
	RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
	VALIDATION_ERROR: 'VALIDATION_ERROR',
	ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

/**
 * Environment names
 */
export const ENV_NAMES = {
	DEVELOPMENT: 'development',
	PRODUCTION: 'production',
	TEST: 'test',
} as const;

/**
 * Internal Authentication Constants
 */
export const INTERNAL_AUTH = {
	TEST_KEY: 'test-internal-key',
	HEADER: 'x-internal-key',
	USER_ID_HEADER: 'x-user-id',
} as const;
