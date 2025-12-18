import { PrismaClient } from '@prisma/client';
import { MongoClient, ObjectId } from 'mongodb';

const prisma = new PrismaClient();

/**
 * Script to fix periodicAttachRate dates from string format to DateTime
 * Converts dates like "01-12-2025" to proper DateTime objects
 */
async function fixAttachRateDates() {
  let mongoClient: MongoClient | null = null;
  
  try {
    console.log('🔄 Starting to fix periodicAttachRate dates...\n');

    // Get MongoDB connection string from environment
    const mongoUrl = process.env.DATABASE_URL;
    if (!mongoUrl) {
      throw new Error('DATABASE_URL not found in environment variables');
    }

    // Connect to MongoDB directly
    mongoClient = new MongoClient(mongoUrl);
    await mongoClient.connect();
    console.log('✅ Connected to MongoDB\n');

    const db = mongoClient.db();
    const collection = db.collection('periodicAttachRate');

    // Get all documents (bypassing Prisma's type checking)
    const records = await collection.find({}).toArray();

    console.log(`📊 Found ${records.length} attach rate records\n`);

    if (records.length === 0) {
      console.log('✅ No records found. Nothing to fix.');
      return;
    }

    // Function to parse DD-MM-YYYY string to Date
    const parseDate = (dateStr: string | Date): Date => {
      if (dateStr instanceof Date) {
        return dateStr;
      }
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      try {
        // Check if dates are strings
        const startIsString = typeof record.start === 'string';
        const endIsString = typeof record.end === 'string';

        if (!startIsString && !endIsString) {
          console.log(`⏭️  Skipping record ${record._id} - dates already in correct format`);
          skippedCount++;
          continue;
        }

        // Convert string dates to Date objects
        const startDate = parseDate(record.start);
        const endDate = parseDate(record.end);

        console.log(`🔧 Fixing record ${record._id}:`);
        console.log(`   Start: "${record.start}" → ${startDate.toISOString()}`);
        console.log(`   End: "${record.end}" → ${endDate.toISOString()}`);

        // Update the record using MongoDB directly
        await collection.updateOne(
          { _id: record._id },
          {
            $set: {
              start: startDate,
              end: endDate,
              updatedAt: new Date()
            }
          }
        );

        successCount++;
        console.log(`   ✅ Updated successfully\n`);

      } catch (error) {
        errorCount++;
        console.error(`   ❌ Error updating record ${record._id}:`, error);
        console.log('');
      }
    }

    console.log('='.repeat(60));
    console.log('📊 FIX SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully fixed: ${successCount} records`);
    console.log(`⏭️  Skipped (already correct): ${skippedCount} records`);
    console.log(`❌ Failed: ${errorCount} records`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Error in fixAttachRateDates:', error);
    throw error;
  } finally {
    if (mongoClient) {
      await mongoClient.close();
      console.log('✅ MongoDB connection closed');
    }
    await prisma.$disconnect();
  }
}

// Run the script
fixAttachRateDates()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
