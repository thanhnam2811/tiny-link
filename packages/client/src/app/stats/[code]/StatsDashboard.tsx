'use client';

import { useState, useEffect } from 'react';
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

	// Auto-fetch ONLY if not locked. If locked, await user submittal.
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

	// 1. Password Protection Render
	if (isLocked) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50 dark:bg-background">
				<div className="w-full max-w-md bg-card text-card-foreground rounded-xl shadow-sm border p-8">
					<div className="text-center mb-6">
						<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<Lock className="w-6 h-6 text-primary" />
						</div>
						<h1 className="text-2xl font-bold">Protected Analytics</h1>
						<p className="text-muted-foreground mt-2 text-sm">
							This link&apos;s performance metrics are secured. Enter the password to view.
						</p>
					</div>

					<form onSubmit={handlePasswordSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium leading-none">
								Analytics Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Enter password"
								disabled={isLoading}
							/>
						</div>
						<button
							type="submit"
							disabled={isLoading}
							className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
						>
							{isLoading ? (
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
							) : null}
							Unlock Metrics
						</button>
					</form>
				</div>
			</div>
		);
	}

	// 2. Loading Skeleton Render
	if (isLoading || !stats) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4">
				<div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
				<p className="text-gray-500 mt-4 font-medium animate-pulse">Aggregating hyper-metrics...</p>
			</div>
		);
	}

	// Helper to format country array for Recharts
	const countryData = Object.entries(stats.geo.countries)
		.map(([name, clicks]) => ({ name, clicks: clicks as number }))
		.sort((a, b) => b.clicks - a.clicks)
		.slice(0, 5);

	// 3. Main Dashboard Render
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-6xl mx-auto space-y-8">
				{/* HEADER HEADER */}
				<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
						<p className="text-muted-foreground mt-1 flex items-center">
							Tracking performance for
							<span className="ml-2 font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
								/{stats.shortCode}
							</span>
						</p>
					</div>
					<div className="flex gap-3">
						<Link
							href="/"
							className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-medium transition"
						>
							Home
						</Link>
						<a
							href={stats.originalUrl}
							target="_blank"
							rel="noreferrer"
							className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition flex items-center gap-2"
						>
							Visit Original URL <ExternalLink className="w-4 h-4" />
						</a>
					</div>
				</div>

				{/* BENTO GRID: TOP METRICS */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
								<MousePointerClick className="w-8 h-8" />
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									Total Clicks
								</p>
								<p className="text-4xl font-extrabold mt-1">{stats.totalClicks}</p>
							</div>
						</div>
					</div>

					<div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
						<div className="flex items-center gap-4">
							<div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
								<Calendar className="w-8 h-8" />
							</div>
							<div>
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									Created On
								</p>
								<p className="text-xl font-bold mt-1">
									{new Date(stats.createdAt).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
										year: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>

					<div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col justify-center">
						<div className="flex items-start gap-4 overflow-hidden">
							<div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
								<LinkIcon className="w-8 h-8" />
							</div>
							<div className="min-w-0">
								<p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
									Destination
								</p>
								<p
									className="text-sm font-medium mt-1 truncate max-w-full text-emerald-700 dark:text-emerald-400"
									title={stats.originalUrl}
								>
									{stats.originalUrl}
								</p>
							</div>
						</div>
					</div>
				</div>

				{/* BENTO GRID: MAIN CHARTS */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* TIME SERIES AREA CHART */}
					<div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm">
						<div className="flex items-center gap-2 mb-6">
							<BarChart3 className="w-5 h-5 text-primary" />
							<h2 className="text-lg font-bold">Traffic Trends (Last 7 Days)</h2>
						</div>
						<div className="h-[300px] w-full">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={stats.timeSeries}
									margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
								>
									<defs>
										<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
											<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="hsl(var(--muted-foreground))"
										opacity={0.2}
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
										fontSize={12}
										tickLine={false}
										axisLine={false}
										dy={10}
									/>
									<YAxis
										stroke="hsl(var(--muted-foreground))"
										fontSize={12}
										tickLine={false}
										axisLine={false}
										allowDecimals={false}
									/>
									<Tooltip
										cursor={{
											stroke: 'hsl(var(--primary))',
											strokeWidth: 2,
											strokeDasharray: '3 3',
										}}
										contentStyle={{
											borderRadius: '12px',
											border: '1px solid hsl(var(--border))',
											backgroundColor: 'hsl(var(--card))',
											color: 'hsl(var(--card-foreground))',
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
										strokeWidth={3}
										fillOpacity={1}
										fill="url(#colorCount)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* GEO BAR CHART */}
					<div className="bg-card border rounded-2xl p-6 shadow-sm flex flex-col">
						<div className="flex items-center gap-2 mb-6">
							<Globe className="w-5 h-5 text-indigo-500" />
							<h2 className="text-lg font-bold">Top Countries</h2>
						</div>

						{countryData.length > 0 ? (
							<div className="flex-1 h-[250px]">
								<ResponsiveContainer width="100%" height="100%">
									<BarChart
										data={countryData}
										layout="vertical"
										margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
									>
										<CartesianGrid
											strokeDasharray="3 3"
											horizontal={false}
											stroke="hsl(var(--muted-foreground))"
											opacity={0.2}
										/>
										<XAxis type="number" hide />
										<YAxis
											dataKey="name"
											type="category"
											axisLine={false}
											tickLine={false}
											fontSize={13}
											width={80}
										/>
										<Tooltip
											cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4 }}
											contentStyle={{
												borderRadius: '12px',
												border: '1px solid hsl(var(--border))',
												backgroundColor: 'hsl(var(--card))',
												color: 'hsl(var(--card-foreground))',
											}}
										/>
										<Bar
											dataKey="clicks"
											name="Clicks"
											fill="hsl(var(--primary))"
											radius={[0, 4, 4, 0]}
											maxBarSize={30}
										/>
									</BarChart>
								</ResponsiveContainer>
							</div>
						) : (
							<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground opacity-50">
								<MapPin className="w-12 h-12 mb-2" />
								<p>No geographic data yet</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
