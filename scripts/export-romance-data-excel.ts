import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';
import * as path from 'path';

async function exportRomanceDataToExcel() {
    try {
        console.log('🔄 Starting Romance Merit Board data export to Excel...');

        // 1. Fetch data
        const valentineStartDate = new Date('2026-02-10T00:00:00.000Z');

        const allSecs = await prisma.sEC.findMany({
            select: {
                id: true,
                phone: true,
                fullName: true,
                otherProfileInfo: true,
                store: {
                    select: {
                        name: true,
                        city: true
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

            let maritalStatusLabel = 'Unknown';
            if (info) {
                if (typeof info.maritalStatus === 'object' && info.maritalStatus !== null) {
                    maritalStatusLabel = info.maritalStatus.isMarried ? 'Married' : 'Single';
                    if (info.maritalStatus.date) {
                        maritalStatusLabel += ` (${info.maritalStatus.date})`;
                    }
                } else if (typeof info.maritalStatus === 'string') {
                    maritalStatusLabel = info.maritalStatus;
                }
            }

            userDataMap.set(sec.id, {
                id: sec.id,
                phone: sec.phone,
                name: sec.fullName || 'Unknown',
                store: sec.store?.name || 'Unknown',
                city: sec.store?.city || 'Unknown',
                hearts: profileBonus,
                submissions: 0,
                photo: hasPhoto ? 'YES' : 'NO',
                birthday: info?.birthday || 'Missing',
                maritalStatus: maritalStatusLabel,
                photoUrl: info?.photoUrl || 'Missing',
                hasAllDetails: (hasPhoto && hasBirthday && hasMaritalStatus)
            });
        });

        submissions.forEach((sub: any) => {
            if (userDataMap.has(sub.secId)) {
                const data = userDataMap.get(sub.secId);
                data.hearts += getHeartsByPlanType(sub.plan?.planType);
                data.submissions += 1;
            }
        });

        const allUsers = Array.from(userDataMap.values());

        // 2. Prepare Sheets Data

        // Sheet 1: Users with Completed Profiles
        const filledProfilesData = allUsers
            .filter(u => u.hasAllDetails)
            .map(u => ({
                'Name': u.name,
                'Phone': u.phone,
                'Store': u.store,
                'City': u.city,
                'Birthday': u.birthday,
                'Marital Status': u.maritalStatus,
                'Hearts': u.hearts,
                'Submissions': u.submissions,
                'Photo URL': u.photoUrl
            }));

        // Sheet 2: Entry Level Profile Status
        const entryLevelStatusData = allUsers
            .filter(u => u.hearts >= 1 && u.hearts < 20)
            .sort((a, b) => b.hearts - a.hearts)
            .map(u => ({
                'Name': u.name,
                'Phone': u.phone,
                'Photo Uploaded?': u.photo,
                'Birthday Filled?': u.birthday !== 'Missing' ? 'YES' : 'NO',
                'Marital Status?': u.maritalStatus !== 'Unknown' ? 'YES' : 'NO',
                'Current Hearts': u.hearts,
                'Store': u.store
            }));

        // 3. Create Excel File
        const wb = XLSX.utils.book_new();

        const ws1 = XLSX.utils.json_to_sheet(filledProfilesData);
        XLSX.utils.book_append_sheet(wb, ws1, 'Filled Profiles');

        const ws2 = XLSX.utils.json_to_sheet(entryLevelStatusData);
        XLSX.utils.book_append_sheet(wb, ws2, 'Entry Level Analysis');

        const filename = 'Romance_Merit_Board_Data.xlsx';
        XLSX.writeFile(wb, filename);

        console.log(`\n✅ Excel file created successfully: ${filename}`);
        console.log(`   - Filled Profiles: ${filledProfilesData.length} users`);
        console.log(`   - Entry Level Analysis: ${entryLevelStatusData.length} users`);

    } catch (error) {
        console.error('❌ Error exporting to Excel:', error);
    } finally {
        await prisma.$disconnect();
    }
}

exportRomanceDataToExcel();
