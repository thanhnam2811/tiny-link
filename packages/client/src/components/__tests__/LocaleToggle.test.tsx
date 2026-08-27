import { render, screen, fireEvent } from '@testing-library/react';
import { LocaleToggle } from '../LocaleToggle';
import { NextIntlClientProvider } from 'next-intl';
import { vi } from 'vitest';

const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		refresh: mockRefresh,
	}),
}));

describe('LocaleToggle (TL-FE-05)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		document.cookie = 'NEXT_LOCALE=en; path=/';
	});

	it('renders language toggle button with current locale', () => {
		render(
			<NextIntlClientProvider locale="en" messages={{}}>
				<LocaleToggle />
			</NextIntlClientProvider>,
		);

		expect(screen.getByRole('button', { name: /Switch to Vietnamese/i })).toBeInTheDocument();
		expect(screen.getByText('EN')).toBeInTheDocument();
	});

	it('toggles locale to Vietnamese and sets cookie on click', () => {
		render(
			<NextIntlClientProvider locale="en" messages={{}}>
				<LocaleToggle />
			</NextIntlClientProvider>,
		);

		const button = screen.getByRole('button', { name: /Switch to Vietnamese/i });
		fireEvent.click(button);

		expect(document.cookie).toContain('NEXT_LOCALE=vi');
		expect(mockRefresh).toHaveBeenCalledTimes(1);
	});
});
