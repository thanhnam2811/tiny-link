import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getEnv } from '../../src/shared/env';
import { ENV_NAMES, INTERNAL_AUTH } from '@tiny-link/shared';

describe('Environment Variable Validator (TL-OPS-05)', () => {
	const originalNodeEnv = process.env.NODE_ENV;

	beforeEach(() => {
		process.env.NODE_ENV = originalNodeEnv || 'test';
	});

	afterEach(() => {
		process.env.NODE_ENV = originalNodeEnv || 'test';
		delete process.env.TEST_VAR;
		delete process.env.NON_EXISTENT_VAR;
		delete process.env.CRITICAL_SECRET;
		delete process.env.JWT_SECRET;
	});

	it('returns the environment variable value when present', () => {
		process.env.TEST_VAR = 'custom-secure-value';
		expect(getEnv('TEST_VAR')).toBe('custom-secure-value');
	});

	it('returns fallback value when environment variable is missing in non-production', () => {
		delete process.env.NON_EXISTENT_VAR;
		process.env.NODE_ENV = ENV_NAMES.DEVELOPMENT;
		expect(getEnv('NON_EXISTENT_VAR', 'my-fallback')).toBe('my-fallback');
	});

	it('throws an error when variable is missing and no fallback is provided in non-production', () => {
		delete process.env.NON_EXISTENT_VAR;
		process.env.NODE_ENV = ENV_NAMES.DEVELOPMENT;
		expect(() => getEnv('NON_EXISTENT_VAR')).toThrow(
			'Environment variable NON_EXISTENT_VAR is missing and no fallback provided.',
		);
	});

	it('throws a critical error when required variable is missing in production', () => {
		delete process.env.CRITICAL_SECRET;
		process.env.NODE_ENV = ENV_NAMES.PRODUCTION;
		expect(() => getEnv('CRITICAL_SECRET', 'fallback')).toThrow(
			'CRITICAL: Environment variable CRITICAL_SECRET is required in production!',
		);
	});

	it.each([
		['admin123'],
		['super-secret-key-for-admin-jwt'],
		['secret'],
		['test-internal-key'],
		[INTERNAL_AUTH.TEST_KEY],
	])('blocks startup when dangerous default (%s) is used in production', (dangerousSecret) => {
		process.env.JWT_SECRET = dangerousSecret;
		process.env.NODE_ENV = ENV_NAMES.PRODUCTION;

		expect(() => getEnv('JWT_SECRET')).toThrow(
			`CRITICAL: Environment variable JWT_SECRET is using a dangerous default value ('${dangerousSecret}') in production. Startup blocked!`,
		);
	});

	it('allows strong, non-default secrets in production', () => {
		process.env.JWT_SECRET = 'a7f9b8c2d1e0456789abcdef0123456789abcdef0123456789abcdef01234567';
		process.env.NODE_ENV = ENV_NAMES.PRODUCTION;

		expect(getEnv('JWT_SECRET')).toBe('a7f9b8c2d1e0456789abcdef0123456789abcdef0123456789abcdef01234567');
	});
});
