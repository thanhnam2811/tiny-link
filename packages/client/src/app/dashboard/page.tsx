'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from '@/components/ui/dialog';
import { BulkImportDialog } from '@/components/BulkImportDialog';
import { LinkCard, type DashboardLink } from '@/components/dashboard/LinkCard';
import { LinkCardSkeleton } from '@/components/dashboard/LinkCardSkeleton';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { downloadBlob } from '@/lib/download';
import { getClientBaseUrl } from '@/lib/url';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Search, Plus, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DashboardPage() {
	const [links, setLinks] = useState<DashboardLink[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; shortCode: string } | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const debouncedSearch = useDebouncedValue(search, 400);
	const baseUrl = getClientBaseUrl();

	useEffect(() => {
		const controller = new AbortController();

		(async () => {
			try {
				setLoading(true);
				const data = await api.links.getUserLinks(page, 10, debouncedSearch, controller.signal);
				setLinks(data.links);
				setTotalPages(data.totalPages);
			} catch (error) {
				if (error instanceof Error && error.name === 'AbortError') return;
				console.error('Failed to fetch links:', error);
				toast.error('Failed to load your links');
			} finally {
				if (!controller.signal.aborted) setLoading(false);
			}
		})();

		return () => controller.abort();
	}, [page, debouncedSearch, refreshKey]);

	const handleExport = async () => {
		try {
			const blob = await api.links.exportCsv();
			downloadBlob(blob, `tinylink-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
		} catch (error) {
			console.error('Failed to export links:', error);
			toast.error('Failed to export links');
		}
	};

	const handleConfirmDelete = async () => {
		if (!deleteTarget) return;
		const { id } = deleteTarget;
		setDeletingId(id);
		try {
			await api.links.delete(id);
			toast.success('Link deleted');
			setRefreshKey((k) => k + 1);
		} catch (error) {
			console.error('Failed to delete link:', error);
			toast.error('Failed to delete link');
		} finally {
			setDeletingId(null);
			setDeleteTarget(null);
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
				<div className="flex flex-wrap items-center gap-2">
					<Button variant="outline" className="h-10 gap-2 px-5" onClick={handleExport}>
						<Download className="h-4 w-4" />
						Export
					</Button>
					<BulkImportDialog onImported={() => setRefreshKey((k) => k + 1)} />
					<Link href="/">
						<Button className="h-10 gap-2 px-5 shadow-sm">
							<Plus className="h-4 w-4" />
							New Link
						</Button>
					</Link>
				</div>
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
					onChange={(e) => {
						setPage(1);
						setSearch(e.target.value);
					}}
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
							<LinkCard
								key={link.id}
								link={link}
								index={i}
								baseUrl={baseUrl}
								deleting={deletingId === link.id}
								onRequestDelete={(id, shortCode) => setDeleteTarget({ id, shortCode })}
							/>
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

			<Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-destructive">Delete Link</DialogTitle>
						<DialogDescription>
							Delete <span className="font-medium text-foreground">/{deleteTarget?.shortCode}</span>? This
							cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4">
						<Button variant="outline" onClick={() => setDeleteTarget(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleConfirmDelete}
							disabled={deletingId === deleteTarget?.id}
						>
							{deletingId === deleteTarget?.id ? 'Deleting...' : 'Delete Permanently'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
