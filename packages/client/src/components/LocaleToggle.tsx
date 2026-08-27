'use client';

import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export function LocaleToggle() {
	const locale = useLocale();
	const router = useRouter();

	const toggleLocale = () => {
		const nextLocale = locale === 'en' ? 'vi' : 'en';
		document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; SameSite=Lax`;
		router.refresh();
	};

	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={toggleLocale}
			className="h-9 min-w-9 px-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
			aria-label={`Switch to ${locale === 'en' ? 'Vietnamese' : 'English'}`}
			title={`Switch to ${locale === 'en' ? 'Tiếng Việt' : 'English'}`}
		>
			<Languages className="h-4 w-4 mr-1 text-primary" />
			<span>{locale.toUpperCase()}</span>
		</Button>
	);
}
