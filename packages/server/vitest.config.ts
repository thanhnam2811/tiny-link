import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		setupFiles: ['./test/setup.ts'],
		fileParallelism: false,
		env: {
			INTERNAL_API_KEY: 'test-internal-key',
		},
	},
});
