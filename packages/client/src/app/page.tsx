'use client';

import { Card, CardContent } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ServerLoadingOverlay } from '@/components/ServerLoadingOverlay';
import { ShortenedLinkInfo } from '@/components/ShortenedLinkInfo';
import { LinkShortenerForm } from '@/components/LinkShortenerForm';

export default function Home() {
	const [shortUrl, setShortUrl] = useState<string | null>(null);
	const [serverStatus, setServerStatus] = useState<'warming' | 'ready' | 'error'>('warming');

	// Server Warmup Polling Logic
	useEffect(() => {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
		const healthUrl = `${apiUrl.replace(/\/api\/?$/, '')}/healthz`;
		let attempts = 0;
		const maxAttempts = 30; // 30 attempts * 2s = 60s max
		const abortController = new AbortController();

		const pingServer = async () => {
			try {
				const response = await fetch(healthUrl, {
					signal: abortController.signal,
					// Ensure we're not getting a cached response
					headers: { 'Cache-Control': 'no-cache' },
				});
				if (response.ok) {
					setServerStatus('ready');
					return true;
				}
			} catch (err) {
				// Avoid throwing on AbortError, it's expected on cleanup
				if (err instanceof Error && err.name === 'AbortError') return false;
			}
			return false;
		};

		const poll = setInterval(async () => {
			if (serverStatus === 'ready' || serverStatus === 'error') {
				clearInterval(poll);
				return;
			}

			attempts++;
			if (attempts >= maxAttempts) {
				setServerStatus('error');
				clearInterval(poll);
				return;
			}

			const isReady = await pingServer();
			if (isReady) {
				clearInterval(poll);
			}
		}, 2000);

		// Initial ping
		pingServer().then((isReady) => {
			if (isReady) clearInterval(poll);
		});

		// Cleanup function to clear interval and abort pending fetch
		return () => {
			clearInterval(poll);
			abortController.abort();
		};
	}, [serverStatus]);

	return (
		<main className="flex min-h-screen flex-col items-center p-6 sm:p-24 relative overflow-hidden bg-background">
			<div className="z-10 w-full max-w-2xl flex flex-col items-center gap-6 text-center mt-12 mb-10">
				<div className="inline-flex items-center rounded-full border border-border/50 bg-muted/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-foreground/80 tracking-wide">
					<span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 mr-2"></span>
					TinyLink
				</div>
				<h1 className="text-5xl sm:text-[4rem] font-[800] leading-[1.1] tracking-tight text-foreground font-[family-name:var(--font-inter-tight)]">
					Shorten your links. <br className="hidden sm:block" />
					<span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent font-extrabold pb-1">
						Track everything.
					</span>
				</h1>
				<p className="text-base sm:text-lg text-muted-foreground max-w-[540px] font-sans font-medium leading-relaxed">
					A lightning-fast URL shortener built for power users. <br className="hidden sm:block" />
					Enter your long URL below to get started.
				</p>
			</div>

			<Card className="w-full max-w-2xl border-border bg-card shadow-sm rounded-2xl overflow-hidden relative">
				<CardContent className="p-6 sm:p-8">
					{!shortUrl && (
						<ServerLoadingOverlay status={serverStatus} onRetry={() => setServerStatus('warming')} />
					)}
					{!shortUrl ? (
						<LinkShortenerForm disabled={serverStatus !== 'ready'} onSuccess={setShortUrl} />
					) : (
						<ShortenedLinkInfo shortUrl={shortUrl} onReset={() => setShortUrl(null)} />
					)}
				</CardContent>
			</Card>
		</main>
	);
}
