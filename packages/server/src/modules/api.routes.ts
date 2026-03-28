import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@tiny-link/db';
import { AnalyticsManager } from './analytics/analytics_manager';
import { Redis } from 'ioredis';
import { linkRoutes } from './link/link.routes';
import { adminRoutes } from './admin/admin.routes';

/**
 * Root API Plugin (The "Plugin Mẹ")
 * Groups all REST routes under a single lifecycle for easier management and future prefixing (e.g., /api/v1).
 */
export const apiRoutes = async (
	server: FastifyInstance,
	options: { prisma: PrismaClient; analyticsManager: AnalyticsManager; redis: Redis },
) => {
	const { prisma, analyticsManager, redis } = options;

	// 1. Core Health Check (Now under /api/healthz)
	// Exempt from rate limit to ensure monitoring tools never get blocked.
	server.get('/healthz', { config: { rateLimit: { skip: () => true } } }, async () => ({
		status: 'ok',
		timestamp: new Date().toISOString(),
	}));

	// 2. Register Sub-Modules
	// We pass the dependencies down to the routes
	await server.register(linkRoutes(prisma, analyticsManager, redis));
	await server.register(adminRoutes(prisma));

	// Future routes like /api/v2 or /api/auth can be added here
};
