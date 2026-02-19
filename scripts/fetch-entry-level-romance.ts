import { prisma } from '@/lib/prisma';

async function fetchEntryLevelUsers() {
    try {
        console.log('🔄 Fetching entry level users for Romance Merit Board...');

        // Valentine campaign start date
        const valentineStartDate = new Date('2026-02-10T00:00:00.000Z');

        // 1. Fetch all SECs
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

        // 2. Fetch approved submissions
        const submissions = await prisma.spotIncentiveReport.findMany({
            where: {
                Date_of_sale: {
                    gte: valentineStartDate
                },
                spotincentivepaidAt: {
                    not: null
                }
            },
            include: {
                plan: {
                    select: {
                        planType: true
                    }
                }
            }
        });

        const getHeartsByPlanType = (planType: string): number => {
            const type = (planType || '').toUpperCase();
            if (type.includes('COMBO')) return 5;
            if (type.includes('ADLD') || type.includes('DAMAGE')) return 3;
            return 1;
        };

        const userHearts = new Map<string, any>();

        // Initialize with profile bonus
        allSecs.forEach(sec => {
            const info = sec.otherProfileInfo as any;
            let profileBonus = 0;
            if (info && info.photoUrl && info.birthday && info.maritalStatus) {
                profileBonus = 20;
            }

            userHearts.set(sec.id, {
                id: sec.id,
                phone: sec.phone,
                name: sec.fullName || 'Unknown',
                store: sec.store?.name || 'Unknown',
                hearts: profileBonus,
                submissions: 0
            });
        });

        // Add hearts from submissions
        submissions.forEach((sub: any) => {
            if (userHearts.has(sub.secId)) {
                const data = userHearts.get(sub.secId);
                data.hearts += getHeartsByPlanType(sub.plan?.planType);
                data.submissions += 1;
            }
        });

        // Filter Entry Level: 1 <= hearts < 20
        const entryLevelUsers = Array.from(userHearts.values())
            .filter(user => user.hearts >= 1 && user.hearts < 20)
            .sort((a, b) => b.hearts - a.hearts);

        console.log(`\n✅ Found ${entryLevelUsers.length} Entry Level users:\n`);

        entryLevelUsers.forEach((user, i) => {
            console.log(`${i + 1}. ${user.name} (${user.phone})`);
            console.log(`   Hearts: ${user.hearts} | Submissions: ${user.submissions} | Store: ${user.store}`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fetchEntryLevelUsers();
