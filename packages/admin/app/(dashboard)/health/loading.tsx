import { Skeleton } from '@/components/ui/skeleton';

export default function HealthLoading() {
	return (
		<div className="animate-in fade-in duration-500">
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Health</h1>
				<p className="text-zinc-500 dark:text-zinc-400">
					Live status of Redis, Postgres, and the in-memory analytics queue.
				</p>
			</header>

			<div className="space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{Array.from({ length: 2 }).map((_, i) => (
						<div
							key={i}
							className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
						>
							<div className="flex items-center justify-between mb-4">
								<Skeleton className="h-9 w-9 rounded-lg" />
								<Skeleton className="h-6 w-12 rounded" />
							</div>
							<Skeleton className="h-4 w-20 rounded-sm mb-2" />
							<Skeleton className="h-6 w-32 rounded-md" />
						</div>
					))}
				</div>

				<div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
					<div className="flex items-center justify-between mb-4">
						<Skeleton className="h-9 w-9 rounded-lg" />
						<Skeleton className="h-4 w-24 rounded-sm" />
					</div>
					<Skeleton className="h-4 w-32 rounded-sm mb-2" />
					<Skeleton className="h-6 w-24 rounded-md mb-3" />
					<Skeleton className="h-2 w-full rounded-full" />
				</div>
			</div>
		</div>
	);
}
