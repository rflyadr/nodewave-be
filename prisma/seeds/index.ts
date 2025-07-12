import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seedAdmin';

const prisma = new PrismaClient();

async function seed() {
    await seedAdmin(prisma);
}

seed()
  .then(() => {
    console.log("ALL SEEDING DONE");
    return prisma.$disconnect();
  })
  .catch(e => {
    console.error(e);
    return prisma.$disconnect();
  });
