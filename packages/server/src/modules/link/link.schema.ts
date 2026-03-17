import { Type, Static } from '@sinclair/typebox';

export const CreateLinkBodySchema = Type.Object(
	{
		originalUrl: Type.String({
			maxLength: 2048,
			pattern: '^https?://',
			description: 'The absolute URL to shorten (must include http/https)',
			examples: ['https://github.com/fastify/fastify'],
		}),
		customCode: Type.Optional(
			Type.String({
				minLength: 3,
				maxLength: 30,
				pattern: '^[a-zA-Z0-9-]+$',
				description: 'Optional custom alias (e.g. "my-event")',
				examples: ['my-event-2026'],
			}),
		),
		maxClicks: Type.Optional(
			Type.Number({
				minimum: 1,
				description: 'Maximum number of times this link can be clicked before it self-destructs',
				examples: [100],
			}),
		),
		expiresAt: Type.Optional(
			Type.String({
				format: 'date-time',
				description: 'ISO 8601 date string when this link self-destructs',
				examples: ['2027-12-31T23:59:59.000Z'], // Future date to prevent instant self-destruction
			}),
		),
		password: Type.Optional(
			Type.String({
				minLength: 4,
				maxLength: 100,
				description: 'Optional password to protect this link',
				examples: ['my-super-secret-password'],
			}),
		),
	},
	{
		description: 'Payload for creating a new short link',
		examples: [
			{
				originalUrl: 'https://github.com/fastify/fastify',
			},
			{
				originalUrl: 'https://github.com/microsoft/vscode',
				customCode: 'vscode-repo',
				maxClicks: 50,
				expiresAt: '2027-12-31T23:59:59.000Z',
			},
		],
	},
);

export type CreateLinkBodyType = Static<typeof CreateLinkBodySchema>;

export const LinkResponseSchema = Type.Object(
	{
		id: Type.String(),
		originalUrl: Type.String(),
		shortCode: Type.String(),
		shortUrl: Type.String(),
		createdAt: Type.String({ format: 'date-time' }),
		maxClicks: Type.Optional(Type.Number()),
		expiresAt: Type.Optional(Type.String({ format: 'date-time' })),
	},
	{
		examples: [
			{
				id: '123e4567-e89b-12d3-a456-426614174000',
				originalUrl: 'https://github.com/fastify/fastify',
				shortCode: 'fastify',
				shortUrl: 'http://localhost:3000/fastify',
				createdAt: '2026-03-17T10:00:00.000Z',
			},
		],
	},
);

export type LinkResponseType = Static<typeof LinkResponseSchema>;

export const RedirectParamsSchema = Type.Object({
	code: Type.String({
		minLength: 3,
		maxLength: 30,
		description: 'The short code to redirect',
		examples: ['fastify'],
	}),
});

export type RedirectParamsType = Static<typeof RedirectParamsSchema>;

export const VerifyPasswordBodySchema = Type.Object(
	{
		password: Type.String({
			minLength: 1,
			description: 'The password to unlock the link',
			examples: ['my-super-secret-password'],
		}),
	},
	{
		examples: [
			{
				password: 'my-super-secret-password',
			},
		],
	},
);

export type VerifyPasswordBodyType = Static<typeof VerifyPasswordBodySchema>;

export const VerifyPasswordResponseSchema = Type.Object(
	{
		originalUrl: Type.String(),
	},
	{
		examples: [
			{
				originalUrl: 'https://github.com/fastify/fastify',
			},
		],
	},
);

export type VerifyPasswordResponseType = Static<typeof VerifyPasswordResponseSchema>;

export const LinkStatsResponseSchema = Type.Object(
	{
		originalUrl: Type.String(),
		shortCode: Type.String(),
		totalClicks: Type.Number(),
		createdAt: Type.String({ format: 'date-time' }),
		geo: Type.Object({
			countries: Type.Record(Type.String(), Type.Number()),
			cities: Type.Record(Type.String(), Type.Number()),
		}),
	},
	{
		examples: [
			{
				originalUrl: 'https://github.com/fastify/fastify',
				shortCode: 'fastify',
				totalClicks: 42,
				createdAt: '2026-03-17T10:00:00.000Z',
				geo: {
					countries: { VN: 30, US: 12 },
					cities: { Hanoi: 20, 'Ho Chi Minh City': 10, 'New York': 12 },
				},
			},
		],
	},
);

export type LinkStatsResponseType = Static<typeof LinkStatsResponseSchema>;

export const ErrorResponseSchema = Type.Object(
	{
		statusCode: Type.Number(),
		error: Type.String(),
		code: Type.String(),
		message: Type.String(),
	},
	{
		examples: [
			{
				statusCode: 404,
				error: 'Not Found',
				code: 'LINK_NOT_FOUND',
				message: 'Link not found or inactive',
			},
		],
	},
);

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
