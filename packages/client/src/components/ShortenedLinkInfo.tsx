'use client';

import { Button } from '@/components/ui/button';
import { Check, Copy, Download, PlusCircle, BarChart2, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35 }}
			className="flex flex-col gap-6 relative"
		>
			<div className="flex flex-col items-start gap-5 w-full">
				<div className="flex items-center gap-2 mb-1">
					<motion.span
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }}
						className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500/15 text-green-600 dark:text-green-400"
					>
						<Check className="w-4 h-4 stroke-[3]" />
					</motion.span>
					<h2 className="text-xl font-heading font-bold text-foreground">Link Shortened Successfully</h2>
					<motion.span
						initial={{ opacity: 0, x: -8 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ delay: 0.2 }}
					>
						<Sparkles className="w-4 h-4 text-primary/60" />
					</motion.span>
				</div>

				<div className="w-full flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl glass gap-6 shadow-sm">
					<div className="relative w-full text-center sm:text-left overflow-hidden">
						<a
							href={shortUrl}
							target="_blank"
							rel="noreferrer"
							className="relative z-10 text-xl sm:text-[22px] font-heading font-bold text-foreground hover:text-primary transition-colors truncate block"
						>
							{shortUrl.replace(/^https?:\/\//, '')}
						</a>
					</div>
					<div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
						<Button
							size="default"
							variant="secondary"
							onClick={() => window.open(`/stats/${shortUrl.split('/').pop()}`, '_blank')}
							className="shrink-0 h-10 px-4 w-full sm:w-auto font-medium rounded-xl transition-all gap-2 hover:-translate-y-0.5"
						>
							<BarChart2 className="h-4 w-4" /> Stats
						</Button>
						<motion.div whileTap={{ scale: 0.97 }} className="w-full sm:w-auto">
							<Button
								size="default"
								onClick={handleCopy}
								className={`shrink-0 h-10 px-6 w-full font-heading font-bold rounded-xl transition-all gap-2 shadow-md hover:-translate-y-0.5 ${
									isCopied
										? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
										: 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20'
								}`}
							>
								<AnimatePresence mode="wait" initial={false}>
									{isCopied ? (
										<motion.span
											key="copied"
											initial={{ opacity: 0, y: -8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 8 }}
											className="flex items-center gap-2"
										>
											<Check className="h-4 w-4" /> Copied!
										</motion.span>
									) : (
										<motion.span
											key="copy"
											initial={{ opacity: 0, y: -8 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 8 }}
											className="flex items-center gap-2"
										>
											<Copy className="h-4 w-4" /> Copy
										</motion.span>
									)}
								</AnimatePresence>
							</Button>
						</motion.div>
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
		</motion.div>
	);
}
