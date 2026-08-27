import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileNav } from '../components/mobile-nav';

vi.mock('next/navigation', () => ({
	usePathname: vi.fn(() => '/'),
	useRouter: vi.fn(() => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
	})),
}));

vi.mock('@/lib/actions', () => ({
	logoutAction: vi.fn(),
}));

describe('Admin Mobile Navigation (TL-ADM-04)', () => {
	it('renders mobile topbar with logo and hamburger menu trigger', () => {
		render(<MobileNav />);

		expect(screen.getByText('TinyLink Admin')).toBeDefined();
		const menuButton = screen.getByLabelText('Open mobile navigation menu');
		expect(menuButton).toBeDefined();
	});

	it('opens mobile drawer with navigation links and logout button upon clicking trigger', () => {
		render(<MobileNav />);

		const menuButton = screen.getByLabelText('Open mobile navigation menu');
		fireEvent.click(menuButton);

		// Assert navigation links exist in drawer
		expect(screen.getByRole('link', { name: /Dashboard/i })).toBeDefined();
		expect(screen.getByRole('link', { name: /Manage Links/i })).toBeDefined();
		expect(screen.getByRole('link', { name: /System Health/i })).toBeDefined();
		expect(screen.getByRole('button', { name: /Logout/i })).toBeDefined();
	});
});
