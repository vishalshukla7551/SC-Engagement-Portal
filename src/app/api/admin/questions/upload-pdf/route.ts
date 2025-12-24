import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import pdf from 'pdf-parse';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const testType = formData.get('testType') as string || 'CERTIFICATION';

        if (!file) {
            return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const data = await pdf(buffer);
        const text = data.text;

        const questions: any[] = [];
        const lines = text.split('\n').filter(l => l.trim());

        let currentCategory = 'General';
        let currentQ: any = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();

            // Detect Category/Section
            if (line.toLowerCase().includes('section')) {
                currentCategory = line.replace(/[\[\]]/g, '').trim();
                continue;
            }

            // Detect Question: Starts with a number followed by a dot
            const qMatch = line.match(/^(\d+)\.\s*(.*)/);
            if (qMatch) {
                if (currentQ && currentQ.options.length > 0) questions.push(currentQ);
                currentQ = {
                    question: qMatch[2].trim(),
                    options: [],
                    category: currentCategory,
                    testType: testType,
                    correctAnswer: ''
                };
                continue;
            }

            // Detect Options: A) B) C) D) or just A. B. C. D.
            const optMatch = line.match(/^([A-D])[\)|.]\s*(.*)/);
            if (optMatch && currentQ) {
                currentQ.options.push(line.trim());
                continue;
            }

            // Detect Answer
            if (line.toLowerCase().includes('answer:') && currentQ) {
                const ansMatch = line.match(/answer:\s*([A-D])/i);
                if (ansMatch) {
                    currentQ.correctAnswer = ansMatch[1].toUpperCase();
                }
            }

            // Handle multi-line options or questions if needed (simplified for now)
        }
        if (currentQ && currentQ.options.length > 0) questions.push(currentQ);

        if (questions.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No questions could be parsed from the PDF. Please check the format.'
            }, { status: 422 });
        }

        // Clean and Save
        await (prisma as any).questionBank.deleteMany({
            where: { testType: testType }
        });

        await (prisma as any).questionBank.createMany({
            data: questions.map((q, i) => ({
                questionId: 2000 + i,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                category: q.category,
                testType: testType,
                isActive: true
            }))
        });

        // Update Test entry
        const testName = testType === 'CERTIFICATION' ? 'Samsung Protect Max Certification' : `${testType} Assessment`;
        await (prisma as any).test.upsert({
            where: { testType: testType },
            update: {
                name: testName,
                totalQuestions: Math.min(questions.length, 10),
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
            message: `Successfully sync ${questions.length} questions from PDF.`,
            count: questions.length
        });

    } catch (error) {
        console.error('PDF Upload Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error during PDF processing',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
