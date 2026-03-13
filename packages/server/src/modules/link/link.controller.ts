import { FastifyRequest, FastifyReply } from 'fastify';
import { LinkService } from './link.service';
import { CreateLinkBodyType } from './link.schema';

export class LinkController {
	constructor(private readonly linkService: LinkService) {}

	createLink = async (request: FastifyRequest<{ Body: CreateLinkBodyType }>, reply: FastifyReply) => {
		const { originalUrl, customCode } = request.body;

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
	};

	redirect = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;
		const ip = request.ip;
		const userAgent = request.headers['user-agent'];

		const originalUrl = await this.linkService.getOriginalUrlAndTrack(code, ip, userAgent);
		return reply.redirect(originalUrl);
	};

	getStats = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;

		const stats = await this.linkService.getLinkStats(code);
		return reply.status(200).send(stats);
	};
}
