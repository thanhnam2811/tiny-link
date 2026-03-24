import { Skeleton } from '@/components/ui/skeleton';

export default function LinksLoading() {
	return (
		<div className="animate-in fade-in duration-500">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Link Management</h1>
				<p className="text-zinc-500 dark:text-zinc-400">View, search, and manage all links in the system.</p>
			</header>

			<div className="space-y-4">
				{/* Toolbar Skeleton */}
				<div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
					<Skeleton className="h-10 w-full max-w-sm rounded-md" />
					<Skeleton className="h-9 w-[80px] rounded-md hidden md:block" />
				</div>

				{/* Table Skeleton */}
				<div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden flex flex-col min-h-[580px]">
					<div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 py-3 px-4 flex gap-4">
						<Skeleton className="h-4 w-[120px] rounded-sm bg-zinc-200 dark:bg-zinc-800" />
						<Skeleton className="h-4 w-full flex-1 rounded-sm bg-zinc-200 dark:bg-zinc-800" />
						<Skeleton className="h-4 w-[100px] rounded-sm bg-zinc-200 dark:bg-zinc-800" />
						<Skeleton className="h-4 w-[120px] rounded-sm bg-zinc-200 dark:bg-zinc-800" />
						<Skeleton className="h-4 w-[120px] rounded-sm bg-zinc-200 dark:bg-zinc-800" />
						<Skeleton className="h-4 w-[80px] rounded-sm ml-auto bg-zinc-200 dark:bg-zinc-800" />
					</div>

					<div className="flex-1 p-4 space-y-6 mt-2">
						{Array.from({ length: 8 }).map((_, i) => (
							<div key={i} className="flex gap-4 items-center">
								<Skeleton className="h-5 w-[120px] rounded-md" />
								<Skeleton className="h-5 w-full flex-1 rounded-md" />
								<Skeleton className="h-5 w-[100px] rounded-md" />
								<Skeleton className="h-5 w-[120px] rounded-md" />
								<Skeleton className="h-6 w-[80px] rounded-full" />
								<Skeleton className="h-8 w-[32px] rounded-md ml-auto" />
							</div>
						))}
					</div>

					{/* Pagination Skeleton */}
					<div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 p-3 flex justify-between items-center mt-auto">
						<Skeleton className="h-4 w-[200px]" />
						<div className="flex gap-2">
							<Skeleton className="h-9 w-[100px] rounded-md" />
							<Skeleton className="h-9 w-[100px] rounded-md" />
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
