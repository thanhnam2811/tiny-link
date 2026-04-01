'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { LinkStatsResponseType } from '@tiny-link/shared';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
	Lock,
	BarChart3,
	Globe,
	MapPin,
	Calendar,
	Link as LinkIcon,
	ExternalLink,
	MousePointerClick,
} from 'lucide-react';
import Link from 'next/link';

type StatsDashboardProps = {
	code: string;
	isProtected?: boolean;
};

function MetricSkeleton() {
	return <div className="h-28 skeleton rounded-2xl" />;
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
			<main className="flex flex-col items-center justify-center min-h-screen p-4 bg-background gradient-mesh">
				<motion.div
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="w-full max-w-sm"
				>
					<div className="glass-card rounded-2xl p-8">
						<div className="text-center mb-6">
							<div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
								<Lock className="w-5 h-5 text-primary" />
							</div>
							<h1 className="text-xl font-heading font-bold">Protected Analytics</h1>
							<p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
								Enter the password to view this link&apos;s metrics.
							</p>
						</div>

						<form onSubmit={handlePasswordSubmit} className="space-y-4">
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="w-full h-11 px-4 rounded-xl glass text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
								placeholder="Enter password"
								disabled={isLoading}
							/>
							<button
								type="submit"
								disabled={isLoading}
								className="w-full h-11 bg-primary text-primary-foreground rounded-xl font-heading font-semibold text-sm hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50 disabled:translate-y-0 flex items-center justify-center gap-2"
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
				className="min-h-screen bg-background gradient-mesh text-foreground py-10 px-4"
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
								<span className="font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-lg text-xs">
									/{stats.shortCode}
								</span>
							</p>
						</div>
						<div className="flex gap-2">
							<Link
								href="/"
								className="px-4 py-2 glass rounded-xl text-sm font-heading font-medium hover:-translate-y-0.5 transition-all"
							>
								Home
							</Link>
							<a
								href={stats.originalUrl}
								target="_blank"
								rel="noreferrer"
								className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-heading font-medium hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center gap-1.5 shadow-md shadow-primary/20"
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
								color: 'text-violet-500',
								bg: 'bg-violet-500/10',
							},
							{
								icon: LinkIcon,
								label: 'Destination',
								value: stats.originalUrl,
								color: 'text-emerald-500',
								bg: 'bg-emerald-500/10',
								truncate: true,
							},
						].map((card, i) => (
							<motion.div
								key={card.label}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.07 }}
								className="glass-card rounded-2xl p-5 flex items-start gap-4"
							>
								<div className={`p-2.5 rounded-xl shrink-0 ${card.bg}`}>
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
										<p className="text-2xl font-heading font-extrabold">{card.value}</p>
									)}
								</div>
							</motion.div>
						))}
					</div>

					{/* Charts Grid */}
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
						{/* Area Chart — Traffic Trends */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.2 }}
							className="lg:col-span-2 glass-card rounded-2xl p-6"
						>
							<div className="flex items-center gap-2 mb-5">
								<BarChart3 className="w-4 h-4 text-primary" />
								<h2 className="text-sm font-heading font-bold">Traffic Trends (Last 7 Days)</h2>
							</div>
							<div className="h-[260px]">
								<ResponsiveContainer width="100%" height="100%">
									<AreaChart
										data={stats.timeSeries}
										margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
									>
										<defs>
											<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
												<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
												<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
											</linearGradient>
										</defs>
										<CartesianGrid
											strokeDasharray="3 3"
											vertical={false}
											stroke="hsl(var(--muted-foreground))"
											opacity={0.15}
										/>
										<XAxis
											dataKey="date"
											tickFormatter={(val) =>
												new Date(val).toLocaleDateString('en-US', {
													month: 'short',
													day: 'numeric',
												})
											}
											stroke="hsl(var(--muted-foreground))"
											fontSize={11}
											tickLine={false}
											axisLine={false}
											dy={10}
										/>
										<YAxis
											stroke="hsl(var(--muted-foreground))"
											fontSize={11}
											tickLine={false}
											axisLine={false}
											allowDecimals={false}
										/>
										<Tooltip
											cursor={{
												stroke: 'hsl(var(--primary))',
												strokeWidth: 1.5,
												strokeDasharray: '4 4',
											}}
											contentStyle={{
												borderRadius: '12px',
												border: '1px solid hsl(var(--border))',
												backgroundColor: 'hsl(var(--card))',
												color: 'hsl(var(--card-foreground))',
												fontSize: '12px',
												boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)',
											}}
											labelFormatter={(val) =>
												new Date(val as string).toLocaleDateString('en-US', {
													weekday: 'long',
													month: 'long',
													day: 'numeric',
												})
											}
										/>
										<Area
											type="monotone"
											dataKey="count"
											name="Clicks"
											stroke="hsl(var(--primary))"
											strokeWidth={2.5}
											fillOpacity={1}
											fill="url(#colorCount)"
											dot={false}
											activeDot={{ r: 4, strokeWidth: 0 }}
										/>
									</AreaChart>
								</ResponsiveContainer>
							</div>
						</motion.div>

						{/* Bar Chart — Top Countries */}
						<motion.div
							initial={{ opacity: 0, y: 12 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: 0.28 }}
							className="glass-card rounded-2xl p-6 flex flex-col"
						>
							<div className="flex items-center gap-2 mb-5">
								<Globe className="w-4 h-4 text-indigo-500" />
								<h2 className="text-sm font-heading font-bold">Top Countries</h2>
							</div>

							{countryData.length > 0 ? (
								<div className="flex-1 h-[220px]">
									<ResponsiveContainer width="100%" height="100%">
										<BarChart
											data={countryData}
											layout="vertical"
											margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
										>
											<CartesianGrid
												strokeDasharray="3 3"
												horizontal={false}
												stroke="hsl(var(--muted-foreground))"
												opacity={0.15}
											/>
											<XAxis type="number" hide />
											<YAxis
												dataKey="name"
												type="category"
												axisLine={false}
												tickLine={false}
												fontSize={12}
												width={72}
											/>
											<Tooltip
												cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
												contentStyle={{
													borderRadius: '10px',
													border: '1px solid hsl(var(--border))',
													backgroundColor: 'hsl(var(--card))',
													color: 'hsl(var(--card-foreground))',
													fontSize: '12px',
												}}
											/>
											<Bar
												dataKey="clicks"
												name="Clicks"
												fill="hsl(var(--primary))"
												radius={[0, 6, 6, 0]}
												maxBarSize={24}
											/>
										</BarChart>
									</ResponsiveContainer>
								</div>
							) : (
								<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40">
									<MapPin className="w-10 h-10 mb-2" />
									<p className="text-sm">No geographic data yet</p>
								</div>
							)}
						</motion.div>
					</div>
				</div>
			</motion.div>
		</AnimatePresence>
	);
}
