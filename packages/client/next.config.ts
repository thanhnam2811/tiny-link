import type { NextConfig } from 'next';
import packageJson from './package.json';

const nextConfig: NextConfig = {
	transpilePackages: ['@tiny-link/shared'],
	output: 'standalone',
	env: {
		NEXT_PUBLIC_APP_VERSION: packageJson.version,
	},
};

export default nextConfig;
