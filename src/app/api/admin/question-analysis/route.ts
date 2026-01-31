import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Fetch ALL questions from the QuestionBank database first (The Master Answer Key)
        const dbQuestions = await prisma.questionBank.findMany({
            where: { isActive: true },
            select: {
                questionId: true,
                question: true,
                options: true,
                correctAnswer: true,
                category: true
            }
        });

        // Create a quick lookup map for questions
        const questionMap = new Map<number, typeof dbQuestions[0]>();
        dbQuestions.forEach(q => questionMap.set(q.questionId, q));

        // 2. Fetch all test submissions
        const submissions = await prisma.testSubmission.findMany({
            select: {
                id: true,
                phone: true,
                responses: true,
                score: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Initialize question statistics with ALL DB questions (default 0s)
        const questionStats = new Map<number, {
            questionId: number;
            questionText: string;
            totalAttempts: number;
            correctAttempts: number;
            incorrectAttempts: number;
            successRate: number;
            category: string;
        }>();

        // Pre-fill stats for every question in DB
        dbQuestions.forEach(q => {
            questionStats.set(q.questionId, {
                questionId: q.questionId,
                questionText: q.question,
                totalAttempts: 0,
                correctAttempts: 0,
                incorrectAttempts: 0,
                successRate: 0,
                category: q.category || 'Unknown'
            });
        });

        // 3. Process each submission
        submissions.forEach(submission => {
            if (!submission.responses) return;
            const rawResponses = submission.responses as any;

            let normalizedResponses: { questionId: number | string, selectedAnswer: string }[] = [];

            if (Array.isArray(rawResponses)) {
                normalizedResponses = rawResponses.map((r: any) => ({
                    questionId: r.questionId,
                    selectedAnswer: r.selectedAnswer
                }));
            } else if (typeof rawResponses === 'object') {
                // Determine if it's the { responses: [...] } wrapper or direct map
                if (Array.isArray(rawResponses.responses)) {
                    normalizedResponses = rawResponses.responses.map((r: any) => ({
                        questionId: r.questionId,
                        selectedAnswer: r.selectedAnswer
                    }));
                } else {
                    // Assume map { "1": "A", "2": "B" }
                    normalizedResponses = Object.entries(rawResponses).map(([k, v]) => ({
                        questionId: k,
                        selectedAnswer: v as string
                    }));
                }
            }

            // Process normalized responses
            normalizedResponses.forEach(({ questionId, selectedAnswer }) => {
                const qId = Number(questionId);
                if (isNaN(qId)) return;

                const question = questionMap.get(qId);
                // If question not found in DB, skip (might be old deleted question)
                if (!question) return;

                const stats = questionStats.get(qId);
                if (!stats) return;

                stats.totalAttempts++;

                // Check if answer is correct (Case insensitive check just to be safe)
                if (String(selectedAnswer).trim().toUpperCase() === String(question.correctAnswer).trim().toUpperCase()) {
                    stats.correctAttempts++;
                } else {
                    stats.incorrectAttempts++;
                }
            });
        });

        // Calculate success rates after gathering all counts
        questionStats.forEach(stats => {
            if (stats.totalAttempts > 0) {
                stats.successRate = Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
            }
        });

        // Convert to array
        const allQuestions = Array.from(questionStats.values());

        // 4. Return formatted data
        // 4. Return formatted data matching frontend interface
        const formattedQuestions = allQuestions
            .map((q) => {
                const dbData = questionMap.get(q.questionId);
                return {
                    id: q.questionId,
                    text: q.questionText,
                    category: q.category,
                    correctAnswer: dbData?.correctAnswer || '',
                    attempts: q.totalAttempts,
                    correct: q.correctAttempts,
                    incorrect: q.incorrectAttempts,
                    accuracy: q.successRate
                };
            })
            .sort((a, b) => b.attempts - a.attempts); // Sort by popularity by default

        // Calculate top 5 hardest (lowest accuracy, but with at least some attempts)
        const top5Hardest = [...formattedQuestions]
            .filter(q => q.attempts > 0)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);

        return NextResponse.json({
            success: true,
            data: {
                allQuestions: formattedQuestions,
                top5Hardest: top5Hardest
            }
        });

    } catch (error) {
        console.error('Error fetching question analysis:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch question analysis' },
            { status: 500 }
        );
    }
}
