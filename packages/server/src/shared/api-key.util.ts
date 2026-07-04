import { randomBytes, createHash } from 'crypto';
import { PUBLIC_API_KEY } from '@tiny-link/shared';

export interface GeneratedApiKey {
	plaintext: string;
	keyPrefix: string;
	keyHash: string;
}

export const hashApiKey = (plaintext: string): string => createHash('sha256').update(plaintext).digest('hex');

export const generateApiKey = (): GeneratedApiKey => {
	const secret = randomBytes(24).toString('base64url');
	const plaintext = `${PUBLIC_API_KEY.PREFIX}${secret}`;

	return {
		plaintext,
		keyPrefix: plaintext.slice(0, PUBLIC_API_KEY.PREFIX_DISPLAY_LENGTH),
		keyHash: hashApiKey(plaintext),
	};
};
