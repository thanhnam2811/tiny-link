'use client';

import { Button } from '@/components/ui/button';
import { Check, Copy, Download, PlusCircle, BarChart2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShortenedLinkInfoProps {
	shortUrl: string;
	onReset: () => void;
}

export function ShortenedLinkInfo({ shortUrl, onReset }: ShortenedLinkInfoProps) {
	const [isCopied, setIsCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(shortUrl);
		setIsCopied(true);
		toast.success('Copied to clipboard!');
		setTimeout(() => setIsCopied(false), 2000);
	};

	const downloadQr = () => {
		const svg = document.getElementById('qr-code-svg');
		if (!svg) return;
		const svgData = new XMLSerializer().serializeToString(svg);
		const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'tinylink-qr.svg';
		a.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-300 relative">
			<div className="flex flex-col items-start gap-5 w-full">
				<div className="flex items-center gap-2 mb-1">
					<span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#22C55E]/15 text-[#22C55E]">
						<Check className="w-4 h-4 stroke-[3]" />
					</span>
					<h2 className="text-lg font-bold text-foreground font-[family-name:var(--font-inter-tight)]">
						Link Shortened
					</h2>
				</div>

				<div className="w-full flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl bg-background border border-border gap-6 shadow-sm ring-1 ring-border/50">
					<div className="relative w-full text-center sm:text-left overflow-hidden">
						<a
							href={shortUrl}
							target="_blank"
							rel="noreferrer"
							className="relative z-10 text-xl sm:text-[22px] font-semibold text-foreground hover:text-blue-600 transition-colors truncate block font-sans"
						>
							{shortUrl.replace(/^https?:\/\//, '')}
						</a>
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
						<Button
							size="default"
							variant="secondary"
							onClick={() => window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank')}
							className="shrink-0 h-10 px-4 w-full sm:w-auto font-medium rounded-md transition-all gap-2 shadow-sm"
						>
							<BarChart2 className="h-4 w-4" /> Stats
						</Button>
						<Button
							size="default"
							onClick={handleCopy}
							className={`shrink-0 h-10 px-4 w-full sm:w-auto font-medium rounded-md transition-all gap-2 shadow-sm ${
								isCopied
									? 'bg-[#22C55E] hover:bg-[#16A34A] text-white'
									: 'bg-white hover:bg-gray-50 text-foreground border border-gray-200 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800'
							}`}
						>
							{isCopied ? (
								<>
									<Check className="h-4 w-4" /> Copied!
								</>
							) : (
								<>
									<Copy className="h-4 w-4" /> Copy
								</>
							)}
						</Button>
					</div>
				</div>
			</div>

			<div className="flex flex-col sm:flex-row items-center justify-between pt-6 border-t border-border/50 gap-4">
				<div className="flex items-center gap-5">
					<div className="p-2 bg-white rounded-lg border shadow-sm flex items-center justify-center relative group">
						<QRCodeSVG
							id="qr-code-svg"
							value={shortUrl}
							size={60}
							level="L"
							includeMargin={false}
							className="rounded-sm"
						/>
						<Button
							variant="secondary"
							size="icon-xs"
							type="button"
							className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 rounded-full shadow-md z-10"
							onClick={downloadQr}
						>
							<Download className="h-3 w-3" />
						</Button>
					</div>
					<div className="flex flex-col text-sm text-muted-foreground justify-center my-auto">
						<span className="font-semibold text-foreground leading-tight">QR Code</span>
						<span className="mt-0.5 leading-tight">Scan to open the link</span>
					</div>
				</div>

				<Button
					variant="ghost"
					className="text-sm font-medium hover:bg-muted/50 rounded-lg text-muted-foreground w-full sm:w-auto flex items-center justify-center gap-2"
					onClick={onReset}
				>
					<PlusCircle className="w-4 h-4" /> Shorten another
				</Button>
			</div>
		</div>
	);
}
