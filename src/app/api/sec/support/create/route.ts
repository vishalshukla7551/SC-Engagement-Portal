
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('[create-query] Received request:', {
            secId: body.secId,
            type: typeof body.secId,
            length: typeof body.secId === 'string' ? body.secId.length : 'N/A',
            category: body.category,
            description: body.description?.substring(0, 50) + '...',
            bodyKeys: Object.keys(body)
        });

        const { secId, category, description } = body;

        if (!secId || !category || !description) {
            console.error('[create-query] Missing required fields:', {
                hasSecId: !!secId,
                hasCategory: !!category,
                hasDescription: !!description
            });
            return NextResponse.json({
                error: 'Missing required fields',
                code: 'MISSING_FIELDS',
                details: {
                    secId: !secId ? 'missing' : 'present',
                    category: !category ? 'missing' : 'present',
                    description: !description ? 'missing' : 'present'
                }
            }, { status: 400 });
        }

        // Strictly validate MongoDB ObjectId format
        // ObjectId must be a single string of 24 hex characters
        if (typeof secId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(secId)) {
            console.error('[create-query] Invalid SEC ID format:', {
                secId,
                type: typeof secId,
                length: typeof secId === 'string' ? secId.length : 0,
                isString: typeof secId === 'string',
                regexTest: typeof secId === 'string' ? /^[0-9a-fA-F]{24}$/.test(secId) : false
            });
            return NextResponse.json({
                error: 'Invalid SEC ID format. Please log out and log in again.',
                code: 'INVALID_SEC_ID_FORMAT',
                details: {
                    received: typeof secId === 'string' ? secId : 'Non-string value',
                    receivedType: typeof secId,
                    length: typeof secId === 'string' ? secId.length : 0,
                    expectedFormat: '24-character hexadecimal string'
                }
            }, { status: 400 });
        }

        // 1. Check if user already has an active query
        // We use the same secId here, which is now validated
        const activeQuery = await prisma.supportQuery.findFirst({
            where: {
                secId: secId,
                status: {
                    in: ['PENDING', 'IN_PROGRESS']
                }
            }
        });

        if (activeQuery) {
            return NextResponse.json({ error: 'You already have an active query. Please close it first.' }, { status: 400 });
        }

        // 2. Generate Query Number (Q0001, Q0002...)
        const lastQuery = await prisma.supportQuery.findFirst({
            orderBy: {
                createdAt: 'desc'
            }
        });

        let queryNumber = 'Q0001';
        if (lastQuery && lastQuery.queryNumber) {
            const lastNum = parseInt(lastQuery.queryNumber.substring(1));
            queryNumber = `Q${(lastNum + 1).toString().padStart(4, '0')}`;
        }

        // 3. Create the Query
        const newQuery = await prisma.supportQuery.create({
            data: {
                secId,
                queryNumber,
                category,
                description,
                status: 'PENDING',
                messages: {
                    create: {
                        message: description, // Initial message is the description itself
                        isFromAdmin: false
                    }
                }
            }
        });

        return NextResponse.json(newQuery);

    } catch (error) {
        console.error('Error creating support query:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
