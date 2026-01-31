import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/test-submissions/[id]
 * Get detailed submission data by fetching questions directly from QuestionBank
 * based on the IDs present in the user's submission.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: submissionId } = await params;

        // 1. Fetch the specific submission
        const submission = await prisma.testSubmission.findUnique({
            where: { id: submissionId },
        });

        if (!submission) {
            return NextResponse.json(
                { success: false, message: 'Submission not found' },
                { status: 404 }
            );
        }

        // 2. Fetch related store and SEC info for display
        const [store, sec] = await Promise.all([
            submission.storeId ? prisma.store.findUnique({
                where: { id: submission.storeId },
                select: { id: true, name: true, city: true }
            }) : null,

            prisma.sEC.findFirst({
                where: {
                    OR: [
                        { phone: submission.phone || '' },
                        { phone: submission.secId || '' },
                        // specific check for employeeId if secId is not a phone number
                        { employeeId: submission.secId || '' }
                    ]
                },
                select: { id: true, phone: true, fullName: true }
            })
        ]);

        // 3. Normalize responses to an array of { questionId, selectedAnswer }
        let parsedResponses: { questionId: string | number, selectedAnswer: string }[] = [];
        let rawResponses = submission.responses as any;

        // If it's a string, try to parse it
        if (typeof rawResponses === 'string') {
            try {
                rawResponses = JSON.parse(rawResponses);
            } catch (e) {
                console.error("Failed to parse responses string", e);
                rawResponses = {};
            }
        }

        if (Array.isArray(rawResponses)) {
            // Already an array (e.g. [{questionId: 1, selectedAnswer: 'A'}])
            parsedResponses = rawResponses;
        } else if (rawResponses && typeof rawResponses === 'object') {
            // Check if it's nested like { responses: [...] } or { answers: [...] }
            if (Array.isArray(rawResponses.responses)) {
                parsedResponses = rawResponses.responses;
            } else if (Array.isArray(rawResponses.answers)) {
                parsedResponses = rawResponses.answers;
            } else {
                // Assume it's a map: { "101": "A", "102": "B" }
                parsedResponses = Object.entries(rawResponses).map(([qId, answer]) => ({
                    questionId: qId,
                    selectedAnswer: String(answer)
                }));
            }
        }

        // 4. Extract Question IDs to fetch from DB
        // We convert everything to numbers because QuestionBank.questionId is Int
        const questionIdsToFetch = parsedResponses
            .map(r => Number(r.questionId))
            .filter(id => !isNaN(id));

        let dbQuestions: any[] = [];
        if (questionIdsToFetch.length > 0) {
            dbQuestions = await prisma.questionBank.findMany({
                where: {
                    questionId: { in: questionIdsToFetch }
                }
            });
        }

        // 5. Enrich the responses with question text, options, and correct answers
        const enrichedResponses = parsedResponses.map((response, index) => {
            const resultQuestionId = Number(response.questionId);

            // Find the question in our DB results
            const questionData = dbQuestions.find(q => q.questionId === resultQuestionId);

            // Construct the enriched object
            return {
                questionNumber: index + 1,
                questionId: response.questionId,
                selectedAnswer: response.selectedAnswer,
                questionText: questionData?.question || `Question ${response.questionId}`,
                options: questionData?.options || [],
                correctAnswer: questionData?.correctAnswer || '',
                // Determine correctness: compare normalized strings
                isCorrect: questionData
                    ? String(response.selectedAnswer).trim().toUpperCase() === String(questionData.correctAnswer).trim().toUpperCase()
                    : false,
                category: questionData?.category || 'Unknown'
            };
        });

        // 6. Return the formatted response
        return NextResponse.json({
            success: true,
            data: {
                id: submission.id,
                secId: submission.secId || '',
                secName: sec?.fullName || '',
                phone: submission.phone || submission.secId || '',
                sessionToken: submission.sessionToken || '',
                testName: submission.testName || 'Test Details',
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