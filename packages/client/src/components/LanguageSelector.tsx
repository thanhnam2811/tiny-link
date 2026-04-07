'use client';

import * as React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, routing } from '@/i18n/routing';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LanguageSelector() {
	const locale = useLocale();
	const t = useTranslations('Common');
	const router = useRouter();
	const pathname = usePathname();

	const onLocaleChange = (newLocale: string) => {
		router.replace(pathname, { locale: newLocale });
	};

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="ghost"
					size="icon"
					className="h-9 w-9 rounded-xl glass-subtle hover:glass transition-all"
				>
					<Languages className="h-4 w-4" />
					<span className="sr-only">{t('switchLanguage')}</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="glass-card border-white/10 min-w-[8rem] p-1 rounded-xl">
				{routing.locales.map((loc) => (
					<DropdownMenuItem
						key={loc}
						onClick={() => onLocaleChange(loc)}
						className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
							locale === loc ? 'bg-primary/10 text-primary font-semibold' : 'hover:bg-white/5'
						}`}
					>
						<span className="text-sm">{t(`languages.${loc}`)}</span>
						{locale === loc && <div className="h-1.5 w-1.5 rounded-full bg-primary" />}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
