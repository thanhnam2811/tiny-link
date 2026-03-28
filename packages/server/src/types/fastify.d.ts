import { PrismaClient } from '@tiny-link/db';
import { AnalyticsManager } from '../modules/analytics/analytics_manager';
import { Redis } from 'ioredis';

declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient;
		analyticsManager: AnalyticsManager;
		redis: Redis;
	}
}
