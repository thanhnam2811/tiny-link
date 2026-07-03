'use client';

import { motion, type Variants } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Mail, Link as LinkIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

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
							<Mail className="h-4 w-4" />
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
