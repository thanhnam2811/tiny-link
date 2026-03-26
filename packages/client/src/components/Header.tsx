'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LayoutDashboard, LogOut, Link as LinkIcon, User } from 'lucide-react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
	const { data: session, status } = useSession();
	const isLoading = status === 'loading';

	return (
		<header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/60 backdrop-blur-md">
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-6">
					<Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
						<LinkIcon className="h-6 w-6 text-blue-500" />
						<span className="text-xl font-bold tracking-tight text-white">TinyLink</span>
					</Link>

					{session && (
						<nav className="hidden md:flex items-center gap-4">
							<Link
								href="/dashboard"
								className="text-sm font-medium text-white/60 hover:text-white transition-colors"
							>
								Dashboard
							</Link>
						</nav>
					)}
				</div>

				<div className="flex items-center gap-4">
					<ThemeToggle />

					{isLoading ? (
						<div className="h-9 w-24 animate-pulse rounded-md bg-white/5" />
					) : session ? (
						<DropdownMenu>
							<DropdownMenuTrigger className="relative h-10 w-10 rounded-full p-0 cursor-pointer overflow-hidden border border-white/10 outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
								<Avatar className="h-10 w-10">
									<AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
									<AvatarFallback className="bg-blue-600 text-white">
										{session.user?.name?.charAt(0) || <User className="h-5 w-5" />}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-56 border-white/10 bg-background/95 backdrop-blur-xl"
								align="end"
							>
								<DropdownMenuLabel className="font-normal">
									<div className="flex flex-col space-y-1">
										<p className="text-sm font-medium leading-none text-white">
											{session.user?.name}
										</p>
										<p className="text-xs leading-none text-white/60">{session.user?.email}</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator className="bg-white/10" />
								<DropdownMenuItem className="cursor-pointer focus:bg-white/5 focus:text-white">
									<Link href="/dashboard" className="flex items-center gap-2 w-full">
										<LayoutDashboard className="h-4 w-4" />
										<span>Dashboard</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuSeparator className="bg-white/10" />
								<DropdownMenuItem
									className="cursor-pointer text-red-400 focus:bg-red-500/10 focus:text-red-400"
									onClick={() => signOut({ callbackUrl: '/' })}
								>
									<LogOut className="h-4 w-4 mr-2" />
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link href="/login">
							<Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6 rounded-lg shadow-md transition-all">
								Sign In
							</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
