import { LayoutDashboard, Link as LinkIcon, BarChart3 } from 'lucide-react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function DashboardPage() {
	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) {
		redirect('/login');
	}

	const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
	let stats = { totalLinks: 0, totalClicks: 0 };

	try {
		const res = await fetch(`${apiUrl}/admin/stats`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: 'no-store',
		});

		if (res.status === 401) {
			redirect('/login');
		}

		if (res.ok) {
			stats = await res.json();
		}
	} catch (error) {
		console.error('Failed to fetch stats:', error);
	}

	const avgClicks = stats.totalLinks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0';

	return (
		<>
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Overview</h1>
				<p className="text-zinc-500 dark:text-zinc-400">
					Welcome back, Admin. Here is what&apos;s happening with your links.
				</p>
			</header>

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
							<span
								className={`text-xs font-bold px-2 py-1 rounded ${
									stat.positive
										? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
										: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
								}`}
							>
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

			<div className="bg-white dark:bg-zinc-900 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center justify-center min-h-[400px] text-center">
				<LayoutDashboard className="w-16 h-16 text-zinc-200 dark:text-zinc-800 mb-4" />
				<h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Manage System Links</h3>
				<p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-2">
					Dive into detailed link management, search specific short codes, and control active status.
				</p>
				<Link href="/links">
					<Button className="mt-6 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900">
						Go to Link Management
					</Button>
				</Link>
			</div>
		</>
	);
}
