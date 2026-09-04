import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('SUCCESS: Connected to the database.');
  } catch (error) {
    console.error('ERROR: Failed to connect to the database.', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
