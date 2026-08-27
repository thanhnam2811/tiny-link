'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerLoadingOverlay } from '@/components/ServerLoadingOverlay';
import { ShortenedLinkInfo } from '@/components/ShortenedLinkInfo';
import { LinkShortenerForm } from '@/components/LinkShortenerForm';
import { Zap, Shield, BarChart2, Globe } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { type Variants } from 'framer-motion';

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

export default function Home() {
	const t = useTranslations('home');
	const [shortUrl, setShortUrl] = useState<string | null>(null);
	const [serverStatus, setServerStatus] = useState<'warming' | 'ready' | 'error'>('warming');

	const FEATURES = [
		{
			icon: Zap,
			title: t('features.lightning.title'),
			description: t('features.lightning.description'),
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
		{
			icon: BarChart2,
			title: t('features.analytics.title'),
			description: t('features.analytics.description'),
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
		{
			icon: Shield,
			title: t('features.security.title'),
			description: t('features.security.description'),
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
		{
			icon: Globe,
			title: t('features.global.title'),
			description: t('features.global.description'),
			color: 'text-primary',
			bg: 'bg-primary/10',
		},
	];

	useEffect(() => {
		const healthUrl = '/api/proxy/healthz';
		let attempts = 0;
		const maxAttempts = 30;
		const abortController = new AbortController();

		const pingServer = async () => {
			try {
				const response = await fetch(healthUrl, {
					signal: abortController.signal,
					headers: { 'Cache-Control': 'no-cache' },
				});
				if (response.ok) {
					setServerStatus('ready');
					return true;
				}
			} catch (err) {
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
			if (isReady) clearInterval(poll);
		}, 2000);

		pingServer().then((isReady) => {
			if (isReady) clearInterval(poll);
		});

		return () => {
			clearInterval(poll);
			abortController.abort();
		};
	}, [serverStatus]);

	return (
		<main className="flex min-h-screen flex-col items-center px-4 pb-24 relative overflow-hidden bg-background gradient-mesh">
			{/* Hero Section */}
			<section className="w-full max-w-2xl flex flex-col items-center gap-6 text-center mt-16 mb-10 z-10">
				<motion.div
					custom={0}
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					className="inline-flex items-center rounded-full glass px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm"
				>
					<span className="flex h-2 w-2 rounded-full bg-primary animate-pulse mr-2" />
					<span className="text-foreground/80">TinyLink v{process.env.NEXT_PUBLIC_APP_VERSION} Stable</span>
				</motion.div>

				<motion.h1
					custom={1}
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					className="text-5xl sm:text-[4rem] font-heading font-black leading-[1.05] tracking-tight text-foreground"
				>
					{t('heroTitle1')} <br className="hidden sm:block" />
					<span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent pb-1">
						{t('heroTitle2')}
					</span>
				</motion.h1>

				<motion.p
					custom={2}
					variants={fadeUp}
					initial="hidden"
					animate="visible"
					className="text-base sm:text-lg text-muted-foreground max-w-[540px] font-sans font-medium leading-relaxed"
				>
					{t('heroSubtitle')}
				</motion.p>
			</section>

			{/* Main Form Card */}
			<motion.div
				custom={3}
				variants={fadeUp}
				initial="hidden"
				animate="visible"
				className="w-full max-w-2xl z-10"
			>
				<div className="glass-card rounded-xl overflow-hidden relative">
					<div className="p-6 sm:p-10">
						{!shortUrl && (
							<ServerLoadingOverlay status={serverStatus} onRetry={() => setServerStatus('warming')} />
						)}
						<AnimatePresence mode="wait">
							{!shortUrl ? (
								<motion.div
									key="form"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0, y: -8 }}
								>
									<LinkShortenerForm disabled={serverStatus !== 'ready'} onSuccess={setShortUrl} />
								</motion.div>
							) : (
								<motion.div
									key="result"
									initial={{ opacity: 0, y: 12 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.3 }}
								>
									<ShortenedLinkInfo shortUrl={shortUrl} onReset={() => setShortUrl(null)} />
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</motion.div>

			{/* Bento-grid Feature Section */}
			<section className="w-full max-w-2xl mt-12 z-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{FEATURES.map((feature, i) => (
						<motion.div
							key={feature.title}
							custom={i + 4}
							variants={fadeUp}
							initial="hidden"
							animate="visible"
							whileHover={{ y: -3, transition: { duration: 0.2 } }}
							className="glass-subtle rounded-lg p-5 flex gap-4 items-start cursor-default"
						>
							<div className={`p-2.5 rounded-md shrink-0 ${feature.bg}`}>
								<feature.icon className={`h-5 w-5 ${feature.color}`} />
							</div>
							<div>
								<h3 className="font-heading font-bold text-foreground text-sm mb-1">{feature.title}</h3>
								<p className="text-xs text-muted-foreground leading-relaxed font-sans">
									{feature.description}
								</p>
							</div>
						</motion.div>
					))}
				</div>
			</section>
		</main>
	);
}
