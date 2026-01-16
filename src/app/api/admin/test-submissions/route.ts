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

                // Enrich responses with question data
                let rawResponses = submission.responses as any;

                // Handle case where parsing is needed or format is non-standard
                if (typeof rawResponses === 'string') {
                    try {
                        rawResponses = JSON.parse(rawResponses);
                    } catch (e) {
                         rawResponses = [];
                    }
                }
                
                // Handle nested object structure
                if (rawResponses && !Array.isArray(rawResponses) && Array.isArray(rawResponses.responses)) {
                    rawResponses = rawResponses.responses;
                } else if (rawResponses && !Array.isArray(rawResponses) && typeof rawResponses === 'object') {
                    // Handle direct key-value map: { "1": "A", "2": "C" }
                    rawResponses = Object.entries(rawResponses).map(([qId, selectedAnswer]) => ({
                        questionId: qId,
                        selectedAnswer: selectedAnswer
                    }));
                }

                // Fetch dynamic questions from DB if needed
                let dbQuestions: any[] = [];
                if (Array.isArray(rawResponses)) {
                    const questionIds = rawResponses
                        .map((r: any) => {
                            const id = Number(r.questionId);
                            return isNaN(id) ? null : id;
                        })
                        .filter((id) => id !== null);

                    if (questionIds.length > 0) {
                        const dbRawQuestions = await prisma.questionBank.findMany({
                            where: { questionId: { in: questionIds } }
                        });
                        
                        dbQuestions = dbRawQuestions.map(q => ({
                            id: q.questionId,
                            question: q.question,
                            options: q.options,
                            correctAnswer: q.correctAnswer,
                            category: q.category || 'Dynamic'
                        }));
                    }
                }

                // Update possible questions pool
                const allPossibleQuestions = isCertTest
                    ? [...dbQuestions, ...SEC_CERT_QUESTIONS, ...standardQuestions]
                    : [...dbQuestions, ...standardQuestions, ...SEC_CERT_QUESTIONS];

                let enrichedResponses: any[] = [];

                if (Array.isArray(rawResponses)) {
                    enrichedResponses = rawResponses.map((response: any, index: number) => {
                        let question = allPossibleQuestions.find(
                            (q) => String(q.id) === String(response.questionId)
                        );
                        
                        // Fallback: If question not found and ID > 1000, try subtracting 1000
                        if (!question && !isNaN(Number(response.questionId)) && Number(response.questionId) > 1000) {
                            question = allPossibleQuestions.find(
                                (q) => String(q.id) === String(Number(response.questionId) - 1000)
                            );
                        }

                        // Fallback values if question is still missing
                        const questionText = question?.question || response.questionText || response.question || 'Question details unavailable';
                        const options = question?.options || response.options || [];
                        const correctAnswer = question?.correctAnswer || response.correctAnswer || '';
                        
                        return {
                            questionNumber: index + 1,
                            questionId: response.questionId,
                            selectedAnswer: response.selectedAnswer,
                            questionText,
                            options,
                            correctAnswer,
                            isCorrect: question
                                ? response.selectedAnswer === question.correctAnswer
                                : (response.isCorrect || response.selectedAnswer === correctAnswer),
                            category: question?.category || 'Unknown'
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
