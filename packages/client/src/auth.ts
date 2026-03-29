import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@tiny-link/db';
import { cookies } from 'next/headers';
import { getEnv } from './lib/env';

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma as unknown as Parameters<typeof PrismaAdapter>[0]),
	secret: getEnv('AUTH_SECRET'),
	providers: [
		Google({
			clientId: getEnv('AUTH_GOOGLE_ID'),
			clientSecret: getEnv('AUTH_GOOGLE_SECRET'),
		}),
		GitHub({
			clientId: getEnv('AUTH_GITHUB_ID'),
			clientSecret: getEnv('AUTH_GITHUB_SECRET'),
		}),
	],
	session: {
		strategy: 'jwt',
	},
	callbacks: {
		async session({ session, token }) {
			if (session.user && token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
	events: {
		async signIn({ user }) {
			const cookieStore = await cookies();
			const guestId = cookieStore.get('tiny_link_guest_id')?.value;

			if (guestId && user.id) {
				const internalUrl = getEnv('INTERNAL_API_URL');
				const internalKey = getEnv('INTERNAL_API_KEY');

				try {
					console.log(`[Auth Event] Triggering silent claim for guest ${guestId}`);
					await fetch(`${internalUrl}/api/links/claim`, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'x-user-id': user.id,
							'x-internal-key': internalKey || '',
						},
						body: JSON.stringify({ guestId }),
					});
				} catch (error) {
					console.error('[Auth Event] Failed to claim links:', error);
				}
			}
		},
	},
});
