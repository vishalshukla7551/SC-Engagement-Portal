import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add SCREEN_PROTECT_2_YR plan for Luxury Flip (Z Flip 7) and Luxury (Z Fold 7)
 * Usage: npx ts-node scripts/add-2yr-screen-protection-luxury.ts
 */
async function add2YrScreenProtectionForLuxury() {
    try {
        console.log('🚀 Adding 2-Year Screen Protection plan for luxury devices...\n');

        // Device configurations: [Category, ModelName, PlanPrice]
        const devicesToUpdate = [
            { category: 'Luxury Flip', modelName: 'Z Flip 7', price: 3999 },  // Example price
            { category: 'Luxury', modelName: 'Z Fold 7', price: 4999 },       // Example price
        ];

        let created = 0;
        let updated = 0;
        let notFound = 0;

        for (const device of devicesToUpdate) {
            console.log(`📱 Processing: ${device.category} - ${device.modelName}`);

            // Find the Samsung SKU
            const samsungSKU = await prisma.samsungSKU.findFirst({
                where: {
                    Category: device.category,
                    ModelName: device.modelName,
                },
            });

            if (!samsungSKU) {
                console.log(`   ⚠️  Device not found! Creating it...`);

                // Create the device first
                const newSKU = await prisma.samsungSKU.create({
                    data: {
                        Category: device.category,
                        ModelName: device.modelName,
                        ModelPrice: null,
                    },
                });

                console.log(`   ✅ Created device: ${newSKU.Category} - ${newSKU.ModelName} (ID: ${newSKU.id})`);

                // Create the 2-year screen protection plan
                const newPlan = await prisma.plan.create({
                    data: {
                        planType: 'SCREEN_PROTECT_2_YR',
                        price: device.price,
                        samsungSKUId: newSKU.id,
                    },
                });

                console.log(`   ✅ Created plan: SCREEN_PROTECT_2_YR → ₹${device.price}`);
                created++;
                continue;
            }

            console.log(`   ✓ Found device (ID: ${samsungSKU.id})`);

            // Check if the plan already exists
            const existingPlan = await prisma.plan.findFirst({
                where: {
                    samsungSKUId: samsungSKU.id,
                    planType: 'SCREEN_PROTECT_2_YR',
                },
            });

            if (existingPlan) {
                console.log(`   ℹ️  Plan already exists with price: ₹${existingPlan.price}`);

                if (existingPlan.price !== device.price) {
                    await prisma.plan.update({
                        where: { id: existingPlan.id },
                        data: { price: device.price },
                    });
                    console.log(`   🔄 Updated plan price: ₹${existingPlan.price} → ₹${device.price}`);
                    updated++;
                } else {
                    console.log(`   ✓ No update needed`);
                }
            } else {
                // Create the new plan
                const newPlan = await prisma.plan.create({
                    data: {
                        planType: 'SCREEN_PROTECT_2_YR',
                        price: device.price,
                        samsungSKUId: samsungSKU.id,
                    },
                });

                console.log(`   ✅ Created plan: SCREEN_PROTECT_2_YR → ₹${device.price}`);
                created++;
            }

            console.log('');
        }

        console.log('='.repeat(60));
        console.log('📊 Summary:');
        console.log(`   ✅ Created: ${created} plan(s)`);
        console.log(`   🔄 Updated: ${updated} plan(s)`);
        console.log(`   ⚠️  Not Found: ${notFound} device(s)`);
        console.log('='.repeat(60));
        console.log('\n🎉 Process completed successfully!\n');

        // Show all luxury devices with their plans
        console.log('📋 Verifying luxury devices and their plans:\n');

        const luxuryDevices = await prisma.samsungSKU.findMany({
            where: {
                OR: [
                    { Category: 'Luxury Flip', ModelName: 'Z Flip 7' },
                    { Category: 'Luxury', ModelName: 'Z Fold 7' },
                ],
            },
            include: { plans: true },
        });

        luxuryDevices.forEach((device, idx) => {
            console.log(`${idx + 1}. ${device.Category} - ${device.ModelName} (ID: ${device.id})`);
            if (device.plans.length > 0) {
                device.plans.forEach((plan) => {
                    console.log(`   - ${plan.planType}: ₹${plan.price}`);
                });
            } else {
                console.log(`   - No plans`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error adding plans:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
add2YrScreenProtectionForLuxury()
    .then(() => {
        console.log('✨ Script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
//test