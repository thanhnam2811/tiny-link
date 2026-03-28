import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	console.log('🌱 Start seeding...');

	// Here you can add seed data for your models
	// Example:
	// const user = await prisma.user.upsert({
	//   where: { email: 'admin@tinylink.dev' },
	//   update: {},
	//   create: { email: 'admin@tinylink.dev', name: 'Admin User' },
	// });

	console.log('✅ Seeding finished.');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
