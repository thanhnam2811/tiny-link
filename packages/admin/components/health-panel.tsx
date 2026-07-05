import { Database, Server as ServerIcon, ListOrdered } from 'lucide-react';
import { AdminHealthResponseType } from '@tiny-link/shared';

function StatusBadge({ status }: { status: 'up' | 'down' }) {
	const isUp = status === 'up';
	return (
		<span
			className={`text-xs font-bold px-2 py-1 rounded ${
				isUp
					? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
					: 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
			}`}
		>
			{isUp ? 'Up' : 'Down'}
		</span>
	);
}

export function HealthPanel({ data }: { data: AdminHealthResponseType }) {
	const queueRatio = data.queue.maxSize > 0 ? Math.min(1, data.queue.depth / data.queue.maxSize) : 0;

	const cards = [
		{
			label: 'Redis',
			icon: ServerIcon,
			color: 'text-red-600',
			status: data.redis.status,
			detail: data.redis.latencyMs !== undefined ? `${data.redis.latencyMs}ms latency` : 'Unreachable',
		},
		{
			label: 'Postgres',
			icon: Database,
			color: 'text-blue-600',
			status: data.postgres.status,
			detail: data.postgres.latencyMs !== undefined ? `${data.postgres.latencyMs}ms latency` : 'Unreachable',
		},
	];

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{cards.map((card) => (
					<div
						key={card.label}
						className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
					>
						<div className="flex items-center justify-between mb-4">
							<div className={`p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 ${card.color}`}>
								<card.icon className="w-5 h-5" />
							</div>
							<StatusBadge status={card.status} />
						</div>
						<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{card.label}</p>
						<p className="text-lg font-mono text-zinc-900 dark:text-zinc-50 mt-1">{card.detail}</p>
					</div>
				))}
			</div>

			<div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<div className="p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-orange-600">
						<ListOrdered className="w-5 h-5" />
					</div>
					<span className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
						{data.queue.processMemoryMb} MB process memory
					</span>
				</div>
				<p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Analytics Queue Depth</p>
				<p className="text-lg font-mono text-zinc-900 dark:text-zinc-50 mt-1">
					{data.queue.depth.toLocaleString()} / {data.queue.maxSize.toLocaleString()}
				</p>
				<div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
					<div
						className={`h-full rounded-full ${queueRatio > 0.8 ? 'bg-red-500' : queueRatio > 0.4 ? 'bg-orange-500' : 'bg-emerald-500'}`}
						style={{ width: `${queueRatio * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
}
