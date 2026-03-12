import fastify from 'fastify';
import { sharedConfig } from '@tiny-link/shared';

const server = fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
});

server.get('/', async (request, reply) => {
  return { hello: `Welcome to ${sharedConfig.appName} API!` };
});

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
