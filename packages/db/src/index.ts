import { PrismaClient } from './generated-client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 🛠️ Prisma 7 Skill-Powered Instantiation
const connectionString = process.env.DATABASE_URL;

if (connectionString) {
	const url = new URL(connectionString);
	console.log(`[Prisma Init] Connecting to database: ${url.host}${url.pathname} (env: ${process.env.NODE_ENV})`);
} else {
	console.warn('[Prisma Init] DATABASE_URL is undefined!');
}

if (!connectionString && process.env.NODE_ENV === 'production') {
	throw new Error('DATABASE_URL is required in production environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
		// @ts-ignore - Some versions of Prisma 7 types might mark this as never when adapter is present
		// but it's often needed as a fallback for internal schema-based logic
		datasources: {
			db: {
				url: connectionString,
			},
		},
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './generated-client/client';
