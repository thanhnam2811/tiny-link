import { FastifyRequest, FastifyReply } from 'fastify';
import { LinkService } from './link.service';
import { HTTP_STATUS, CreateLinkBodyType } from '@tiny-link/shared';

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

		// Use CLIENT_URL (falling back to localhost:3000) for security anti-bypass.
		// We no longer trust request.headers.host to ensure the Next.js Frontend mask is strictly enforced.
		const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
		const shortUrl = `${clientUrl}/${link.shortCode}`;

		return reply.status(HTTP_STATUS.CREATED).send({
			id: link.id,
			originalUrl: link.originalUrl,
			shortCode: link.shortCode,
			shortUrl,
			createdAt: link.createdAt.toISOString(),
			maxClicks: link.maxClicks ?? undefined,
			expiresAt: link.expiresAt?.toISOString() ?? undefined,
		});
	};

	trackPublic = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;
		const ip = request.ip;
		const userAgent = request.headers['user-agent'];

		const originalUrl = await this.linkService.getOriginalUrlAndTrack(code, ip, userAgent);
		return reply.status(HTTP_STATUS.OK).send({ originalUrl });
	};

	getStats = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;

		const stats = await this.linkService.getLinkStats(code);
		return reply.status(HTTP_STATUS.OK).send(stats);
	};

	getPreview = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;

		const preview = await this.linkService.getPreview(code);
		return reply.status(HTTP_STATUS.OK).send(preview);
	};

	verifyPassword = async (
		request: FastifyRequest<{ Params: { code: string }; Body: { password?: string } }>,
		reply: FastifyReply,
	) => {
		const { code } = request.params;
		const { password } = request.body;

		// We need to capture the IP and UserAgent from the verify API so that Next.js client-side verification
		// clicks are properly accredited to the user's browser, not just lost.
		const ip = request.ip;
		const userAgent = request.headers['user-agent'];

		if (!password) {
			return reply.status(HTTP_STATUS.BAD_REQUEST).send({ message: 'Password is required' });
		}

		const originalUrl = await this.linkService.verifyPassword(code, password, ip, userAgent);
		return reply.status(HTTP_STATUS.OK).send({ originalUrl });
	};
}
