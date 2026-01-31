import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/test-submissions/time-trends
 * Get completion time trends over time for analytics
 * Query params:
 *   - period: 'daily' | 'weekly' | 'monthly' (default: 'daily')
 *   - days: number of days to look back (default: 30)
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const period = searchParams.get('period') || 'daily';
        const days = parseInt(searchParams.get('days') || '30');

        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // Fetch submissions within date range
        const submissions = await prisma.testSubmission.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            select: {
                completionTime: true,
                score: true,
                createdAt: true,
                testName: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        if (submissions.length === 0) {
            return NextResponse.json({
                success: true,
                data: {
                    trends: [],
                    summary: {
                        totalSubmissions: 0,
                        averageTime: 0,
                        timeImprovement: 0,
                    },
                },
            });
        }

        // Group submissions by period
        const groupedData = new Map<string, { times: number[]; scores: number[]; count: number }>();

        submissions.forEach(submission => {
            let periodKey: string;
            const date = new Date(submission.createdAt);

            switch (period) {
                case 'weekly':
                    // Get week start (Monday)
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay() + 1);
                    periodKey = weekStart.toISOString().split('T')[0];
                    break;
                case 'monthly':
                    periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    break;
                default: // daily
                    periodKey = date.toISOString().split('T')[0];
                    break;
            }

            if (!groupedData.has(periodKey)) {
                groupedData.set(periodKey, { times: [], scores: [], count: 0 });
            }

            const group = groupedData.get(periodKey)!;
            group.times.push(submission.completionTime);
            group.scores.push(submission.score);
            group.count++;
        });

        // Calculate trends
        const trends = Array.from(groupedData.entries()).map(([periodKey, data]) => {
            const averageTime = Math.round(data.times.reduce((sum, time) => sum + time, 0) / data.times.length);
            const averageScore = Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length);
            
            return {
                period: periodKey,
                averageTime,
                averageTimeFormatted: `${Math.floor(averageTime / 60)}m ${averageTime % 60}s`,
                averageScore,
                submissionCount: data.count,
                minTime: Math.min(...data.times),
                maxTime: Math.max(...data.times),
            };
        }).sort((a, b) => a.period.localeCompare(b.period));

        // Calculate overall summary
        const allTimes = submissions.map(s => s.completionTime);
        const totalSubmissions = submissions.length;
        const averageTime = Math.round(allTimes.reduce((sum, time) => sum + time, 0) / totalSubmissions);

        // Calculate time improvement (compare first half vs second half of period)
        const midPoint = Math.floor(submissions.length / 2);
        const firstHalfAvg = submissions.slice(0, midPoint).reduce((sum, s) => sum + s.completionTime, 0) / midPoint;
        const secondHalfAvg = submissions.slice(midPoint).reduce((sum, s) => sum + s.completionTime, 0) / (submissions.length - midPoint);
        const timeImprovement = Math.round(((firstHalfAvg - secondHalfAvg) / firstHalfAvg) * 100);

        return NextResponse.json({
            success: true,
            data: {
                trends,
                summary: {
                    totalSubmissions,
                    averageTime,
                    averageTimeFormatted: `${Math.floor(averageTime / 60)}m ${averageTime % 60}s`,
                    timeImprovement, // Positive means improvement (faster), negative means slower
                    periodType: period,
                    daysAnalyzed: days,
                },
            },
        });
    } catch (error) {
        console.error('Error fetching time trends:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch time trends',
                error: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}