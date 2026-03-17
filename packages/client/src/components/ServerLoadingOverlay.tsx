'use client';

import { Button } from '@/components/ui/button';
import { Loader2, Minus } from 'lucide-react';

interface ServerLoadingOverlayProps {
	status: 'warming' | 'ready' | 'error';
	onRetry: () => void;
}

export function ServerLoadingOverlay({ status, onRetry }: ServerLoadingOverlayProps) {
	if (status === 'ready') return null;

	return (
		<div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background/60 backdrop-blur-[2px] rounded-2xl animate-in fade-in duration-300">
			<div className="bg-background border border-border/50 shadow-lg rounded-xl p-6 flex flex-col items-center gap-3 max-w-[280px] text-center">
				{status === 'warming' ? (
					<>
						<Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
						<p className="text-sm font-medium text-foreground">Waking up server...</p>
						<p className="text-xs text-muted-foreground leading-relaxed">
							This might take a few seconds as the free-tier backend spins up.
						</p>
					</>
				) : (
					<>
						<div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center text-destructive mb-1">
							<Minus className="w-5 h-5" />
						</div>
						<p className="text-sm font-medium text-foreground">Server Unavailable</p>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Server is undergoing maintenance. Please try again later.
						</p>
						<Button variant="outline" size="sm" className="mt-2 w-full h-8 text-xs" onClick={onRetry}>
							Retry
						</Button>
					</>
				)}
			</div>
		</div>
	);
}
