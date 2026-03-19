import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { AdminLoginBodySchema, AdminLoginResponseSchema, AdminLoginBodyType } from '@tiny-link/shared';

export const adminRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
	console.log('AdminLoginBodySchema:', !!AdminLoginBodySchema);
	console.log('AdminLoginResponseSchema:', !!AdminLoginResponseSchema);

	server.post<{ Body: AdminLoginBodyType }>(
		'/api/admin/login',
		{
			schema: {
				body: AdminLoginBodySchema,
				response: {
					200: AdminLoginResponseSchema,
				},
				tags: ['Admin'],
				description: 'Authenticate as admin using a password',
			},
		},
		async (request, reply) => {
			const { password } = request.body;
			const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

			if (password !== adminPassword) {
				return reply.code(401).send({
					error: 'Unauthorized',
					message: 'Invalid admin password',
				});
			}

			// Sign JWT token
			const token = server.jwt.sign({ role: 'admin' });

			return { token };
		},
	);
};
