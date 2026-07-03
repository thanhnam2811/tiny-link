'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Link as LinkIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" {...props}>
			<path
				fill="#4285F4"
				d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
			/>
			<path
				fill="#34A853"
				d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.27v3.1A12 12 0 0 0 12 24Z"
			/>
			<path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58v-3.1H1.27a12 12 0 0 0 0 10.78l4-3.1Z" />
			<path
				fill="#EA4335"
				d="M12 4.75c1.76 0 3.35.61 4.59 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.61l4 3.1C6.22 6.86 8.87 4.75 12 4.75Z"
			/>
		</svg>
	);
}

const fadeUp: Variants = {
	hidden: { opacity: 0, y: 24 },
	visible: (i: number) => ({
		opacity: 1,
		y: 0,
		transition: {
			delay: i * 0.08,
			duration: 0.5,
			ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
		},
	}),
};

function LoginForm() {
	const searchParams = useSearchParams();
	const returnTo = searchParams.get('callbackUrl') || '/dashboard';

	return (
		<main className="relative flex min-h-[calc(100vh-64px)] flex-col items-center justify-center overflow-hidden bg-background gradient-mesh px-4">
			<motion.div
				custom={0}
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="z-10 mb-8 flex w-full max-w-md flex-col items-center gap-3 text-center"
			>
				<span className="inline-flex items-center justify-center rounded-full glass p-3 shadow-sm">
					<LinkIcon className="h-5 w-5 text-primary" />
				</span>
				<h1 className="font-heading text-3xl font-black tracking-tight text-foreground">Welcome back</h1>
				<p className="text-sm font-medium text-muted-foreground">
					Sign in to manage your links and view detailed analytics.
				</p>
			</motion.div>

			<motion.div
				custom={1}
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="z-10 w-full max-w-md"
			>
				<Card className="glass-card w-full">
					<CardContent className="flex flex-col gap-3 p-6 sm:p-8">
						<Button
							variant="outline"
							className="h-11 gap-3 text-sm font-semibold"
							nativeButton={false}
							render={
								<a
									href={`/auth/login?connection=google-oauth2&returnTo=${encodeURIComponent(returnTo)}`}
								/>
							}
						>
							<GoogleIcon className="h-4 w-4" />
							Continue with Google
						</Button>
						<Button
							variant="outline"
							className="h-11 gap-3 text-sm font-semibold"
							nativeButton={false}
							render={
								<a href={`/auth/login?connection=github&returnTo=${encodeURIComponent(returnTo)}`} />
							}
						>
							<Github className="h-4 w-4" />
							Continue with GitHub
						</Button>

						<p className="mt-2 text-center text-xs text-muted-foreground">
							By continuing, you agree to our Terms of Service <br />
							and Privacy Policy.
						</p>
					</CardContent>
				</Card>
			</motion.div>
		</main>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
					<div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
				</div>
			}
		>
			<LoginForm />
		</Suspense>
	);
}
