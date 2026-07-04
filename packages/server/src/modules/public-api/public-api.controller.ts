import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES, PublicCreateLinkBodyType } from '@tiny-link/shared';
import { LinkService } from '../link/link.service';

export class PublicApiController {
	constructor(private readonly linkService: LinkService) {}

	createLink = async (request: FastifyRequest, reply: FastifyReply) => {
		const { originalUrl, customCode, maxClicks, expiresAt, password } = request.body as PublicCreateLinkBodyType;

		const link = await this.linkService.createShortLink(
			originalUrl,
			customCode,
			maxClicks,
			expiresAt ? new Date(expiresAt) : undefined,
			password,
			request.apiKeyUserId,
		);

		const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';

		return reply.status(HTTP_STATUS.CREATED).send({
			id: link.id,
			originalUrl: link.originalUrl,
			shortCode: link.shortCode,
			shortUrl: `${clientUrl}/${link.shortCode}`,
			createdAt: link.createdAt.toISOString(),
			maxClicks: link.maxClicks ?? undefined,
			expiresAt: link.expiresAt?.toISOString() ?? undefined,
			userId: link.userId ?? undefined,
			clicksCount: 0,
			isActive: true,
		});
	};

	getLinks = async (request: FastifyRequest, reply: FastifyReply) => {
		const query = request.query as { page?: number; limit?: number; search?: string };
		const data = await this.linkService.getUserLinks(
			request.apiKeyUserId as string,
			query.page,
			query.limit,
			query.search,
		);
		return reply.status(HTTP_STATUS.OK).send(data);
	};

	deleteLink = async (request: FastifyRequest, reply: FastifyReply) => {
		const { id } = request.params as { id: string };
		const success = await this.linkService.deleteLink(id, request.apiKeyUserId as string);

		if (!success) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({
				statusCode: HTTP_STATUS.NOT_FOUND,
				error: 'Not Found',
				code: ERROR_MESSAGES.LINK_NOT_FOUND,
				message: 'Link not found or not owned by this account',
			});
		}

		return reply.status(HTTP_STATUS.OK).send({ success: true });
	};
}
