'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { api } from '@/lib/api';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';

export function ClaimLinksEffect() {
	const { data: session, status } = useSession();
	const hasClaimed = useRef(false);

	useEffect(() => {
		// Only trigger once per session when user becomes authenticated
		if (status === 'authenticated' && session?.user?.id && !hasClaimed.current) {
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
	}, [status, session]);

	return null;
}
