import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { sharedConfig } from '@tiny-link/shared';
import { PrismaClient } from '@prisma/client';
import { linkRoutes } from './modules/link/link.routes';

export const buildServer = () => {
	const server = fastify({
		logger:
			process.env.NODE_ENV === 'test'
				? false
				: {
						transport: {
							target: 'pino-pretty',
						},
					},
	}).withTypeProvider<TypeBoxTypeProvider>();

	const prisma = new PrismaClient();

	server.get('/', async (_request, _reply) => {
		return { hello: `Welcome to ${sharedConfig.appName} API!` };
	});

	server.register(linkRoutes(prisma));

	return server;
};

const start = async () => {
	const server = buildServer();
	try {
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
		await server.listen({ port, host: '0.0.0.0' });
		server.log.info(`Server running on port ${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// Only start the server if not in a test environment
if (process.env.NODE_ENV !== 'test') {
	start();
}
