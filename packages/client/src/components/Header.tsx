'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, Link as LinkIcon, User } from 'lucide-react';

export function Header() {
	const [scrolled, setScrolled] = useState(false);
	const { data: session, status } = useSession();
	const isLoading = status === 'loading';

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 12);
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, []);

	return (
		<header
			className={`sticky top-0 z-50 w-full border-x-0 border-t-0 border-b transition-all duration-300 ${
				scrolled ? 'glass shadow-md py-0' : 'bg-transparent border-transparent py-0'
			}`}
		>
			<div className="container mx-auto flex h-16 items-center justify-between px-4">
				<div className="flex items-center gap-6">
					<Link
						href="/"
						className="flex items-center gap-2 transition-opacity hover:opacity-80 cursor-pointer"
					>
						<LinkIcon className="h-6 w-6 text-primary" />
						<span className="text-xl font-heading font-bold tracking-tight">TinyLink</span>
					</Link>

					{session && (
						<nav className="hidden md:flex items-center gap-4">
							<Link
								href="/dashboard"
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								Dashboard
							</Link>
						</nav>
					)}
				</div>

				<div className="flex items-center gap-3">
					<ThemeToggle />

					{isLoading ? (
						<div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
					) : session ? (
						<DropdownMenu>
							<DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
								<Avatar>
									<AvatarImage src={session.user?.image ?? ''} alt={session.user?.name ?? ''} />
									<AvatarFallback className="bg-primary text-primary-foreground font-heading">
										{session.user?.name?.charAt(0) || <User className="h-4 w-4" />}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end">
								<DropdownMenuLabel>
									<div className="flex flex-col gap-0.5">
										<p className="font-heading text-sm font-bold leading-none text-foreground">
											{session.user?.name}
										</p>
										<p className="text-xs leading-none text-muted-foreground">
											{session.user?.email}
										</p>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href="/dashboard" />}>
									<LayoutDashboard className="h-4 w-4" />
									<span>Dashboard</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem variant="destructive" onClick={() => signOut({ callbackUrl: '/' })}>
									<LogOut className="h-4 w-4" />
									<span>Sign out</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link href="/login">
							<Button className="h-9 rounded-lg px-4 shadow-sm">Sign In</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
