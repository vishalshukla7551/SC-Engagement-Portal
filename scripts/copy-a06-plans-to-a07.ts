import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to copy plans from Mass A-06 to Mass - A07
 * Usage: npx ts-node scripts/copy-a06-plans-to-a07.ts
 */
async function copyPlansFromA06ToA07() {
    try {
        console.log('🚀 Copying plans from Mass A-06 to Mass - A07...\n');

        // Find Mass - A06
        const a06Device = await prisma.samsungSKU.findFirst({
            where: {
                Category: 'Mass',
                ModelName: 'A06',
            },
            include: { plans: true },
        });

        if (!a06Device) {
            console.log('❌ Mass A-06 device not found!');
            console.log('   Please check the exact Category and ModelName in the database.\n');

            // Try to find similar devices
            const massDevices = await prisma.samsungSKU.findMany({
                where: {
                    Category: { contains: 'Mass' },
                },
                include: { plans: true },
            });

            if (massDevices.length > 0) {
                console.log('📋 Found Mass category devices:');
                massDevices.forEach((device) => {
                    console.log(`   - ${device.Category} - ${device.ModelName} (${device.plans.length} plans)`);
                });
            }

            return;
        }

        console.log(`✓ Found Mass A-06 (ID: ${a06Device.id})`);
        console.log(`  Plans: ${a06Device.plans.length}\n`);

        if (a06Device.plans.length === 0) {
            console.log('⚠️  Mass A-06 has no plans to copy!');
            return;
        }

        // Find Mass - A07
        const a07Device = await prisma.samsungSKU.findFirst({
            where: {
                Category: 'Mass',
                ModelName: 'A07',
            },
        });

        if (!a07Device) {
            console.log('❌ Mass - A07 device not found!');
            return;
        }

        console.log(`✓ Found Mass - A07 (ID: ${a07Device.id})\n`);

        // Delete existing plans for A07 to avoid duplicates
        const deleteResult = await prisma.plan.deleteMany({
            where: { samsungSKUId: a07Device.id },
        });

        if (deleteResult.count > 0) {
            console.log(`🗑️  Deleted ${deleteResult.count} existing plan(s) from A07\n`);
        }

        // Copy plans from A-06 to A07
        console.log('📋 Copying plans:');
        let copied = 0;

        for (const plan of a06Device.plans) {
            await prisma.plan.create({
                data: {
                    planType: plan.planType,
                    price: plan.price,
                    samsungSKUId: a07Device.id,
                },
            });

            console.log(`   ✅ ${plan.planType}: ₹${plan.price}`);
            copied++;
        }

        console.log('\n' + '='.repeat(60));
        console.log('📊 Summary:');
        console.log(`   ✅ Copied: ${copied} plan(s) from Mass A-06 to Mass - A07`);
        console.log('='.repeat(60));
        console.log('\n🎉 Process completed successfully!\n');

        // Verify the copy
        console.log('📋 Verifying Mass - A07 plans:\n');
        const a07WithPlans = await prisma.samsungSKU.findUnique({
            where: { id: a07Device.id },
            include: { plans: true },
        });

        if (a07WithPlans?.plans && a07WithPlans.plans.length > 0) {
            a07WithPlans.plans.forEach((plan, idx) => {
                console.log(`   ${idx + 1}. ${plan.planType}: ₹${plan.price}`);
            });
        }
        console.log('');

    } catch (error) {
        console.error('❌ Error copying plans:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
copyPlansFromA06ToA07()
    .then(() => {
        console.log('✨ Script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
