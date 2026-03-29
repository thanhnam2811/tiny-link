import { afterEach, afterAll, beforeAll } from 'vitest';
import { prisma } from '@tiny-link/db';
import * as dotenv from 'dotenv';
import path from 'path';
import { INTERNAL_AUTH } from '@tiny-link/shared';

// Load test environment variables explicitly
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });

// Force internal key for tests as a safeguard
process.env.INTERNAL_API_KEY = INTERNAL_AUTH.TEST_KEY;

beforeAll(async () => {
	await prisma.$connect();
});

afterEach(async () => {
	// Clear the database after each test to ensure isolation
	await prisma.link.deleteMany({});
	await prisma.user.deleteMany({});
});

afterAll(async () => {
	await prisma.$disconnect();
});
