import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/test-submissions/completion-time-stats
 * Get detailed completion time statistics for test submissions
 * Query params:
 *   - startDate: Optional start date filter (YYYY-MM-DD)
 *   - endDate: Optional end date filter (YYYY-MM-DD)
 *   - testType: Optional test type filter
 *   - storeId: Optional store filter
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const testType = searchParams.get('testType');
        const storeId = searchParams.get('storeId');

        // Build query filters
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};

        // Date range filter
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate + 'T00:00:00.000Z');
            }
            if (endDate) {
                where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
            }
        }

        // Test type filter
        if (testType) {
            where.testName = {
                contains: testType,
                mode: 'insensitive'
            };
        }

        // Store filter
        if (storeId) {
            where.storeId = storeId;
        }

        // Fetch submissions with completion time data
        const submissions = await prisma.testSubmission.findMany({
            where,
            select: {
                id: true,
                secId: true,
                score: true,
                completionTime: true,
                testName: true,
                storeId: true,
                storeName: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        if (submissions.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    totalSubmissions: 0,
                    averageTime: 0,
                    medianTime: 0,
                    minTime: 0,
                    maxTime: 0,
                    timeDistribution: {
                        under5min: 0,
                        between5and10min: 0,
                        between10and15min: 0,
                        over15min: 0,
                    },
                    scoreVsTimeCorrelation: [],
                    submissions: [],
                },
            });
        }

        // Calculate statistics
        const totalSubmissions = submissions.length;
        const completionTimes = submissions.map(s => s.completionTime).sort((a, b) => a - b);
        
        const totalTime = completionTimes.reduce((sum, time) => sum + time, 0);
        const averageTime = Math.round(totalTime / totalSubmissions);
        
        // Calculate median
        const medianTime = completionTimes.length % 2 === 0
            ? Math.round((completionTimes[completionTimes.length / 2 - 1] + completionTimes[completionTimes.length / 2]) / 2)
            : completionTimes[Math.floor(completionTimes.length / 2)];
        
        const minTime = completionTimes[0];
        const maxTime = completionTimes[completionTimes.length - 1];

        // Time distribution
        const timeDistribution = {
            under5min: completionTimes.filter(t => t < 300).length,
            between5and10min: completionTimes.filter(t => t >= 300 && t < 600).length,
            between10and15min: completionTimes.filter(t => t >= 600 && t < 900).length,
            over15min: completionTimes.filter(t => t >= 900).length,
        };

        // Score vs Time correlation data (for charts)
        const scoreVsTimeCorrelation = submissions.map(s => ({
            score: s.score,
            completionTime: s.completionTime,
            testName: s.testName,
        }));

        // Format submissions for detailed view
        const formattedSubmissions = submissions.map(s => ({
            id: s.id,
            secId: s.secId,
            score: s.score,
            completionTime: s.completionTime,
            completionTimeFormatted: `${Math.floor(s.completionTime / 60)}m ${s.completionTime % 60}s`,
            testName: s.testName,
            storeName: s.storeName,
            submittedAt: s.createdAt.toISOString(),
        }));

        return NextResponse.json({
            success: true,
            data: {
                totalSubmissions,
                averageTime,
                averageTimeFormatted: `${Math.floor(averageTime / 60)}m ${averageTime % 60}s`,
                medianTime,
                medianTimeFormatted: `${Math.floor(medianTime / 60)}m ${medianTime % 60}s`,
                minTime,
                minTimeFormatted: `${Math.floor(minTime / 60)}m ${minTime % 60}s`,
                maxTime,
                maxTimeFormatted: `${Math.floor(maxTime / 60)}m ${maxTime % 60}s`,
                timeDistribution,
                scoreVsTimeCorrelation,
                submissions: formattedSubmissions,
            },
        });
    } catch (error) {
        console.error('Error fetching completion time statistics:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch completion time statistics',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}