import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { queryId, message, isFromAdmin, adminName } = body;

        if (!queryId || !message) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newMessage = await prisma.supportQueryMessage.create({
            data: {
                queryId,
                message,
                isFromAdmin: isFromAdmin || false,
                adminName: adminName || null
            }
        });

        // Update query status to IN_PROGRESS if pending
        await prisma.supportQuery.update({
            where: { id: queryId },
            data: {
                status: 'IN_PROGRESS',
                lastUpdatedAt: new Date()
            }
        });

        return NextResponse.json(newMessage);

    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
