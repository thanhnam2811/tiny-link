'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminGetLinksResponseType } from '@tiny-link/shared';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
	DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	MoreHorizontal,
	Search,
	Settings,
	ShieldAlert,
	Trash2,
	ExternalLink,
	Copy,
	ChevronLeft,
	ChevronRight,
} from 'lucide-react';
import { toggleLinkStatusAction, deleteLinkAction } from '@/lib/actions';

interface LinksTableProps {
	data: AdminGetLinksResponseType;
	searchParams: {
		page: number;
		search: string;
		sortBy: string;
		sortOrder: string;
	};
}

export function LinksTable({ data, searchParams }: LinksTableProps) {
	const router = useRouter();
	const pathname = usePathname();
	const [isPending, startTransition] = useTransition();

	const [searchQuery, setSearchQuery] = useState(searchParams.search);
	const [deleteDialogId, setDeleteDialogId] = useState<string | null>(null);

	useEffect(() => {
		const handler = setTimeout(() => {
			if (searchQuery !== searchParams.search) {
				const params = new URLSearchParams();
				if (searchQuery) params.set('search', searchQuery);
				params.set('page', '1');
				startTransition(() => {
					router.push(`${pathname}?${params.toString()}`);
				});
			}
		}, 300);

		return () => clearTimeout(handler);
	}, [searchQuery, pathname, router, searchParams.search]);

	const handlePageChange = (newPage: number) => {
		const params = new URLSearchParams();
		if (searchQuery) params.set('search', searchQuery);
		params.set('page', newPage.toString());
		startTransition(() => {
			router.push(`${pathname}?${params.toString()}`);
		});
	};

	const handleToggleStatus = async (id: string, currentStatus: boolean) => {
		startTransition(async () => {
			await toggleLinkStatusAction(id, currentStatus);
		});
	};

	const handleDelete = async () => {
		if (!deleteDialogId) return;
		startTransition(async () => {
			await deleteLinkAction(deleteDialogId);
			setDeleteDialogId(null);
		});
	};

	return (
		<div className="space-y-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
					<Input
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search by code or URL..."
						className="pl-9 bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-zinc-500"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="hidden sm:flex border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
					>
						<Settings className="w-4 h-4 mr-2" />
						Filter
					</Button>
				</div>
			</div>

			{/* Table */}
			<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col">
				<div className="overflow-x-auto min-h-[580px] flex-1">
					<Table>
						<TableHeader className="bg-zinc-50/50 dark:bg-zinc-950/50">
							<TableRow className="border-zinc-200 dark:border-zinc-800">
								<TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 w-[120px]">
									Short Code
								</TableHead>
								<TableHead className="font-semibold text-zinc-900 dark:text-zinc-100">
									Original URL
								</TableHead>
								<TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 w-[100px]">
									Clicks
								</TableHead>
								<TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 w-[120px]">
									Created At
								</TableHead>
								<TableHead className="font-semibold text-zinc-900 dark:text-zinc-100 w-[120px]">
									Status
								</TableHead>
								<TableHead className="text-right font-semibold text-zinc-900 dark:text-zinc-100 w-[80px]">
									Actions
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{data.links.length === 0 ? (
								<TableRow>
									<TableCell colSpan={6} className="h-24 text-center text-zinc-500">
										No links found.
									</TableCell>
								</TableRow>
							) : (
								data.links.map((link) => (
									<TableRow key={link.id} className="border-zinc-200 dark:border-zinc-800 group">
										<TableCell className="font-mono text-zinc-900 dark:text-zinc-100 font-medium">
											{link.shortCode}
										</TableCell>
										<TableCell
											className="max-w-[200px] truncate text-zinc-500"
											title={link.originalUrl}
										>
											{link.originalUrl}
										</TableCell>
										<TableCell className="text-zinc-600 dark:text-zinc-400 font-medium">
											{link.clicksCount.toLocaleString()}
										</TableCell>
										<TableCell className="text-zinc-500">
											{new Date(link.createdAt).toLocaleDateString('en-GB')}
										</TableCell>
										<TableCell>
											<span
												className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
													link.isActive
														? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
														: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
												}`}
											>
												{link.isActive ? 'Active' : 'Disabled'}
											</span>
										</TableCell>
										<TableCell className="text-right">
											<DropdownMenu>
												<DropdownMenuTrigger className="focus:outline-none h-8 w-8 p-0 flex items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
													<span className="sr-only">Open menu</span>
													<MoreHorizontal className="h-4 w-4" />
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align="end"
													className="w-[160px] border-zinc-200 dark:border-zinc-800"
												>
													<DropdownMenuGroup>
														<DropdownMenuLabel>Actions</DropdownMenuLabel>
														<DropdownMenuItem
															onClick={() =>
																navigator.clipboard.writeText(
																	`http://localhost:3000/${link.shortCode}`,
																)
															}
															className="cursor-pointer"
														>
															<Copy className="mr-2 h-4 w-4" />
															Copy Link
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																window.open(
																	`http://localhost:3000/${link.shortCode}`,
																	'_blank',
																)
															}
															className="cursor-pointer"
														>
															<ExternalLink className="mr-2 h-4 w-4" />
															Visit Link
														</DropdownMenuItem>
													</DropdownMenuGroup>
													<DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
													<DropdownMenuGroup>
														<DropdownMenuItem
															onClick={() => handleToggleStatus(link.id, link.isActive)}
															className="cursor-pointer"
														>
															<ShieldAlert className="mr-2 h-4 w-4" />
															{link.isActive ? 'Disable Link' : 'Enable Link'}
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => setDeleteDialogId(link.id)}
															className="text-red-600 dark:text-red-400 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/30 dark:focus:text-red-400 cursor-pointer"
														>
															<Trash2 className="mr-2 h-4 w-4" />
															Delete
														</DropdownMenuItem>
													</DropdownMenuGroup>
												</DropdownMenuContent>
											</DropdownMenu>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>

				{/* Pagination */}
				{data.totalPages > 1 && (
					<div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
						<div className="text-sm text-zinc-500">
							Showing{' '}
							<span className="font-medium text-zinc-900 dark:text-zinc-100">
								{(searchParams.page - 1) * 10 + 1}
							</span>{' '}
							to{' '}
							<span className="font-medium text-zinc-900 dark:text-zinc-100">
								{Math.min(searchParams.page * 10, data.totalCount)}
							</span>{' '}
							of <span className="font-medium text-zinc-900 dark:text-zinc-100">{data.totalCount}</span>{' '}
							results
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(searchParams.page - 1)}
								disabled={searchParams.page <= 1 || isPending}
								className="border-zinc-200 dark:border-zinc-800"
							>
								<ChevronLeft className="w-4 h-4 mr-1" />
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() => handlePageChange(searchParams.page + 1)}
								disabled={searchParams.page >= data.totalPages || isPending}
								className="border-zinc-200 dark:border-zinc-800"
							>
								Next
								<ChevronRight className="w-4 h-4 ml-1" />
							</Button>
						</div>
					</div>
				)}
			</div>

			<Dialog open={!!deleteDialogId} onOpenChange={(open) => !open && setDeleteDialogId(null)}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle className="text-red-600">Delete Link</DialogTitle>
						<DialogDescription>
							Are you sure you want to permanently delete this link? This action cannot be undone and will
							erase all stats.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="mt-4">
						<Button variant="outline" onClick={() => setDeleteDialogId(null)}>
							Cancel
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isPending}>
							{isPending ? 'Deleting...' : 'Delete Permanently'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
