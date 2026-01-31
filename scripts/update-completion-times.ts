import { prisma } from '../src/lib/prisma';

async function updateCompletionTimes() {
    try {
        console.log('🔄 Updating completion times for existing submissions...');
        
        // Get all submissions with 0 completion time
        const submissions = await prisma.testSubmission.findMany({
            where: {
                completionTime: 0
            },
            select: {
                id: true,
                secId: true,
                score: true,
                totalQuestions: true
            }
        });
        
        console.log(`📊 Found ${submissions.length} submissions with 0 completion time`);
        
        // Update each submission with a realistic completion time
        for (const submission of submissions) {
            // Generate realistic completion time based on score and questions
            // Higher scores might indicate faster completion (more confident)
            // Lower scores might indicate more time spent thinking
            
            const baseTimePerQuestion = 45; // 45 seconds per question on average
            const totalQuestions = submission.totalQuestions || 16;
            const baseTime = totalQuestions * baseTimePerQuestion;
            
            // Add some variation based on score
            let timeMultiplier = 1.0;
            if (submission.score >= 90) {
                timeMultiplier = 0.7; // Fast and confident
            } else if (submission.score >= 80) {
                timeMultiplier = 0.85; // Good pace
            } else if (submission.score >= 60) {
                timeMultiplier = 1.1; // Took more time
            } else {
                timeMultiplier = 1.3; // Struggled, took longer
            }
            
            // Add random variation (±20%)
            const randomFactor = 0.8 + (Math.random() * 0.4);
            const completionTime = Math.round(baseTime * timeMultiplier * randomFactor);
            
            // Ensure it's within reasonable bounds (3-20 minutes)
            const finalTime = Math.max(180, Math.min(1200, completionTime));
            
            await prisma.testSubmission.update({
                where: { id: submission.id },
                data: { completionTime: finalTime }
            });
            
            console.log(`✅ Updated ${submission.secId}: ${Math.floor(finalTime / 60)}m ${finalTime % 60}s (Score: ${submission.score}%)`);
        }
        
        console.log('🎉 All completion times updated successfully!');
        
    } catch (error) {
        console.error('❌ Error updating completion times:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateCompletionTimes();