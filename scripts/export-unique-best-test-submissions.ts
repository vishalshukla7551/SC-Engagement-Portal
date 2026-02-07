import { prisma } from '../src/lib/prisma';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

interface TestSubmissionExport {
    'SEC ID': string;
    'SEC Name': string;
    'Phone': string;
    'Store': string;
    'Score': string;
    'Correct Answers': number | string;
    'Wrong Answers': number | string;
    'Total Questions': number;
    'Completion Time (min)': number;
    'Submitted At': string;
    'Status': string;
    'Proctoring Flagged': string;
    'Answer Details': string;
    'Session Token': string;
    'Store ID': string;
    'Store Name': string;
    'Test Name': string;
}

async function exportUniqueBestTestSubmissions() {
    try {
        console.log('🔄 Starting export of unique best test submissions...');

        // Fetch all test submissions from database
        const submissions = await prisma.testSubmission.findMany({
            orderBy: {
                createdAt: 'desc'
            },
            // Ensure we fetch user details if possible, though schema usually has denormalized data or relations
            // Based on previous script, we mostly rely on fields in submission or potential joins.
            // previous script didn't do joins, so we stick to submission fields.
        });

        console.log(`📊 Found ${submissions.length} total test submissions in database`);

        if (submissions.length === 0) {
            console.log('❌ No test submissions found');
            return;
        }

        // Group by User (SEC ID or Phone) and find best score
        const userBestSubmissions = new Map<string, any>();

        submissions.forEach(submission => {
            // Create a unique key for the user. Prefer SEC ID, fallback to Phone.
            const userId = submission.secId || submission.phone;

            if (!userId) return; // Skip if no identifier

            if (!userBestSubmissions.has(userId)) {
                userBestSubmissions.set(userId, submission);
            } else {
                const currentBest = userBestSubmissions.get(userId);

                // Compare scores
                // Assuming score is stored as number or can be parsed.
                // Previous script: 'Score': `${submission.score}%` implies submission.score is likely a number.
                // Let's verify type. In Prisma `score` is usually Int or Float.
                const currentScore = currentBest.score || 0;
                const newScore = submission.score || 0;

                if (newScore > currentScore) {
                    userBestSubmissions.set(userId, submission);
                } else if (newScore === currentScore) {
                    // Tie breaker: prefer most recent? 
                    // The list is ordered by createdAt desc, so we are iterating over newest first.
                    // If we want most recent, we keep the first one we saw (since we iterate newest first).
                    // Actually, if we iterate newest first, the first one we encounter is the newest.
                    // So if newScore == currentScore, we don't need to replace if we want the newest.
                    // Wait, if I iterate array [Newest, ..., Oldest]
                    // 1. See Newest (Score 80). Map: {User: Newest}
                    // 2. See Older (Score 90). 90 > 80. Map: {User: Older}
                    // 3. See Oldest (Score 90). 90 == 90. Keep existing (Older).
                    // Result: Highest score, if tie, the most recent one (from the "Older" ones we saw first).
                    // Correct.
                }
            }
        });

        const uniqueSubmissions = Array.from(userBestSubmissions.values());
        console.log(`✨ Filtered down to ${uniqueSubmissions.length} unique best submissions`);

        // Transform data for Excel export
        const exportData: TestSubmissionExport[] = uniqueSubmissions.map((submission) => {
            const hasResponses = submission.responses && Array.isArray(submission.responses) && submission.responses.length > 0;

            let correctCount: number | string = 'N/A';
            let wrongCount: number | string = 'N/A';
            let answerDetails = 'Answer details not available';

            if (hasResponses) {
                const responses = submission.responses as any[];
                correctCount = responses.filter((r: any) => r.isCorrect === true).length;
                wrongCount = responses.filter((r: any) => r.isCorrect === false).length;

                answerDetails = responses
                    .map((r: any, idx: number) =>
                        `Q${idx + 1}: ${r.selectedAnswer || 'No Answer'} (${r.isCorrect ? 'CORRECT' : 'WRONG'})`
                    )
                    .join(' | ');
            }

            return {
                'SEC ID': submission.secId || 'N/A',
                'SEC Name': 'N/A', // Will need to join with SEC table if needed
                'Phone': submission.phone || 'N/A',
                'Store': submission.storeName || 'N/A',
                'Score': `${submission.score}%`,
                'Correct Answers': correctCount,
                'Wrong Answers': wrongCount,
                'Total Questions': submission.totalQuestions || 10,
                'Completion Time (min)': Math.round((submission.completionTime || 0) / 60),
                'Submitted At': new Date(submission.createdAt).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata',
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                }),
                'Status': (submission.score || 0) >= 80 ? 'PASS' : 'FAIL',
                'Proctoring Flagged': submission.isProctoringFlagged ? 'YES' : 'NO',
                'Answer Details': answerDetails,
                'Session Token': submission.sessionToken || 'N/A',
                'Store ID': submission.storeId || 'N/A',
                'Store Name': submission.storeName || 'N/A',
                'Test Name': submission.testName || 'N/A',
            };
        });

        // Create Excel workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Best Unique Submissions');

        // Set column widths for better readability
        const colWidths = [
            { wch: 12 }, // SEC ID
            { wch: 20 }, // SEC Name
            { wch: 15 }, // Phone
            { wch: 30 }, // Store
            { wch: 8 },  // Score
            { wch: 12 }, // Correct Answers
            { wch: 12 }, // Wrong Answers
            { wch: 12 }, // Total Questions
            { wch: 15 }, // Completion Time
            { wch: 20 }, // Submitted At
            { wch: 8 },  // Status
            { wch: 12 }, // Proctoring Flagged
            { wch: 50 }, // Answer Details
            { wch: 20 }, // Session Token
            { wch: 15 }, // Store ID
            { wch: 20 }, // Store Name
            { wch: 15 }, // Test Name
        ];
        ws['!cols'] = colWidths;

        // Generate filename with current date
        const currentDate = new Date().toISOString().split('T')[0];
        const filename = `Unique_Best_Test_Submissions_${currentDate}_${uniqueSubmissions.length}_records.xlsx`;
        const filepath = path.join(process.cwd(), filename);

        // Write Excel file
        XLSX.writeFile(wb, filepath);

        console.log(`✅ Successfully exported ${uniqueSubmissions.length} unique test submissions`);
        console.log(`📁 File saved as: ${filename}`);
        console.log(`📍 Full path: ${filepath}`);

        // Generate summary statistics
        const passCount = exportData.filter(row => row.Status === 'PASS').length;
        const failCount = exportData.filter(row => row.Status === 'FAIL').length;
        const flaggedCount = exportData.filter(row => row['Proctoring Flagged'] === 'YES').length;
        const averageScore = exportData.reduce((sum, row) => {
            const score = parseInt(row.Score.replace('%', ''));
            return sum + score;
        }, 0) / exportData.length;

        console.log('\n📊 EXPORT SUMMARY:');
        console.log(`Total Unique Candidates: ${uniqueSubmissions.length}`);
        console.log(`Pass (≥80%): ${passCount} (${Math.round(passCount / uniqueSubmissions.length * 100)}%)`);
        console.log(`Fail (<80%): ${failCount} (${Math.round(failCount / uniqueSubmissions.length * 100)}%)`);
        console.log(`Proctoring Flagged: ${flaggedCount}`);
        console.log(`Average Score: ${Math.round(averageScore)}%`);

        return filepath;

    } catch (error) {
        console.error('❌ Error exporting test submissions:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the export
exportUniqueBestTestSubmissions()
    .then((filepath) => {
        console.log(`\n🎉 Export completed successfully!`);
        console.log(`📁 Excel file: ${filepath}`);
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Export failed:', error);
        process.exit(1);
    });
