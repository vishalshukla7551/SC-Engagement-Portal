import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const testType = searchParams.get('testType') || 'CERTIFICATION';
        const limit = parseInt(searchParams.get('limit') || '10');

        // Fetch all active questions for the test type
        const [allQuestions, testConfig] = await Promise.all([
            (prisma as any).questionBank.findMany({
                where: {
                    testType,
                    isActive: true
                }
            }),
            (prisma as any).test.findFirst({
                where: { testType: testType }
            })
        ]);

        if (allQuestions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No questions found for this test type'
            }, { status: 404 });
        }

        // Group questions by category
        const categorized: Record<string, any[]> = {};
        allQuestions.forEach((q: any) => {
            const cat = q.category || 'General';
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(q);
        });

        const categories = Object.keys(categorized);
        let selected: any[] = [];
        let remainingPool: any[] = [...allQuestions];

        // 1. Pick one random question from each category
        categories.forEach(cat => {
            const questionsInCat = categorized[cat];
            const randomIndex = Math.floor(Math.random() * questionsInCat.length);
            const picked = questionsInCat[randomIndex];
            selected.push(picked);

            // Remove from remaining pool
            remainingPool = remainingPool.filter(q => q.id !== picked.id);
        });

        // 2. If we need more questions, pick randomly from the remaining pool
        if (selected.length < limit) {
            const extraCount = limit - selected.length;
            const shuffledRemaining = remainingPool.sort(() => 0.5 - Math.random());
            selected = [...selected, ...shuffledRemaining.slice(0, extraCount)];
        } else if (selected.length > limit) {
            // If categories > limit (unlikely but possible), trim to limit
            selected = selected.sort(() => 0.5 - Math.random()).slice(0, limit);
        }

        // 3. Final shuffle so section order isn't predictable
        const finalQuestions = selected.sort(() => 0.5 - Math.random());

        return NextResponse.json({
            success: true,
            data: finalQuestions.map((q: any) => ({
                id: q.questionId,
                questionText: q.question,
                options: q.options.map((opt: string, idx: number) => ({
                    option: String.fromCharCode(65 + idx), // A, B, C, D
                    text: opt.includes(') ') ? opt.split(') ')[1] : opt
                })),
                correctAnswer: q.correctAnswer,
                category: q.category
            })),
            meta: {
                passingPercentage: testConfig?.passingPercentage || 80,
                duration: testConfig?.duration || 15,
                totalQuestions: limit
            }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch questions'
        }, { status: 500 });
    }
}
