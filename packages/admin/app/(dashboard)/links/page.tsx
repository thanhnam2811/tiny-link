import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { LinksTable } from '@/components/links-table';
import { AdminGetLinksResponseType } from '@tiny-link/shared';
import { getEnv } from '@/lib/env';

// Generate dynamic pages
export const dynamic = 'force-dynamic';

export default async function LinksPage(props: {
	searchParams?: Promise<{ page?: string; search?: string; sortBy?: string; sortOrder?: string }>;
}) {
	const searchParams = await props.searchParams;
	const page = searchParams?.page || '1';
	const search = searchParams?.search || '';
	const sortBy = searchParams?.sortBy || 'createdAt';
	const sortOrder = searchParams?.sortOrder || 'desc';

	const urlParams = new URLSearchParams();
	urlParams.set('page', page);
	if (search) urlParams.set('search', search);
	urlParams.set('sortBy', sortBy);
	urlParams.set('sortOrder', sortOrder);

	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) {
		redirect('/login');
	}

	const apiUrl = getEnv('INTERNAL_API_URL') + '/api';
	let data: AdminGetLinksResponseType = {
		links: [],
		totalCount: 0,
		totalPages: 0,
		currentPage: 1,
	};

	try {
		const res = await fetch(`${apiUrl}/admin/links?${urlParams.toString()}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
			cache: 'no-store',
		});

		if (res.status === 401) {
			redirect('/login');
		}

		if (res.ok) {
			data = await res.json();
		}
	} catch (error) {
		console.error('Failed to fetch links:', error);
	}

	return (
		<>
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Link Management</h1>
				<p className="text-zinc-500 dark:text-zinc-400">View, search, and manage all links in the system.</p>
			</header>

			<LinksTable
				data={data}
				searchParams={{
					page: parseInt(page),
					search: search,
					sortBy: sortBy,
					sortOrder: sortOrder,
				}}
			/>
		</>
	);
}
