import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const testType = searchParams.get('testType') || 'CERTIFICATION';
        const limit = parseInt(searchParams.get('limit') || '10');

        // Fetch all active questions for the test type
        const allQuestions = await (prisma as any).questionBank.findMany({
            where: {
                testType,
                isActive: true
            }
        });

        if (allQuestions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No questions found in the bank'
            }, { status: 404 });
        }

        // Shuffle and pick
        const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, Math.min(limit, allQuestions.length));

        return NextResponse.json({
            success: true,
            data: selected.map((q: any) => ({
                id: q.questionId,
                questionText: q.question,
                options: q.options.map((opt: string, idx: number) => ({
                    option: String.fromCharCode(65 + idx), // A, B, C, D
                    text: opt.includes(') ') ? opt.split(') ')[1] : opt
                })),
                correctAnswer: q.correctAnswer,
                category: q.category
            }))
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to fetch questions'
        }, { status: 500 });
    }
}
