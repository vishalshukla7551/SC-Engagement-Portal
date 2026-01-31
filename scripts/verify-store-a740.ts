import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Verifying store A740...\n');

  try {
    // Find the specific store
    const store = await prisma.store.findUnique({
      where: { id: 'A740' }
    });

    if (store) {
      console.log('✅ Store found in database:');
      console.log(`   ID: ${store.id}`);
      console.log(`   Name: ${store.name}`);
      console.log(`   City: ${store.city}`);
      console.log(`   Region: ${store.region || 'Not set'}`);
      console.log(`   Number of SECs: ${store.numberOfSec || 'Not set'}`);
      console.log(`   Created: ${store.createdAt}`);
      console.log(`   Updated: ${store.updatedAt}`);
    } else {
      console.log('❌ Store A740 not found in database');
    }

    // Also show total store count
    const totalStores = await prisma.store.count();
    console.log(`\n📊 Total stores in database: ${totalStores}`);

  } catch (error: any) {
    console.error('❌ Error verifying store:', error.message || error);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });