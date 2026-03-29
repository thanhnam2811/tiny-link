import { ENV_NAMES, INTERNAL_AUTH } from '@tiny-link/shared';

// Centralize environment checks for efficiency and consistency
export const isProduction = process.env.NODE_ENV === ENV_NAMES.PRODUCTION;
export const isTest = process.env.NODE_ENV === ENV_NAMES.TEST || !!process.env.VITEST;
export const isDev = process.env.NODE_ENV === ENV_NAMES.DEVELOPMENT || !process.env.NODE_ENV;

/**
 * Utility to get environment variables with strict validation for production.
 * Ensures that critical secrets are not missing or using dangerous defaults in non-dev environments.
 */
export const getEnv = (key: string, fallback?: string): string => {
	const value = process.env[key];

	if (!value) {
		if (isProduction) {
			throw new Error(`CRITICAL: Environment variable ${key} is required in production!`);
		}
		if (fallback === undefined) {
			throw new Error(`Environment variable ${key} is missing and no fallback provided.`);
		}
		return fallback;
	}

	// Check for dangerous default values in production
	const dangerousDefaults = [
		'admin123',
		'super-secret-key-for-admin-jwt',
		'secret',
		'test-internal-key',
		INTERNAL_AUTH.TEST_KEY, // Added for extra safety
	];

	if (isProduction && dangerousDefaults.includes(value)) {
		console.warn(
			`[CAUTION] Environment variable ${key} is using a well-known default value. This is highly discouraged in production!`,
		);
	}

	return value;
};
