import { prisma } from '@/lib/prisma';

async function fetchFilledProfiles() {
    try {
        console.log('🔄 Fetching users with completed profile info...');

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

        const usersWithFilledProfiles = allSecs.filter(sec => {
            const info = sec.otherProfileInfo as any;
            return info && info.photoUrl && info.birthday && info.maritalStatus;
        });

        console.log(`\n✅ Found ${usersWithFilledProfiles.length} users with completed profiles:\n`);

        usersWithFilledProfiles.forEach((user, i) => {
            const info = user.otherProfileInfo as any;
            let maritalStatus = 'Unknown';
            if (typeof info.maritalStatus === 'object' && info.maritalStatus !== null) {
                maritalStatus = info.maritalStatus.isMarried ? 'Married' : 'Single';
                if (info.maritalStatus.date) {
                    maritalStatus += ` (${info.maritalStatus.date})`;
                }
            } else if (typeof info.maritalStatus === 'string') {
                maritalStatus = info.maritalStatus;
            }

            console.log(`${i + 1}. ${user.fullName || 'Unknown'} (${user.phone})`);
            console.log(`   Store: ${user.store?.name || 'Unknown'} | City: ${user.store?.city || 'Unknown'}`);
            console.log(`   Birthday: ${info.birthday} | Marital Status: ${maritalStatus}`);
            console.log(`   Photo: ${info.photoUrl}`);
            console.log('--------------------------------------------------');
        });

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

fetchFilledProfiles();
