import { logoutAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, Link as LinkIcon, BarChart3, Settings } from 'lucide-react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<div className="flex min-h-screen bg-zinc-50 dark:bg-black font-sans">
			{/* Sidebar */}
			<aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 hidden md:flex flex-col bg-white dark:bg-black">
				<div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
					<h2 className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
						<LinkIcon className="w-5 h-5" />
						TinyLink Admin
					</h2>
				</div>
				<nav className="flex-1 p-4 space-y-2">
					<Link
						href="/"
						className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 rounded-lg transition-colors"
					>
						<LayoutDashboard className="w-5 h-5" />
						Dashboard
					</Link>
					<Link
						href="/links"
						className="flex items-center gap-3 p-3 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50 rounded-lg transition-colors"
					>
						<LinkIcon className="w-5 h-5" />
						Manage Links
					</Link>
					<div className="flex items-center gap-3 p-3 text-zinc-400 dark:text-zinc-600 rounded-lg cursor-not-allowed">
						<BarChart3 className="w-5 h-5" />
						Analytics (Soon)
					</div>
					<div className="flex items-center gap-3 p-3 text-zinc-400 dark:text-zinc-600 rounded-lg cursor-not-allowed">
						<Settings className="w-5 h-5" />
						Settings (Soon)
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
			<main className="flex-1 p-0 md:p-8">
				<div className="p-4 md:p-0">{children}</div>
			</main>
		</div>
	);
}
