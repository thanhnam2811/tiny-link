'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, LayoutDashboard, Link as LinkIcon, BarChart3, Settings, Activity } from 'lucide-react';
import { logoutAction } from '@/lib/actions';

export function MobileNav() {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();

	const navItems = [
		{ href: '/', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/links', label: 'Manage Links', icon: LinkIcon },
		{ href: '/health', label: 'System Health', icon: Activity },
	];

	return (
		<div className="flex md:hidden items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shrink-0">
			<div className="flex items-center gap-2">
				<LinkIcon className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />
				<span className="font-bold text-zinc-900 dark:text-zinc-50">TinyLink Admin</span>
			</div>

			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger
					render={
						<Button
							variant="ghost"
							size="icon"
							className="h-11 w-11 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
							aria-label="Open mobile navigation menu"
						>
							<Menu className="w-5 h-5" />
						</Button>
					}
				/>
				<SheetContent
					side="left"
					className="w-72 p-0 flex flex-col bg-white dark:bg-black border-r border-zinc-200 dark:border-zinc-800"
				>
					<SheetHeader className="p-6 border-b border-zinc-200 dark:border-zinc-800">
						<SheetTitle className="text-xl font-bold flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
							<LinkIcon className="w-5 h-5" />
							TinyLink Admin
						</SheetTitle>
					</SheetHeader>

					<nav className="flex-1 p-4 space-y-2">
						{navItems.map((item) => {
							const Icon = item.icon;
							const isActive = pathname === item.href;
							return (
								<Link
									key={item.href}
									href={item.href}
									onClick={() => setOpen(false)}
									className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
										isActive
											? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-50 font-medium'
											: 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50'
									}`}
								>
									<Icon className="w-5 h-5" />
									{item.label}
								</Link>
							);
						})}

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
								className="w-full h-11 justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 font-medium"
							>
								<LogOut className="w-5 h-5 mr-3" />
								Logout
							</Button>
						</form>
					</div>
				</SheetContent>
			</Sheet>
		</div>
	);
}
