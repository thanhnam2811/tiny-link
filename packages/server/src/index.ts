import 'dotenv/config';
import path from 'path';
import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { prisma } from '@tiny-link/db';
import fastifyRedis from '@fastify/redis';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import fastifyCors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { linkRoutes } from './modules/link/link.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { AnalyticsManager } from './modules/analytics/analytics_manager';
import { globalErrorHandler, notFoundHandler } from './shared/error-handler';
import { SYSTEM_CONFIG, ENV_NAMES, APP_VERSION, INTERNAL_AUTH } from '@tiny-link/shared';

export const buildServer = async () => {
	const analyticsManager = new AnalyticsManager(prisma);

	const server = fastify({
		trustProxy: true,
		logger:
			process.env.NODE_ENV === ENV_NAMES.TEST
				? false
				: process.env.NODE_ENV === ENV_NAMES.DEVELOPMENT
					? { transport: { target: 'pino-pretty' } }
					: true,
	}).withTypeProvider<TypeBoxTypeProvider>();

	server.setErrorHandler(globalErrorHandler);
	server.setNotFoundHandler(notFoundHandler);

	// Register CORS (Allow Next.js client to call the API)
	await server.register(fastifyCors, {
		origin: (origin, cb) => {
			// During testing, allow all origins
			if (process.env.NODE_ENV === ENV_NAMES.TEST) {
				cb(null, true);
				return;
			}
			const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
			// Allow if no origin (e.g. server-to-server), or if it matches client_url exactly,
			// or if it matches a vercel preview URL pattern.
			if (!origin || origin === clientUrl || /\.vercel\.app$/.test(origin)) {
				cb(null, true);
				return;
			}
			cb(new Error('Not allowed by CORS'), false);
		},
		credentials: true,
	});

	// Register Redis plugin
	await server.register(fastifyRedis, {
		url: process.env.REDIS_URL || 'redis://localhost:6379',
		closeClient: true,
	});

	// Register JWT
	await server.register(fastifyJwt, {
		secret: process.env.JWT_SECRET || 'super-secret-key-for-admin-jwt',
	});

	// Register Rate Limit plugin (uses Redis store for distributed limiting)
	await server.register(fastifyRateLimit, {
		global: true,
		max: SYSTEM_CONFIG.RATE_LIMIT_GLOBAL,
		timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
		redis: server.redis,
	});

	// Register Static Server
	await server.register(fastifyStatic, {
		root: path.join(process.cwd(), 'public'),
	});

	// Health check – exempt from rate limit so Render LB never gets blocked
	server.get('/healthz', { config: { rateLimit: { skip: () => true } } }, async () => ({ status: 'ok' }));

	// redirect root to client url
	server.get('/', async (_request, reply) => {
		const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
		return reply.code(301).redirect(clientUrl);
	});

	// Register Swagger Plugins
	await server.register(fastifySwagger, {
		openapi: {
			info: {
				title: 'TinyLink API',
				description: 'API documentation for TinyLink backend operations',
				version: APP_VERSION,
			},
			components: {
				securitySchemes: {
					bearerAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
					},
				},
			},
		},
	});

	await server.register(fastifySwaggerUi, {
		routePrefix: '/api/docs',
		uiConfig: {
			docExpansion: 'list',
			deepLinking: false,
		},
	});

	server.register(linkRoutes(prisma, analyticsManager, server.redis));
	server.register(adminRoutes(prisma));

	return { server, analyticsManager, prisma };
};

const start = async () => {
	const { server, analyticsManager, prisma } = await buildServer();

	// 0. Start Analytics Manager
	analyticsManager.start();
	try {
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
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
if (process.env.NODE_ENV === ENV_NAMES.TEST) {
	process.env.INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || INTERNAL_AUTH.TEST_KEY;
}

if (process.env.NODE_ENV !== ENV_NAMES.TEST) {
	start();
}
