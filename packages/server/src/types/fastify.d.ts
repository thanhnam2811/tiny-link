import { PrismaClient } from '@tiny-link/db';
import { AnalyticsManager } from '../modules/analytics/analytics_manager';
import { Redis } from 'ioredis';

declare module 'fastify' {
	interface FastifyInstance {
		prisma: PrismaClient;
		analyticsManager: AnalyticsManager;
		redis: Redis;
	}

	interface FastifyRequest {
		/** Set by apiKeyAuthMiddleware. The owning user's id, resolved from the API key — the only trusted identity source for public API routes. */
		apiKeyUserId?: string;
		/** Set by apiKeyAuthMiddleware. Used as the rate-limit bucket key so limits are independent of the internal M2M channel. */
		apiKeyId?: string;
	}
}
