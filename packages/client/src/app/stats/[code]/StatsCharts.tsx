'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { BarChart3, Globe, MapPin } from 'lucide-react';
import { LinkStatsResponseType } from '@tiny-link/shared';

export interface StatsChartsProps {
	stats: LinkStatsResponseType;
	countryData: Array<{ name: string; clicks: number }>;
}

export function StatsCharts({ stats, countryData }: StatsChartsProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
			{/* Area Chart — Traffic Trends */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.2 }}
				className="lg:col-span-2 rounded-lg border border-border bg-card p-6"
			>
				<div className="flex items-center gap-2 mb-5">
					<BarChart3 className="w-4 h-4 text-primary" />
					<h2 className="text-sm font-heading font-bold">Traffic Trends (Last 7 Days)</h2>
				</div>
				<div className="h-[260px]">
					<ResponsiveContainer width="100%" height="100%">
						<AreaChart data={stats.timeSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
							<defs>
								<linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
									<stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
									<stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
								</linearGradient>
							</defs>
							<CartesianGrid
								strokeDasharray="3 3"
								vertical={false}
								stroke="hsl(var(--muted-foreground))"
								opacity={0.15}
							/>
							<XAxis
								dataKey="date"
								tickFormatter={(val) =>
									new Date(val).toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									})
								}
								stroke="hsl(var(--muted-foreground))"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								dy={10}
							/>
							<YAxis
								stroke="hsl(var(--muted-foreground))"
								fontSize={11}
								tickLine={false}
								axisLine={false}
								allowDecimals={false}
							/>
							<Tooltip
								cursor={{
									stroke: 'hsl(var(--primary))',
									strokeWidth: 1.5,
									strokeDasharray: '4 4',
								}}
								contentStyle={{
									borderRadius: '12px',
									border: '1px solid hsl(var(--border))',
									backgroundColor: 'hsl(var(--card))',
									color: 'hsl(var(--card-foreground))',
									fontSize: '12px',
									boxShadow: '0 8px 24px hsl(var(--foreground) / 0.08)',
								}}
								labelFormatter={(val) =>
									new Date(val as string).toLocaleDateString('en-US', {
										weekday: 'long',
										month: 'long',
										day: 'numeric',
									})
								}
							/>
							<Area
								type="monotone"
								dataKey="count"
								name="Clicks"
								stroke="hsl(var(--primary))"
								strokeWidth={2.5}
								fillOpacity={1}
								fill="url(#colorCount)"
								dot={false}
								activeDot={{ r: 4, strokeWidth: 0 }}
							/>
						</AreaChart>
					</ResponsiveContainer>
				</div>
			</motion.div>

			{/* Bar Chart — Top Countries */}
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.28 }}
				className="rounded-lg border border-border bg-card p-6 flex flex-col"
			>
				<div className="flex items-center gap-2 mb-5">
					<Globe className="w-4 h-4 text-chart-2" />
					<h2 className="text-sm font-heading font-bold">Top Countries</h2>
				</div>

				{countryData.length > 0 ? (
					<div className="flex-1 h-[220px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={countryData}
								layout="vertical"
								margin={{ top: 0, right: 16, left: 16, bottom: 0 }}
							>
								<CartesianGrid
									strokeDasharray="3 3"
									horizontal={false}
									stroke="hsl(var(--muted-foreground))"
									opacity={0.15}
								/>
								<XAxis type="number" hide />
								<YAxis
									dataKey="name"
									type="category"
									axisLine={false}
									tickLine={false}
									fontSize={12}
									width={72}
								/>
								<Tooltip
									cursor={{ fill: 'hsl(var(--muted))', opacity: 0.35 }}
									contentStyle={{
										borderRadius: '10px',
										border: '1px solid hsl(var(--border))',
										backgroundColor: 'hsl(var(--card))',
										color: 'hsl(var(--card-foreground))',
										fontSize: '12px',
									}}
								/>
								<Bar
									dataKey="clicks"
									name="Clicks"
									fill="hsl(var(--chart-2))"
									radius={[0, 6, 6, 0]}
									maxBarSize={24}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				) : (
					<div className="flex-1 flex flex-col items-center justify-center text-muted-foreground/40">
						<MapPin className="w-10 h-10 mb-2" />
						<p className="text-sm">No geographic data yet</p>
					</div>
				)}
			</motion.div>
		</div>
	);
}
