import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

beforeAll(() => {
	// Ensure the test schema is up to date before any tests run
	execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
});

afterEach(async () => {
	// Clear the database after each test to ensure isolation
	await prisma.link.deleteMany({});
	// Add other tables here as they are created
});

afterAll(async () => {
	await prisma.$disconnect();
});
