'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BarChart2, Trash2, Search, Link as LinkIcon, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardLink {
	id: string;
	shortCode: string;
	originalUrl: string;
	shortUrl: string;
	clicksCount: number;
	createdAt: string;
	isActive: boolean;
}

function LinkCardSkeleton() {
	return <div className="h-28 skeleton rounded-lg" />;
}

function EmptyState() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-lg border border-dashed border-border bg-card py-20 text-center"
		>
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
				<LinkIcon className="h-8 w-8 text-muted-foreground/40" />
			</div>
			<h3 className="mb-2 font-heading text-lg font-bold text-foreground">No links yet</h3>
			<p className="mb-6 text-sm text-muted-foreground">Start by shortening your first URL!</p>
			<Link href="/">
				<Button variant="outline">Go to Shortener</Button>
			</Link>
		</motion.div>
	);
}

export default function DashboardPage() {
	const [links, setLinks] = useState<DashboardLink[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const fetchLinks = useCallback(async () => {
		try {
			setLoading(true);
			const data = await api.links.getUserLinks(page, 10, search);
			setLinks(data.links);
			setTotalPages(data.totalPages);
		} catch (error) {
			console.error('Failed to fetch links:', error);
			toast.error('Failed to load your links');
		} finally {
			setLoading(false);
		}
	}, [page, search]);

	useEffect(() => {
		fetchLinks();
	}, [fetchLinks]);

	const handleDelete = async (id: string, shortCode: string) => {
		const confirmed = window.confirm(`Delete /${shortCode}? This cannot be undone.`);
		if (!confirmed) return;
		setDeletingId(id);
		try {
			await api.links.delete(id);
			toast.success('Link deleted');
			fetchLinks();
		} catch (error) {
			console.error('Failed to delete link:', error);
			toast.error('Failed to delete link');
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-4xl">
			{/* Header */}
			<motion.div
				initial={{ opacity: 0, y: 16 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
			>
				<div>
					<h1 className="text-3xl font-heading font-black text-foreground mb-1">My Links</h1>
					<p className="text-muted-foreground text-sm font-medium">Manage and track your shortened links</p>
				</div>
				<Link href="/">
					<Button className="h-10 gap-2 px-5 shadow-sm">
						<Plus className="h-4 w-4" />
						New Link
					</Button>
				</Link>
			</motion.div>

			{/* Search */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
				className="relative mb-6"
			>
				<Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground/50" />
				<input
					type="text"
					placeholder="Search links..."
					className="h-11 w-full rounded-lg border border-border bg-card pr-4 pl-10 font-sans text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-ring focus:outline-none"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</motion.div>

			{/* Link List */}
			<div className="space-y-3">
				<AnimatePresence mode="popLayout">
					{loading ? (
						Array.from({ length: 4 }).map((_, i) => <LinkCardSkeleton key={i} />)
					) : links.length === 0 ? (
						<EmptyState key="empty" />
					) : (
						links.map((link, i) => (
							<motion.div
								key={link.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, x: -16 }}
								transition={{ delay: i * 0.05 }}
								whileHover={{ y: -1 }}
								className="group overflow-hidden rounded-lg border border-border bg-card transition-shadow hover:shadow-md"
							>
								<div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
									{/* Link info */}
									<div className="min-w-0 flex-1">
										<div className="mb-1.5 flex items-center gap-2">
											<LinkIcon className="h-3.5 w-3.5 shrink-0 text-primary" />
											<a
												href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.shortCode}`}
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
										<p className="mb-1.5 truncate font-sans text-xs text-muted-foreground">
											{link.originalUrl}
										</p>
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
										<button
											onClick={() => handleDelete(link.id, link.shortCode)}
											disabled={deletingId === link.id}
											title="Delete link"
											className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									</div>
								</div>
							</motion.div>
						))
					)}
				</AnimatePresence>
			</div>

			{/* Pagination */}
			{totalPages > 1 && (
				<div className="mt-8 flex justify-center gap-2">
					<Button variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
						Previous
					</Button>
					<div className="flex items-center px-4 text-sm font-medium text-muted-foreground tabular-nums">
						{page} / {totalPages}
					</div>
					<Button variant="outline" disabled={page === totalPages} onClick={() => setPage(page + 1)}>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
