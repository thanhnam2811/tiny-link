'use client';

import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart2, Trash2, Search, Link as LinkIcon, Plus } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface DashboardLink {
	id: string;
	shortCode: string;
	originalUrl: string;
	clicksCount: number;
	createdAt: string;
	isActive: boolean;
}

export default function DashboardPage() {
	const [links, setLinks] = useState<DashboardLink[]>([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);

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
		if (!window.confirm(`Are you sure you want to delete the link /${shortCode}?`)) {
			return;
		}

		try {
			await api.links.delete(id);
			toast.success('Link deleted successfully');
			fetchLinks(); // Refresh the list
		} catch (error) {
			console.error('Failed to delete link:', error);
			toast.error('Failed to delete link');
		}
	};

	return (
		<div className="container mx-auto py-8 px-4 max-w-6xl">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
				<div>
					<h1 className="text-4xl font-bold text-white mb-2 drop-shadow-sm">My Dashboard</h1>
					<p className="text-white/60">Manage and track your shortened links</p>
				</div>
				<Link href="/">
					<Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 h-12 px-6 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all">
						<Plus className="h-5 w-5" />
						Create New Link
					</Button>
				</Link>
			</div>

			<div className="mb-6 relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
				<input
					type="text"
					placeholder="Search links..."
					className="w-full h-12 pl-10 pr-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
			</div>

			<div className="grid gap-4">
				{loading ? (
					Array.from({ length: 3 }).map((_, i) => (
						<div key={i} className="h-32 rounded-2xl bg-white/5 animate-pulse border border-white/5" />
					))
				) : links.length > 0 ? (
					links.map((link) => (
						<Card
							key={link.id}
							className="border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group overflow-hidden"
						>
							<CardContent className="p-0 flex flex-col md:flex-row items-center">
								<div className="p-6 flex-1 min-w-0">
									<div className="flex items-center gap-2 mb-2">
										<LinkIcon className="h-4 w-4 text-blue-400 shrink-0" />
										<h3 className="font-bold text-white text-lg truncate hover:text-blue-400 transition-colors">
											<a
												href={`${window.location.origin}/${link.shortCode}`}
												target="_blank"
												rel="noopener noreferrer"
											>
												{link.shortCode}
											</a>
										</h3>
									</div>
									<p className="text-white/40 text-sm truncate mb-4">{link.originalUrl}</p>
									<div className="flex flex-wrap items-center gap-4 text-xs text-white/60">
										<span className="flex items-center gap-1">
											<BarChart2 className="h-3 w-3" />
											{link.clicksCount} clicks
										</span>
										<span>Created {format(new Date(link.createdAt), 'MMM d, yyyy')}</span>
										{link.isActive ? (
											<span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/20">
												Active
											</span>
										) : (
											<span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/20">
												Inactive
											</span>
										)}
									</div>
								</div>
								<div className="flex items-center gap-2 p-6 bg-black/20 border-t md:border-t-0 md:border-l border-white/5 w-full md:w-auto justify-center">
									<Link href={`/${link.shortCode}/stats`}>
										<Button
											size="icon"
											variant="ghost"
											className="hover:bg-white/10 hover:text-white"
											title="View Statistics"
										>
											<BarChart2 className="h-5 w-5" />
										</Button>
									</Link>
									<Button
										size="icon"
										variant="ghost"
										className="hover:bg-red-500/20 hover:text-red-400"
										title="Delete Link"
										onClick={() => handleDelete(link.id, link.shortCode)}
									>
										<Trash2 className="h-5 w-5" />
									</Button>
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<div className="text-center py-20 bg-white/5 rounded-2xl border border-dashed border-white/10">
						<LinkIcon className="h-12 w-12 text-white/20 mx-auto mb-4" />
						<h3 className="text-xl font-bold text-white mb-2">No links found</h3>
						<p className="text-white/40 mb-6">Start by shortening your first URL!</p>
						<Link href="/">
							<Button
								variant="outline"
								className="border-white/20 bg-white/5 text-white hover:bg-white/10"
							>
								Go to Shortener
							</Button>
						</Link>
					</div>
				)}
			</div>

			{totalPages > 1 && (
				<div className="flex justify-center mt-8 gap-2">
					<Button
						variant="outline"
						disabled={page === 1}
						onClick={() => setPage(page - 1)}
						className="border-white/10 bg-white/5 text-white"
					>
						Previous
					</Button>
					<div className="flex items-center px-4 text-white text-sm">
						Page {page} of {totalPages}
					</div>
					<Button
						variant="outline"
						disabled={page === totalPages}
						onClick={() => setPage(page + 1)}
						className="border-white/10 bg-white/5 text-white"
					>
						Next
					</Button>
				</div>
			)}
		</div>
	);
}
