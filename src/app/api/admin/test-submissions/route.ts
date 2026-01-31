import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/test-submissions
 * Optimized endpoint for fast loading of test submissions
 * Query params:
 *   - secId: Optional filter by SEC ID
 *   - status: Optional filter by pass/fail (pass|fail)
 *   - limit: Optional limit results (default: 50)
 *   - offset: Optional offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const secId = searchParams.get('secId');
        const status = searchParams.get('status');
        const limit = Math.min(parseInt(searchParams.get('limit') || '200'), 200); // Increase to show more submissions
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build query filters
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        if (secId) {
            where.OR = [
                { secId: secId },
                { phone: secId }
            ];
        }

        if (status === 'pass') {
            where.score = { gte: 60 };
        } else if (status === 'fail') {
            where.score = { lt: 60 };
        }

        // Fetch submissions with responses included
        const submissions = await prisma.testSubmission.findMany({
            where,
            select: {
                id: true,
                secId: true,
                phone: true,
                sessionToken: true,
                testName: true,
                responses: true, // Include responses
                score: true,
                totalQuestions: true,
                completionTime: true,
                isProctoringFlagged: true,
                storeId: true,
                storeName: true,
                certificateUrl: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        if (submissions.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                meta: {
                    total: 0,
                    limit,
                    offset,
                },
            });
        }

        // Batch fetch related data
        const storeIds = [...new Set(submissions.map(s => s.storeId).filter(Boolean))] as string[];
        const secIdentifiers = new Set<string>();
        submissions.forEach(s => {
            if (s.secId) secIdentifiers.add(s.secId);
            if (s.phone) secIdentifiers.add(s.phone);
        });
        const uniqueSecIdentifiers = [...secIdentifiers];

        // Parallel fetch of related data
        const [stores, secs] = await Promise.all([
            // Fetch stores
            storeIds.length > 0 ? prisma.store.findMany({
                where: { id: { in: storeIds } },
                select: { id: true, name: true, city: true }
            }) : [],
            
            // Fetch SEC names
            uniqueSecIdentifiers.length > 0 ? prisma.sEC.findMany({
                where: {
                    OR: [
                        { phone: { in: uniqueSecIdentifiers } },
                        { id: { in: uniqueSecIdentifiers.filter(id => /^[0-9a-fA-F]{24}$/.test(id)) } }
                    ]
                },
                select: { id: true, phone: true, fullName: true }
            }) : []
        ]);

        // Create lookup maps for performance
        const storeMap = new Map(stores.map(s => [s.id, s]));
        const secMap = new Map();
        secs.forEach(sec => {
            if (sec.phone) secMap.set(sec.phone, sec.fullName);
            secMap.set(sec.id, sec.fullName);
        });

        // Process submissions efficiently
        const processedSubmissions = submissions.map((submission) => {
            // Get store info
            let storeName = submission.storeName;
            let storeCity = '';
            if (submission.storeId && !storeName) {
                const store = storeMap.get(submission.storeId);
                if (store) {
                    storeName = store.name;
                    storeCity = store.city || '';
                }
            }

            // Get SEC name
            const secName = secMap.get(submission.phone) || secMap.get(submission.secId) || '';

            // Process responses to get basic answer info
            let processedResponses: any[] = [];
            let responseCount = 0;
            
            if (submission.responses) {
                let rawResponses = submission.responses as any;
                
                // Handle different response formats
                if (typeof rawResponses === 'string') {
                    try {
                        rawResponses = JSON.parse(rawResponses);
                    } catch (e) {
                        rawResponses = [];
                    }
                }
                
                if (Array.isArray(rawResponses)) {
                    responseCount = rawResponses.length;
                    processedResponses = rawResponses.map((response: any, index: number) => ({
                        questionNumber: index + 1,
                        questionId: response.questionId,
                        selectedAnswer: response.selectedAnswer,
                        isCorrect: response.isCorrect || false
                    }));
                } else if (rawResponses && typeof rawResponses === 'object') {
                    // Handle key-value format: { "1": "A", "2": "C" }
                    const entries = Object.entries(rawResponses);
                    responseCount = entries.length;
                    processedResponses = entries.map(([qId, selectedAnswer], index) => ({
                        questionNumber: index + 1,
                        questionId: qId,
                        selectedAnswer: selectedAnswer,
                        isCorrect: false // Will be calculated if needed
                    }));
                }
            }

            return {
                id: submission.id,
                secId: submission.secId || '',
                secName: secName || '',
                phone: submission.phone || submission.secId || '',
                sessionToken: submission.sessionToken || '',
                testName: submission.testName || 'Samsung Protect Max Certification',
                responses: processedResponses,
                score: submission.score,
                totalQuestions: submission.totalQuestions || responseCount || 10,
                completionTime: submission.completionTime,
                submittedAt: submission.createdAt.toISOString(),
                isProctoringFlagged: submission.isProctoringFlagged,
                storeId: submission.storeId || '',
                storeName: storeName || '',
                storeCity: storeCity,
                certificateUrl: submission.certificateUrl || null,
                screenshotUrls: [], // Empty for performance - implement separately if needed
            };
        });

        return NextResponse.json({
            success: true,
            data: processedSubmissions,
            meta: {
                total: processedSubmissions.length,
                limit,
                offset,
                hasMore: processedSubmissions.length === limit
            },
        });
    } catch (error) {
        console.error('Error fetching test submissions:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch test submissions',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
