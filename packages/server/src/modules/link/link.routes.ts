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
						max: 10,
						timeWindow: '1 minute',
					},
				},
				schema: {
					body: CreateLinkBodySchema,
					response: {
						201: LinkResponseSchema,
						400: ValidationErrorResponseSchema,
						409: ErrorResponseSchema,
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
						max: 5,
						timeWindow: '1 minute',
					},
				},
				schema: {
					params: RedirectParamsSchema,
					body: VerifyPasswordBodySchema,
					response: {
						200: VerifyPasswordResponseSchema,
						401: ErrorResponseSchema,
						404: ErrorResponseSchema,
						410: ErrorResponseSchema,
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
					params: RedirectParamsSchema,
					response: {
						200: LinkStatsResponseSchema,
					},
				},
			},
			controller.getStats,
		);
	};
};
