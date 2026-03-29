/**
 * Utility to strictly fetch environment variables.
 * - On Server: Throws an error if the variable is missing.
 * - On Browser: Returns undefined for non-public variables (those not starting with NEXT_PUBLIC_).
 */
export const getEnv = (key: string): string => {
	const value = process.env[key];

	if (!value) {
		// Only throw on the server. In the browser, non-public env vars are naturally undefined.
		if (typeof window === 'undefined') {
			throw new Error(`[Strict Env] Missing required environment variable: ${key}`);
		}
	}

	return value as string;
};
