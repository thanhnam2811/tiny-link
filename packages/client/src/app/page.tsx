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
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
		// If absolute URL, strip /api and add /healthz. If relative, just use /healthz
		const healthUrl = apiUrl.startsWith('http') ? `${apiUrl.replace(/\/api\/?$/, '')}/healthz` : '/healthz';
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
				<div className="inline-flex items-center rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm">
					<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2"></span>
					<span className="text-foreground/80">TinyLink v1.5.4 Stable</span>
				</div>
				<h1 className="text-5xl sm:text-[4rem] font-heading font-black leading-[1.05] tracking-tight text-foreground">
					Shorten your links. <br className="hidden sm:block" />
					<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">
						Track everything.
					</span>
				</h1>
				<p className="text-base sm:text-lg text-muted-foreground max-w-[540px] font-sans font-medium leading-relaxed">
					A lightning-fast URL shortener built for power users. <br className="hidden sm:block" />
					Enter your long URL below to get started.
				</p>
			</div>

			<Card className="w-full max-w-2xl border border-border/40 bg-card/50 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden relative">
				<CardContent className="p-6 sm:p-10">
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
