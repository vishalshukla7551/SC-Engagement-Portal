import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const tests = await (prisma as any).test.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json({ success: true, data: tests });
    } catch (error) {
        return NextResponse.json({ success: false, message: 'Failed to fetch tests' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const newTest = await (prisma as any).test.create({
            data: {
                name: data.name,
                description: data.description,
                type: data.type,
                totalQuestions: data.totalQuestions || 10,
                duration: data.duration,
                maxAttempts: data.maxAttempts,
                passingPercentage: data.passingPercentage,
                status: data.status,
                enableProctoring: data.enableProctoring,
                testType: data.testType || 'GENERAL',
                startDate: data.startDate ? new Date(data.startDate) : null,
                endDate: data.endDate ? new Date(data.endDate) : null,
            },
        });
        return NextResponse.json({ success: true, data: newTest });
    } catch (error) {
        console.error('Error creating test:', error);
        return NextResponse.json({ success: false, message: 'Failed to create test' }, { status: 500 });
    }
}
