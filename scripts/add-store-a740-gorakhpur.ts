import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding store: A740 - Gorakhpur Taramandal');

  try {
    // Check if store already exists
    const existingStore = await prisma.store.findUnique({
      where: { id: 'A740' }
    });

    if (existingStore) {
      console.log('Store A740 already exists:', existingStore.name);
      return;
    }

    // Create the new store
    const newStore = await prisma.store.create({
      data: {
        id: 'A740',
        name: 'A740 - Gorakhpur Taramandal',
        city: 'Gorakhpur',
        region: null, // Can be updated later if region information is available
        numberOfSec: null, // Can be updated when SECs are assigned to this store
      },
    });

    console.log('✅ Successfully created store:', newStore);
    console.log(`Store ID: ${newStore.id}`);
    console.log(`Store Name: ${newStore.name}`);
    console.log(`City: ${newStore.city}`);

  } catch (error: any) {
    if (error.code === 'P2002') {
      console.error('❌ Store with this ID already exists');
    } else {
      console.error('❌ Error creating store:', error.message || error);
    }
  }
}

main()
  .then(async () => {
    console.log('\n🔄 Disconnecting from database...');
    await prisma.$disconnect();
    console.log('✅ Database connection closed');
  })
  .catch(async (e) => {
    console.error('❌ Script failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });