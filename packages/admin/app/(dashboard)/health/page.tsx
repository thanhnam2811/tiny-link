import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { HealthPanel } from '@/components/health-panel';
import { AdminHealthResponseType } from '@tiny-link/shared';
import { getEnv } from '@/lib/env';

export const dynamic = 'force-dynamic';

export default async function HealthPage() {
	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) {
		redirect('/login');
	}

	const apiUrl = getEnv('INTERNAL_API_URL') + '/api';
	let health: AdminHealthResponseType = {
		redis: { status: 'down' },
		postgres: { status: 'down' },
		queue: { depth: 0, maxSize: 0, processMemoryMb: 0 },
	};
	let fetchFailed = false;

	try {
		const res = await fetch(`${apiUrl}/admin/health`, {
			headers: { Authorization: `Bearer ${token}` },
			cache: 'no-store',
		});

		if (res.status === 401) {
			redirect('/login');
		}

		if (res.ok) {
			health = await res.json();
		} else {
			fetchFailed = true;
		}
	} catch (error) {
		console.error('Failed to fetch health data:', error);
		fetchFailed = true;
	}

	return (
		<>
			<header className="mb-8">
				<h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Health</h1>
				<p className="text-zinc-500 dark:text-zinc-400">
					Live status of Redis, Postgres, and the in-memory analytics queue.
				</p>
			</header>

			{fetchFailed && (
				<div className="mb-6 p-4 rounded-lg bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-sm">
					Could not reach the API server to fetch health data.
				</div>
			)}

			<HealthPanel data={health} />
		</>
	);
}
