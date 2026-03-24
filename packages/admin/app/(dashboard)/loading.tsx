import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="flex min-h-screen bg-zinc-50 dark:bg-black p-8">
			<div className="flex-1 space-y-8">
				<div className="space-y-2">
					<Skeleton className="h-10 w-[250px]" />
					<Skeleton className="h-4 w-[350px]" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Skeleton className="h-[120px] rounded-xl" />
					<Skeleton className="h-[120px] rounded-xl" />
					<Skeleton className="h-[120px] rounded-xl" />
				</div>
				<Skeleton className="h-[400px] w-full rounded-xl" />
			</div>
		</div>
	);
}
