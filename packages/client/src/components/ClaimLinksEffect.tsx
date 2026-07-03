'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { api } from '@/lib/api';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';

export function ClaimLinksEffect() {
	const { user, isLoading } = useUser();
	const hasClaimed = useRef(false);

	useEffect(() => {
		// Only trigger once per session when user becomes authenticated
		if (!isLoading && user?.sub && !hasClaimed.current) {
			const guestId = getCookie('tiny_link_guest_id') as string;

			if (guestId) {
				console.log('[ClaimLinksEffect] Guest ID detected, triggering claim...');
				hasClaimed.current = true;

				api.links
					.claim(guestId)
					.then((res) => {
						if (res.claimedCount > 0) {
							console.log(`[ClaimLinksEffect] Successfully claimed ${res.claimedCount} links.`);
							toast.success(`Welcome back! We've added ${res.claimedCount} links to your account.`);
						}
					})
					.catch((err) => {
						console.error('[ClaimLinksEffect] Failed to claim links:', err);
					});
			} else {
				// No guest ID, mark as claimed anyway to avoid re-checks
				hasClaimed.current = true;
			}
		}
	}, [isLoading, user]);

	return null;
}
