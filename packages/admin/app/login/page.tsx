'use client';

import { useActionState } from 'react';
import { loginAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, AlertCircle } from 'lucide-react';

const initialState = {
	error: null as string | null,
};

export default function LoginPage() {
	const [state, formAction, isPending] = useActionState(loginAction, initialState);

	return (
		<div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
			<Card className="w-full max-w-md shadow-lg border-zinc-200 dark:border-zinc-800">
				<CardHeader className="space-y-1 text-center">
					<div className="mx-auto bg-zinc-900 dark:bg-zinc-100 rounded-full p-3 w-12 h-12 flex items-center justify-center mb-2 text-zinc-100 dark:text-zinc-900">
						<Lock className="w-6 h-6" />
					</div>
					<CardTitle className="text-2xl font-bold tracking-tight">Admin Portal</CardTitle>
					<CardDescription>Enter your administrator password to access the dashboard</CardDescription>
				</CardHeader>
				<form action={formAction}>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="••••••••"
								className="h-12 border-zinc-300 dark:border-zinc-700 focus-visible:ring-zinc-500"
								required
								autoFocus
							/>
						</div>
						{state?.error && (
							<div className="flex items-center gap-2 p-3 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg border border-red-200 dark:border-red-900/50">
								<AlertCircle className="w-4 h-4" />
								<span>{state.error}</span>
							</div>
						)}
					</CardContent>
					<CardFooter>
						<Button
							type="submit"
							className="w-full h-12 text-base font-semibold bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-all"
							disabled={isPending}
						>
							{isPending ? (
								<div className="flex items-center gap-2">
									<div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-100 dark:border-zinc-600 dark:border-t-zinc-900 rounded-full animate-spin"></div>
									Authenticating...
								</div>
							) : (
								'Sign In'
							)}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
