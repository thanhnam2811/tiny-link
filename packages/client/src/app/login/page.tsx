'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
	const searchParams = useSearchParams();
	const returnTo = searchParams.get('callbackUrl') || '/dashboard';

	return (
		<main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center bg-background p-6">
			<div className="z-10 mb-8 flex w-full max-w-md flex-col items-center gap-3 text-center">
				<h1 className="font-heading text-3xl font-black tracking-tight text-foreground">Welcome back</h1>
				<p className="text-sm font-medium text-muted-foreground">
					Sign in to manage your links and view detailed analytics.
				</p>
			</div>

			<Card className="w-full max-w-md shadow-lg">
				<CardContent className="flex flex-col gap-3 p-6 sm:p-8">
					<Button
						variant="outline"
						className="h-11 gap-3 text-sm font-semibold"
						nativeButton={false}
						render={
							<a href={`/auth/login?connection=google-oauth2&returnTo=${encodeURIComponent(returnTo)}`} />
						}
					>
						<Mail className="h-4 w-4" />
						Continue with Google
					</Button>
					<Button
						variant="outline"
						className="h-11 gap-3 text-sm font-semibold"
						nativeButton={false}
						render={<a href={`/auth/login?connection=github&returnTo=${encodeURIComponent(returnTo)}`} />}
					>
						<Github className="h-4 w-4" />
						Continue with GitHub
					</Button>

					<div className="relative my-2">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t border-border" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-card px-2 text-muted-foreground">Or</span>
						</div>
					</div>

					<p className="text-center text-xs text-muted-foreground">
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
