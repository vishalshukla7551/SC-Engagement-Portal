import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuestionsForPhone, SEC_CERT_QUESTIONS } from '@/lib/testData';

/**
 * GET /api/admin/test-submissions
 * Fetch all test submissions with enriched question/answer data
 * Query params:
 *   - secId: Optional filter by SEC ID
 *   - status: Optional filter by pass/fail (pass|fail)
 *   - limit: Optional limit results (default: 100)
 *   - offset: Optional offset for pagination (default: 0)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const secId = searchParams.get('secId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '100');
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

        // Fetch submissions from database
        const submissions = await prisma.testSubmission.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        });

        // Fetch store information for each submission
        const submissionsWithStoreInfo = await Promise.all(
            submissions.map(async (submission) => {
                let storeName = submission.storeName;
                let storeCity = '';

                // If storeId exists but storeName is missing, fetch it
                if (submission.storeId && !storeName) {
                    try {
                        const store = await prisma.store.findUnique({
                            where: { id: submission.storeId },
                            select: { name: true, city: true },
                        });
                        if (store) {
                            storeName = store.name;
                            storeCity = store.city || '';
                        }
                    } catch (error) {
                        console.error('Error fetching store:', error);
                    }
                }

                // Get available questions from all sources
                const testName = submission.testName || '';
                const isCertTest = testName.toLowerCase().includes('certification') || testName.toLowerCase().includes('protect max');

                const phone = submission.phone || submission.secId || '';
                const standardQuestions = phone ? getQuestionsForPhone(phone) : [];

                // Prioritize bank based on test type to avoid ID collisions (1, 2, 3...)
                const allPossibleQuestions = isCertTest
                    ? [...SEC_CERT_QUESTIONS, ...standardQuestions]
                    : [...standardQuestions, ...SEC_CERT_QUESTIONS];

                // Enrich responses with question data
                const rawResponses = submission.responses as any;
                let enrichedResponses: any[] = [];

                if (Array.isArray(rawResponses)) {
                    enrichedResponses = rawResponses.map((response: any) => {
                        const question = allPossibleQuestions.find(
                            (q) => String(q.id) === String(response.questionId)
                        );

                        return {
                            ...response,
                            questionText: question?.question || 'Question details unavailable',
                            options: question?.options || [],
                            correctAnswer: question?.correctAnswer || '',
                            isCorrect: question
                                ? response.selectedAnswer === question.correctAnswer
                                : false,
                        };
                    });
                } else if (rawResponses && typeof rawResponses === 'object') {
                    // Handle case where responses is a map: { "1": "A", "2": "C" }
                    enrichedResponses = Object.entries(rawResponses).map(([qId, selectedAnswer], index) => {
                        const question = allPossibleQuestions.find(
                            (q) => String(q.id) === String(qId)
                        );

                        return {
                            questionNumber: index + 1,
                            questionId: qId,
                            questionText: question?.question || 'Question details unavailable',
                            options: question?.options || [],
                            selectedAnswer: selectedAnswer,
                            correctAnswer: question?.correctAnswer || '',
                            isCorrect: question ? selectedAnswer === question.correctAnswer : false,
                            category: question?.category || 'Unknown',
                        };
                    });
                }

                return {
                    id: submission.id,
                    secId: submission.secId || '',
                    phone: submission.phone || submission.secId || '',
                    sessionToken: submission.sessionToken || '',
                    testName: submission.testName || 'Samsung Protect Max Certification',
                    responses: enrichedResponses,
                    score: submission.score,
                    totalQuestions: submission.totalQuestions,
                    completionTime: submission.completionTime,
                    submittedAt: submission.createdAt.toISOString(),
                    isProctoringFlagged: submission.isProctoringFlagged,
                    storeId: submission.storeId || '',
                    storeName: storeName || '',
                    storeCity: storeCity,
                    certificateUrl: submission.certificateUrl || null,
                    screenshotUrls: [], // Placeholder - implement screenshot storage separately
                };
            })
        );

        return NextResponse.json({
            success: true,
            data: submissionsWithStoreInfo,
            meta: {
                total: submissionsWithStoreInfo.length,
                limit,
                offset,
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
