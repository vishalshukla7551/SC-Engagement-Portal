import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

interface ParsedQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    category: string;
}

function parseQuestionsFromText(text: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];

    // Split text into lines
    const lines = text.split('\n');

    let currentCategory = '';
    let currentQuestion = '';
    let currentOptions: string[] = [];
    let correctAnswer = '';
    let isReadingQuestion = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Detect category
        if (line.match(/^​?Category \d+/)) {
            // Read next line for full category name
            let categoryName = line.replace(/^​?Category \d+ :/, '').trim();
            if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine && !nextLine.match(/^​?Q\d+/)) {
                    categoryName += ' ' + nextLine.replace(/^​/, '');
                }
            }
            currentCategory = categoryName.replace(/​/g, '').trim();
            console.log(`Found category: ${currentCategory}`);
            continue;
        }

        // Detect question start
        if (line.match(/^​?Q\d+\./)) {
            // Save previous question if exists
            if (currentQuestion && currentOptions.length >= 4 && correctAnswer) {
                questions.push({
                    question: currentQuestion.trim(),
                    options: currentOptions,
                    correctAnswer: correctAnswer,
                    category: currentCategory
                });
            }

            // Reset for new question
            currentQuestion = line.replace(/^​?Q\d+\.\s*/, '').replace(/​/g, '').trim();
            currentOptions = [];
            correctAnswer = '';
            isReadingQuestion = true;
            continue;
        }

        // Detect options (A., B., C., D.)
        if (line.match(/^​?[A-D]\./)) {
            isReadingQuestion = false;
            currentOptions.push(line.replace(/^​/, '').replace(/​/g, '').trim());
            continue;
        }

        // Detect correct answer
        if (line.match(/Answer:\s*[A-D]/)) {
            const match = line.match(/Answer:\s*([A-D])/);
            if (match) {
                correctAnswer = match[1];
            }
            continue;
        }

        // Continue reading question text
        if (isReadingQuestion && line && !line.match(/^✅/) && !line.match(/^​ ​​/)) {
            currentQuestion += ' ' + line.replace(/​/g, '').trim();
        }
    }

    // Save last question
    if (currentQuestion && currentOptions.length >= 4 && correctAnswer) {
        questions.push({
            question: currentQuestion.trim(),
            options: currentOptions,
            correctAnswer: correctAnswer,
            category: currentCategory
        });
    }

    return questions;
}

async function main() {
    try {
        const testType = "SAMSUNG_PROTECT_MAX";

        console.log("Reading extracted text file...");
        const textContent = fs.readFileSync('/Users/archittiwari/Documents/zopper/SC-Engagement-Portal/test_extracted.txt', 'utf-8');

        console.log("\nParsing questions...");
        const allQuestions = parseQuestionsFromText(textContent);

        console.log(`\nTotal questions parsed: ${allQuestions.length}`);

        // Group by category
        const categoryCounts: Record<string, number> = {};
        allQuestions.forEach(q => {
            categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        });

        console.log("\n📚 Questions per category:");
        Object.entries(categoryCounts).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} questions`);
        });

        // Delete old questions
        console.log("\n🗑️  Deleting old questions...");
        const deleteResult = await (prisma as any).questionBank.deleteMany({
            where: { testType: testType }
        });
        console.log(`   Deleted ${deleteResult.count} old questions`);

        // Update Test configuration
        console.log("\n⚙️  Updating Test configuration...");
        await (prisma as any).test.upsert({
            where: { testType: testType },
            update: {
                status: "ACTIVE",
                totalQuestions: 16,
                passingPercentage: 80,
                name: "Samsung Protect Max Assessment",
                description: "Official assessment for Samsung Protect Max product knowledge.",
            },
            create: {
                name: "Samsung Protect Max Assessment",
                description: "Official assessment for Samsung Protect Max product knowledge.",
                type: "QUIZ",
                totalQuestions: 16,
                duration: 20,
                maxAttempts: 3,
                passingPercentage: 80,
                status: "ACTIVE",
                enableProctoring: true,
                testType: testType,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
            },
        });

        // Find current max Question ID
        const lastQ = await (prisma as any).questionBank.findFirst({
            orderBy: { questionId: 'desc' },
        });
        let currentId = (lastQ?.questionId || 0) + 1;

        console.log(`\n🔢 Starting Question ID: ${currentId}`);

        // Insert new questions
        console.log("\n📝 Inserting new questions...");
        let insertedCount = 0;

        for (const q of allQuestions) {
            await (prisma as any).questionBank.create({
                data: {
                    questionId: currentId,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                    testType: testType,
                    isActive: true,
                    category: q.category,
                },
            });
            currentId++;
            insertedCount++;

            if (insertedCount % 20 === 0) {
                console.log(`   Inserted ${insertedCount} questions...`);
            }
        }

        console.log(`\n✅ Successfully inserted ${insertedCount} questions`);
        console.log("\n📊 Summary:");
        console.log(`   • Test Type: ${testType}`);
        console.log(`   • Total Questions in Database: ${insertedCount}`);
        console.log(`   • Passing Percentage: 80%`);
        console.log(`   • Questions per Test: 16 (randomly selected)`);
        console.log(`   • Categories: ${Object.keys(categoryCounts).length}`);
        console.log(`   • Each test will pick 2 questions from each category`);
        console.log(`   • This creates virtually unlimited unique test sets! 🎯`);

    } catch (error) {
        console.error("❌ Error seeding questions:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
