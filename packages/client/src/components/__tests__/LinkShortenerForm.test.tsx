import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LinkShortenerForm } from '../LinkShortenerForm';
import { vi } from 'vitest';
import { api } from '@/lib/api';
import { toast } from 'sonner';

vi.mock('@/lib/api', () => ({
	api: {
		links: {
			create: vi.fn(),
		},
	},
}));

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

describe('LinkShortenerForm', () => {
	const mockOnSuccess = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders correctly with default state', () => {
		render(<LinkShortenerForm disabled={false} onSuccess={mockOnSuccess} />);
		expect(screen.getByPlaceholderText('Paste long URL...')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Shorten' })).toBeDisabled();
	});

	it('enables submit button when valid URL is entered', async () => {
		render(<LinkShortenerForm disabled={false} onSuccess={mockOnSuccess} />);
		const input = screen.getByPlaceholderText('Paste long URL...');
		fireEvent.change(input, { target: { value: 'https://example.com' } });

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Shorten' })).not.toBeDisabled();
		});
	});

	it('handles successful link creation', async () => {
		vi.mocked(api.links.create).mockResolvedValue({
			id: 'abc',
			shortCode: 'my-link',
			shortUrl: 'http://localhost:3000/my-link',
			originalUrl: 'https://example.com',
			createdAt: new Date().toISOString(),
			clicksCount: 0,
			isActive: true,
		});

		render(<LinkShortenerForm disabled={false} onSuccess={mockOnSuccess} />);
		const input = screen.getByPlaceholderText('Paste long URL...');
		fireEvent.change(input, { target: { value: 'https://example.com' } });

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Shorten' })).not.toBeDisabled();
		});

		fireEvent.click(screen.getByRole('button', { name: 'Shorten' }));

		await waitFor(() => {
			expect(api.links.create).toHaveBeenCalledWith(
				expect.objectContaining({ originalUrl: 'https://example.com' }),
			);
			expect(toast.success).toHaveBeenCalledWith('Link Shortened successfully!');
			// Assuming window location protocol/host defaults to http://localhost:3000 in jsdom
			expect(mockOnSuccess).toHaveBeenCalledWith(expect.stringMatching(/localhost.*\/my-link/));
		});
	});

	it('validates password matching if advanced options are used', async () => {
		render(<LinkShortenerForm disabled={false} onSuccess={mockOnSuccess} />);
		const input = screen.getByPlaceholderText('Paste long URL...');
		fireEvent.change(input, { target: { value: 'https://example.com' } });

		// Open accordion
		fireEvent.click(screen.getByText('Advanced Options'));

		const passwordInput = screen.getByPlaceholderText('Secure with password...');
		const confirmInput = screen.getByPlaceholderText('Confirm password...');

		fireEvent.change(passwordInput, { target: { value: 'secret' } });
		fireEvent.change(confirmInput, { target: { value: 'wrongsecret' } });

		fireEvent.click(screen.getByRole('button', { name: /Shorten/i }));

		await waitFor(() => {
			expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
			expect(api.links.create).not.toHaveBeenCalled();
		});
	});
});
