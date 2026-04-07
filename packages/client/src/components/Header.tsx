'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSelector } from '@/components/LanguageSelector';
import { Link as LinkIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function Header() {
	const [scrolled, setScrolled] = useState(false);
	const t = useTranslations('Header');

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
						<span className="text-xl font-heading font-bold tracking-tight">{t('brand')}</span>
					</Link>
				</div>

				<div className="flex items-center gap-4">
					<LanguageSelector />
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
