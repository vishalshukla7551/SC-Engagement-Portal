
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const testType = "SAMSUNG_PROTECT_MAX";

        console.log("Starting seed for Samsung Protect Max questions...");

        // 1. Ensure the Test definition exists
        console.log("Upserting Test definition...");
        await prisma.test.upsert({
            where: { testType: testType },
            update: {
                status: "ACTIVE",
                totalQuestions: 15,
                passingPercentage: 60, // Assuming 60% passing
                name: "Samsung Protect Max Assessment",
                description: "Official assessment for Samsung Protect Max product knowledge.",
            },
            create: {
                name: "Samsung Protect Max Assessment",
                description: "Official assessment for Samsung Protect Max product knowledge.",
                type: "QUIZ",
                totalQuestions: 15,
                duration: 20, // 20 minutes
                maxAttempts: 3,
                passingPercentage: 60,
                status: "ACTIVE",
                enableProctoring: true,
                testType: testType,
                startDate: new Date(),
                endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // Valid for 1 year
            },
        });

        // 2. Prepare Questions
        const questionsData = [
            {
                question: "What is the primary coverage offered by Samsung Protect Max?",
                options: [
                    "A) Only Screen Damage",
                    "B) Only Liquid Damage",
                    "C) Accidental & Liquid Damage + Extended Warranty",
                    "D) Theft Coverage"
                ],
                correctAnswer: "C",
            },
            {
                question: "How many claims can a customer make under the Accidental Damage Protection component?",
                options: [
                    "A) Only 1 claim",
                    "B) Uhlimited claims up to Sum Insured",
                    "C) 2 claims per year",
                    "D) No claims allowed"
                ],
                correctAnswer: "B",
            },
            {
                question: "Does Samsung Protect Max cover depreciation of the device value?",
                options: [
                    "A) Yes, 10% per month",
                    "B) No, it offers Zero Depreciation coverage",
                    "C) Yes, based on market value",
                    "D) Only for Extended Warranty"
                ],
                correctAnswer: "B",
            },
            {
                question: "Is theft or loss of the device covered under Samsung Protect Max?",
                options: [
                    "A) Yes, fully covered",
                    "B) Covered with 50% deductible",
                    "C) Only theft is covered, not loss",
                    "D) No, Theft and Loss are not covered"
                ],
                correctAnswer: "D",
            },
            {
                question: "What is the mandatory activation period for Samsung Protect Max after device purchase?",
                options: [
                    "A) Within 30 days",
                    "B) Within 24 hours",
                    "C) Anytime within warranty period",
                    "D) Same day as device purchase"
                ],
                correctAnswer: "D", // Usually add-on plans are strictly same day, or very short window. Assuming Same Day/Purchase time for "Protect Max" type bundles.
            },
            {
                question: "Which service centers are authorized to perform repairs under this plan?",
                options: [
                    "A) Any local repair shop",
                    "B) Only Samsung Authorized Service Centers (ASC)",
                    "C) Zopper partner workshops only",
                    "D) Self-repair is reimbursed"
                ],
                correctAnswer: "B",
            },
            {
                question: "Does the plan provide cashless repair service?",
                options: [
                    "A) No, it is reimbursement only",
                    "B) Yes, 100% cashless at Authorized Service Centers",
                    "C) Pay 50% upfront",
                    "D) Only for screen replacement"
                ],
                correctAnswer: "B",
            },
            {
                question: "What happens to the plan if the device is replaced under DOA (Dead On Arrival)?",
                options: [
                    "A) Plan is cancelled without refund",
                    "B) Plan can be transferred to the new device",
                    "C) Customer must buy a new plan",
                    "D) Plan continues on the old IMEI"
                ],
                correctAnswer: "B",
            },
            {
                question: "Is the Samsung Protect Max plan transferable to a new owner?",
                options: [
                    "A) No, it is non-transferable",
                    "B) Yes, along with the device transfer",
                    "C) Only to family members",
                    "D) Yes, for a fee"
                ],
                correctAnswer: "B",
            },
            {
                question: "Does the Extended Warranty component cover battery replacement?",
                options: [
                    "A) Yes, anytime",
                    "B) No, consumables like batteries are excluded",
                    "C) Only if battery health is < 50%",
                    "D) Yes, within first 6 months"
                ],
                correctAnswer: "B",
            },
            {
                question: "What is the processing fee for raising a claim?",
                options: [
                    "A) ₹0 (Free)",
                    "B) ₹599 or ₹999 depending on model (Standard excess)",
                    "C) 10% of repair cost",
                    "D) 50% of device value"
                ],
                correctAnswer: "B",
            },
            {
                question: "How can a customer register a claim?",
                options: [
                    "A) Call Samsung Support only",
                    "B) Visit any store",
                    "C) Through Zopper App / Samsung Care+ Portal",
                    "D) Send an email to CEO"
                ],
                correctAnswer: "C",
            },
            {
                question: "What is the validity of the Extended Warranty coverage in this plan?",
                options: [
                    "A) Starts immediately",
                    "B) Starts after expiry of standard manufacturer warranty",
                    "C) Valid for 6 months only",
                    "D) Starts after 2 years"
                ],
                correctAnswer: "B",
            },
            {
                question: "Can I buy Samsung Protect Max for an old Samsung phone?",
                options: [
                    "A) Yes, if it is working",
                    "B) No, only for new devices at time of purchase",
                    "C) Yes, if less than 6 months old",
                    "D) Yes, during festive sales"
                ],
                correctAnswer: "B",
            },
            {
                question: "Is cosmetic damage (scratches, dents) covered if functionality is unaffected?",
                options: [
                    "A) Yes, fully covered",
                    "B) Only dents are covered",
                    "C) No, cosmetic damages are excluded",
                    "D) Covered with 50% fee"
                ],
                correctAnswer: "C",
            },
        ];

        // 3. Find current max Question ID to continue sequence
        const lastQ = await prisma.questionBank.findFirst({
            orderBy: { questionId: 'desc' },
        });
        let currentId = (lastQ?.questionId || 0) + 1;

        console.log(`Starting Question ID: ${currentId}`);

        // 4. Insert Questions
        for (const q of questionsData) {
            // Check for duplicates to avoid re-seeding same questions
            const exists = await prisma.questionBank.findFirst({
                where: {
                    question: q.question,
                    testType: testType
                }
            });

            if (!exists) {
                await prisma.questionBank.create({
                    data: {
                        questionId: currentId,
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        testType: testType,
                        isActive: true,
                        category: "Product Knowledge",
                    },
                });
                console.log(`Created question: ${q.question.substring(0, 30)}...`);
                currentId++;
            } else {
                console.log(`Skipping existing question: ${q.question.substring(0, 30)}...`);
            }
        }

        console.log("Seeding completed successfully.");

    } catch (error) {
        console.error("Error seeding questions:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
