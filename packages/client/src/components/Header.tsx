'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutDashboard, LogOut, Link as LinkIcon, User } from 'lucide-react';

import { useTranslations } from 'next-intl';
import { LocaleToggle } from '@/components/LocaleToggle';

export function Header() {
	const t = useTranslations('common');
	const [scrolled, setScrolled] = useState(false);
	const { user, isLoading } = useUser();

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

					{user && (
						<nav className="hidden md:flex items-center gap-4">
							<Link
								href="/dashboard"
								className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
							>
								{t('dashboard')}
							</Link>
						</nav>
					)}
				</div>

				<div className="flex items-center gap-2 sm:gap-3">
					<LocaleToggle />
					<ThemeToggle />

					{isLoading ? (
						<div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
					) : user ? (
						<DropdownMenu>
							<DropdownMenuTrigger className="cursor-pointer rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
								<Avatar>
									<AvatarImage src={user.picture ?? ''} alt={user.name ?? ''} />
									<AvatarFallback className="bg-primary text-primary-foreground font-heading">
										{user.name?.charAt(0) || <User className="h-4 w-4" />}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end">
								<DropdownMenuGroup>
									<DropdownMenuLabel>
										<div className="flex flex-col gap-0.5">
											<p className="font-heading text-sm font-bold leading-none text-foreground">
												{user.name}
											</p>
											<p className="text-xs leading-none text-muted-foreground">{user.email}</p>
										</div>
									</DropdownMenuLabel>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem render={<Link href="/dashboard" />}>
									<LayoutDashboard className="h-4 w-4" />
									<span>{t('dashboard')}</span>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								{/* Plain anchor: /auth/logout is handled by Auth0 middleware, not a Next.js route */}
								{/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
								<DropdownMenuItem variant="destructive" render={<a href="/auth/logout?returnTo=/" />}>
									<LogOut className="h-4 w-4" />
									<span>{t('signOut')}</span>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<Link href="/login">
							<Button className="h-9 rounded-lg px-4 shadow-sm">{t('signIn')}</Button>
						</Link>
					)}
				</div>
			</div>
		</header>
	);
}
