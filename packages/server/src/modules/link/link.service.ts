import { nanoid } from 'nanoid';
import { LinkRepository } from './link.repository';

export class LinkService {
	constructor(private readonly linkRepository: LinkRepository) {}

	async createShortLink(originalUrl: string, customCode?: string) {
		let shortCode = customCode;
		const maxRetries = 3;

		for (let attempt = 1; attempt <= maxRetries; attempt++) {
			if (!shortCode) {
				shortCode = nanoid(7);
			}

			try {
				const link = await this.linkRepository.create(originalUrl, shortCode);
				return link;
			} catch (error: unknown) {
				// P2002 is Prisma's error code for "Unique constraint failed"
				if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
					if (customCode) {
						// If custom code is taken, throw immediately
						const err = new Error(`The custom code '${customCode}' is already in use.`, { cause: error });
						(err as { statusCode?: number }).statusCode = 409;
						throw err;
					} else {
						// Auto-generated collision, retry
						shortCode = undefined;
						if (attempt === maxRetries) {
							throw new Error('Internal Server Error: Could not generate unique short code.', {
								cause: error,
							});
						}
						continue;
					}
				}
				throw error;
			}
		}

		throw new Error('Failed to create short link due to unknown error.');
	}

	async getOriginalUrlAndTrack(code: string, ipAddress?: string, userAgent?: string, logger?: any): Promise<string> {
		const link = await this.linkRepository.findByShortCode(code);

		if (!link || !link.isActive) {
			const err = new Error('Link not found or inactive');
			(err as any).statusCode = 404;
			throw err;
		}

		// Analytics: Fire-and-forget
		// Attach .catch to avoid Unhandled Promise Rejection
		this.linkRepository.trackClick(link.id, ipAddress, userAgent).catch((err) => {
			if (logger && typeof logger.error === 'function') {
				logger.error({ err, linkId: link.id }, 'Failed to track link click');
			}
		});

		return link.originalUrl;
	}
}
