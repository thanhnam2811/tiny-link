'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';

type RedirectHandlerProps = {
	code: string;
	isProtected?: boolean;
};

export default function RedirectHandler({ code, isProtected }: RedirectHandlerProps) {
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	// PUBLIC LINK LOGIC
	useEffect(() => {
		if (!isProtected) {
			// Simulate a small loading state for "Premium" UX feel as requested
			const timer = setTimeout(async () => {
				try {
					const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
					const response = await fetch(`${API_URL}/links/${code}/track`, {
						method: 'POST',
					});

					const data = await response.json();

					if (!response.ok) {
						toast.error(data.message || 'Error redirecting to link');
						setIsLoading(false);
						return;
					}

					// Safe Frontend-driven redirect. Backend Analytics has already completed.
					window.location.href = data.originalUrl;
				} catch (err: unknown) {
					toast.error('Network error during redirect');
					setIsLoading(false);
				}
			}, 800);

			return () => clearTimeout(timer);
		}
	}, [code, isProtected]);

	// PUBLIC RENDERING
	if (!isProtected) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
				<h1 className="text-2xl font-bold mb-4">Securing your connection...</h1>
				<p className="text-gray-500 mb-8 max-w-sm">
					Please wait a moment while we prepare your destination link.
				</p>
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
			const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
			const response = await fetch(`${API_URL}/links/${code}/verify`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || 'Incorrect password');
			}

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
		<div className="flex flex-col items-center justify-center min-h-screen p-4">
			<div className="w-full max-w-md bg-white rounded-xl shadow-sm border p-8">
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
					<p className="text-gray-500 mt-2 text-sm">
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
