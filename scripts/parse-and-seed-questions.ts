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

    // Split by categories
    const categoryRegex = /​Category (\d+) :(.+?)​\n/g;
    const sections = text.split(categoryRegex);

    for (let i = 1; i < sections.length; i += 3) {
        const categoryNumber = sections[i];
        const categoryName = sections[i + 1].trim();
        const categoryContent = sections[i + 2];

        // Parse questions within this category
        const questionMatches = categoryContent.matchAll(/​Q(\d+)\.\s*(.+?)(?=​Q\d+\.|Category \d+|$)/gs);

        for (const match of questionMatches) {
            const questionBlock = match[2];

            // Extract question text
            const questionLines = questionBlock.split('\n').filter(line => line.trim());
            let questionText = '';
            const options: string[] = [];
            let correctAnswer = '';

            let isReadingQuestion = true;
            let isReadingOptions = false;

            for (const line of questionLines) {
                const trimmed = line.trim();

                // Skip empty lines and check marks
                if (!trimmed || trimmed === '✅' || trimmed.startsWith('​ ​​Correct Answer')) {
                    if (trimmed.startsWith('​ ​​Correct Answer')) {
                        const answerMatch = trimmed.match(/Answer:\s*([A-D])/);
                        if (answerMatch) {
                            correctAnswer = answerMatch[1];
                        }
                    }
                    continue;
                }

                // Check if it's an option line
                if (/^​?[A-D]\./.test(trimmed)) {
                    isReadingQuestion = false;
                    isReadingOptions = true;
                    options.push(trimmed.replace(/^​/, ''));
                } else if (isReadingQuestion) {
                    questionText += (questionText ? ' ' : '') + trimmed.replace(/^​/, '');
                }
            }

            if (questionText && options.length >= 4 && correctAnswer) {
                questions.push({
                    question: questionText,
                    options: options,
                    correctAnswer: correctAnswer,
                    category: categoryName
                });
            }
        }
    }

    return questions;
}

async function main() {
    try {
        const testType = "SAMSUNG_PROTECT_MAX";

        console.log("Reading extracted text file...");
        const textContent = fs.readFileSync('/Users/archittiwari/Documents/zopper/SC-Engagement-Portal/test_extracted.txt', 'utf-8');

        console.log("Parsing questions...");
        const allQuestions = parseQuestionsFromText(textContent);

        console.log(`Total questions parsed: ${allQuestions.length}`);

        // Group by category
        const categoryCounts: Record<string, number> = {};
        allQuestions.forEach(q => {
            categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
        });

        console.log("\nQuestions per category:");
        Object.entries(categoryCounts).forEach(([cat, count]) => {
            console.log(`  ${cat}: ${count} questions`);
        });

        // Delete old questions
        console.log("\nDeleting old questions...");
        const deleteResult = await (prisma as any).questionBank.deleteMany({
            where: { testType: testType }
        });
        console.log(`Deleted ${deleteResult.count} old questions`);

        // Update Test configuration
        console.log("\nUpdating Test configuration...");
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

        console.log(`\nStarting Question ID: ${currentId}`);

        // Insert new questions
        console.log("\nInserting new questions...");
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

            if (insertedCount % 10 === 0) {
                console.log(`  Inserted ${insertedCount} questions...`);
            }
        }

        console.log(`\n✅ Successfully inserted ${insertedCount} questions`);
        console.log("\n📊 Summary:");
        console.log(`  - Test Type: ${testType}`);
        console.log(`  - Total Questions: ${insertedCount}`);
        console.log(`  - Passing Percentage: 80%`);
        console.log(`  - Questions per Test: 16`);
        console.log(`  - Categories: ${Object.keys(categoryCounts).length}`);

    } catch (error) {
        console.error("Error seeding questions:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
