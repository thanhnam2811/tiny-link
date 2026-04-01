'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Home, LinkIcon } from 'lucide-react';

export default function NotFound() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center px-4 bg-background gradient-mesh">
			<motion.div
				initial={{ opacity: 0, y: 32 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
				className="text-center max-w-md"
			>
				{/* Animated icon */}
				<motion.div
					animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
					transition={{ delay: 0.5, duration: 0.6, ease: 'easeInOut' }}
					className="mx-auto w-20 h-20 glass-card rounded-3xl flex items-center justify-center mb-8"
				>
					<LinkIcon className="h-10 w-10 text-primary/60" />
				</motion.div>

				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-8xl font-heading font-black text-foreground/10 select-none mb-2"
				>
					404
				</motion.p>

				<h1 className="text-2xl font-heading font-bold text-foreground mb-3">Link not found</h1>
				<p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
					This short link doesn&apos;t exist, has expired, or has been removed.
					<br />
					Double-check the URL or create a new one.
				</p>

				<Link
					href="/"
					className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-heading font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/20"
				>
					<Home className="h-4 w-4" />
					Back to Home
				</Link>
			</motion.div>
		</main>
	);
}
