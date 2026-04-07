import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StatsDashboard from './StatsDashboard';
import { api } from '@/lib/api';

type Props = {
	params: Promise<{ code: string }>;
};

// Fetch preview strictly to detect if it's protected before rendering UI
async function getLinkPreview(code: string) {
	try {
		return await api.links.getPreview(code);
	} catch (err: unknown) {
		const error = err as { statusCode?: number };
		if (error.statusCode === 404 || error.statusCode === 410) {
			return null;
		}
		throw err;
	}
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { code } = await params;
	return {
		title: `Analytics for /${code} | TinyLink`,
		description: 'View detailed performance metrics, geographic distribution, and time-series data for this link.',
	};
}

export default async function StatsPage({ params }: Props) {
	const { code } = await params;

	const preview = await getLinkPreview(code);

	if (!preview) {
		notFound();
	}

	return <StatsDashboard code={code} isProtected={preview.isProtected} />;
}
