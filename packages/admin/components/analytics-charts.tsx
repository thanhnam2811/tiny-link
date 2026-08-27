'use client';

import dynamic from 'next/dynamic';
import { AdminAnalyticsResponseType } from '@tiny-link/shared';

const RawAnalyticsCharts = dynamic(() => import('./raw-analytics-charts').then((mod) => mod.RawAnalyticsCharts), {
	ssr: false,
	loading: () => (
		<div className="space-y-6">
			<div className="h-[380px] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="h-[340px] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
				<div className="h-[340px] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
				<div className="h-[340px] w-full animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800" />
			</div>
		</div>
	),
});

export function AnalyticsCharts({ data }: { data: AdminAnalyticsResponseType }) {
	return <RawAnalyticsCharts data={data} />;
}
