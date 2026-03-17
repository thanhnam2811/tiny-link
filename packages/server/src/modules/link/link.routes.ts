import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { PrismaClient } from '@prisma/client';
import {
	CreateLinkBodySchema,
	LinkResponseSchema,
	RedirectParamsSchema,
	LinkStatsResponseSchema,
	ErrorResponseSchema,
	ValidationErrorResponseSchema,
	VerifyPasswordBodySchema,
	VerifyPasswordResponseSchema,
} from './link.schema';
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

		// Redirect Route: Root level
		// Regex constraint ensures it only matches alphanumeric codes (no dots, preventing static file conflicts like .css)
		server.get(
			'/:code(^[a-zA-Z0-9-]+$)',
			{
				schema: {
					tags: ['Redirects'],
					summary: 'Redirect to Original URL',
					description: 'Redirects the user to the original URL and tracks the click anonymously.',
					params: RedirectParamsSchema,
				},
			},
			controller.redirect,
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
		server.get(
			'/api/stats/:code',
			{
				schema: {
					tags: ['Analytics'],
					summary: 'Get Link Analytics',
					description:
						'Retrieves aggregated click analytics and geographic distribution for a specific link.',
					params: RedirectParamsSchema,
					response: {
						[HTTP_STATUS.OK]: LinkStatsResponseSchema,
					},
				},
			},
			controller.getStats,
		);
	};
};
