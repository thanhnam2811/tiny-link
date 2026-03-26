import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@tiny-link/db';
import { cookies } from 'next/headers';

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: PrismaAdapter(prisma),
	providers: [
		Google({
			clientId: process.env.AUTH_GOOGLE_ID,
			clientSecret: process.env.AUTH_GOOGLE_SECRET,
		}),
		GitHub({
			clientId: process.env.AUTH_GITHUB_ID,
			clientSecret: process.env.AUTH_GITHUB_SECRET,
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
				const internalUrl = process.env.INTERNAL_API_URL || 'http://localhost:3001';
				const internalKey = process.env.INTERNAL_API_KEY;

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
