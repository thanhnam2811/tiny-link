'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { LinkStatsResponseType } from '@tiny-link/shared';
import dynamic from 'next/dynamic';

const StatsCharts = dynamic(() => import('./StatsCharts').then((mod) => mod.StatsCharts), {
	ssr: false,
	loading: () => (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<div className="lg:col-span-2 h-[340px] animate-pulse rounded-lg border border-border bg-card/60" />
			<div className="h-[340px] animate-pulse rounded-lg border border-border bg-card/60" />
		</div>
	),
});
import {
	Lock,
	BarChart3,
	Globe,
	MapPin,
	Calendar,
	Link as LinkIcon,
	ExternalLink,
	MousePointerClick,
	QrCode,
} from 'lucide-react';
import Link from 'next/link';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LinkQrCode } from '@/components/LinkQrCode';

type StatsDashboardProps = {
	code: string;
	isProtected?: boolean;
};

function MetricSkeleton() {
	return <div className="h-28 skeleton rounded-lg" />;
}

export default function StatsDashboard({ code, isProtected }: StatsDashboardProps) {
	const [password, setPassword] = useState('');
	const [isLocked, setIsLocked] = useState(isProtected ?? false);
	const [isLoading, setIsLoading] = useState(isProtected ? false : true);
	const [stats, setStats] = useState<LinkStatsResponseType | null>(null);

	const fetchStats = async (pw?: string) => {
		setIsLoading(true);
		try {
			const data = await api.links.getStats(code, pw);
			setStats(data as LinkStatsResponseType);
			setIsLocked(false);
		} catch (err: unknown) {
			const error = err as { statusCode?: number; message?: string };
			if (error.statusCode === 401) {
				setIsLocked(true);
				toast.error(error.message || 'Incorrect password');
			} else {
				toast.error(error.message || 'Failed to load statistics');
				console.error('Stats fetch error:', err);
			}
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		if (!isLocked && !stats) {
			fetchStats();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isLocked, stats]);

	const handlePasswordSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!password) {
			toast.error('Please enter a password');
			return;
		}
		fetchStats(password);
	};

	// 1. Password Protection
	if (isLocked) {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="w-full max-w-sm"
				>
					<div className="rounded-lg border border-border bg-card p-8 shadow-lg">
						<div className="mb-6 text-center">
							<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10">
								<Lock className="h-5 w-5 text-primary" />
							</div>
							<h1 className="font-heading text-xl font-bold">Protected Analytics</h1>
							<p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
								Enter the password to view this link&apos;s metrics.
							</p>
						</div>

						<form onSubmit={handlePasswordSubmit} className="space-y-4">
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="h-11 w-full rounded-md border border-border bg-background px-4 text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:outline-none"
								placeholder="Enter password"
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={isLoading}
								className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-primary text-sm font-heading font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
							>
								{isLoading && (
									<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
								)}
								Unlock Metrics
							</button>
						</form>
					</div>
				</motion.div>
			</main>
		);
	}

	// 2. Loading Skeleton
	if (isLoading || !stats) {
		return (
			<div className="min-h-screen bg-background py-10 px-4">
				<div className="max-w-5xl mx-auto space-y-6">
					<div className="h-10 w-48 skeleton rounded-xl" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<MetricSkeleton />
						<MetricSkeleton />
						<MetricSkeleton />
					</div>
					<div className="h-80 skeleton rounded-2xl" />
				</div>
			</div>
		);
	}

	const countryData = Object.entries(stats.geo.countries)
		.map(([name, clicks]) => ({ name, clicks: clicks as number }))
		.sort((a, b) => b.clicks - a.clicks)
		.slice(0, 5);

	// 3. Main Dashboard
	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="min-h-screen bg-background text-foreground py-10 px-4"
			>
				<div className="max-w-5xl mx-auto space-y-6">
					{/* Header */}
					<motion.div
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						className="flex flex-col md:flex-row md:items-center justify-between gap-4"
					>
						<div>
							<h1 className="text-2xl font-heading font-bold tracking-tight">Analytics Overview</h1>
							<p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
								Tracking performance for
								<span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-sm text-xs">
									/{stats.shortCode}
								</span>
							</p>
						</div>
						<div className="flex gap-2">
							<Link
								href="/"
								className="px-4 py-2 rounded-md border border-border bg-card text-sm font-heading font-medium transition-colors hover:bg-muted"
							>
								Home
							</Link>
							<Popover>
								<PopoverTrigger className="px-4 py-2 rounded-md border border-border bg-card text-sm font-heading font-medium transition-colors hover:bg-muted flex items-center gap-1.5">
									<QrCode className="w-3.5 h-3.5" /> QR Code
								</PopoverTrigger>
								<PopoverContent align="end" className="w-auto">
									<LinkQrCode
										shortUrl={
											typeof window !== 'undefined'
												? `${window.location.origin}/${stats.shortCode}`
												: `/${stats.shortCode}`
										}
									/>
								</PopoverContent>
							</Popover>
							<a
								href={stats.originalUrl}
								target="_blank"
								rel="noreferrer"
								className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-heading font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
							>
								Visit URL <ExternalLink className="w-3.5 h-3.5" />
							</a>
						</div>
					</motion.div>

					{/* Metric Cards — bento grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[
							{
								icon: MousePointerClick,
								label: 'Total Clicks',
								value: stats.totalClicks,
								color: 'text-primary',
								bg: 'bg-primary/10',
							},
							{
								icon: Calendar,
								label: 'Created On',
								value: new Date(stats.createdAt).toLocaleDateString('en-US', {
									month: 'short',
									day: 'numeric',
									year: 'numeric',
								}),
								color: 'text-chart-5',
								bg: 'bg-chart-5/10',
							},
							{
								icon: LinkIcon,
								label: 'Destination',
								value: stats.originalUrl,
								color: 'text-success',
								bg: 'bg-success/10',
								truncate: true,
							},
						].map((card, i) => (
							<motion.div
								key={card.label}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.07 }}
								className="rounded-lg border border-border bg-card p-5 flex items-start gap-4"
							>
								<div className={`p-2.5 rounded-md shrink-0 ${card.bg}`}>
									<card.icon className={`w-5 h-5 ${card.color}`} />
								</div>
								<div className="min-w-0">
									<p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
										{card.label}
									</p>
									{card.truncate ? (
										<p
											className={`text-sm font-medium truncate ${card.color}`}
											title={String(card.value)}
										>
											{card.value}
										</p>
									) : (
										<p className="text-2xl font-heading font-extrabold tabular-nums">
											{card.value}
										</p>
									)}
								</div>
							</motion.div>
						))}
					</div>

					{/* Dynamic Charts Grid */}
					<StatsCharts stats={stats} countryData={countryData} />
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
