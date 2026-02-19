import { prisma } from '@/lib/prisma';

async function analyzeEntryLevelProfiles() {
    try {
        console.log('🔄 Analyzing profile completion for Entry Level users (1-19 Hearts)...');

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
            const hasPhoto = !!(info && info.photoUrl);
            const hasBirthday = !!(info && info.birthday);
            const hasMaritalStatus = !!(info && info.maritalStatus);

            if (hasPhoto && hasBirthday && hasMaritalStatus) {
                profileBonus = 20;
            }

            userHearts.set(sec.id, {
                id: sec.id,
                phone: sec.phone,
                name: sec.fullName || 'Unknown',
                store: sec.store?.name || 'Unknown',
                hearts: profileBonus,
                submissions: 0,
                profileStatus: {
                    photo: hasPhoto,
                    birthday: hasBirthday,
                    maritalStatus: hasMaritalStatus
                }
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

        console.log(`\n✅ Found ${entryLevelUsers.length} Entry Level users.\n`);
        console.log('Status Key: ✅ = Filled, ❌ = Missing\n');

        console.log(`${'Name'.padEnd(25)} | ${'Phone'.padEnd(12)} | ${'Store'.padEnd(30)} | Photo | Bday | Marital | Hearts`);
        console.log('-'.repeat(120));

        entryLevelUsers.forEach((user) => {
            const s = user.profileStatus;
            const photo = s.photo ? ' ✅   ' : ' ❌   ';
            const bday = s.birthday ? ' ✅  ' : ' ❌  ';
            const marital = s.maritalStatus ? '   ✅    ' : '   ❌    ';

            console.log(
                `${(user.name || 'N/A').substring(0, 25).padEnd(25)} | ` +
                `${(user.phone || '').padEnd(12)} | ` +
                `${(user.store || 'Unknown').substring(0, 30).padEnd(30)} | ` +
                `${photo} | ${bday} | ${marital} | ${user.hearts.toString().padStart(2)}`
            );
        });

        console.log('\nNote: Completing all 3 profile details grants a 20-heart bonus, pushing users out of Entry Level into Bronze.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

analyzeEntryLevelProfiles();
