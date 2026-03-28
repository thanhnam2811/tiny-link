import { FastifyRequest, FastifyReply } from 'fastify';
import { LinkService } from './link.service';
import { HTTP_STATUS, CreateLinkBodyType, INTERNAL_AUTH, ERROR_MESSAGES } from '@tiny-link/shared';

export class LinkController {
	constructor(private readonly linkService: LinkService) {}

	createLink = async (request: FastifyRequest, reply: FastifyReply) => {
		const { originalUrl, customCode, maxClicks, expiresAt, password, userId, guestId } =
			request.body as CreateLinkBodyType;

		const link = await this.linkService.createShortLink(
			originalUrl,
			customCode,
			maxClicks,
			expiresAt ? new Date(expiresAt) : undefined,
			password,
			userId,
			guestId,
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
			userId: link.userId ?? undefined,
			clicksCount: 0,
			isActive: true,
		});
	};

	trackPublic = async (request: FastifyRequest<{ Params: { code: string } }>, reply: FastifyReply) => {
		const { code } = request.params;
		const ip = request.ip;
		const userAgent = request.headers['user-agent'];

		const originalUrl = await this.linkService.getOriginalUrlAndTrack(code, ip, userAgent);
		return reply.status(HTTP_STATUS.OK).send({ originalUrl });
	};

	getStats = async (
		request: FastifyRequest<{ Params: { code: string }; Body?: { password?: string } }>,
		reply: FastifyReply,
	) => {
		const { code } = request.params;
		const password = request.body?.password;

		const stats = await this.linkService.getLinkStats(code, password);
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

	claimLinks = async (request: FastifyRequest, reply: FastifyReply) => {
		const { guestId } = request.body as { guestId: string };
		const userId = request.headers[INTERNAL_AUTH.USER_ID_HEADER] as string;

		if (!userId) {
			return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'User ID missing in header',
			});
		}

		const count = await this.linkService.claimLinks(guestId, userId);
		return reply.status(HTTP_STATUS.OK).send({ success: true, claimedCount: count });
	};

	getUserLinks = async (request: FastifyRequest, reply: FastifyReply) => {
		const query = request.query as { page?: number; limit?: number; search?: string };
		// In a real M2M setup, userId would be extracted from a trusted header or the body
		// For simplicity, we assume the BFF sends the header 'x-user-id'
		const userId = request.headers[INTERNAL_AUTH.USER_ID_HEADER] as string;

		if (!userId) {
			return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'User ID missing in header',
			});
		}

		const data = await this.linkService.getUserLinks(userId, query.page, query.limit, query.search);
		return reply.status(HTTP_STATUS.OK).send(data);
	};

	deleteLink = async (request: FastifyRequest, reply: FastifyReply) => {
		const { id } = request.params as { id: string };
		const userId = request.headers[INTERNAL_AUTH.USER_ID_HEADER] as string;

		if (!userId) {
			return reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'User ID missing in header',
			});
		}

		const success = await this.linkService.deleteLink(id, userId);
		if (!success) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({
				statusCode: HTTP_STATUS.NOT_FOUND,
				error: 'Not Found',
				code: ERROR_MESSAGES.LINK_NOT_FOUND,
				message: 'Link not found or unauthorized',
			});
		}

		return reply.status(HTTP_STATUS.OK).send({ success: true });
	};
}
