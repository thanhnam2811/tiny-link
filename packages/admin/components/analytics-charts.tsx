'use client';

import { useMemo } from 'react';
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell,
} from 'recharts';
import { AdminAnalyticsResponseType } from '@tiny-link/shared';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export function AnalyticsCharts({ data }: { data: AdminAnalyticsResponseType }) {
	const timelineData = useMemo(() => {
		return data.timeline.map((d) => ({
			...d,
			dateFormatted: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
		}));
	}, [data.timeline]);

	return (
		<div className="space-y-6">
			{/* Timeline Chart */}
			<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6">
				<h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Click Timeline</h3>
				<div className="h-[300px] w-full">
					<ResponsiveContainer width="100%" height="100%" minWidth={0}>
						<AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
									<stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
							<XAxis
								dataKey="dateFormatted"
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: '#71717a' }}
								dy={10}
							/>
							<YAxis
								axisLine={false}
								tickLine={false}
								tick={{ fontSize: 12, fill: '#71717a' }}
								allowDecimals={false}
							/>
							<Tooltip
								contentStyle={{
									borderRadius: '8px',
									border: '1px solid #e4e4e7',
									boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
								}}
								itemStyle={{ color: '#18181b', fontWeight: 600 }}
							/>
							<Area
								type="monotone"
								dataKey="clicks"
								stroke="#3b82f6"
								strokeWidth={3}
								fillOpacity={1}
								fill="url(#colorClicks)"
								activeDot={{ r: 6, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Categorical Row */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* OS & Browser */}
				<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6 flex flex-col items-center">
					<h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4 self-start">
						Operating Systems
					</h3>
					<div className="h-[250px] w-full flex items-center justify-center">
						<ResponsiveContainer width="100%" height="100%" minWidth={0}>
							<PieChart>
								<Pie
									data={data.os.length ? data.os : [{ name: 'No data', count: 1 }]}
									cx="50%"
									cy="50%"
									innerRadius={60}
									outerRadius={80}
									paddingAngle={5}
									dataKey="count"
									fill="#e4e4e7"
								>
									{data.os.length > 0 &&
										data.os.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
								</Pie>
								{data.os.length > 0 && <Tooltip contentStyle={{ borderRadius: '8px' }} />}
							</PieChart>
						</ResponsiveContainer>
					</div>
					<div className="flex flex-wrap justify-center gap-3 mt-4">
						{data.os.map((entry, index) => (
							<div key={entry.name} className="flex items-center text-sm">
								<span
									className="w-3 h-3 rounded-full mr-2"
									style={{ backgroundColor: COLORS[index % COLORS.length] }}
								/>
								<span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
							</div>
						))}
					</div>
				</div>

				{/* Location */}
				<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6">
					<h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Top Countries</h3>
					<div className="h-[250px] w-full">
						{data.country.length === 0 ? (
							<div className="h-full w-full flex items-center justify-center text-zinc-500">
								No data available
							</div>
						) : (
							<ResponsiveContainer width="100%" height="100%" minWidth={0}>
								<BarChart
									data={data.country}
									layout="vertical"
									margin={{ top: 0, right: 20, left: 40, bottom: 0 }}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										horizontal={false}
										stroke="#3f3f46"
										opacity={0.2}
									/>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 12, fill: '#71717a' }}
									/>
									<Tooltip cursor={{ fill: '#f4f4f5' }} contentStyle={{ borderRadius: '8px' }} />
									<Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
										{data.country.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Bar>
								</BarChart>
							</ResponsiveContainer>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
