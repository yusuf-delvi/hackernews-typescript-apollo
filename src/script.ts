import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
	const newLink = await prisma.link.create({
		data: {
			description: 'Link added to database',
			url: 'link.com',
		},
	});

	const allLinks = await prisma.link.findMany();
	console.log(allLinks);
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
