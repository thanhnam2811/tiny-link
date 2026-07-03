import { NextResponse } from 'next/server';
import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { prisma } from '@tiny-link/db';
import { getEnv } from './env';

// Guest-link claiming on login is handled client-side by ClaimLinksEffect
// (runs once the session becomes authenticated), so no server-side event is needed here.
export const auth0 = new Auth0Client({
	async onCallback(error, context, session) {
		if (error || !session) {
			return NextResponse.redirect(
				new URL(`/login?error=${error?.code ?? 'auth_error'}`, getEnv('APP_BASE_URL')),
			);
		}

		const { user } = session;

		await prisma.user.upsert({
			where: { id: user.sub },
			update: {
				name: user.name ?? null,
				email: user.email,
				image: user.picture ?? null,
			},
			create: {
				id: user.sub,
				name: user.name ?? null,
				email: user.email,
				image: user.picture ?? null,
			},
		});

		return NextResponse.redirect(new URL(context.returnTo || '/dashboard', getEnv('APP_BASE_URL')));
	},
});
