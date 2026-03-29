import { LayoutDashboard, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AnalyticsCharts } from '@/components/analytics-charts';
import { AdminAnalyticsResponseType } from '@tiny-link/shared';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function DashboardPage(props: { searchParams?: Promise<{ range?: string }> }) {
	const searchParams = await props.searchParams;
	const range = searchParams?.range || '7d';

	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) {
		redirect('/login');
	}

	const apiUrl = getEnv('INTERNAL_API_URL') + '/api';
	let stats = { totalLinks: 0, totalClicks: 0 };
	let analyticsData: AdminAnalyticsResponseType = {
		timeline: [],
		os: [],
		browser: [],
		country: [],
	};

	try {
		// Fetch stats and analytics concurrently
		const [resStats, resAnalytics] = await Promise.all([
			fetch(`${apiUrl}/admin/stats`, {
				headers: { Authorization: `Bearer ${token}` },
				cache: 'no-store',
			}),
			fetch(`${apiUrl}/admin/analytics?range=${range}`, {
				headers: { Authorization: `Bearer ${token}` },
				cache: 'no-store',
			}),
		]);

		if (resStats.status === 401 || resAnalytics.status === 401) {
			redirect('/login');
		}

		if (resStats.ok) {
			stats = await resStats.json();
		}
		if (resAnalytics.ok) {
			analyticsData = await resAnalytics.json();
		}
	} catch (error) {
		console.error('Failed to fetch data:', error);
	}

	const avgClicks = stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0';

	return (
		<>
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Overview</h1>
					<p className="text-zinc-500 dark:text-zinc-400">
						Welcome back, Admin. Here is what&apos;s happening with your links.
					</p>
				</div>

				{/* Filter Buttons */}
				<div className="flex items-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-lg shadow-sm">
					<Link href="/?range=7d">
						<Button variant={range === '7d' ? 'secondary' : 'ghost'} size="sm" className="rounded-md">
							7D
						</Button>
					</Link>
					<Link href="/?range=30d">
						<Button variant={range === '30d' ? 'secondary' : 'ghost'} size="sm" className="rounded-md">
							30D
						</Button>
					</Link>
					<Link href="/?range=all">
						<Button variant={range === 'all' ? 'secondary' : 'ghost'} size="sm" className="rounded-md">
							All Time
						</Button>
					</Link>
				</div>
			</header>

			{/* Row 1: KPI Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
				{[
					{
						label: 'Total Links',
						value: stats.totalLinks.toLocaleString(),
						icon: LinkIcon,
						color: 'text-blue-600',
						trend: 'Live',
						positive: true,
					},
					{
						label: 'Total Clicks',
						value: stats.totalClicks.toLocaleString(),
						icon: BarChart3,
						color: 'text-emerald-600',
						trend: 'Live',
						positive: true,
					},
					{
						label: 'Avg. Clicks/Link',
						value: avgClicks,
						icon: LayoutDashboard,
						color: 'text-orange-600',
						trend: 'Live',
						positive: true,
					},
				].map((stat, i) => (
					<div
						key={i}
						className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow"
					>
						<div className="flex items-center justify-between mb-4">
							<div className={`p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 ${stat.color}`}>
								<stat.icon className="w-5 h-5" />
							</div>
							<span className="text-xs font-bold px-2 py-1 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
								{stat.trend}
							</span>
						</div>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{stat.label}</p>
						<p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mt-1 font-mono">
							{stat.value}
						</p>
					</div>
				))}
			</div>

			{/* Row 2 & 3: Analytics Charts */}
			<AnalyticsCharts data={analyticsData} />
		</>
	);
}
