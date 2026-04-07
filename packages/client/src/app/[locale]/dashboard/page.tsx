'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { BarChart2, Trash2, Search, Link as LinkIcon, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useTranslations, useFormatter } from 'next-intl';

interface IDashboardLink {
	id: string;
	shortCode: string;
	originalUrl: string;
	shortUrl: string;
	clicksCount: number;
	createdAt: string;
	isActive: boolean;
}

function LinkCardSkeleton() {
	return <div className="h-28 skeleton rounded-2xl" />;
}

function EmptyState() {
	const t = useTranslations('Dashboard');
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="text-center py-20 glass-subtle rounded-2xl border border-dashed border-border/50"
		>
			<div className="mx-auto w-16 h-16 glass rounded-2xl flex items-center justify-center mb-4">
				<LinkIcon className="h-8 w-8 text-muted-foreground/40" />
			</div>
			<h3 className="text-lg font-heading font-bold text-foreground mb-2">{t('emptyTitle')}</h3>
			<p className="text-muted-foreground text-sm mb-6">{t('emptyDesc')}</p>
			<Link href="/">
				<Button variant="outline" className="glass hover:-translate-y-0.5 transition-all">
					{t('emptyButton')}
				</Button>
			</Link>
		</motion.div>
	);
}

export default function DashboardPage() {
	const t = useTranslations('Dashboard');
	const format = useFormatter();
	const [links, setLinks] = useState<IDashboardLink[]>([]);
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
			toast.error(t('toastLoadError'));
		} finally {
			setLoading(false);
		}
	}, [page, search, t]);

	useEffect(() => {
		fetchLinks();
	}, [fetchLinks]);

	const handleDelete = async (id: string, shortCode: string) => {
		const confirmed = window.confirm(t('confirmDelete', { code: shortCode }));
		if (!confirmed) return;
		setDeletingId(id);
		try {
			await api.links.delete(id);
			toast.success(t('toastDeleted'));
			fetchLinks();
		} catch (error) {
			console.error('Failed to delete link:', error);
			toast.error(t('toastDeleteError'));
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
					<h1 className="text-3xl font-heading font-black text-foreground mb-1">{t('title')}</h1>
					<p className="text-muted-foreground text-sm font-medium">{t('description')}</p>
				</div>
				<Link href="/">
					<Button className="gap-2 h-10 px-5 rounded-xl hover:-translate-y-0.5 transition-all shadow-md shadow-primary/20">
						<Plus className="h-4 w-4" />
						{t('newLink')}
					</Button>
				</Link>
			</motion.div>

			{/* Search */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.1 }}
				className="mb-6 relative"
			>
				<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
				<input
					type="text"
					placeholder={t('searchPlaceholder')}
					className="w-full h-11 pl-10 pr-4 rounded-xl glass text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all font-sans text-sm"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</motion.div>

			{/* Link List */}
			<div className="space-y-3">
				<AnimatePresence mode="popLayout">
					{loading ? (
						Array.from({ length: 4 }).map((_, i: number) => <LinkCardSkeleton key={i} />)
					) : links.length === 0 ? (
						<EmptyState key="empty" />
					) : (
						links.map((link: IDashboardLink, i: number) => (
							<motion.div
								key={link.id}
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, x: -16 }}
								transition={{ delay: i * 0.05 }}
								whileHover={{ y: -2 }}
								className="glass-subtle rounded-2xl overflow-hidden group transition-shadow hover:shadow-md"
							>
								<div className="p-5 flex flex-col md:flex-row md:items-center gap-4">
									{/* Link info */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center gap-2 mb-1.5">
											<LinkIcon className="h-3.5 w-3.5 text-primary shrink-0" />
											<a
												href={`${typeof window !== 'undefined' ? window.location.origin : ''}/${link.shortCode}`}
												target="_blank"
												rel="noopener noreferrer"
												className="font-heading font-bold text-foreground hover:text-primary transition-colors truncate text-sm"
											>
												{link.shortCode}
											</a>
											{link.isActive ? (
												<span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/15">
													{t('statusActive')}
												</span>
											) : (
												<span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive border border-destructive/15">
													{t('statusInactive')}
												</span>
											)}
										</div>
										<p className="text-xs text-muted-foreground truncate font-sans mb-1.5">
											{link.originalUrl}
										</p>
										<div className="flex items-center gap-3 text-[11px] text-muted-foreground/70">
											<span className="flex items-center gap-1">
												<BarChart2 className="h-3 w-3" />
												{t('clicks', { count: link.clicksCount })}
											</span>
											<span>
												{format.dateTime(new Date(link.createdAt), {
													year: 'numeric',
													month: 'short',
													day: 'numeric',
												})}
											</span>
										</div>
									</div>

									{/* Actions */}
									<div className="flex items-center gap-1.5 shrink-0">
										<a
											href={link.originalUrl}
											target="_blank"
											rel="noopener noreferrer"
											title={t('tooltips.visit')}
											className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
										>
											<ExternalLink className="h-4 w-4" />
										</a>
										<Link href={`/stats/${link.shortCode}`} title={t('tooltips.stats')}>
											<button className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all">
												<BarChart2 className="h-4 w-4" />
											</button>
										</Link>
										<button
											onClick={() => handleDelete(link.id, link.shortCode)}
											disabled={deletingId === link.id}
											title={t('tooltips.delete')}
											className="h-9 w-9 flex items-center justify-center rounded-xl hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all disabled:opacity-40"
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
				<div className="flex justify-center mt-8 gap-2">
					<Button
						variant="outline"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
						className="glass hover:-translate-y-0.5 transition-all"
					>
						{t('prev')}
					</Button>
					<div className="flex items-center px-4 text-sm text-muted-foreground font-medium">
						{page} / {totalPages}
					</div>
					<Button
						variant="outline"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
						className="glass hover:-translate-y-0.5 transition-all"
					>
						{t('next')}
					</Button>
				</div>
			)}
		</div>
	);
}
