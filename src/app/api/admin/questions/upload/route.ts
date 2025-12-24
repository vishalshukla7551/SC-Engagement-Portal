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

        if (!testType) {
            return NextResponse.json({ success: false, message: 'testType is required' }, { status: 400 });
        }

        // 1. Remove existing questions for this test type (Cleans dummy data)
        await (prisma as any).questionBank.deleteMany({
            where: { testType: testType }
        });

        // 2. Prepare questions for bulk creation
        const questionsToCreate = questions.map((q, index) => {
            const options = Array.isArray(q.options)
                ? q.options
                : [q.option1, q.option2, q.option3, q.option4].filter(Boolean);

            return {
                questionId: q.questionId ? parseInt(q.questionId) : (index + 1), // Use provided or sequence
                question: q.question,
                options: options,
                correctAnswer: q.correctAnswer,
                category: q.category || 'General',
                testType: testType,
                isActive: true,
            };
        });

        // 3. Bulk Create
        const createdCount = await (prisma as any).questionBank.createMany({
            data: questionsToCreate
        });

        // 4. Automatically create/update a Test entry for this question bank
        // This ensures it appears in the "Manage Tests" dashboard
        const testName = testType === 'CERTIFICATION' ? 'Samsung Protect Max Certification' : `${testType} Assessment`;
        await (prisma as any).test.upsert({
            where: { testType: testType },
            update: {
                name: testName,
                totalQuestions: Math.min(questions.length, 10), // Default to 10 questions for the actual test
                status: 'ACTIVE'
            },
            create: {
                name: testName,
                testType: testType,
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
            message: `Successfully uploaded ${createdCount.count} questions.`,
            count: createdCount.count
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
