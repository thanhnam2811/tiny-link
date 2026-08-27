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

export function RawAnalyticsCharts({ data }: { data: AdminAnalyticsResponseType }) {
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
									border: '1px solid #3f3f46',
									backgroundColor: '#18181b',
									color: '#fafafa',
									fontSize: '12px',
								}}
							/>
							<Area
								type="monotone"
								dataKey="count"
								stroke="#3b82f6"
								strokeWidth={2}
								fillOpacity={1}
								fill="url(#colorClicks)"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</div>

			{/* Distribution Grids (OS, Browser, Country) */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* OS Distribution */}
				<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6 flex flex-col">
					<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4">Operating Systems</h3>
					<div className="h-[200px] w-full flex-1">
						{data.os.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data.os}
										dataKey="count"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={45}
										outerRadius={70}
										paddingAngle={4}
									>
										{data.os.map((_, index) => (
											<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: '8px',
											border: '1px solid #3f3f46',
											backgroundColor: '#18181b',
											color: '#fafafa',
											fontSize: '12px',
										}}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-xs text-zinc-500">
								No data available
							</div>
						)}
					</div>
					<div className="flex flex-wrap gap-2 mt-4">
						{data.os.map((item, idx) => (
							<div key={item.name} className="flex items-center text-xs text-zinc-400 gap-1.5">
								<span
									className="w-2 h-2 rounded-full"
									style={{ backgroundColor: COLORS[idx % COLORS.length] }}
								/>
								<span>
									{item.name} ({item.count})
								</span>
							</div>
						))}
					</div>
				</div>

				{/* Browser Distribution */}
				<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6 flex flex-col">
					<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4">Browsers</h3>
					<div className="h-[200px] w-full flex-1">
						{data.browser.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={data.browser} layout="vertical" margin={{ left: -10, right: 10 }}>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 11, fill: '#71717a' }}
										width={65}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: '8px',
											border: '1px solid #3f3f46',
											backgroundColor: '#18181b',
											color: '#fafafa',
											fontSize: '12px',
										}}
									/>
									<Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={20} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-xs text-zinc-500">
								No data available
							</div>
						)}
					</div>
				</div>

				{/* Country Distribution */}
				<div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl p-6 flex flex-col">
					<h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-4">Top Countries</h3>
					<div className="h-[200px] w-full flex-1">
						{data.country.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={data.country} layout="vertical" margin={{ left: -10, right: 10 }}>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 11, fill: '#71717a' }}
										width={65}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: '8px',
											border: '1px solid #3f3f46',
											backgroundColor: '#18181b',
											color: '#fafafa',
											fontSize: '12px',
										}}
									/>
									<Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} maxBarSize={20} />
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-xs text-zinc-500">
								No data available
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
