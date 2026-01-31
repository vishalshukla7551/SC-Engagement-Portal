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
            const responses = submission.responses as any;

            // Process each response
            Object.entries(responses).forEach(([questionIdStr, answer]) => {
                const questionId = parseInt(questionIdStr);
                const question = questionMap.get(questionId);

                // If question not found in DB, skip (might be old deleted question)
                if (!question) return;

                const stats = questionStats.get(questionId)!;
                stats.totalAttempts++;

                // Check if answer is correct (Case insensitive check just to be safe)
                if (String(answer).trim().toUpperCase() === String(question.correctAnswer).trim().toUpperCase()) {
                    stats.correctAttempts++;
                } else {
                    stats.incorrectAttempts++;
                }

                // Calculate success rate
                if (stats.totalAttempts > 0) {
                    stats.successRate = Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
                }
            });
        });

        // Convert to array
        const allQuestions = Array.from(questionStats.values());

        // 4. Return formatted data
        return NextResponse.json({
            success: true,
            data: allQuestions
                .sort((a, b) => {
                    // Sort by attempts (desc) then by question ID
                    if (b.totalAttempts !== a.totalAttempts) return b.totalAttempts - a.totalAttempts;
                    return a.questionId - b.questionId;
                })
                .map((q) => {
                    // Find database data for options
                    const dbData = questionMap.get(q.questionId);

                    // Format options if available
                    const formattedOptions = dbData ? dbData.options.map((optString: string) => {
                        const parts = optString.split(') ');
                        const optLetter = parts[0].trim(); // "A"
                        const optText = parts.slice(1).join(') ').trim(); // "Rest of text"

                        return {
                            option: optLetter,
                            text: optText || optString, // Fallback if split fails
                            selectedCount: 0, // Placeholder
                            isCorrect: dbData.correctAnswer === optLetter
                        };
                    }) : [];

                    return {
                        id: `q-${q.questionId}`,
                        questionNumber: q.questionId,
                        questionText: q.questionText,
                        // If 0 attempts, show 0% for both correct and wrong
                        correctPercentage: q.totalAttempts > 0 ? q.successRate : 0,
                        wrongPercentage: q.totalAttempts > 0 ? (100 - q.successRate) : 0,
                        totalAttempts: q.totalAttempts,
                        mostSelectedWrongOption: '-',
                        options: formattedOptions
                    };
                })
        });

    } catch (error) {
        console.error('Error fetching question analysis:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch question analysis' },
            { status: 500 }
        );
    }
}
