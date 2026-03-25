import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { Type } from '@sinclair/typebox';
import { PrismaClient } from '@tiny-link/db';
import {
	CreateLinkBodySchema,
	LinkResponseSchema,
	RedirectParamsSchema,
	LinkStatsResponseSchema,
	ErrorResponseSchema,
	ValidationErrorResponseSchema,
	VerifyPasswordBodySchema,
	VerifyPasswordResponseSchema,
	LinkPreviewResponseSchema,
	TrackPublicResponseSchema,
} from '@tiny-link/shared';
import { LinkRepository } from './link.repository';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { AnalyticsManager } from '../analytics/analytics_manager';
import { Redis } from 'ioredis';
import { SYSTEM_CONFIG, HTTP_STATUS } from '@tiny-link/shared';

// This is where we wire up our dependencies (IoC)
export const linkRoutes = (
	prisma: PrismaClient,
	analyticsManager: AnalyticsManager,
	redis: Redis,
): FastifyPluginAsyncTypebox => {
	const repository = new LinkRepository(prisma);
	const service = new LinkService(repository, analyticsManager, redis);
	const controller = new LinkController(service);

	return async (server) => {
		// API Route: Create Short Link
		// Stricter rate limit: 10 link creations per minute per IP
		server.post(
			'/api/links',
			{
				config: {
					rateLimit: {
						max: SYSTEM_CONFIG.RATE_LIMIT_CREATE_LINK,
						timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
					},
				},
				schema: {
					tags: ['Links'],
					summary: 'Create a Short Link',
					description:
						'Creates a new short link, optionally with custom code, password, and expiration settings.',
					body: CreateLinkBodySchema,
					response: {
						[HTTP_STATUS.CREATED]: LinkResponseSchema,
						[HTTP_STATUS.BAD_REQUEST]: ValidationErrorResponseSchema,
						[HTTP_STATUS.CONFLICT]: ErrorResponseSchema,
					},
				},
			},
			controller.createLink,
		);

		// Track Public Route: Headless JSON API
		// Replaces legacy GET /:code. Enforces usage via Next.js Client
		server.post(
			'/api/links/:code/track',
			{
				schema: {
					tags: ['Analytics'],
					summary: 'Track Public Link Click',
					description: 'Records analytics silently and returns the original URL for client-side redirection.',
					params: RedirectParamsSchema,
					response: {
						[HTTP_STATUS.OK]: TrackPublicResponseSchema,
						[HTTP_STATUS.NOT_FOUND]: ErrorResponseSchema,
						[HTTP_STATUS.GONE]: ErrorResponseSchema,
					},
				},
			},
			controller.trackPublic,
		);

		// Verify Password Route (Strict Rate Limit: 5 per minute)
		server.post(
			'/api/links/:code/verify',
			{
				config: {
					rateLimit: {
						max: SYSTEM_CONFIG.RATE_LIMIT_VERIFY_PASSWORD,
						timeWindow: SYSTEM_CONFIG.RATE_LIMIT_WINDOW,
					},
				},
				schema: {
					tags: ['Links'],
					summary: 'Verify Password',
					description:
						'Verifies the password for a protected link and returns the original URL upon success.',
					params: RedirectParamsSchema,
					body: VerifyPasswordBodySchema,
					response: {
						[HTTP_STATUS.OK]: VerifyPasswordResponseSchema,
						[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
						[HTTP_STATUS.NOT_FOUND]: ErrorResponseSchema,
						[HTTP_STATUS.GONE]: ErrorResponseSchema,
					},
				},
			},
			controller.verifyPassword,
		);

		// Stats API Route
		server.post(
			'/api/stats/:code',
			{
				schema: {
					tags: ['Analytics'],
					summary: 'Get Link Analytics',
					description:
						'Retrieves aggregated click analytics and geographic distribution for a specific link. Requires password if the link is protected.',
					params: RedirectParamsSchema,
					body: Type.Optional(Type.Object({ password: Type.Optional(Type.String()) })),
					response: {
						[HTTP_STATUS.OK]: LinkStatsResponseSchema,
						[HTTP_STATUS.UNAUTHORIZED]: ErrorResponseSchema,
					},
				},
			},
			controller.getStats,
		);

		// Preview API Route (For Bot & Next.js Metadata fetcher)
		server.get(
			'/api/links/:code/preview',
			{
				schema: {
					tags: ['Links'],
					summary: 'Get Link Preview Metadata',
					description:
						'Retrieves read-only metadata (originalUrl, title, description) for constructing OpenGraph tags without triggering analytics increments.',
					params: RedirectParamsSchema,
					response: {
						[HTTP_STATUS.OK]: LinkPreviewResponseSchema,
						[HTTP_STATUS.NOT_FOUND]: ErrorResponseSchema,
						[HTTP_STATUS.GONE]: ErrorResponseSchema,
					},
				},
			},
			controller.getPreview,
		);
	};
};
