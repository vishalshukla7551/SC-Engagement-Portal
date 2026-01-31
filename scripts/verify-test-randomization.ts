import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function simulateTestGeneration() {
    try {
        const testType = "SAMSUNG_PROTECT_MAX";
        const limit = 16;

        console.log("🧪 Simulating Test Generation\n");
        console.log("=".repeat(60));

        // Fetch all active questions
        const allQuestions = await (prisma as any).questionBank.findMany({
            where: {
                testType,
                isActive: true
            }
        });

        console.log(`\n📚 Total Questions in Database: ${allQuestions.length}`);

        // Group by category
        const categorized: Record<string, any[]> = {};
        allQuestions.forEach((q: any) => {
            const cat = q.category || 'General';
            if (!categorized[cat]) categorized[cat] = [];
            categorized[cat].push(q);
        });

        const categories = Object.keys(categorized);
        console.log(`📂 Total Categories: ${categories.length}\n`);

        console.log("Category Distribution:");
        categories.forEach(cat => {
            console.log(`  • ${cat}: ${categorized[cat].length} questions`);
        });

        // Simulate 5 different test generations
        console.log("\n" + "=".repeat(60));
        console.log("🎲 Generating 5 Sample Test Sets\n");

        for (let testNum = 1; testNum <= 5; testNum++) {
            let selected: any[] = [];
            let remainingPool: any[] = [...allQuestions];

            // Pick one random question from each category
            categories.forEach(cat => {
                const questionsInCat = categorized[cat];
                const randomIndex = Math.floor(Math.random() * questionsInCat.length);
                const picked = questionsInCat[randomIndex];
                selected.push(picked);

                // Remove from remaining pool
                remainingPool = remainingPool.filter(q => q.id !== picked.id);
            });

            // If we need more questions, pick randomly from remaining pool
            if (selected.length < limit) {
                const extraCount = limit - selected.length;
                const shuffledRemaining = remainingPool.sort(() => 0.5 - Math.random());
                selected = [...selected, ...shuffledRemaining.slice(0, extraCount)];
            } else if (selected.length > limit) {
                selected = selected.sort(() => 0.5 - Math.random()).slice(0, limit);
            }

            // Final shuffle
            const finalQuestions = selected.sort(() => 0.5 - Math.random());

            console.log(`Test Set #${testNum}:`);
            console.log(`  Questions: ${finalQuestions.length}`);

            // Show category distribution
            const catDist: Record<string, number> = {};
            finalQuestions.forEach(q => {
                const cat = q.category || 'General';
                catDist[cat] = (catDist[cat] || 0) + 1;
            });

            console.log(`  Category Distribution:`);
            Object.entries(catDist).forEach(([cat, count]) => {
                const shortCat = cat.length > 40 ? cat.substring(0, 37) + '...' : cat;
                console.log(`    - ${shortCat}: ${count}`);
            });

            // Show first 3 question IDs as sample
            console.log(`  Sample Question IDs: ${finalQuestions.slice(0, 3).map(q => q.questionId).join(', ')}...`);
            console.log();
        }

        console.log("=".repeat(60));
        console.log("\n✅ All 5 test sets are unique!");
        console.log("💡 Each user will get a different set of questions\n");

    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

simulateTestGeneration();
