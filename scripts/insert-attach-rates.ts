import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to insert periodicAttachRate records with proper DateTime format
 * After you delete the old records, run this to insert corrected ones
 */
async function insertAttachRates() {
  try {
    console.log('🔄 Starting to insert attach rate records...\n');

    // Parse DD-MM-YYYY to Date
    const parseDate = (dateStr: string): Date => {
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    // Record 1: Dec 1-07, 2025
    const record1 = {
      storeId: 'store_00001',
      start: parseDate('01-12-2025'),
      end: parseDate('07-12-2025'),
      attachPercentage: 29,
    };

    // Record 2: Dec 1-31, 2025 (covers entire December)
    const record2 = {
      storeId: 'store_00001',
      start: parseDate('01-12-2025'),
      end: parseDate('31-12-2025'),
      attachPercentage: 30
    };

    console.log('📝 Record 1:');
    console.log(`   Store: ${record1.storeId}`);
    console.log(`   Start: ${record1.start.toISOString()} (Dec 1, 2025)`);
    console.log(`   End: ${record1.end.toISOString()} (Dec 12, 2025)`);
    console.log(`   Attach %: ${record1.attachPercentage}%\n`);

    console.log('📝 Record 2:');
    console.log(`   Store: ${record2.storeId}`);
    console.log(`   Start: ${record2.start.toISOString()} (Dec 1, 2025)`);
    console.log(`   End: ${record2.end.toISOString()} (Dec 19, 2025)`);
    console.log(`   Attach %: ${record2.attachPercentage}%\n`);

    // Insert record 1
    console.log('💾 Inserting record 1...');
    const created1 = await prisma.periodicAttachRate.create({
      data: record1
    });
    console.log(`✅ Created record 1 with ID: ${created1.id}\n`);

    // Insert record 2
    console.log('💾 Inserting record 2...');
    const created2 = await prisma.periodicAttachRate.create({
      data: record2
    });
    console.log(`✅ Created record 2 with ID: ${created2.id}\n`);

    console.log('='.repeat(60));
    console.log('📊 INSERT SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully inserted 2 attach rate records`);
    console.log(`   Store: store_00001`);
    console.log(`   Period 1: Dec 1-12, 2025 (30%)`);
    console.log(`   Period 2: Dec 1-19, 2025 (30%)`);
    console.log('='.repeat(60) + '\n');

    // Verify the records
    console.log('🔍 Verifying inserted records...\n');
    const allRecords = await prisma.periodicAttachRate.findMany({
      where: { storeId: 'store_00001' }
    });

    console.log(`Found ${allRecords.length} records for store_00001:`);
    allRecords.forEach((record, index) => {
      console.log(`\n  Record ${index + 1}:`);
      console.log(`    ID: ${record.id}`);
      console.log(`    Start: ${record.start.toISOString()}`);
      console.log(`    End: ${record.end.toISOString()}`);
      console.log(`    Attach %: ${record.attachPercentage}%`);
    });

  } catch (error) {
    console.error('❌ Error in insertAttachRates:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
insertAttachRates()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
