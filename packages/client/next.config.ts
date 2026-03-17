import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	transpilePackages: ['@tiny-link/shared'],
	output: 'standalone',
};

export default nextConfig;
