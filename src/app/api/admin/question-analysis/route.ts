import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // 1. Fetch all questions to build a lookup map
        const allQuestions = await (prisma as any).questionBank.findMany({
            where: { isActive: true },
            select: {
                questionId: true,
                question: true,
                correctAnswer: true,
                category: true,
                options: true, // Need options to build the breakdown
            }
        });

        // Map: questionId -> { details, stats, optionCounts }
        const questionMap = new Map();
        allQuestions.forEach((q: any) => {
            // Initialize option counts
            const optionCounts: Record<string, number> = {};

            // Parse options if they are strings like "A) Text"
            const parsedOptions = (q.options || []).map((optStr: string) => {
                let optionChar = '';
                let optionText = optStr;

                // Try to extract "A) " or "A. " pattern
                const match = optStr.match(/^([A-Z])[\)\.]\s+(.*)/);
                if (match) {
                    optionChar = match[1];
                    optionText = match[2];
                } else {
                    // Fallback if just "Option Text", assign fictional letters if needed or handle otherwise
                    // For now assuming A, B, C, D based on index if pattern fails is risky but check
                }

                if (optionChar) optionCounts[optionChar] = 0;

                return {
                    original: optStr,
                    char: optionChar,
                    text: optionText
                };
            });

            // Also ensure A, B, C, D exist in counts if standard
            ['A', 'B', 'C', 'D'].forEach(char => {
                if (optionCounts[char] === undefined) optionCounts[char] = 0;
            });

            questionMap.set(String(q.questionId), {
                id: String(q.questionId),
                questionNumber: q.questionId,
                questionText: q.question,
                category: q.category,
                correctAnswer: q.correctAnswer,
                totalAttempts: 0,
                correctCount: 0,
                incorrectCount: 0,
                optionCounts: optionCounts,
                parsedOptions: parsedOptions
            });
        });

        // 2. Fetch all test submissions with responses
        const submissions = await (prisma as any).testSubmission.findMany({
            select: {
                responses: true,
            }
        });

        // 3. Aggregate statistics
        submissions.forEach((submission: any) => {
            if (!submission.responses || !Array.isArray(submission.responses)) return;

            submission.responses.forEach((response: any) => {
                const qId = String(response.questionId);
                const stats = questionMap.get(qId);

                if (stats) {
                    stats.totalAttempts++;

                    const selected = response.selectedAnswer; // e.g., "A"
                    if (stats.optionCounts[selected] !== undefined) {
                        stats.optionCounts[selected]++;
                    }

                    // Use isCorrect flag if available
                    const isCorrect = response.isCorrect === true || response.isCorrect === 'true';

                    if (isCorrect) {
                        stats.correctCount++;
                    } else {
                        stats.incorrectCount++;
                    }
                }
            });
        });

        // 4. Transform to final format matches UI expectations roughly
        const analysisResults = Array.from(questionMap.values())
            .map((item) => {
                const correctPercentage = item.totalAttempts > 0
                    ? Math.round((item.correctCount / item.totalAttempts) * 100)
                    : 0;

                const wrongPercentage = item.totalAttempts > 0
                    ? 100 - correctPercentage
                    : 0;

                // Find most selected wrong option
                let mostSelectedWrongOption = '-';
                let maxWrongCount = -1;

                Object.entries(item.optionCounts).forEach(([opt, count]) => {
                    if (opt !== item.correctAnswer && (count as number) > maxWrongCount) {
                        maxWrongCount = (count as number);
                        mostSelectedWrongOption = opt;
                    }
                });

                // Format options for UI
                const optionsFormatted = item.parsedOptions.map((pOpt: any) => {
                    const count = item.optionCounts[pOpt.char] || 0;
                    return {
                        option: pOpt.char,
                        text: pOpt.text,
                        selectedCount: item.totalAttempts > 0 ? Math.round((count / item.totalAttempts) * 100) : 0, // Sending percentage as 'selectedCount' for UI compatibility or raw count?
                        // UI expects 'selectedCount' to be displayed as percentage in one place: "{opt.selectedCount}%"
                        // But logical structure might imply count. 
                        // Looking at existing UI: <div className="font-bold text-gray-900">{opt.selectedCount}%</div>
                        // So it expects percentage.
                        isCorrect: pOpt.char === item.correctAnswer
                    };
                });

                return {
                    id: item.id,
                    questionNumber: item.questionNumber,
                    questionText: item.questionText,
                    correctPercentage,
                    wrongPercentage,
                    totalAttempts: item.totalAttempts,
                    mostSelectedWrongOption,
                    options: optionsFormatted
                };
            })
            .sort((a, b) => a.correctPercentage - b.correctPercentage); // Hardest first (lowest correct %)

        return NextResponse.json({
            success: true,
            data: analysisResults
        });

    } catch (error) {
        console.error('Error fetching question analysis:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch question analysis data' },
            { status: 500 }
        );
    }
}
