const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkBonusStatus() {
    try {
        // Get phone number from command line argument
        const phone = process.argv[2];

        if (!phone) {
            console.log('Usage: node check-bonus.js <phone_number>');
            console.log('Example: node check-bonus.js 9876543210');
            process.exit(1);
        }

        // Find the SEC user
        const sec = await prisma.sEC.findUnique({
            where: { phone },
            select: {
                id: true,
                fullName: true,
                phone: true,
                hasProtectMaxBonus: true,
                employeeId: true
            }
        });

        if (!sec) {
            console.log(`❌ No SEC found with phone: ${phone}`);
            process.exit(1);
        }

        console.log('\n📊 SEC User Details:');
        console.log('-------------------');
        console.log(`Name: ${sec.fullName || 'N/A'}`);
        console.log(`Phone: ${sec.phone}`);
        console.log(`Employee ID: ${sec.employeeId || 'N/A'}`);
        console.log(`Has ProtectMax Bonus: ${sec.hasProtectMaxBonus ? '✅ YES' : '❌ NO'}`);

        // Check test submissions
        const testSubmissions = await prisma.testSubmission.findMany({
            where: {
                secId: sec.id,
                testName: {
                    contains: 'protect',
                    mode: 'insensitive'
                }
            },
            orderBy: { submittedAt: 'desc' },
            take: 5
        });

        console.log(`\n📝 Recent ProtectMax Test Submissions: ${testSubmissions.length}`);
        console.log('-------------------');
        testSubmissions.forEach((sub, idx) => {
            console.log(`${idx + 1}. Score: ${sub.score}% | Test: ${sub.testName} | Date: ${sub.submittedAt.toISOString()}`);
        });

        // Check if they should have the bonus
        const highScoreSubmission = testSubmissions.find(sub => sub.score >= 80);
        if (highScoreSubmission && !sec.hasProtectMaxBonus) {
            console.log('\n⚠️  WARNING: User scored 80%+ but hasProtectMaxBonus is false!');
            console.log('Run: node scripts/award-bonus.js ' + phone);
        } else if (sec.hasProtectMaxBonus) {
            console.log('\n✅ Bonus already awarded!');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkBonusStatus();
