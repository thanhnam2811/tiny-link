import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@tiny-link/db';
import { linkRoutes } from './link/link.routes';
import { adminRoutes } from './admin/admin.routes';
import { AnalyticsManager } from './analytics/analytics_manager';
import { Redis } from 'ioredis';

export const apiRoutes: FastifyPluginAsyncTypebox<{
	prisma: PrismaClient;
	analyticsManager: AnalyticsManager;
	redis: Redis;
}> = async (server, options) => {
	const { prisma, analyticsManager, redis } = options;

	// Health check – moved into /api prefix for standardization
	server.get('/healthz', { config: { rateLimit: { skip: () => true } } }, async () => ({
		status: 'ok',
		timestamp: new Date().toISOString(),
	}));

	// Register Link Routes (handles its own /links and /stats prefixes)
	server.register(linkRoutes(prisma, analyticsManager, redis), { prefix: '' });

	// Register Admin Routes under /admin
	server.register(adminRoutes(prisma), { prefix: '/admin' });
};
