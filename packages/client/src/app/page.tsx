'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { api, ApiError } from '@/lib/api';
import { ERROR_MESSAGES, CreateLinkBodyType } from '@tiny-link/shared';
import { ArrowRight, Copy, LinkIcon } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Home() {
	const [url, setUrl] = useState('');
	const [customCode, setCustomCode] = useState('');
	const [loading, setLoading] = useState(false);
	const [shortUrl, setShortUrl] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url) return;

		setLoading(true);
		setShortUrl(null);

		const payload: CreateLinkBodyType = { originalUrl: url };
		if (customCode.trim()) payload.customCode = customCode.trim();

		try {
			const response = await api.links.create(payload);
			setShortUrl(response.shortUrl);
			toast.success('Short link created successfully!');
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.code === ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
					toast.error('Whoa there! You are creating links too fast.', { description: err.message });
				} else if (err.code === ERROR_MESSAGES.LINK_CODE_CONFLICT) {
					toast.error('Custom code already taken', { description: 'Please pick a different one.' });
				} else if (err.code === ERROR_MESSAGES.VALIDATION_ERROR) {
					toast.error('Invalid URL format', { description: 'Make sure you include http or https.' });
				} else {
					toast.error('Failed to create link', { description: err.message });
				}
			} else {
				toast.error('Network error. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	const handleCopy = () => {
		if (shortUrl) {
			navigator.clipboard.writeText(shortUrl);
			toast.success('Copied to clipboard!');
		}
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-24 relative overflow-hidden">
			{/* Decorative background blobs */}
			<div className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -z-10" />
			<div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

			<div className="z-10 w-full max-w-2xl flex flex-col items-center gap-8 text-center mb-12">
				<div className="inline-flex items-center rounded-full border border-border bg-background/50 backdrop-blur-sm px-3 py-1 text-sm font-medium text-muted-foreground">
					<span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
					TinyLink v1.1.0 is Live
				</div>
				<h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
					Shorten. Manage. <br className="hidden sm:block" />
					<span className="text-blue-500">Track Everything.</span>
				</h1>
				<p className="text-lg text-muted-foreground max-w-xl">
					A lightning-fast, premium URL shortener built for power users. Enter your long URL below to get
					started.
				</p>
			</div>

			<Card className="w-full max-w-2xl border-white/10 bg-background/60 backdrop-blur-xl shadow-2xl">
				<CardHeader>
					<CardTitle>Create Link</CardTitle>
					<CardDescription>Paste your long URL to make it tiny.</CardDescription>
				</CardHeader>
				<CardContent>
					{!shortUrl ? (
						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div className="flex flex-col sm:flex-row gap-3">
								<div className="relative flex-1">
									<LinkIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
									<Input
										placeholder="https://example.com/very/long/url"
										className="pl-9 h-12 text-md transition-all border-border focus:border-blue-500/50 focus:ring-blue-500/50"
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										required
										autoComplete="off"
										autoFocus
									/>
								</div>
								<div className="relative w-full sm:w-48">
									<Input
										placeholder="Custom Code (Optional)"
										className="h-12 text-md transition-all border-border"
										value={customCode}
										onChange={(e) => setCustomCode(e.target.value)}
										autoComplete="off"
									/>
								</div>
							</div>
							<Button
								type="submit"
								size="lg"
								className="w-full h-12 font-semibold text-md transition-all shadow-md active:scale-[0.98]"
								disabled={loading || !url}
							>
								{loading ? 'Shortening...' : 'Shorten URL'} <ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</form>
					) : (
						<div className="flex flex-col gap-6 animate-in zoom-in-95 duration-300">
							<div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-white/5">
								<div className="flex flex-col gap-1 overflow-hidden">
									<span className="text-sm font-medium text-muted-foreground">
										Your tiny link is ready:
									</span>
									<a
										href={shortUrl}
										target="_blank"
										rel="noreferrer"
										className="text-xl font-bold text-blue-400 hover:text-blue-300 transition-colors truncate"
									>
										{shortUrl}
									</a>
								</div>
								<Button
									variant="secondary"
									size="icon"
									onClick={handleCopy}
									className="shrink-0 h-10 w-10 ml-4"
								>
									<Copy className="h-4 w-4" />
								</Button>
							</div>

							<div className="flex justify-center">
								<div className="p-4 bg-white rounded-xl shadow-sm border flex items-center justify-center">
									<QRCodeSVG
										value={shortUrl}
										size={160}
										level="H"
										includeMargin={false}
										className="rounded-sm"
									/>
								</div>
							</div>

							<Button
								variant="outline"
								className="w-full h-12"
								onClick={() => {
									setShortUrl(null);
									setUrl('');
									setCustomCode('');
								}}
							>
								Create Another Link
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</main>
	);
}
