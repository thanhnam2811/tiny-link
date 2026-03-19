import { logoutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Link as LinkIcon, BarChart3, Settings } from 'lucide-react';

export default function DashboardPage() {
	return (
		<div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
			{/* Sidebar (Draft) */}
			<aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col bg-white dark:bg-black">
				<div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
					<h2 className="text-xl font-bold flex items-center gap-2">
						<LinkIcon className="w-5 h-5" />
						TinyLink Admin
					</h2>
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<div className="flex items-center gap-3 p-3 bg-zinc-100 dark:bg-zinc-900 rounded-lg font-medium">
						<LayoutDashboard className="w-5 h-5" />
						Dashboard
					</div>
					<div className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
						<LinkIcon className="w-5 h-5" />
						Manage Links
					</div>
					<div className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
						<BarChart3 className="w-5 h-5" />
						Analytics
					</div>
					<div className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors cursor-pointer">
						<Settings className="w-5 h-5" />
						Settings
					</div>
				</nav>
				<div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
					<form action={logoutAction}>
						<Button
							type="submit"
							variant="ghost"
							className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
						>
							<LogOut className="w-5 h-5 mr-3" />
							Logout
						</Button>
					</form>
				</div>
			</aside>

			{/* Main Content */}
			<main className="flex-1 p-8">
				<header className="mb-8">
					<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Overview</h1>
					<p className="text-zinc-500 dark:text-zinc-400">
						Welcome back, Admin. Here is what's happening with your links.
					</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					{/* Placeholder Stats */}
					{[
						{
							label: 'Total Links',
							value: '1,234',
							icon: LinkIcon,
							color: 'text-blue-600',
							trend: '+12%',
							positive: true,
						},
						{
							label: 'Total Clicks',
							value: '45,678',
							icon: BarChart3,
							color: 'text-emerald-600',
							trend: '+5.4%',
							positive: true,
						},
						{
							label: 'Avg. Clicks/Link',
							value: '37',
							icon: LayoutDashboard,
							color: 'text-orange-600',
							trend: '-2.1%',
							positive: false,
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
					<h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">No Data Available Yet</h3>
					<p className="text-zinc-500 dark:text-zinc-400 max-w-sm mt-2">
						Detailed analytics and link management features are coming in the next phases of development.
					</p>
					<Button className="mt-6 bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900">
						Go to Link Management
					</Button>
				</div>
			</main>
		</div>
	);
}
