import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const { title, testType, size } = await request.json();

        if (!title) {
            return NextResponse.json({ success: false, message: 'Title is required' }, { status: 400 });
        }

        // Upsert Training Material
        const material = await (prisma as any).trainingMaterial.upsert({
            where: { testType_title: { testType: testType || 'GENERAL', title: title } },
            update: {
                title: title,
                size: size || '1.0 MB',
                isActive: true,
            },
            create: {
                title: title,
                testType: testType || 'GENERAL',
                size: size || '1.0 MB',
                url: '#', // Placeholder
                isActive: true,
            }
        });

        // Also create a "QUIZ" test entry for this training
        // This makes it appear in the Tests list
        const testName = `${title} Quiz`;
        await (prisma as any).test.upsert({
            where: { testType: testType || 'GENERAL' },
            update: {
                name: testName,
                status: 'ACTIVE'
            },
            create: {
                name: testName,
                testType: testType || 'GENERAL',
                type: 'QUIZ',
                totalQuestions: 5, // Default for easy quizzes
                duration: 10,
                passingPercentage: 50,
                status: 'ACTIVE',
                enableProctoring: false // Quizzes usually don't need proctoring
            }
        });

        return NextResponse.json({
            success: true,
            message: `Successfully uploaded training material "${title}"`,
            data: material
        });
    } catch (error) {
        console.error('Error uploading training:', error);
        return NextResponse.json({
            success: false,
            message: 'Failed to upload training material',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const materials = await (prisma as any).trainingMaterial.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ success: true, data: materials });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch materials' }, { status: 500 });
    }
}
