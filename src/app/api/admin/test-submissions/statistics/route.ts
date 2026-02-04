import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/test-submissions/statistics
 * Get aggregated statistics for all test submissions
 * Returns:
 *   - total submissions
 *   - average score
 *   - pass rate
 *   - average completion time
 */
export async function GET(request: NextRequest) {
    try {
        // Use Prisma aggregates for efficient calculation in database
        const [stats, passedCount] = await prisma.$transaction([
            prisma.testSubmission.aggregate({
                _count: {
                    id: true, // Total submissions
                },
                _avg: {
                    score: true, // Average score
                    completionTime: true, // Average completion time
                },
            }),
            prisma.testSubmission.count({
                where: {
                    score: {
                        gte: 80, // Pass threshold
                    },
                },
            }),
        ]);

        const totalSubmissions = stats._count.id;

        if (totalSubmissions === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalSubmissions: 0,
                    averageScore: 0,
                    passRate: 0,
                    averageTime: 0,
                },
            });
        }

        const averageScore = Math.round(stats._avg.score || 0);
        const averageTime = Math.round(stats._avg.completionTime || 0);
        const passRate = Math.round((passedCount / totalSubmissions) * 100);

        return NextResponse.json({
            success: true,
            data: {
                totalSubmissions,
                averageScore,
                passRate,
                averageTime,
            },
        });
    } catch (error) {
        console.error('Error fetching test statistics:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch test statistics',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
