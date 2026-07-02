'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error('[TinyLink Error]', error);
	}, [error]);

	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
			<motion.div
				initial={{ opacity: 0, y: 24 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="text-center max-w-md"
			>
				<div className="mx-auto w-16 h-16 rounded-lg bg-destructive/10 flex items-center justify-center mb-6">
					<AlertCircle className="h-8 w-8 text-destructive" />
				</div>

				<h1 className="text-2xl font-heading font-bold text-foreground mb-3">Something went wrong</h1>
				<p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
					An unexpected error occurred. This has been logged and we&apos;re looking into it.
				</p>

				<div className="flex gap-3 justify-center">
					<button
						onClick={reset}
						className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-md font-heading font-semibold text-sm hover:bg-primary/90 transition-colors shadow-sm"
					>
						<RefreshCw className="h-4 w-4" />
						Try again
					</button>
					<Link
						href="/"
						className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-border bg-card font-heading font-semibold text-sm hover:bg-muted transition-colors"
					>
						<Home className="h-4 w-4" />
						Home
					</Link>
				</div>
			</motion.div>
		</main>
	);
}
