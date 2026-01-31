const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function awardBonus() {
    try {
        // Get phone number from command line argument
        const phone = process.argv[2];

        if (!phone) {
            console.log('Usage: node award-bonus.js <phone_number>');
            console.log('Example: node award-bonus.js 9876543210');
            process.exit(1);
        }

        // Find the SEC user
        const sec = await prisma.sEC.findUnique({
            where: { phone },
            select: {
                id: true,
                fullName: true,
                phone: true,
                hasProtectMaxBonus: true
            }
        });

        if (!sec) {
            console.log(`❌ No SEC found with phone: ${phone}`);
            process.exit(1);
        }

        if (sec.hasProtectMaxBonus) {
            console.log(`⚠️  ${sec.fullName} already has the ProtectMax bonus!`);
            process.exit(0);
        }

        // Award the bonus
        await prisma.sEC.update({
            where: { id: sec.id },
            data: { hasProtectMaxBonus: true }
        });

        console.log(`✅ Successfully awarded 10,000 bonus points to ${sec.fullName} (${phone})`);
        console.log('The bonus will now appear in:');
        console.log('  - Hall of Fame leaderboard');
        console.log('  - Regiments page');
        console.log('  - Republic Day Hero page');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

awardBonus();
