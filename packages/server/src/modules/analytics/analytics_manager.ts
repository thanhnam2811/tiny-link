import { PrismaClient, Prisma } from '@tiny-link/db';
import geoip from 'geoip-lite';

export interface ClickEvent {
	linkId: string;
	ipAddress?: string;
	userAgent?: string;
}

export class AnalyticsManager {
	private currentQueue: ClickEvent[] = [];
	private readonly MAX_QUEUE_SIZE = 10000;
	private flushInterval: NodeJS.Timeout | null = null;
	private isShuttingDown = false;

	constructor(
		private readonly prisma: PrismaClient,
		private readonly flushIntervalMs: number = 30000,
	) {}

	start() {
		if (this.flushInterval) return;
		this.flushInterval = setInterval(() => this.flush(), this.flushIntervalMs);
	}

	stop() {
		if (this.flushInterval) {
			clearInterval(this.flushInterval);
			this.flushInterval = null;
		}
	}

	push(event: ClickEvent) {
		if (this.isShuttingDown) return;

		if (this.currentQueue.length >= this.MAX_QUEUE_SIZE) {
			console.error(
				`[AnalyticsManager] Queue full (${this.MAX_QUEUE_SIZE}), dropping event for link ${event.linkId}`,
			);
			return;
		}

		this.currentQueue.push(event);
	}

	async flush() {
		if (this.currentQueue.length === 0) return;

		// 1. Atomic Swap: Take a snapshot and reset the current queue immediately
		const snapshot = [...this.currentQueue];
		this.currentQueue = [];

		try {
			await this.processBatch(snapshot);
		} catch (error) {
			console.error('[AnalyticsManager] Failed to flush analytics batch:', error);

			// Strategy: If flush fails, try to put back into queue if space allows
			// This avoids losing data on temporary DB/network blips
			if (!this.isShuttingDown && this.currentQueue.length + snapshot.length <= this.MAX_QUEUE_SIZE) {
				this.currentQueue = [...snapshot, ...this.currentQueue];
			} else {
				console.error(
					'[AnalyticsManager] Could not recover snapshot due to queue size or shutdown. Data lost.',
				);
			}
		}
	}

	private async processBatch(events: ClickEvent[]) {
		// 2. In-memory Aggregation: Group clicks by linkId for efficient counting
		const aggregation = events.reduce(
			(acc, event) => {
				acc[event.linkId] = (acc[event.linkId] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
			// 3. Batch Insert raw click data
			await tx.click.createMany({
				data: events.map((e) => {
					let country = 'Unknown';
					let city = 'Unknown';

					if (e.ipAddress) {
						const geo = geoip.lookup(e.ipAddress);
						if (geo) {
							country = geo.country || 'Unknown';
							city = geo.city || 'Unknown';
						}
					}

					return {
						linkId: e.linkId,
						ipAddress: e.ipAddress,
						userAgent: e.userAgent,
						country,
						city,
					};
				}),
			});

			// 4. Update Link counters (Aggregation results)
			// We do multiple updates, but grouped by unique linkId
			for (const [linkId, count] of Object.entries(aggregation)) {
				await tx.link.update({
					where: { id: linkId },
					data: {
						clicksCount: {
							increment: count,
						},
					},
				});
			}
		});
	}

	async shutdown() {
		this.isShuttingDown = true;
		this.stop();
		console.log('[AnalyticsManager] Shutting down, performing final flush...');
		await this.flush();
		console.log('[AnalyticsManager] Final flush complete.');
	}
}
