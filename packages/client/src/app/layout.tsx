import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SessionProvider } from 'next-auth/react';

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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					<SessionProvider>
						<Header />
						<ClaimLinksEffect />
						{children}
						<ThemeToggle />
						<Toaster position="top-center" />
					</SessionProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
