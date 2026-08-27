import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import * as z from 'zod';
import { api, ApiError } from '@/lib/api';
import { getClientBaseUrl } from '@/lib/url';
import { getOrCreateGuestId } from '@/lib/guest-id';
import { CreateLinkBodyType, ERROR_MESSAGES } from '@tiny-link/shared';

// Kept as a local Zod schema: @tiny-link/shared's CreateLinkBodyType is
// TypeBox-based, and bridging TypeBox <-> Zod for a single form is not worth
// the added indirection here.
const formSchema = z
	.object({
		url: z.string().url({ message: 'Please enter a valid URL (e.g., https://example.com)' }),
		customCode: z
			.string()
			.optional()
			.refine((val) => !val || (val.length >= 3 && val.length <= 30 && /^[a-zA-Z0-9-]+$/.test(val)), {
				message: 'Custom alias must be 3-30 characters and can only contain letters, numbers, and hyphens',
			}),
		password: z.string().optional(),
		passwordConfirm: z.string().optional(),
		maxClicks: z.union([z.number().min(1, 'Must be at least 1'), z.literal('')]).optional(),
		expiresAt: z.date().optional(),
	})
	.refine(
		(data) => {
			if (data.password && data.password !== data.passwordConfirm) {
				return false;
			}
			return true;
		},
		{
			message: 'Passwords do not match',
			path: ['passwordConfirm'],
		},
	);

export type LinkFormValues = z.infer<typeof formSchema>;

export function useLinkForm(onSuccess: (shortUrl: string) => void) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

	// Derived from a build-time env var (falls back to window.location only in
	// the browser), so it's identical on the server render and first client
	// render — no useEffect/hydration mismatch needed.
	const host = getClientBaseUrl().replace(/^https?:\/\//, '');

	const { handleSubmit, control, watch } = useForm<LinkFormValues>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			url: '',
			customCode: '',
			password: '',
			passwordConfirm: '',
			maxClicks: '',
		},
	});

	const urlValue = watch('url');

	const onSubmit = async (values: LinkFormValues) => {
		setLoading(true);

		const payload: CreateLinkBodyType = { originalUrl: values.url };
		if (values.customCode) payload.customCode = values.customCode.trim();
		if (values.password) payload.password = values.password.trim();
		if (values.maxClicks && typeof values.maxClicks === 'number') payload.maxClicks = values.maxClicks;
		if (values.expiresAt) payload.expiresAt = values.expiresAt.toISOString();

		// Always provide a guestId for anonymous tracking
		payload.guestId = getOrCreateGuestId();

		try {
			const response = await api.links.create(payload);
			toast.success('Link Shortened successfully!');

			const clientShortUrl = `${getClientBaseUrl()}/${response.shortCode}`;
			onSuccess(clientShortUrl);
		} catch (err) {
			if (err instanceof ApiError) {
				if (err.code === ERROR_MESSAGES.RATE_LIMIT_EXCEEDED) {
					toast.error('Whoa there! You are creating links too fast.');
				} else if (err.code === ERROR_MESSAGES.LINK_CODE_CONFLICT) {
					toast.error('Custom code already taken. Please pick a different one.');
				} else {
					toast.error(`Failed to create link: ${err.message}`);
				}
			} else {
				toast.error('Network error. Please try again.');
			}
		} finally {
			setLoading(false);
		}
	};

	return {
		control,
		handleSubmit,
		onSubmit,
		urlValue,
		loading,
		showPassword,
		setShowPassword,
		showPasswordConfirm,
		setShowPasswordConfirm,
		host,
	};
}
