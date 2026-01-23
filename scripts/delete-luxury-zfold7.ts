import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to delete Luxury - Z Fold 7 device and its plans from database
 * Usage: npx ts-node scripts/delete-luxury-zfold7.ts
 */
async function deleteLuxuryZFold7() {
    try {
        console.log('🚀 Deleting Luxury - Z Fold 7 device and its plans...\n');

        // Find Luxury - Z Fold 7
        const zfold7Device = await prisma.samsungSKU.findFirst({
            where: {
                Category: 'Luxury',
                ModelName: 'Z Fold 7',
            },
            include: { plans: true },
        });

        if (!zfold7Device) {
            console.log('⚠️  Luxury - Z Fold 7 device not found in database.');
            console.log('   It may have already been deleted.\n');
            return;
        }

        console.log(`✓ Found Luxury - Z Fold 7 (ID: ${zfold7Device.id})`);
        console.log(`  Plans: ${zfold7Device.plans.length}\n`);

        if (zfold7Device.plans.length > 0) {
            console.log('📋 Plans to be deleted:');
            zfold7Device.plans.forEach((plan) => {
                console.log(`   - ${plan.planType}: ₹${plan.price}`);
            });
            console.log('');
        }

        // Delete all plans associated with this device
        const deletedPlans = await prisma.plan.deleteMany({
            where: { samsungSKUId: zfold7Device.id },
        });

        console.log(`🗑️  Deleted ${deletedPlans.count} plan(s)\n`);

        // Delete the device itself
        await prisma.samsungSKU.delete({
            where: { id: zfold7Device.id },
        });

        console.log('✅ Deleted Luxury - Z Fold 7 device\n');

        console.log('='.repeat(60));
        console.log('📊 Summary:');
        console.log(`   ✅ Deleted device: Luxury - Z Fold 7`);
        console.log(`   ✅ Deleted ${deletedPlans.count} plan(s)`);
        console.log('='.repeat(60));
        console.log('\n🎉 Process completed successfully!\n');

    } catch (error) {
        console.error('❌ Error deleting device:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
deleteLuxuryZFold7()
    .then(() => {
        console.log('✨ Script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
