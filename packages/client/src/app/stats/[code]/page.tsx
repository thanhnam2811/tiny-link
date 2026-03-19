import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import StatsDashboard from './StatsDashboard';

type Props = {
	params: Promise<{ code: string }>;
};

// Fetch preview strictly to detect if it's protected before rendering UI
async function getLinkPreview(code: string) {
	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
	const response = await fetch(`${API_URL}/links/${code}/preview`, {
		cache: 'no-store', // Always fetch fresh to know current protection status
	});

	if (!response.ok) {
		if (response.status === 404 || response.status === 410) {
			return null;
		}
		throw new Error('Failed to fetch link preview');
	}

	return response.json();
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
