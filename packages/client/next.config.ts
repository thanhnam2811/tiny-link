import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import packageJson from './package.json';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
	transpilePackages: ['@tiny-link/shared'],
	output: 'standalone',
	env: {
		NEXT_PUBLIC_APP_VERSION: packageJson.version,
	},
};

export default withNextIntl(nextConfig);
