import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export function EmptyState() {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			className="rounded-lg border border-dashed border-border bg-card py-20 text-center"
		>
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
				<LinkIcon className="h-8 w-8 text-muted-foreground/40" />
			</div>
			<h3 className="mb-2 font-heading text-lg font-bold text-foreground">No links yet</h3>
			<p className="mb-6 text-sm text-muted-foreground">Start by shortening your first URL!</p>
			<Link href="/">
				<Button variant="outline">Go to Shortener</Button>
			</Link>
		</motion.div>
	);
}
