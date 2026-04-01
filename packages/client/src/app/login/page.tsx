'use client';

import { signIn } from 'next-auth/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

	return (
		<main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-background">
			<div className="z-10 w-full max-w-md flex flex-col items-center gap-6 text-center mb-8">
				<h1 className="text-4xl font-heading font-black tracking-tight text-foreground">Welcome back.</h1>
				<p className="text-muted-foreground font-sans font-medium">
					Sign in to your account to manage your links <br className="hidden sm:block" />
					and view detailed analytics.
				</p>
			</div>

			<Card className="w-full max-w-md border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden relative">
				<CardContent className="p-8 sm:p-10 flex flex-col gap-4">
					<Button
						variant="outline"
						className="h-12 text-base font-semibold border-border/40 hover:bg-white/5 transition-all flex gap-3"
						onClick={() => signIn('google', { callbackUrl })}
					>
						<Mail className="h-5 w-5" />
						Continue with Google
					</Button>
					<Button
						variant="outline"
						className="h-12 text-base font-semibold border-border/40 hover:bg-white/5 transition-all flex gap-3"
						onClick={() => signIn('github', { callbackUrl })}
					>
						<Github className="h-5 w-5" />
						Continue with GitHub
					</Button>

					<div className="relative my-4">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border/40" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">Or</span>
						</div>
					</div>

					<p className="text-center text-sm text-muted-foreground">
						By continuing, you agree to our Terms of Service <br />
						and Privacy Policy.
					</p>
				</CardContent>
			</Card>
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
