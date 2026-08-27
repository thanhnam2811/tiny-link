import { FastifyRequest, FastifyReply } from 'fastify';
import { AdminService } from './admin.service';
import {
	AdminLoginBodyType,
	AdminGetLinksQueryType,
	AdminLinkIdParamsType,
	AdminUpdateLinkStatusBodyType,
	AdminAnalyticsQueryType,
} from '@tiny-link/shared';

export class AdminController {
	constructor(private readonly adminService: AdminService) {}

	login = async (request: FastifyRequest<{ Body: AdminLoginBodyType }>, reply: FastifyReply) => {
		const { password } = request.body;
		const isValid = this.adminService.validatePassword(password);

		if (!isValid) {
			return reply.code(401).send({
				error: 'Unauthorized',
				message: 'Invalid admin password',
			});
		}

		// Sign JWT token with 8h expiry using Fastify JWT instance
		const token = request.server.jwt.sign({ role: 'admin' }, { expiresIn: '8h' });

		return reply.code(200).send({ token });
	};

	getStats = async (_request: FastifyRequest, reply: FastifyReply) => {
		const stats = await this.adminService.getStats();
		return reply.code(200).send(stats);
	};

	getHealth = async (_request: FastifyRequest, reply: FastifyReply) => {
		const health = await this.adminService.getHealth();
		return reply.code(200).send(health);
	};

	getLinks = async (request: FastifyRequest<{ Querystring: AdminGetLinksQueryType }>, reply: FastifyReply) => {
		const query = request.query;
		const result = await this.adminService.getLinks(query);
		return reply.code(200).send(result);
	};

	updateLinkStatus = async (
		request: FastifyRequest<{ Params: AdminLinkIdParamsType; Body: AdminUpdateLinkStatusBodyType }>,
		reply: FastifyReply,
	) => {
		const { id } = request.params;
		const { isActive } = request.body;

		await this.adminService.updateLinkStatus(id, isActive);
		return reply.code(200).send({ success: true });
	};

	deleteLink = async (request: FastifyRequest<{ Params: AdminLinkIdParamsType }>, reply: FastifyReply) => {
		const { id } = request.params;

		await this.adminService.deleteLink(id);
		return reply.code(200).send({ success: true });
	};

	getAnalytics = async (request: FastifyRequest<{ Querystring: AdminAnalyticsQueryType }>, reply: FastifyReply) => {
		const { range } = request.query;
		const analytics = await this.adminService.getAnalytics(range);
		return reply.code(200).send(analytics);
	};
}
