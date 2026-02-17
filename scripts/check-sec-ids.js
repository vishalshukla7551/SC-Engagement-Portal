
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching valid SEC IDs...');
        const secs = await prisma.sEC.findMany({ select: { id: true, phone: true } });
        console.log(`Found ${secs.length} SECs.`);
        if (secs.length > 0) {
            console.log('Sample SEC IDs:', secs.slice(0, 3).map(s => ({ id: s.id, phone: s.phone })));

            const first = secs[0];
            console.log('ID Type:', typeof first.id);
            console.log('ID Length:', first.id.length);
            console.log('Is valid ObjectId?', /^[0-9a-fA-F]{24}$/.test(first.id));
        }
    } catch (error) {
        console.error('Error fetching SECs:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
