import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { questions, testType } = await request.json();

        if (!Array.isArray(questions) || questions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No questions provided'
            }, { status: 400 });
        }

        // Optional: Clear existing questions for this testType if needed
        // await prisma.questionBank.deleteMany({ where: { testType } });

        const createdQuestions = await Promise.all(
            questions.map(q => {
                // Ensure options is an array
                const options = Array.isArray(q.options)
                    ? q.options
                    : [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

                return (prisma as any).questionBank.upsert({
                    where: { questionId: parseInt(q.questionId) },
                    update: {
                        question: q.question,
                        options: options,
                        correctAnswer: q.correctAnswer,
                        category: q.category || 'General',
                        testType: testType || 'GENERAL',
                        isActive: true,
                    },
                    create: {
                        questionId: parseInt(q.questionId),
                        question: q.question,
                        options: options,
                        correctAnswer: q.correctAnswer,
                        category: q.category || 'General',
                        testType: testType || 'GENERAL',
                        isActive: true,
                    }
                });
            })
        );

        // Automatically create/update a Test entry for this question bank
        const testName = testType === 'CERTIFICATION' ? 'Samsung Protect Max Certification' : `${testType} Assessment`;
        await (prisma as any).test.upsert({
            where: { testType: testType || 'GENERAL' },
            update: {
                name: testName,
                totalQuestions: Math.min(questions.length, 10),
                status: 'ACTIVE'
            },
            create: {
                name: testName,
                testType: testType || 'GENERAL',
                type: 'ASSESSMENT',
                totalQuestions: Math.min(questions.length, 10),
                duration: 15,
                passingPercentage: 60,
                status: 'ACTIVE',
                enableProctoring: true
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded ${createdQuestions.length} questions.`,
            count: createdQuestions.length
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to upload questions',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
