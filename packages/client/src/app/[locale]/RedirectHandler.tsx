'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { api } from '@/lib/api';

type RedirectHandlerProps = {
	code: string;
	isProtected?: boolean;
};

export default function RedirectHandler({ code, isProtected }: RedirectHandlerProps) {
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// PUBLIC LINK LOGIC
	useEffect(() => {
		if (!isProtected) {
			// Simulate a small loading state for "Premium" UX feel as requested
			const timer = setTimeout(async () => {
				try {
					const data = await api.links.track(code);

					// Safe Frontend-driven redirect. Backend Analytics has already completed.
					window.location.href = data.originalUrl;
				} catch {
					toast.error('Network error during redirect');
					setError('A network error occurred while resolving the link. Please try again.');
				}
			}, 800);

			return () => clearTimeout(timer);
		}
	}, [code, isProtected]);

	// PUBLIC RENDERING
	if (!isProtected) {
		if (error) {
			return (
				<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
					<div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 mx-auto">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="w-8 h-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold mb-4">Redirect Failed</h1>
					<p className="text-gray-500 mb-8 max-w-sm">{error}</p>
					<Link
						href="/"
						className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 font-medium transition-colors"
					>
						Create New Link
					</Link>
				</div>
			);
		}

		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
				<h1 className="text-2xl font-bold mb-4">Securing your connection...</h1>
				<p className="text-gray-500 mb-8 max-w-sm">
					Please wait a moment while we prepare your destination link.
				</p>
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
			</div>
		);
	}

	// PASSWORD PROTECTED LOGIC
	const handlePasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error('Please enter a password');
			return;
		}

		setIsLoading(true);
		try {
			const data = await api.links.verify(code, password);

			toast.success('Password verified. Redirecting...');
			// Safely redirect to original URL! The backend AnalyticsManager.push has already tracked this!
			window.location.href = data.originalUrl;
		} catch (err: unknown) {
			toast.error(err instanceof Error ? err.message : 'An unknown error occurred');
			setIsLoading(false);
		}
	};

	// PASSWORD RENDERING
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-background">
			<div className="w-full max-w-md bg-card text-card-foreground rounded-xl shadow-sm border p-8">
				<div className="text-center mb-6">
					<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
						<svg
							xmlns="http://www.w3.org/Dom"
							className="w-6 h-6 text-primary"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
					</div>
					<h1 className="text-2xl font-bold">Protected Link</h1>
					<p className="text-muted-foreground mt-2 text-sm">
						This link is secured with a password. Please enter it below to proceed.
					</p>
				</div>

				<form onSubmit={handlePasswordSubmit} className="space-y-4">
					<div className="space-y-2">
						<label htmlFor="password" className="text-sm font-medium leading-none">
							Password
						</label>
						<input
							id="password"
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
							placeholder="Enter password"
							disabled={isLoading}
						/>
					</div>
					<button
						type="submit"
						disabled={isLoading}
						className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
					>
						{isLoading ? (
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
						) : null}
						Unlock Link
					</button>
				</form>
			</div>
		</div>
	);
}
