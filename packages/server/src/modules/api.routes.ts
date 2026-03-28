import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { linkRoutes } from './link/link.routes';
import { adminRoutes } from './admin/admin.routes';
import { statsRoutes } from './link/stats.routes';

/**
 * Master Router for the /api namespace.
 * Centralizes all resource prefixes and global API metadata.
 */
export const apiRoutes: FastifyPluginAsyncTypebox = async (server) => {
	// 🏥 Health check – fully documented with TypeBox schema
	server.get(
		'/healthz',
		{
			config: { rateLimit: { skip: () => true } },
			schema: {
				tags: ['System'],
				summary: 'API Health Check',
				description: 'Returns the current status and timestamp of the API server.',
				response: {
					200: Type.Object({
						status: Type.String(),
						timestamp: Type.String({ format: 'date-time' }),
					}),
				},
			},
		},
		async () => ({
			status: 'ok',
			timestamp: new Date().toISOString(),
		}),
	);

	// 🛠️ Resource Centralization: All prefixes are declared here
	// Dependencies are injected via server.decorate in index.ts

	// Links Service
	server.register(linkRoutes, { prefix: '/links' });

	// Stats/Analytics Service
	server.register(statsRoutes, { prefix: '/stats' });

	// User/Admin Management
	server.register(adminRoutes, { prefix: '/admin' });
};
