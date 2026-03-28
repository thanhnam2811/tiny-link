import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import RedirectHandler from './RedirectHandler';
import { api } from '@/lib/api';

type Props = {
	params: Promise<{ code: string }>;
};

// Next.js handles deduplication of API calls effectively
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
