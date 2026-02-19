
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('--- START DEBUG ---');

        // 1. Fetch an SEC user to use for testing
        console.log('1. Fetching first SEC user...');
        const secUser = await prisma.sEC.findFirst();

        if (!secUser) {
            console.log('No SEC user found. Cannot proceed with relation test.');
            return;
        }
        console.log('Found SEC User:', { id: secUser.id, name: secUser.fullName });

        const secId = secUser.id;

        // 2. Test findFirst on SupportQuery (like my-query route)
        console.log(`2. Testing findFirst for secId: ${secId}`);
        try {
            const existing = await prisma.supportQuery.findFirst({
                where: { secId: secId }
            });
            console.log('findFirst result:', existing);
        } catch (e) {
            console.error('ERROR in findFirst:', e);
        }

        // 3. Test Create (like create route)
        console.log('3. Testing create SupportQuery...');
        try {
            const newQuery = await prisma.supportQuery.create({
                data: {
                    secId: secId,
                    queryNumber: 'Q-TEST-001',
                    category: 'TECHNICAL_ISSUE',
                    description: 'Test description from script',
                    status: 'PENDING',
                    messages: {
                        create: {
                            message: 'Test description from script',
                            isFromAdmin: false
                        }
                    }
                }
            });
            console.log('Successfully created query:', newQuery);

            // Cleanup
            console.log('Cleaning up test query...');
            await prisma.supportQuery.delete({ where: { id: newQuery.id } });
        } catch (e) {
            console.error('ERROR in create:', e);
        }

    } catch (error) {
        console.error('CRITICAL FAILURE:', error);
    } finally {
        await prisma.$disconnect();
        console.log('--- END DEBUG ---');
    }
}

main();
