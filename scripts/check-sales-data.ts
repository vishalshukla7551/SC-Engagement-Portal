import { prisma } from '@/lib/prisma';

async function checkSalesData() {
    try {
        console.log('🔄 Checking sales data...');

        // Check total spot incentive reports
        const totalReports = await prisma.spotIncentiveReport.count();
        console.log(`📊 Total Spot Incentive Reports: ${totalReports}`);

        // Check paid vs unpaid
        const paidReports = await prisma.spotIncentiveReport.count({
            where: { spotincentivepaidAt: { not: null } }
        });
        const unpaidReports = await prisma.spotIncentiveReport.count({
            where: { spotincentivepaidAt: null }
        });
        
        console.log(`💰 Paid Reports: ${paidReports}`);
        console.log(`⏳ Unpaid Reports: ${unpaidReports}`);

        // Check total incentive amounts
        const allReports = await prisma.spotIncentiveReport.findMany({
            select: {
                spotincentiveEarned: true,
                spotincentivepaidAt: true,
                secId: true,
            }
        });

        const totalEarned = allReports.reduce((sum, r) => sum + r.spotincentiveEarned, 0);
        const totalPaid = allReports
            .filter(r => r.spotincentivepaidAt)
            .reduce((sum, r) => sum + r.spotincentiveEarned, 0);

        console.log(`💵 Total Earned: ₹${totalEarned.toLocaleString('en-IN')}`);
        console.log(`💸 Total Paid: ₹${totalPaid.toLocaleString('en-IN')}`);

        // Check top earners (including unpaid)
        const secSales = new Map<string, number>();
        allReports.forEach(report => {
            const current = secSales.get(report.secId) || 0;
            secSales.set(report.secId, current + report.spotincentiveEarned);
        });

        const topEarners = Array.from(secSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        console.log('\n🏆 TOP 10 EARNERS (Including Unpaid):');
        for (const [secId, amount] of topEarners) {
            const secUser = await prisma.sEC.findUnique({
                where: { id: secId },
                select: { fullName: true, employeeId: true, phone: true }
            });
            console.log(`${secUser?.fullName || 'N/A'} (${secUser?.employeeId || secId}): ₹${amount.toLocaleString('en-IN')}`);
        }

        // Check top paid earners
        const secPaidSales = new Map<string, number>();
        allReports
            .filter(r => r.spotincentivepaidAt)
            .forEach(report => {
                const current = secPaidSales.get(report.secId) || 0;
                secPaidSales.set(report.secId, current + report.spotincentiveEarned);
            });

        const topPaidEarners = Array.from(secPaidSales.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        console.log('\n💰 TOP 10 PAID EARNERS:');
        if (topPaidEarners.length === 0) {
            console.log('No paid earnings found');
        } else {
            for (const [secId, amount] of topPaidEarners) {
                const secUser = await prisma.sEC.findUnique({
                    where: { id: secId },
                    select: { fullName: true, employeeId: true, phone: true }
                });
                console.log(`${secUser?.fullName || 'N/A'} (${secUser?.employeeId || secId}): ₹${amount.toLocaleString('en-IN')}`);
            }
        }

    } catch (error) {
        console.error('❌ Error checking sales data:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSalesData();