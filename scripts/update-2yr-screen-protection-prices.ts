import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add/update SCREEN_PROTECT_2_YR plan for luxury and mid-range devices
 * Usage: npx ts-node scripts/update-2yr-screen-protection-prices.ts
 */
async function update2YrScreenProtectionPrices() {
    try {
        console.log('🚀 Adding/Updating 2-Year Screen Protection plans...\n');

        // Device configurations with correct prices
        const devicesToUpdate = [
            { category: 'Luxury Flip', modelName: 'Z Flip 7', price: 15999 },
            { category: 'Luxury', modelName: 'Z Fold 7', price: 21999 },
            { category: 'Mid', modelName: 'A17', price: 1499 },
        ];

        let created = 0;
        let updated = 0;

        for (const device of devicesToUpdate) {
            console.log(`📱 Processing: ${device.category} - ${device.modelName}`);

            // Find the Samsung SKU
            let samsungSKU = await prisma.samsungSKU.findFirst({
                where: {
                    Category: device.category,
                    ModelName: device.modelName,
                },
            });

            if (!samsungSKU) {
                console.log(`   ⚠️  Device not found! Creating it...`);

                // Create the device first
                samsungSKU = await prisma.samsungSKU.create({
                    data: {
                        Category: device.category,
                        ModelName: device.modelName,
                        ModelPrice: null,
                    },
                });

                console.log(`   ✅ Created device: ${samsungSKU.Category} - ${samsungSKU.ModelName} (ID: ${samsungSKU.id})`);
            } else {
                console.log(`   ✓ Found device (ID: ${samsungSKU.id})`);
            }

            // Check if the plan already exists
            const existingPlan = await prisma.plan.findFirst({
                where: {
                    samsungSKUId: samsungSKU.id,
                    planType: 'SCREEN_PROTECT_2_YR',
                },
            });

            if (existingPlan) {
                if (existingPlan.price !== device.price) {
                    await prisma.plan.update({
                        where: { id: existingPlan.id },
                        data: { price: device.price },
                    });
                    console.log(`   🔄 Updated plan price: ₹${existingPlan.price} → ₹${device.price}`);
                    updated++;
                } else {
                    console.log(`   ✓ Plan already exists with correct price: ₹${device.price}`);
                }
            } else {
                // Create the new plan
                await prisma.plan.create({
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
        console.log('='.repeat(60));
        console.log('\n🎉 Process completed successfully!\n');

        // Show all devices with their 2-year screen protection plans
        console.log('📋 Verifying devices with SCREEN_PROTECT_2_YR plans:\n');

        const devicesWithPlan = await prisma.samsungSKU.findMany({
            where: {
                OR: [
                    { Category: 'Luxury Flip', ModelName: 'Z Flip 7' },
                    { Category: 'Luxury', ModelName: 'Z Fold 7' },
                    { Category: 'Mid', ModelName: 'A17' },
                ],
            },
            include: {
                plans: {
                    where: { planType: 'SCREEN_PROTECT_2_YR' }
                }
            },
        });

        devicesWithPlan.forEach((device, idx) => {
            console.log(`${idx + 1}. ${device.Category} - ${device.ModelName} (ID: ${device.id})`);
            if (device.plans.length > 0) {
                device.plans.forEach((plan) => {
                    console.log(`   ✓ ${plan.planType}: ₹${plan.price}`);
                });
            } else {
                console.log(`   ⚠️  No SCREEN_PROTECT_2_YR plan found!`);
            }
            console.log('');
        });

    } catch (error) {
        console.error('❌ Error updating plans:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
update2YrScreenProtectionPrices()
    .then(() => {
        console.log('✨ Script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
