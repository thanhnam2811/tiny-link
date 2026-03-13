import fastify from 'fastify';
import { TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import { sharedConfig } from '@tiny-link/shared';
import { PrismaClient } from '@prisma/client';
import { linkRoutes } from './modules/link/link.routes';

const server = fastify({
	logger: {
		transport: {
			target: 'pino-pretty',
		},
	},
}).withTypeProvider<TypeBoxTypeProvider>();

const prisma = new PrismaClient();

server.get('/', async (_request, _reply) => {
	return { hello: `Welcome to ${sharedConfig.appName} API!` };
});

server.register(linkRoutes(prisma), { prefix: '/api' });

const start = async () => {
	try {
		const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
		await server.listen({ port, host: '0.0.0.0' });
		server.log.info(`Server running on port ${port}`);
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

start();
