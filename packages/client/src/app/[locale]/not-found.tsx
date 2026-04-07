'use client';

import { motion } from 'framer-motion';
import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { type ReactNode } from 'react';

export default function NotFound() {
	const t = useTranslations('NotFound');

	return (
		<main className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
			{/* Decorative elements */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] -z-10" />

			<div className="z-10 w-full max-w-md flex flex-col items-center text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					className="mx-auto w-24 h-24 glass rounded-3xl flex items-center justify-center mb-8 relative"
				>
					<div className="absolute inset-0 bg-primary/10 rounded-3xl animate-pulse" />
					<FileQuestion className="h-12 w-12 text-primary" />
				</motion.div>

				<motion.h1
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="text-4xl font-heading font-black text-foreground mb-3"
				>
					{t('title')}
				</motion.h1>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.2 }}
					className="text-muted-foreground font-sans text-sm leading-relaxed mb-10 max-w-[320px]"
				>
					{t.rich('description', {
						p: (chunks: ReactNode) => <p>{chunks}</p>,
					})}
				</motion.div>

				<Link href="/">
					<motion.div
						initial={{ opacity: 0, y: 8 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
						className="inline-flex items-center gap-2 h-11 px-8 rounded-xl glass font-heading font-bold text-sm text-foreground hover:glass-subtle transition-all shadow-lg shadow-primary/5"
					>
						<Home className="h-4 w-4" />
						{t('home')}
					</motion.div>
				</Link>
			</div>
		</main>
	);
}
