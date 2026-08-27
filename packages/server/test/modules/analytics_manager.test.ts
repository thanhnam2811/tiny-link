import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@tiny-link/db';
import { AnalyticsManager } from '../../src/modules/analytics/analytics_manager';

describe('AnalyticsManager Poison Pill & Batch Rollback Protection (TL-BE-04)', () => {
	let analyticsManager: AnalyticsManager;

	beforeEach(async () => {
		analyticsManager = new AnalyticsManager(prisma, 60000);
	});

	it('successfully flushes click events for existing links', async () => {
		const link = await prisma.link.create({
			data: {
				originalUrl: 'https://example.com/analytics-test-1',
				shortCode: 'anl-1',
				clicksCount: 0,
			},
		});

		analyticsManager.push({ linkId: link.id, ipAddress: '8.8.8.8', userAgent: 'TestAgent' });
		analyticsManager.push({ linkId: link.id, ipAddress: '8.8.8.8', userAgent: 'TestAgent' });

		expect(analyticsManager.getQueueStats().depth).toBe(2);

		await analyticsManager.flush();

		expect(analyticsManager.getQueueStats().depth).toBe(0);

		const updatedLink = await prisma.link.findUnique({ where: { id: link.id } });
		expect(updatedLink?.clicksCount).toBe(2);

		const clicks = await prisma.click.findMany({ where: { linkId: link.id } });
		expect(clicks.length).toBe(2);
	});

	it('safely handles batch containing deleted/orphaned link clicks without failing or rolling back active links', async () => {
		// 1. Create two links
		const activeLink = await prisma.link.create({
			data: {
				originalUrl: 'https://example.com/active-link',
				shortCode: 'active-1',
				clicksCount: 5,
			},
		});

		const deletedLink = await prisma.link.create({
			data: {
				originalUrl: 'https://example.com/deleted-link',
				shortCode: 'deleted-1',
				clicksCount: 0,
			},
		});

		const deletedLinkId = deletedLink.id;

		// 2. Queue clicks for BOTH active and to-be-deleted links
		analyticsManager.push({ linkId: activeLink.id, ipAddress: '1.1.1.1' });
		analyticsManager.push({ linkId: activeLink.id, ipAddress: '1.1.1.1' });
		analyticsManager.push({ linkId: deletedLinkId, ipAddress: '1.1.1.1' });
		analyticsManager.push({ linkId: 'non-existent-uuid-12345', ipAddress: '1.1.1.1' });

		expect(analyticsManager.getQueueStats().depth).toBe(4);

		// 3. Delete the deletedLink from DB while clicks are queued in memory
		await prisma.link.delete({ where: { id: deletedLinkId } });

		// 4. Trigger flush - must NOT throw P2025 or rollback active link update
		await expect(analyticsManager.flush()).resolves.not.toThrow();

		// 5. Queue should be cleanly flushed (no infinite poison pill re-queueing)
		expect(analyticsManager.getQueueStats().depth).toBe(0);

		// 6. Active link clicksCount must be incremented from 5 to 7
		const reloadedActive = await prisma.link.findUnique({ where: { id: activeLink.id } });
		expect(reloadedActive?.clicksCount).toBe(7);

		const activeClicks = await prisma.click.findMany({ where: { linkId: activeLink.id } });
		expect(activeClicks.length).toBe(2);
	});
});
