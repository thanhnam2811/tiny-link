'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AdminLoginResponseType } from '@tiny-link/shared';

export async function loginAction(prevState: { error?: string } | null, formData: FormData) {
	const password = formData.get('password') as string;

	if (!password) {
		return { error: 'Password is required' };
	}

	try {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
		const response = await fetch(`${apiUrl}/admin/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ password }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return { error: errorData.message || 'Login failed' };
		}

		const { token }: AdminLoginResponseType = await response.json();

		// Set HttpOnly cookie on Admin App domain
		const cookieStore = await cookies();
		cookieStore.set('admin_token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24, // 1 day
		});
	} catch (err) {
		// Re-throw if it's a redirect error
		if (err instanceof Error && err.message === 'NEXT_REDIRECT') {
			throw err;
		}
		return { error: 'Something went wrong. Please try again later.' };
	}

	redirect('/');
}

export async function logoutAction() {
	const cookieStore = await cookies();
	cookieStore.set('admin_token', '', {
		path: '/',
		expires: new Date(0),
		httpOnly: true,
	});
	redirect('/login');
}

export async function toggleLinkStatusAction(id: string, currentStatus: boolean) {
	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) return { error: 'Unauthorized' };

	try {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
		const response = await fetch(`${apiUrl}/admin/links/${id}/status`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ isActive: !currentStatus }),
		});

		if (!response.ok) return { error: 'Failed to update status' };

		revalidatePath('/links');
		return { success: true };
	} catch (err) {
		return { error: 'Something went wrong.' };
	}
}

export async function deleteLinkAction(id: string) {
	const cookieStore = await cookies();
	const token = cookieStore.get('admin_token')?.value;

	if (!token) return { error: 'Unauthorized' };

	try {
		const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
		const response = await fetch(`${apiUrl}/admin/links/${id}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) return { error: 'Failed to delete link' };

		revalidatePath('/links');
		return { success: true };
	} catch (err) {
		return { error: 'Something went wrong.' };
	}
}
