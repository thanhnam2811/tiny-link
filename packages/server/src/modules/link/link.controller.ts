import { FastifyRequest, FastifyReply } from 'fastify';
import { LinkService } from './link.service';
import { CreateLinkBodyType } from './link.schema';

export class LinkController {
	constructor(private readonly linkService: LinkService) {}

	createLink = async (request: FastifyRequest<{ Body: CreateLinkBodyType }>, reply: FastifyReply) => {
		const { originalUrl, customCode, maxClicks, expiresAt, password } = request.body;

		const link = await this.linkService.createShortLink(
			originalUrl,
			customCode,
			maxClicks,
			expiresAt ? new Date(expiresAt) : undefined,
			password,
		);

		const host = request.headers.host || 'localhost:3000';
		const protocol = request.protocol || 'http';
		const shortUrl = `${protocol}://${host}/${link.shortCode}`;

		return reply.status(201).send({
			id: link.id,
			originalUrl: link.originalUrl,
			shortCode: link.shortCode,
			shortUrl,
			createdAt: link.createdAt.toISOString(),
			maxClicks: link.maxClicks ?? undefined,
			expiresAt: link.expiresAt?.toISOString() ?? undefined,
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

	verifyPassword = async (
		request: FastifyRequest<{ Params: { code: string }; Body: { password?: string } }>,
		reply: FastifyReply,
	) => {
		const { code } = request.params;
		const { password } = request.body;

		if (!password) {
			return reply.status(400).send({ message: 'Password is required' });
		}

		const originalUrl = await this.linkService.verifyPassword(code, password);
		return reply.status(200).send({ originalUrl });
	};
}
