import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { sharedConfig } from '@tiny-link/shared';
import { PrismaClient } from '@prisma/client';
import fastifyRedis from '@fastify/redis';
import fastifyRateLimit from '@fastify/rate-limit';
import { linkRoutes } from './modules/link/link.routes';
import { AnalyticsManager } from './modules/analytics/analytics_manager';
import { globalErrorHandler, notFoundHandler } from './shared/error-handler';

export const buildServer = async () => {
	const prisma = new PrismaClient();
	const analyticsManager = new AnalyticsManager(prisma);

	const server = fastify({
		logger:
			process.env.NODE_ENV === 'test'
				? false
				: process.env.NODE_ENV === 'development'
					? { transport: { target: 'pino-pretty' } }
					: true,
	}).withTypeProvider<TypeBoxTypeProvider>();

	server.setErrorHandler(globalErrorHandler);
	server.setNotFoundHandler(notFoundHandler);

	// Register Redis plugin
	await server.register(fastifyRedis, {
		url: process.env.REDIS_URL || 'redis://localhost:6379',
		closeClient: true,
	});

	// Register Rate Limit plugin (uses Redis store for distributed limiting)
	await server.register(fastifyRateLimit, {
		global: true,
		max: 100,
		timeWindow: '1 minute',
		redis: server.redis,
	});

	// Health check – exempt from rate limit so Render LB never gets blocked
	server.get('/healthz', { config: { rateLimit: { skip: () => true } } }, async () => ({ status: 'ok' }));

	server.get('/', async (_request, _reply) => {
		return { hello: `Welcome to ${sharedConfig.appName} API!` };
	});

	server.register(linkRoutes(prisma, analyticsManager, server.redis));

	return { server, analyticsManager, prisma };
};

const start = async () => {
	const { server, analyticsManager, prisma } = await buildServer();

	// 0. Start Analytics Manager
	analyticsManager.start();
	try {
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
		await server.listen({ port, host: '0.0.0.0' });
		server.log.info(`Server running on port ${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}

	// GRACEFUL SHUTDOWN (4 Steps)
	const shutdown = async (signal: string) => {
		server.log.info(`Received ${signal}. Starting graceful shutdown...`);

		try {
			// 1. Stop Ingress (Stop receiving new requests)
			await server.close();
			server.log.info('HTTP server closed.');

			// 2. Wait for Inflight - handled by server.close() in Fastify

			// 3. Final Flush of Analytics Queue
			await analyticsManager.shutdown();
			server.log.info('Analytics queue flushed.');

			// 4. Cleanup (Close DB connections)
			await prisma.$disconnect();
			server.log.info('Database connection closed.');

			process.exit(0);
		} catch (err) {
			server.log.error({ err }, 'Error during graceful shutdown');
			process.exit(1);
		}
	};

	process.on('SIGTERM', () => shutdown('SIGTERM'));
	process.on('SIGINT', () => shutdown('SIGINT'));
};

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
	start();
}
