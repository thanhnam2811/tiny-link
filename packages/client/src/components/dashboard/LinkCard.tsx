import { motion } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LinkQrCode } from '@/components/LinkQrCode';
import { BarChart2, Trash2, Link as LinkIcon, ExternalLink, QrCode } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export interface DashboardLink {
	id: string;
	shortCode: string;
	originalUrl: string;
	clicksCount: number;
	createdAt: string;
	isActive: boolean;
}

interface LinkCardProps {
	link: DashboardLink;
	index: number;
	baseUrl: string;
	deleting: boolean;
	onRequestDelete: (id: string, shortCode: string) => void;
}

export function LinkCard({ link, index, baseUrl, deleting, onRequestDelete }: LinkCardProps) {
	const shortUrl = `${baseUrl}/${link.shortCode}`;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, x: -16 }}
			transition={{ delay: index * 0.05 }}
			whileHover={{ y: -1 }}
			className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
		>
			<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
				{/* Link info */}
				<div className="min-w-0 flex-1">
					<div className="mb-1.5 flex items-center gap-2">
						<LinkIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
						<a
							href={shortUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="truncate font-heading text-sm font-bold text-foreground transition-colors hover:text-primary"
						>
							{link.shortCode}
						</a>
						{link.isActive ? (
							<span className="flex shrink-0 items-center gap-1 rounded-sm border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
								<span className="h-1.5 w-1.5 rounded-full bg-success" />
								Active
							</span>
						) : (
							<span className="shrink-0 rounded-sm border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
								Inactive
							</span>
						)}
					</div>
					<p className="mb-1.5 truncate font-sans text-xs text-muted-foreground">{link.originalUrl}</p>
					<div className="flex items-center gap-3 text-[11px] text-muted-foreground/70 tabular-nums">
						<span className="flex items-center gap-1">
							<BarChart2 className="h-3 w-3" />
							{link.clicksCount} clicks
						</span>
						<span>{format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
					</div>
				</div>

				{/* Actions */}
				<div className="flex shrink-0 items-center gap-1">
					<a
						href={link.originalUrl}
						target="_blank"
						rel="noopener noreferrer"
						title="Visit original URL"
						className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
					>
						<ExternalLink className="h-4 w-4" />
					</a>
					<Link href={`/stats/${link.shortCode}`} title="View statistics">
						<button className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary">
							<BarChart2 className="h-4 w-4" />
						</button>
					</Link>
					<Popover>
						<PopoverTrigger
							title="Generate QR code"
							className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-primary/10 hover:text-primary"
						>
							<QrCode className="h-4 w-4" />
						</PopoverTrigger>
						<PopoverContent align="end" className="w-auto">
							<LinkQrCode shortUrl={shortUrl} />
						</PopoverContent>
					</Popover>
					<button
						onClick={() => onRequestDelete(link.id, link.shortCode)}
						disabled={deleting}
						title="Delete link"
						className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
					>
						<Trash2 className="h-4 w-4" />
					</button>
				</div>
			</div>
		</motion.div>
	);
}
