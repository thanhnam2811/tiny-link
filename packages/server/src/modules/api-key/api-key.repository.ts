import { PrismaClient, ApiKey } from '@tiny-link/db';

export class ApiKeyRepository {
	constructor(private readonly prisma: PrismaClient) {}

	async create(userId: string, name: string, keyPrefix: string, keyHash: string): Promise<ApiKey> {
		return this.prisma.apiKey.create({
			data: { userId, name, keyPrefix, keyHash },
		});
	}

	async findByUserId(userId: string): Promise<ApiKey[]> {
		return this.prisma.apiKey.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		});
	}

	async findById(id: string): Promise<ApiKey | null> {
		return this.prisma.apiKey.findUnique({ where: { id } });
	}

	async revoke(id: string, userId: string): Promise<boolean> {
		const result = await this.prisma.apiKey.updateMany({
			where: { id, userId, revokedAt: null },
			data: { revokedAt: new Date() },
		});
		return result.count > 0;
	}
}
