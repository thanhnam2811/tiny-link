import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Auth0Provider } from '@auth0/nextjs-auth0';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

const outfit = Outfit({
	variable: '--font-outfit',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'TinyLink | Premium URL Shortener',
	description: 'A lightning-fast, highly trackable URL shortener built for power users.',
};

import { Header } from '@/components/Header';
import { ClaimLinksEffect } from '@/components/ClaimLinksEffect';
import { SmoothScrollProvider } from '@/components/SmoothScrollProvider';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const locale = await getLocale();
	const messages = await getMessages();

	return (
		<html lang={locale} suppressHydrationWarning>
			<body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<Auth0Provider>
						<NextIntlClientProvider locale={locale} messages={messages}>
							<SmoothScrollProvider>
								<Header />
								<ClaimLinksEffect />
								{children}
								<Toaster position="top-center" />
							</SmoothScrollProvider>
						</NextIntlClientProvider>
					</Auth0Provider>
				</ThemeProvider>
			</body>
		</html>
	);
}
