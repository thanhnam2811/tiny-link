import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
	const cookieStore = await cookies();
	const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
	const messages = (await import(`../messages/${locale === 'vi' ? 'vi' : 'en'}.json`)).default;

	return {
		locale,
		messages,
	};
});
