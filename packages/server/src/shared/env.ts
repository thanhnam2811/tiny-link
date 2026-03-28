import { ENV_NAMES } from '@tiny-link/shared';

/**
 * Utility to get environment variables with strict validation for production.
 * Ensures that critical secrets are not missing or using dangerous defaults in non-dev environments.
 */
export const getEnv = (key: string, fallback?: string): string => {
	const value = process.env[key];
	const isProduction = process.env.NODE_ENV === ENV_NAMES.PRODUCTION;

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
	const dangerousDefaults = ['admin123', 'super-secret-key-for-admin-jwt', 'secret', 'test-internal-key'];
	if (isProduction && dangerousDefaults.includes(value)) {
		console.warn(
			`[CAUTION] Environment variable ${key} is using a well-known default value. This is highly discouraged in production!`,
		);
	}

	return value;
};
