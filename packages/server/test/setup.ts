import { afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

afterEach(async () => {
	// Clear the database after each test to ensure isolation
	await prisma.link.deleteMany({});
	// Add other tables here as they are created
});

afterAll(async () => {
	await prisma.$disconnect();
});
