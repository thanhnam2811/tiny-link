import { Type, Static } from '@sinclair/typebox';

export const CreateLinkBodySchema = Type.Object({
	originalUrl: Type.String({
		maxLength: 2048,
		pattern: '^https?://',
		description: 'The absolute URL to shorten (must include http/https)',
	}),
	customCode: Type.Optional(
		Type.String({
			minLength: 3,
			maxLength: 30,
			pattern: '^[a-zA-Z0-9-]+$',
			description: 'Optional custom alias (e.g. "my-event")',
		}),
	),
});

export type CreateLinkBodyType = Static<typeof CreateLinkBodySchema>;

export const LinkResponseSchema = Type.Object({
	id: Type.String(),
	originalUrl: Type.String(),
	shortCode: Type.String(),
	shortUrl: Type.String(),
	createdAt: Type.String({ format: 'date-time' }),
});

export type LinkResponseType = Static<typeof LinkResponseSchema>;

export const RedirectParamsSchema = Type.Object({
	code: Type.String({
		minLength: 3,
		maxLength: 30,
		description: 'The short code to redirect',
	}),
});

export type RedirectParamsType = Static<typeof RedirectParamsSchema>;

export const LinkStatsResponseSchema = Type.Object({
	originalUrl: Type.String(),
	shortCode: Type.String(),
	totalClicks: Type.Number(),
	createdAt: Type.String({ format: 'date-time' }),
});

export type LinkStatsResponseType = Static<typeof LinkStatsResponseSchema>;

export const ErrorResponseSchema = Type.Object({
	statusCode: Type.Number(),
	error: Type.String(),
	code: Type.String(),
	message: Type.String(),
});

export const ValidationErrorResponseSchema = Type.Object({
	statusCode: Type.Number(),
	error: Type.String(),
	code: Type.String(),
	message: Type.String(),
	details: Type.Array(
		Type.Object({
			field: Type.String(),
			message: Type.String(),
		}),
	),
});
