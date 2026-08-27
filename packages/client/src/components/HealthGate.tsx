'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerLoadingOverlay } from '@/components/ServerLoadingOverlay';
import { ShortenedLinkInfo } from '@/components/ShortenedLinkInfo';
import { LinkShortenerForm } from '@/components/LinkShortenerForm';
import { api } from '@/lib/api';

const MAX_ATTEMPTS = 30;
const POLL_INTERVAL_MS = 2000;

type ServerStatus = 'warming' | 'ready' | 'error';

export function HealthGate() {
	const [status, setStatus] = useState<ServerStatus>('warming');
	const [shortUrl, setShortUrl] = useState<string | null>(null);
	const [retryKey, setRetryKey] = useState(0);
	const attempts = useRef(0);

	useEffect(() => {
		attempts.current = 0;

		let cancelled = false;
		let timeoutId: ReturnType<typeof setTimeout> | undefined;
		const controller = new AbortController();

		const tick = async () => {
			try {
				await api.health.check(controller.signal);
				if (!cancelled) setStatus('ready');
			} catch (err) {
				if (err instanceof Error && err.name === 'AbortError') return;

				attempts.current += 1;
				if (attempts.current >= MAX_ATTEMPTS) {
					if (!cancelled) setStatus('error');
					return;
				}
				if (!cancelled) timeoutId = setTimeout(tick, POLL_INTERVAL_MS);
			}
		};

		tick();

		return () => {
			cancelled = true;
			controller.abort();
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, [retryKey]);

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: 0.24 }}
			className="w-full max-w-2xl z-10"
		>
			<div className="glass-card rounded-xl overflow-hidden relative">
				<div className="p-6 sm:p-10">
					{!shortUrl && (
						<ServerLoadingOverlay
							status={status}
							onRetry={() => {
								setStatus('warming');
								setRetryKey((k) => k + 1);
							}}
						/>
					)}
					<AnimatePresence mode="wait">
						{!shortUrl ? (
							<motion.div
								key="form"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0, y: -8 }}
							>
								<LinkShortenerForm disabled={status !== 'ready'} onSuccess={setShortUrl} />
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
	);
}
