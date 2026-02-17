import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        // Fetch all queries, prioritized by active status
        const queries = await prisma.supportQuery.findMany({
            include: {
                secUser: true,
                messages: {
                    orderBy: {
                        sentAt: 'asc'
                    }
                }
            },
            orderBy: [
                { status: 'asc' }, // PENDING first, then IN_PROGRESS, then RESOLVED
                { lastUpdatedAt: 'desc' }
            ]
        });

        return NextResponse.json(queries);

    } catch (error) {
        console.error('Error fetching all queries:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
