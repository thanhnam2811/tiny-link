import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function StatsPage({ params }: { params: Promise<{ code: string }> }) {
	const resolvedParams = await params;
	const { code } = resolvedParams;

	return (
		<main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background">
			<Card className="w-full max-w-md border-border shadow-sm">
				<CardHeader className="text-center pb-2">
					<div className="flex justify-center mb-4">
						<div className="p-3 bg-blue-500/10 rounded-full">
							<BarChart2 className="w-8 h-8 text-blue-500" />
						</div>
					</div>
					<CardTitle className="text-2xl font-bold font-['Inter_Tight']">Analytics Dashboard</CardTitle>
					<p className="text-muted-foreground mt-2">
						Stats for <span className="font-mono font-semibold text-foreground">{code}</span>
					</p>
				</CardHeader>
				<CardContent className="flex flex-col items-center gap-6 pt-6">
					<div className="text-center p-6 rounded-xl border border-dashed border-border/60 bg-muted/20 w-full">
						<p className="font-medium text-foreground">Coming Soon</p>
						<p className="text-sm text-muted-foreground mt-1">
							The analytics engine is currently in development.
						</p>
					</div>
					<Link href="/" className="w-full">
						<Button variant="outline" className="w-full">
							<ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
						</Button>
					</Link>
				</CardContent>
			</Card>
		</main>
	);
}
