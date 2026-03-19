import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import RedirectHandler from './RedirectHandler';

type Props = {
	params: Promise<{ code: string }>;
};

// Next.js deduplicates fetch inherently when used with the native `fetch` API.
async function getLinkPreview(code: string) {
	const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
	const response = await fetch(`${API_URL}/links/${code}/preview`, {
		next: { revalidate: 60 }, // Cache the preview for 60 seconds
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
	const preview = await getLinkPreview(code);

	if (!preview) {
		return {
			title: 'Link Not Found | TinyLink',
			description: 'The requested link does not exist or has expired.',
		};
	}

	return {
		title: preview.title,
		description: preview.description,
		openGraph: {
			title: preview.title,
			description: preview.description,
			url: preview.originalUrl,
			images: preview.image ? [{ url: preview.image }] : [],
		},
		twitter: {
			card: 'summary_large_image',
			title: preview.title,
			description: preview.description,
			images: preview.image ? [preview.image] : [],
		},
	};
}

export default async function Page({ params }: Props) {
	const { code } = await params;
	const headersList = await headers();
	const isBot = headersList.get('x-is-bot') === 'true';

	const preview = await getLinkPreview(code);

	if (!preview) {
		notFound();
	}

	// BOT SCENARIO: Return empty body, relies entirely on injected OpenGraph tags.
	if (isBot) {
		return null;
	}

	// HUMAN SCENARIO: Interactive UI for real users.
	return <RedirectHandler code={code} isProtected={preview.isProtected} />;
}
