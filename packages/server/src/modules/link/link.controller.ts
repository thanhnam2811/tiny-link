import { FastifyRequest, FastifyReply } from 'fastify';
import { LinkService } from './link.service';
import { CreateLinkBodyType } from './link.schema';

export class LinkController {
	constructor(private readonly linkService: LinkService) {}

	createLink = async (request: FastifyRequest<{ Body: CreateLinkBodyType }>, reply: FastifyReply) => {
		const { originalUrl, customCode } = request.body;

		try {
			const link = await this.linkService.createShortLink(originalUrl, customCode);

			const host = request.headers.host || 'localhost:3000';
			const protocol = request.protocol || 'http';
			const shortUrl = `${protocol}://${host}/${link.shortCode}`;

			return reply.status(201).send({
				id: link.id,
				originalUrl: link.originalUrl,
				shortCode: link.shortCode,
				shortUrl,
				createdAt: link.createdAt.toISOString(),
			});
		} catch (error: unknown) {
			if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 409) {
				return reply.status(409).send({
					statusCode: 409,
					error: 'Conflict',
					message: 'message' in error ? String(error.message) : 'Conflict',
				});
			}

			request.log.error(error);
			throw error;
		}
	};

	redirect = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;
		const ip = request.ip;
		const userAgent = request.headers['user-agent'];

		try {
			const originalUrl = await this.linkService.getOriginalUrlAndTrack(code, ip, userAgent, request.log);
			return reply.redirect(originalUrl);
		} catch (error: unknown) {
			if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 404) {
				return reply.callNotFound(); // Triggers the default 404 handler
			}

			throw error;
		}
	};

	getStats = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;

		try {
			const stats = await this.linkService.getLinkStats(code);
			return reply.status(200).send(stats);
		} catch (error: unknown) {
			if (typeof error === 'object' && error !== null && 'statusCode' in error && error.statusCode === 404) {
				return reply.callNotFound();
			}

			request.log.error(error);
			throw error;
		}
	};
}
