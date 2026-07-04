import { ApiKeySummaryType, CreateApiKeyResponseType } from '@tiny-link/shared';
import { ApiKeyRepository } from './api-key.repository';
import { generateApiKey } from '../../shared/api-key.util';

export class ApiKeyService {
	constructor(private readonly repository: ApiKeyRepository) {}

	async createKey(userId: string, name: string): Promise<CreateApiKeyResponseType> {
		const { plaintext, keyPrefix, keyHash } = generateApiKey();
		const apiKey = await this.repository.create(userId, name, keyPrefix, keyHash);

		return {
			id: apiKey.id,
			name: apiKey.name,
			keyPrefix: apiKey.keyPrefix,
			plaintext,
			createdAt: apiKey.createdAt.toISOString(),
		};
	}

	async listKeys(userId: string): Promise<ApiKeySummaryType[]> {
		const apiKeys = await this.repository.findByUserId(userId);

		return apiKeys.map((apiKey) => ({
			id: apiKey.id,
			name: apiKey.name,
			keyPrefix: apiKey.keyPrefix,
			createdAt: apiKey.createdAt.toISOString(),
			lastUsedAt: apiKey.lastUsedAt?.toISOString(),
			revokedAt: apiKey.revokedAt?.toISOString(),
		}));
	}

	async revokeKey(id: string, userId: string): Promise<boolean> {
		return this.repository.revoke(id, userId);
	}
}
