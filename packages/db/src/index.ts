import { PrismaClient } from './generated-client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// 🛠️ Prisma 7 Skill-Powered Instantiation
const connectionString = process.env.DATABASE_URL;

if (!connectionString && process.env.NODE_ENV === 'production') {
	throw new Error('DATABASE_URL is required in production environment');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma: PrismaClient =
	globalForPrisma.prisma ||
	new PrismaClient({
		adapter,
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export * from './generated-client/client';
