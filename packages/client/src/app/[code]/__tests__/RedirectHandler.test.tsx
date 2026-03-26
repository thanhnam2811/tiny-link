import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RedirectHandler from '../RedirectHandler';
import { vi } from 'vitest';
import { toast } from 'sonner';

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe('RedirectHandler', () => {
	const originalLocation = window.location;

	beforeAll(() => {
		Object.defineProperty(window, 'location', {
			writable: true,
			value: { href: '', replace: vi.fn() },
		});
	});

	afterAll(() => {
		// @ts-expect-error - necessary for location mock casting
		window.location = originalLocation;
	});

	afterEach(() => {
		vi.clearAllMocks();
		global.fetch = vi.fn();
	});

	it('handles public link redirection by hitting the /track API', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ originalUrl: 'https://example.com' }),
		});

		render(<RedirectHandler code="abc" isProtected={false} />);

		expect(screen.getByText('Securing your connection...')).toBeInTheDocument();

		await waitFor(
			() => {
				expect(global.fetch).toHaveBeenCalledWith(
					expect.stringContaining('/api/links/abc/track'),
					expect.any(Object),
				);
				expect(window.location.href).toBe('https://example.com');
			},
			{ timeout: 1500 },
		);
	});

	it('displays the password form for protected links', () => {
		render(<RedirectHandler code="abc" isProtected={true} />);

		expect(screen.getByText('Protected Link')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Unlock Link' })).toBeInTheDocument();
	});

	it('handles successful password verification', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: true,
			json: async () => ({ originalUrl: 'https://protected.com' }),
		});

		render(<RedirectHandler code="abc" isProtected={true} />);

		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'secret' } });
		fireEvent.click(screen.getByRole('button', { name: 'Unlock Link' }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/links/abc/verify'),
				expect.any(Object),
			);
			expect(toast.success).toHaveBeenCalledWith('Password verified. Redirecting...');
			expect(window.location.href).toBe('https://protected.com');
		});
	});

	it('handles incorrect password verification', async () => {
		global.fetch = vi.fn().mockResolvedValue({
			ok: false,
			json: async () => ({ message: 'Incorrect password' }),
		});

		render(<RedirectHandler code="abc" isProtected={true} />);

		fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
		fireEvent.click(screen.getByRole('button', { name: 'Unlock Link' }));

		await waitFor(() => {
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('/api/links/abc/verify'),
				expect.any(Object),
			);
			expect(toast.error).toHaveBeenCalledWith('Incorrect password');
		});
	});
});
