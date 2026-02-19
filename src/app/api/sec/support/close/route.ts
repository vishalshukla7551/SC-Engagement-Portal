
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[close-ticket] Received request:', {
            queryId: body.queryId,
            type: typeof body.queryId,
            length: typeof body.queryId === 'string' ? body.queryId.length : 'N/A'
        });

        const { queryId } = body;

        if (!queryId) {
            console.error('[close-ticket] Missing Query ID');
            return NextResponse.json({
                error: 'Missing Query ID',
                code: 'MISSING_QUERY_ID'
            }, { status: 400 });
        }

        // Strictly validate MongoDB ObjectId format
        if (typeof queryId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(queryId)) {
            console.error('[close-ticket] Invalid Query ID format:', {
                queryId,
                type: typeof queryId,
                length: typeof queryId === 'string' ? queryId.length : 0
            });
            return NextResponse.json({
                error: 'Invalid Query ID',
                code: 'INVALID_QUERY_ID_FORMAT'
            }, { status: 400 });
        }

        const updatedQuery = await prisma.supportQuery.update({
            where: { id: queryId },
            data: {
                status: 'RESOLVED',
                resolvedAt: new Date()
            }
        });

        return NextResponse.json(updatedQuery);

    } catch (error) {
        console.error('Error closing support query:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
