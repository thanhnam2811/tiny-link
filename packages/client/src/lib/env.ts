/**
 * Utility to strictly fetch environment variables.
 * Always throws an error if the variable is missing, regardless of environment.
 */
export const getEnv = (key: string): string => {
	const value = process.env[key];

	if (!value) {
		throw new Error(`[Strict Env] Missing required environment variable: ${key}`);
	}

	return value;
};
