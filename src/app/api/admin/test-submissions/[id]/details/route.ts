import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getQuestionsForPhone, SEC_CERT_QUESTIONS } from '@/lib/testData';

/**
 * GET /api/admin/test-submissions/[id]
 * Get detailed submission data including enriched responses with full question details
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: submissionId } = await params;

        // Fetch the specific submission
        const submission = await prisma.testSubmission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Submission not found' },
                { status: 404 }
            );
        }

        // Get store and SEC info
        const [store, sec] = await Promise.all([
            submission.storeId ? prisma.store.findUnique({
                where: { id: submission.storeId },
                select: { id: true, name: true, city: true }
            }) : null,
            
            // Try to find SEC by phone or ID
            prisma.sEC.findFirst({
                where: {
                    OR: [
                        { phone: submission.phone || '' },
                        { phone: submission.secId || '' },
                        { id: submission.secId || '' }
                    ]
                },
                select: { id: true, phone: true, fullName: true }
            })
        ]);

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
                const questionText = question?.question || response.questionText || response.question || `Question ${response.questionId}`;
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

        return NextResponse.json({
            success: true,
            data: {
                id: submission.id,
                secId: submission.secId || '',
                secName: sec?.fullName || '',
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
                storeName: submission.storeName || store?.name || '',
                storeCity: store?.city || '',
                certificateUrl: submission.certificateUrl || null,
            },
        });
    } catch (error) {
        console.error('Error fetching submission details:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch submission details',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}