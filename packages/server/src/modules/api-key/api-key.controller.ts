import { FastifyRequest, FastifyReply } from 'fastify';
import { HTTP_STATUS, ERROR_MESSAGES, INTERNAL_AUTH, CreateApiKeyBodyType } from '@tiny-link/shared';
import { ApiKeyService } from './api-key.service';

export class ApiKeyController {
	constructor(private readonly apiKeyService: ApiKeyService) {}

	private requireUserId(request: FastifyRequest, reply: FastifyReply): string | null {
		const userId = request.headers[INTERNAL_AUTH.USER_ID_HEADER] as string;

		if (!userId) {
			reply.status(HTTP_STATUS.UNAUTHORIZED).send({
				statusCode: HTTP_STATUS.UNAUTHORIZED,
				error: 'Unauthorized',
				code: ERROR_MESSAGES.UNAUTHORIZED,
				message: 'User ID missing in header',
			});
			return null;
		}

		return userId;
	}

	createKey = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = this.requireUserId(request, reply);
		if (!userId) return;

		const { name } = request.body as CreateApiKeyBodyType;
		const apiKey = await this.apiKeyService.createKey(userId, name);
		return reply.status(HTTP_STATUS.CREATED).send(apiKey);
	};

	listKeys = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = this.requireUserId(request, reply);
		if (!userId) return;

		const apiKeys = await this.apiKeyService.listKeys(userId);
		return reply.status(HTTP_STATUS.OK).send({ apiKeys });
	};

	revokeKey = async (request: FastifyRequest, reply: FastifyReply) => {
		const userId = this.requireUserId(request, reply);
		if (!userId) return;

		const { id } = request.params as { id: string };
		const success = await this.apiKeyService.revokeKey(id, userId);

		if (!success) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({
				statusCode: HTTP_STATUS.NOT_FOUND,
				error: 'Not Found',
				code: ERROR_MESSAGES.API_KEY_NOT_FOUND,
				message: 'API key not found or already revoked',
			});
		}

		return reply.status(HTTP_STATUS.OK).send({ success: true });
	};
}
