export default function Loading() {
	return (
		<div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
			<div className="w-full max-w-2xl space-y-4 animate-pulse">
				{/* Hero skeleton */}
				<div className="flex flex-col items-center gap-4 mb-8">
					<div className="h-6 w-36 skeleton rounded-full" />
					<div className="h-14 w-3/4 skeleton rounded-2xl" />
					<div className="h-5 w-1/2 skeleton rounded-xl" />
				</div>
				{/* Card skeleton */}
				<div className="h-64 w-full skeleton rounded-2xl" />
				{/* Feature grid skeleton */}
				<div className="grid grid-cols-2 gap-4 mt-8">
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className="h-24 skeleton rounded-2xl" />
					))}
				</div>
			</div>
		</div>
	);
}
