
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { secId } = body;

        console.log('[my-query] Received request:', {
            secId,
            type: typeof secId,
            length: typeof secId === 'string' ? secId.length : 'N/A',
            bodyKeys: Object.keys(body)
        });

        if (!secId) {
            console.error('[my-query] Missing SEC ID');
            return NextResponse.json({
                error: 'Missing SEC ID',
                code: 'MISSING_SEC_ID'
            }, { status: 400 });
        }

        // Strictly validate MongoDB ObjectId format
        if (typeof secId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(secId)) {
            console.error('[my-query] Invalid SEC ID format:', {
                secId,
                type: typeof secId,
                length: typeof secId === 'string' ? secId.length : 0,
                isString: typeof secId === 'string',
                regexTest: typeof secId === 'string' ? /^[0-9a-fA-F]{24}$/.test(secId) : false
            });
            return NextResponse.json({
                error: 'Invalid SEC ID format',
                code: 'INVALID_SEC_ID_FORMAT',
                received: typeof secId === 'string' ? secId : 'Non-string value',
                receivedType: typeof secId,
                length: typeof secId === 'string' ? secId.length : 0,
                expectedFormat: '24-character hexadecimal string'
            }, { status: 400 });
        }

        // Find the latest active query
        const activeQuery = await prisma.supportQuery.findFirst({
            where: {
                secId: secId,
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                }
            },
            include: {
                messages: {
                    orderBy: {
                        sentAt: 'asc'
                    }
                }
            }
        });

        return NextResponse.json(activeQuery || null);

    } catch (error) {
        console.error('Error fetching support query:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
