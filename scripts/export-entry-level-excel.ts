import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

async function exportEntryLevelToExcel() {
    try {
        console.log('🔄 Exporting Entry Level users to Excel...');

        const valentineStartDate = new Date('2026-02-10T00:00:00.000Z');

        const allSecs = await prisma.sEC.findMany({
            select: {
                id: true,
                phone: true,
                fullName: true,
                otherProfileInfo: true,
                store: {
                    select: {
                        name: true
                    }
                }
            }
        });

        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: { gte: valentineStartDate },
                spotincentivepaidAt: { not: null }
            },
            include: {
                plan: { select: { planType: true } }
            }
        });

        const getHeartsByPlanType = (planType: string): number => {
            const type = (planType || '').toUpperCase();
            if (type.includes('COMBO')) return 5;
            if (type.includes('ADLD') || type.includes('DAMAGE')) return 3;
            return 1;
        };

        const userDataMap = new Map<string, any>();

        allSecs.forEach(sec => {
            const info = sec.otherProfileInfo as any;
            const hasPhoto = !!(info && info.photoUrl);
            const hasBirthday = !!(info && info.birthday);
            const hasMaritalStatus = !!(info && info.maritalStatus);

            let profileBonus = 0;
            if (hasPhoto && hasBirthday && hasMaritalStatus) {
                profileBonus = 20;
            }

            userDataMap.set(sec.id, {
                phone: sec.phone,
                name: sec.fullName || 'Unknown',
                store: sec.store?.name || 'Unknown',
                hearts: profileBonus,
                photo: hasPhoto ? '✅' : '❌',
                birthday: hasBirthday ? '✅' : '❌',
                marital: hasMaritalStatus ? '✅' : '❌'
            });
        });

        submissions.forEach((sub: any) => {
            if (userDataMap.has(sub.secId)) {
                const data = userDataMap.get(sub.secId);
                data.hearts += getHeartsByPlanType(sub.plan?.planType);
            }
        });

        const entryLevelData = Array.from(userDataMap.values())
            .filter(u => u.hearts >= 1 && u.hearts < 20)
            .sort((a, b) => b.hearts - a.hearts)
            .map(u => ({
                'Name': u.name,
                'Phone': u.phone,
                'Store': u.store,
                'Hearts': u.hearts,
                'Photo Uploaded': u.photo,
                'Birthday Filled': u.birthday,
                'Marital Status Filled': u.marital
            }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(entryLevelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Entry Level Users');

        const filename = 'Entry_Level_Users_Report.xlsx';
        XLSX.writeFile(wb, filename);

        console.log(`\n✅ Exported ${entryLevelData.length} Entry Level users to ${filename}`);

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportEntryLevelToExcel();
