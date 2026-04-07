'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	const t = useTranslations('Error');

	useEffect(() => {
		console.error('[TinyLink Error]', error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 bg-background gradient-mesh">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="text-center max-w-md"
			>
				<div className="mx-auto w-16 h-16 glass-card rounded-2xl flex items-center justify-center mb-6">
					<AlertCircle className="h-8 w-8 text-destructive" />
				</div>

				<h1 className="text-2xl font-heading font-bold text-foreground mb-3">{t('title')}</h1>
				<p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
					{t.rich('description', {
						p: (chunks: ReactNode) => <p>{chunks}</p>,
					})}
				</p>

				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-heading font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20"
					>
						<RefreshCw className="h-4 w-4" />
						{t('tryAgain')}
					</button>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-xl font-heading font-semibold text-sm hover:-translate-y-0.5 transition-all"
					>
						<Home className="h-4 w-4" />
						{t('home')}
					</Link>
				</div>
			</motion.div>
		</main>
	);
}
