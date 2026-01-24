import { prisma } from '@/lib/prisma';

const secUpdates = [
  { phone: '6377159886', correctName: 'Manish Santani' },
  { phone: '7359544317', correctName: 'Shivam Kushwaha' },
  { phone: '7569720524', correctName: 'Mohd sajeed khan' },
  { phone: '7600443523', correctName: 'Dharmesh rathod' },
  { phone: '7838131652', correctName: 'Imtiyaz' },
  { phone: '8080555696', correctName: 'Ansar Ansari' },
  { phone: '8218981308', correctName: 'Tushar sethi' },
  { phone: '8668993472', correctName: 'Abhishek' },
  { phone: '8882575369', correctName: 'NITESH MISHRA' },
  { phone: '9626983020', correctName: 'K.VINOTHKUMAR' },
  { phone: '9690997663', correctName: 'Varsha' },
  { phone: '9945111142', correctName: 'Mohammed imran ahmed' },
];

async function updateSecFullNames() {
  try {
    console.log('Starting SEC fullName updates...\n');

    let updatedCount = 0;
    let skippedCount = 0;

    for (const { phone, correctName } of secUpdates) {
      try {
        // Find SEC user by phone
        const secUser = await prisma.sEC.findUnique({
          where: { phone },
        });

        if (!secUser) {
          console.log(`⚠️  SEC user not found: ${phone}`);
          skippedCount++;
          continue;
        }

        // Check if fullName is unknown/empty/missing
        const currentName = secUser.fullName || '';
        const isUnknown =
          !currentName ||
          currentName.trim().length === 0 ||
          currentName.toLowerCase() === 'unknown';

        if (isUnknown) {
          // Update with correct name
          await prisma.sEC.update({
            where: { phone },
            data: { fullName: correctName },
          });
          console.log(`✅ Updated: ${phone} → ${correctName}`);
          updatedCount++;
        } else {
          console.log(`⏭️  Skipped: ${phone} (already has name: ${currentName})`);
          skippedCount++;
        }
      } catch (itemError) {
        console.error(`❌ Error processing ${phone}:`, itemError);
        skippedCount++;
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Skipped: ${skippedCount}`);
    console.log(`   Total: ${secUpdates.length}`);
  } catch (error) {
    console.error('Error updating SEC fullNames:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateSecFullNames();
