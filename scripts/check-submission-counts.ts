import { prisma } from '../src/lib/prisma';

async function checkSubmissionCounts() {
    try {
        console.log('🔍 Analyzing Test Submissions Data...');

        // 1. Total Submissions
        const totalSubmissions = await prisma.testSubmission.count();
        console.log(`\n📋 Total Submissions Rows: ${totalSubmissions}`);

        // 2. Submissions with/without Identifiers
        const withSecId = await prisma.testSubmission.count({
            where: { secId: { not: '' } }
        });
        const withPhone = await prisma.testSubmission.count({
            where: { phone: { not: '' } }
        });
        const withoutEither = await prisma.testSubmission.count({
            where: {
                AND: [
                    { secId: { equals: '' } },
                    { phone: { equals: '' } }
                ]
            }
        });

        console.log(`   - With SEC ID: ${withSecId}`);
        console.log(`   - With Phone: ${withPhone}`);
        console.log(`   - Without SEC ID or Phone: ${withoutEither}`);

        // 3. Unique Identifiers Analysis
        // Group by SEC ID
        const bySecId = await prisma.testSubmission.groupBy({
            by: ['secId'],
            _count: { id: true },
        });
        const totalUniqueSecIds = bySecId.filter(g => g.secId && g.secId.trim() !== '').length;

        // Group by Phone
        const byPhone = await prisma.testSubmission.groupBy({
            by: ['phone'],
            _count: { id: true },
        });
        const totalUniquePhones = byPhone.filter(g => g.phone && g.phone.trim() !== '').length;

        console.log(`\n👤 Unique Identity Analysis:`);
        console.log(`   - Unique SEC IDs found: ${totalUniqueSecIds}`);
        console.log(`   - Unique Phones found: ${totalUniquePhones}`);

        // 4. Combined Unique Analysis (Simulating the export logic)
        const submissions = await prisma.testSubmission.findMany({
            select: { secId: true, phone: true }
        });

        const uniqueUsers = new Set<string>();
        submissions.forEach(s => {
            // Logic used in previous script: Prefer SEC ID, then Phone
            const id = s.secId || s.phone;
            if (id) uniqueUsers.add(id);
        });

        console.log(`\n✨ Logic Check (SEC ID || Phone):`);
        console.log(`   - Total Unique Users (according to export logic): ${uniqueUsers.size}`);

        // 5. High frequency submitters
        console.log(`\n🏆 Top 5 Frequent Submitters (by SEC ID):`);
        const topSubmitters = bySecId
            .filter(g => g.secId)
            .sort((a, b) => b._count.id - a._count.id)
            .slice(0, 5);

        topSubmitters.forEach(g => {
            console.log(`   - SEC ID: ${g.secId}: ${g._count.id} submissions`);
        });

    } catch (error) {
        console.error('❌ Error analyzing data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSubmissionCounts();
