'use client';

import * as React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	// Ensure the component is mounted to prevent hydration mismatch with the current theme
	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		// Render an invisible placeholder with exact same dimensions
		return <div className="h-10 w-10 opacity-0" aria-hidden="true" />;
	}

	const toggleTheme = () => {
		if (theme === 'light') setTheme('dark');
		else if (theme === 'dark') setTheme('system');
		else setTheme('light');
	};

	return (
		<Button
			variant="ghost"
			size="icon"
			onClick={toggleTheme}
			className="h-10 w-10 rounded-full border border-border/50 bg-background/50 backdrop-blur-md shadow-sm transition-all duration-500 hover:scale-110 active:scale-95 text-muted-foreground hover:text-foreground hover:bg-muted/50 overflow-hidden cursor-pointer"
			aria-label="Toggle theme"
			title={`Current theme: ${theme === 'system' ? 'System' : theme === 'dark' ? 'Dark' : 'Light'}`}
		>
			<Sun
				className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-500 ease-in-out ${
					theme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'
				}`}
			/>
			<Moon
				className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-500 ease-in-out ${
					theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0'
				}`}
			/>
			<Monitor
				className={`absolute h-[1.15rem] w-[1.15rem] transition-all duration-500 ease-in-out ${
					theme === 'system' ? 'rotate-0 scale-100 opacity-100' : 'rotate-[180deg] scale-50 opacity-0'
				}`}
			/>
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
