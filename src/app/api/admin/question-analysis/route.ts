import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SEC_CERT_QUESTIONS, allSamsungQuestions } from '@/lib/testData';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // 1. Fetch all submissions
        const submissions = await prisma.testSubmission.findMany({
            select: { responses: true }
        });

        // 2. Fetch all dynamic questions from DB
        const dbQuestions = await prisma.questionBank.findMany();

        // 3. Create a master map of all known questions for lookup
        const questionMap = new Map<string, any>();

        // Add static questions
        [...SEC_CERT_QUESTIONS, ...allSamsungQuestions].forEach(q => {
            questionMap.set(String(q.id), {
                id: q.id,
                text: q.question,
                correctAnswer: q.correctAnswer,
                options: q.options
            });
        });

        // Add correct answers from DB questions
        dbQuestions.forEach(q => {
            questionMap.set(String(q.questionId), {
                id: q.questionId,
                text: q.question,
                correctAnswer: q.correctAnswer,
                options: q.options
            });
        });

        // 4. Analysis Data Structures
        const stats = new Map<string, {
            id: string;
            text: string;
            totalAttempts: number;
            correctCount: number;
            wrongCounts: Record<string, number>; // Option -> Count
        }>();

        // 5. Process Submissions
        for (const sub of submissions) {
            let rawResponses = sub.responses as any;

            // Normalize response format
            if (typeof rawResponses === 'string') {
                try {
                    rawResponses = JSON.parse(rawResponses);
                } catch { rawResponses = []; }
            }

            if (rawResponses && !Array.isArray(rawResponses) && Array.isArray(rawResponses.responses)) {
                rawResponses = rawResponses.responses;
            } else if (rawResponses && !Array.isArray(rawResponses) && typeof rawResponses === 'object') {
                rawResponses = Object.entries(rawResponses).map(([k, v]) => ({ questionId: k, selectedAnswer: v }));
            }

            if (!Array.isArray(rawResponses)) continue;

            for (const resp of rawResponses) {
                const qId = String(resp.questionId);
                const selected = resp.selectedAnswer;

                // Initialize stats for this question if new
                if (!stats.has(qId)) {
                    // 1. Try to get text from the response itself (Best source of truth for what user saw)
                    let displayText = resp.questionText;

                    // 2. If response text missing/generic, try the master map
                    if (!displayText || displayText === 'Question details unavailable') {
                        const qData = questionMap.get(qId);
                        if (qData) {
                            displayText = qData.text;
                        }
                    }

                    // 3. Last resort: Try ID-1000 fallback lookup
                    if ((!displayText || displayText === 'Question details unavailable') && Number(qId) > 1000) {
                        const fallbackId = String(Number(qId) - 1000);
                        const fallbackQ = questionMap.get(fallbackId);
                        if (fallbackQ) {
                            displayText = fallbackQ.text;
                            // Note: We keep the original qId for the key to separate "1001" from "1" if they are legally different, 
                            // unless we want to merge them. Given user "uploaded new questions", merging might be wrong if 1001 is new and 1 is old.
                            // Let's rely on the text we found.
                        }
                    }

                    // 4. Ultimate fallback
                    if (!displayText) {
                        displayText = `Question ${qId}`;
                    }

                    stats.set(qId, {
                        id: qId,
                        text: displayText,
                        totalAttempts: 0,
                        correctCount: 0,
                        wrongCounts: {}
                    });
                } else {
                    // Update text if we have a better version from a new response
                    const currentEntry = stats.get(qId)!;
                    if ((currentEntry.text === `Question ${qId}` || currentEntry.text === 'Question details unavailable') && resp.questionText) {
                        currentEntry.text = resp.questionText;
                    }
                }

                // Get the entry
                const entry = stats.get(qId);
                if (!entry) continue;

                entry.totalAttempts++;

                // Determine correctness
                // 1. Check if `isCorrect` is already stored (Primary Truth)
                let isCorrect = resp.isCorrect;

                // 2. If not, check against known correct answer from Map
                if (typeof isCorrect !== 'boolean') {
                    const qData = questionMap.get(qId);
                    if (qData) {
                        isCorrect = selected === qData.correctAnswer;
                    } else if (Number(qId) > 1000) {
                        // Try fallback ID for correctness check
                        const fallbackQ = questionMap.get(String(Number(qId) - 1000));
                        if (fallbackQ) {
                            isCorrect = selected === fallbackQ.correctAnswer;
                        }
                    }
                }

                if (isCorrect) {
                    entry.correctCount++;
                } else {
                    // Track wrong answer
                    if (selected) {
                        entry.wrongCounts[selected] = (entry.wrongCounts[selected] || 0) + 1;
                    }
                }
            }
        }

        // 6. Final Calculation
        const questionStats = Array.from(stats.values()).map(s => {
            const correctPct = s.totalAttempts > 0
                ? Math.round((s.correctCount / s.totalAttempts) * 100)
                : 0;

            // Find most wrong answer
            let mostWrongAnswer = '-';
            let maxCount = 0;
            for (const [opt, count] of Object.entries(s.wrongCounts)) {
                if (count > maxCount) {
                    maxCount = count;
                    mostWrongAnswer = opt; // e.g. "B" or "Option B"
                }
            }

            // Format option if it's just a letter "A" -> "Option A"
            if (mostWrongAnswer.length === 1 && /[A-Z]/.test(mostWrongAnswer)) {
                mostWrongAnswer = `Option ${mostWrongAnswer}`;
            }

            return {
                id: s.id,
                text: s.text.length > 80 ? s.text.substring(0, 80) + '...' : s.text,
                fullText: s.text,
                totalAttempts: s.totalAttempts,
                correctPercentage: correctPct,
                wrongPercentage: 100 - correctPct,
                mostWrongAnswer
            };
        });

        // 7. Sort by difficulty (lowest correct % first)
        questionStats.sort((a, b) => a.correctPercentage - b.correctPercentage);

        // 8. Global Insights
        const validQuestions = questionStats.filter(q => q.totalAttempts > 0);

        let avgAccuracy = 0;
        if (validQuestions.length > 0) {
            const sumAccuracy = validQuestions.reduce((acc, q) => acc + q.correctPercentage, 0);
            avgAccuracy = Math.round(sumAccuracy / validQuestions.length);
        }

        const summary = {
            totalQuestions: validQuestions.length,
            avgAccuracy,
            easiestQuestion: validQuestions.length > 0
                ? validQuestions.reduce((prev, curr) => prev.correctPercentage > curr.correctPercentage ? prev : curr)
                : null,
            hardestQuestion: validQuestions.length > 0
                ? validQuestions[0] // Since it's sorted ascending by accuracy
                : null
        };

        return NextResponse.json({
            success: true,
            summary,
            questions: questionStats, // Table data
            topDifficult: questionStats.slice(0, 5) // Top 5 hardest
        });

    } catch (error) {
        console.error('Error in question analysis:', error);
        return NextResponse.json({ success: false, message: 'Analysis failed' }, { status: 500 });
    }
}
