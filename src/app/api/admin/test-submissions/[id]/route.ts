import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuestionsForPhone, SEC_CERT_QUESTIONS } from '@/lib/testData';

/**
 * GET /api/admin/test-submissions/[id]
 * Fetch a specific test submission with full answer details
 * Shows which questions were answered correctly/incorrectly
 */
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Fetch submission from database
        const submission = await prisma.testSubmission.findUnique({
            where: { id },
        });

        if (!submission) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Test submission not found',
                },
                { status: 404 }
            );
        }

        // Fetch store information if available
        let storeName = submission.storeName;
        let storeCity = '';

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

        // Enrich responses with question details
        let rawResponses = submission.responses as any;

        // Handle case where responses might be stringified JSON
        if (typeof rawResponses === 'string') {
            try {
                rawResponses = JSON.parse(rawResponses);
            } catch (e) {
                console.error('Error parsing responses JSON:', e);
                rawResponses = [];
            }
        }

        // Handle case where responses is a direct key-value map
        if (rawResponses && !Array.isArray(rawResponses) && typeof rawResponses === 'object') {
            rawResponses = Object.entries(rawResponses).map(([key, value]) => ({
                questionId: key,
                selectedAnswer: value
            }));
        }

        // Fetch dynamic questions from DB based on IDs in responses
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
                    where: {
                        questionId: { in: questionIds }
                    }
                });

                // Map DB questions to match the Question interface expected by the frontend
                dbQuestions = dbRawQuestions.map(q => ({
                    id: q.questionId,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    category: q.category || 'Dynamic'
                }));
            }
        }

        // Prioritize bank based on test type to avoid ID collisions (1, 2, 3...)
        const allPossibleQuestions = isCertTest
            ? [...dbQuestions, ...SEC_CERT_QUESTIONS, ...standardQuestions]
            : [...dbQuestions, ...standardQuestions, ...SEC_CERT_QUESTIONS];

        let enrichedResponses: any[] = [];

        if (Array.isArray(rawResponses)) {
            enrichedResponses = rawResponses.map((response: any, index: number) => {
                let question = allPossibleQuestions.find(
                    (q) => String(q.id) === String(response.questionId)
                );

                // Fallback: If question not found and ID > 1000, try subtracting 1000 (e.g. 1001 -> 1)
                if (!question && !isNaN(Number(response.questionId)) && Number(response.questionId) > 1000) {
                    question = allPossibleQuestions.find(
                        (q) => String(q.id) === String(Number(response.questionId) - 1000)
                    );
                }

                const selectedAnswer = response.selectedAnswer || '';

                // Fallback to data in the response object itself if static lookup fails
                const questionText = question?.question || response.questionText || response.question || 'Question not found';
                const options = question?.options || response.options || [];
                const correctAnswer = question?.correctAnswer || response.correctAnswer || '';
                const category = question?.category || response.category || 'Unknown';

                // Calculate correctness with fallback steps
                let isCorrect = false;
                if (question) {
                    // 1. Trust the static master question if found
                    isCorrect = selectedAnswer === question.correctAnswer;
                } else if (typeof response.isCorrect === 'boolean') {
                    // 2. Trust the pre-calculated result stored in DB
                    isCorrect = response.isCorrect;
                } else if (correctAnswer) {
                    // 3. Compare with the stored correct answer
                    isCorrect = selectedAnswer === correctAnswer;
                }

                return {
                    questionNumber: index + 1,
                    questionId: response.questionId,
                    questionText,
                    options,
                    selectedAnswer,
                    correctAnswer,
                    isCorrect,
                    category,
                };
            });
        }

        // Calculate correct and wrong counts
        const correctCount = enrichedResponses.filter((r) => r.isCorrect).length;
        const wrongCount = enrichedResponses.filter((r) => !r.isCorrect).length;

        const result = {
            id: submission.id,
            secId: submission.secId || '',
            phone: submission.phone || submission.secId || '',
            sessionToken: submission.sessionToken || '',
            testName: submission.testName || 'Samsung Protect Max Certification',
            score: submission.score,
            totalQuestions: submission.totalQuestions,
            completionTime: submission.completionTime,
            submittedAt: submission.createdAt.toISOString(),
            isProctoringFlagged: submission.isProctoringFlagged,
            storeId: submission.storeId || '',
            storeName: storeName || 'Unknown Store',
            storeCity: storeCity,
            status: submission.score >= 60 ? 'PASS' : 'FAIL',
            correctAnswers: correctCount,
            wrongAnswers: wrongCount,
            certificateUrl: submission.certificateUrl || null,
            responses: enrichedResponses,
        };

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        console.error('Error fetching test submission:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch test submission',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
