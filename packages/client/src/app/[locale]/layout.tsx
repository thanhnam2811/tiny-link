import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/Header';
import { ClaimLinksEffect } from '@/components/ClaimLinksEffect';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { type ReactNode } from 'react';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
	const { locale } = await params;
	const t = await getTranslations({ locale, namespace: 'Metadata' });

	return {
		title: t('title'),
		description: t('description'),
	};
}

export default async function RootLayout(props: { children: ReactNode; params: Promise<{ locale: string }> }) {
	const { locale } = await props.params;

	// Ensure that the incoming `locale` is valid
	if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
		notFound();
	}

	// Providing all messages to the client
	// side is the easiest way to get started
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
				<NextIntlClientProvider messages={messages}>
					<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
						<SessionProvider>
							<SmoothScrollProvider>
								<Header />
								<ClaimLinksEffect />
								{props.children}
								<Toaster position="top-center" />
							</SmoothScrollProvider>
						</SessionProvider>
					</ThemeProvider>
				</NextIntlClientProvider>
			</body>
		</html>
	);
}
