'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Chrome as Google } from 'lucide-react';

export default function LoginPage() {
	return (
		<div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-4">
			<Card className="w-full max-w-md border-white/20 bg-white/10 backdrop-blur-md shadow-2xl">
				<CardHeader className="space-y-1 text-center">
					<CardTitle className="text-3xl font-bold tracking-tight text-white drop-shadow-md">
						Welcome Back
					</CardTitle>
					<CardDescription className="text-white/60">Choose your preferred sign in method</CardDescription>
				</CardHeader>
				<CardContent className="grid gap-4 py-8">
					<Button
						variant="outline"
						className="flex items-center gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-12 text-lg font-medium transition-all duration-300"
						onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
					>
						<Google className="h-5 w-5" />
						Continue with Google
					</Button>
					<Button
						variant="outline"
						className="flex items-center gap-2 border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white h-12 text-lg font-medium transition-all duration-300"
						onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
					>
						<Github className="h-5 w-5" />
						Continue with GitHub
					</Button>
				</CardContent>
				<div className="px-6 pb-6 text-center">
					<p className="text-xs text-white/40 italic">
						By signing in, you agree to our Terms of Service and Privacy Policy.
					</p>
				</div>
			</Card>
		</div>
	);
}
