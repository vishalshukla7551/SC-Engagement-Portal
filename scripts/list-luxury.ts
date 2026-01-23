import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listLuxuryDevices() {
    const devices = await prisma.samsungSKU.findMany({
        where: { Category: { contains: 'Luxury' } },
        include: { plans: true },
    });

    console.log(JSON.stringify(devices, null, 2));
}

listLuxuryDevices().finally(() => prisma.$disconnect());
