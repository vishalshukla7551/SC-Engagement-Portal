import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secId } = body;

        console.log('[query-history] Received request:', {
            secId,
            type: typeof secId,
            length: typeof secId === 'string' ? secId.length : 'N/A'
        });

        if (!secId) {
            console.error('[query-history] Missing SEC ID');
            return NextResponse.json({
                error: 'Missing SEC ID',
                code: 'MISSING_SEC_ID'
            }, { status: 400 });
        }

        // Validate MongoDB ObjectId format
        if (typeof secId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(secId)) {
            console.error('[query-history] Invalid SEC ID format:', {
                secId,
                type: typeof secId,
                length: typeof secId === 'string' ? secId.length : 0
            });
            return NextResponse.json({
                error: 'Invalid SEC ID format',
                code: 'INVALID_SEC_ID_FORMAT'
            }, { status: 400 });
        }

        // Find all resolved queries for this SEC
        const resolvedQueries = await prisma.supportQuery.findMany({
            where: {
                secId: secId,
                status: 'RESOLVED'
            },
            orderBy: {
                resolvedAt: 'desc'
            },
            take: 10, // Limit to last 10 queries
            select: {
                id: true,
                queryNumber: true,
                category: true,
                description: true,
                status: true,
                submittedAt: true,
                resolvedAt: true
            }
        });

        console.log('[query-history] Found queries:', resolvedQueries.length);
        return NextResponse.json({ queries: resolvedQueries });

    } catch (error) {
        console.error('Error fetching query history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
