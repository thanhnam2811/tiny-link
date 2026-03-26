import { v4 as uuidv4 } from 'uuid';
import { getCookie, setCookie } from 'cookies-next';

const GUEST_ID_COOKIE = 'tiny_link_guest_id';

/**
 * Retrieves the existing guest ID or generates a new one.
 * Stores it in a long-lived cookie (1 year).
 */
export function getOrCreateGuestId(): string {
	let guestId = getCookie(GUEST_ID_COOKIE) as string;

	if (!guestId) {
		guestId = uuidv4();
		setCookie(GUEST_ID_COOKIE, guestId, {
			maxAge: 60 * 60 * 24 * 365, // 1 year
			path: '/',
		});
	}

	return guestId;
}

/**
 * Clears the guest ID cookie (usually after successful claim).
 */
export function clearGuestId() {
	setCookie(GUEST_ID_COOKIE, '', { maxAge: -1, path: '/' });
}
