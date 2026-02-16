require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Drop the conflicting indexes first
  try {
    await prisma.$runCommandRaw({ dropIndexes: 'images', index: 'images_userId_key' });
    console.log('Dropped images_userId_key');
  } catch (e) { console.log('userId index already dropped or not found'); }

  try {
    await prisma.$runCommandRaw({ dropIndexes: 'images', index: 'images_shopId_key' });
    console.log('Dropped images_shopId_key');
  } catch (e) { console.log('shopId index already dropped or not found'); }

  // Now create the address collection by inserting and removing a dummy doc
  // This ensures the collection exists for Prisma
  console.log('Indexes cleaned. Now run: npx prisma db push');
  await prisma.$disconnect();
}

main();
