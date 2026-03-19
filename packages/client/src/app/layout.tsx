import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ThemeToggle } from '@/components/ThemeToggle';

const inter = Inter({
	variable: '--font-inter',
	subsets: ['latin'],
});

const interTight = Inter_Tight({
	variable: '--font-inter-tight',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'TinyLink | Premium URL Shortener',
	description: 'A lightning-fast, highly trackable URL shortener built for power users.',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${inter.className} ${interTight.variable} antialiased`}>
				<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
					{children}
					<ThemeToggle />
					<Toaster position="top-center" />
				</ThemeProvider>
			</body>
		</html>
	);
}
