import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script to add Mass - A07 device to Samsung SKU database
 * Usage: npx ts-node scripts/add-mass-a07-device.ts
 */
async function addMassA07Device() {
    try {
        console.log('🚀 Adding Mass - A07 device to database...\n');

        // Check if device already exists
        const existingDevice = await prisma.samsungSKU.findFirst({
            where: {
                Category: 'Mass',
                ModelName: 'A07',
            },
        });

        if (existingDevice) {
            console.log('⚠️  Device already exists!');
            console.log(`   Category: ${existingDevice.Category}`);
            console.log(`   Model Name: ${existingDevice.ModelName}`);
            console.log(`   Model Price: ${existingDevice.ModelPrice || 'Not set'}`);
            console.log(`   Device ID: ${existingDevice.id}\n`);

            // Ask if user wants to view plans
            const plans = await prisma.plan.findMany({
                where: { samsungSKUId: existingDevice.id },
            });

            if (plans.length > 0) {
                console.log('📋 Existing Plans:');
                plans.forEach((plan, idx) => {
                    console.log(`   ${idx + 1}. ${plan.planType}: ₹${plan.price}`);
                });
            } else {
                console.log('📋 No plans found for this device.');
            }

            console.log('\n✅ Device already exists in database.');
            return existingDevice;
        }

        // Create the new device
        const newDevice = await prisma.samsungSKU.create({
            data: {
                Category: 'Mass',
                ModelName: 'A07',
                ModelPrice: null, // Set to null if no price is provided
            },
        });

        console.log('✅ Successfully added Mass - A07 device!\n');
        console.log('📋 Device Details:');
        console.log(`   ID: ${newDevice.id}`);
        console.log(`   Category: ${newDevice.Category}`);
        console.log(`   Model Name: ${newDevice.ModelName}`);
        console.log(`   Model Price: ${newDevice.ModelPrice || 'Not set'}\n`);

        console.log('💡 Note: You can add plans for this device using the Samsung SKU import script.');
        console.log('   Or add plans manually through the database.\n');

        return newDevice;
    } catch (error) {
        console.error('❌ Error adding device:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
addMassA07Device()
    .then(() => {
        console.log('✨ Script completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
//test-ignore-end