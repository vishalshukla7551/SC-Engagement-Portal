import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PDF_TEXT = `
[SECTION A: Situation-Based (Customer Scenarios)]
1. A customer drops their new Samsung phone in water two weeks after buying it but didn’t buy the plan. They now want to buy it. What do you say and why?
A) Yes, they can still buy it with extra charges.
B) Yes, but it will cover only water damage.
C) No, the plan must be bought within 7 days
D) Yes, if they show proof of damage.
Answer: C

2. A Fold phone customer comes on Day 8 after purchase to buy the plan. How do you respond?
A) Eligible with late purchase fees.
B) Accept only if diagnostics are done immediately.
C) Not eligible — Fold/Flip models must buy within 7 days.
D) Accept the purchase — Fold phones have 30 days to buy.
Answer: C

3. A customer’s name is on the invoice, but their father uses the phone. Will the plan still cover the father?
A) Yes, coverage extends to spouse, children, and parents.
B) Yes, but only if father’s name is added later.
C) No, unless a transfer fee is paid.
D) No, coverage is only for the buyer.
Answer: A

4. A company buys 50 phones and 50 plans for staff. Who will be treated as the “Customer” for claim purposes?
A) The plan provider, Zopper.
B) Only the store where it was purchased.
C) The company or its authorised representative/employee.
D) Any employee who uses the phone.
Answer: C

[SECTION B: Application-Based (Decision & Policy Use)]
11. You’re trying to convince a hesitant customer. What’s the strongest difference between this plan and a normal warranty?
A) Warranty covers accidental damage; plan covers only manufacturing faults.
B) Warranty covers manufacturing faults; plan covers accidental and liquid damage.
C) Warranty and plan both cover the same issues.
D) Plan covers theft; warranty covers water damage.
Answer: B

12. If a customer made three damage claims in one year, can they still make a fourth? What’s the condition?
A) Yes, unlimited claims allowed within invoice value limit.
B) No, only three claims allowed.
C) Yes, but only after paying an extra fee.
D) No, unless the plan is renewed.
Answer: A

13. How would you explain the “processing fee” to a customer to avoid confusion later?
A) Small fee charged per repair; varies by phone category.
B) Fee only applies for the first claim.
C) Fee is optional if the customer requests.
D) Fee covers warranty extensions.
Answer: A

14. A customer says, “I’ll buy the plan next week.” What persuasive yet honest point can you make?
A) Encourage immediate purchase — must be bought within 7 days
B) Accept later purchase with penalty.
C) Advise buying next month for better coverage.
D) Suggest buying another phone instead.
Answer: A

[SECTION C: Knowledge-Based (Plan Details)]
22. How long does the plan last from activation?
A) 6 months
B) 2 years
C) 1 year
D) Until first claim
Answer: C

23. Within how many days must a customer buy the plan after phone purchase?
A) 7 days
B) 3 days (or 30 days with diagnostics)
C) 15 days
D) 60 days
Answer: B

26. Can the plan be purchased for non-Samsung phones?
A) Yes, with additional fee
B) No, only Samsung phones
C) Only for phones under warranty
D) Yes, if registered on My Galaxy App
Answer: B

27. How many total repair claims can a customer make in one year?
A) 1
B) 3
C) Unlimited within invoice value limit
D) 5
Answer: C

[SECTION D: Real-World Scenarios (Applied Skills)]
31. A customer claims their phone fell in a pool and stopped working. What 3 questions should you ask before directing them to service?
A) Was the plan active? When did damage happen?
B) What colour is the phone? When purchased? Who gifted it?
C) Did they buy insurance? Did they drop it before purchase? What is the IMEI?
D) Is it Fold/Flip? Warranty status? Store location?
Answer: A

32. Unsure if a customer’s plan is active. How do you confirm?
A) Only Check confirmation email /Whatsapp / SMS received by Customer
B) Only Check with Samsung Care+ Call Center team
C) Only ask Zopper POC to confirm
D) Confirmation by using all methods: Email, Call Center, and Zopper POC.
Answer: D
`;

async function main() {
    console.log('🚀 Importing PDF questions...');

    // Basic parser for this specific format
    const lines = PDF_TEXT.split('\n').filter(l => l.trim());
    const questions: any[] = [];
    let currentCategory = 'General';
    let currentQ: any = null;

    for (const line of lines) {
        if (line.startsWith('[SECTION')) {
            currentCategory = line.replace('[', '').replace(']', '').trim();
            continue;
        }

        if (/^\d+\./.test(line)) {
            if (currentQ) questions.push(currentQ);
            currentQ = {
                question: line.replace(/^\d+\.\s/, ''),
                options: [],
                category: currentCategory,
                testType: 'CERTIFICATION'
            };
            continue;
        }

        if (/^[A-D]\)/.test(line)) {
            currentQ.options.push(line.trim());
            continue;
        }

        if (line.toLowerCase().includes('answer:')) {
            currentQ.correctAnswer = line.split(':')[1].trim();
        }
    }
    if (currentQ) questions.push(currentQ);

    console.log(`📝 Parsed ${questions.length} questions from ${new Set(questions.map(q => q.category)).size} sections.`);

    try {
        // Clear existing questions for CERTIFICATION to remove dummy ones
        await (prisma as any).questionBank.deleteMany({
            where: { testType: 'CERTIFICATION' }
        });

        // Bulk insert
        await (prisma as any).questionBank.createMany({
            data: questions.map((q, i) => ({
                questionId: 1000 + i,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                category: q.category,
                testType: q.testType,
                isActive: true
            }))
        });

        // Create/Update the Test config
        await (prisma as any).test.upsert({
            where: { testType: 'CERTIFICATION' },
            update: {
                name: 'Samsung Protect Max Certification',
                totalQuestions: 10,
                status: 'ACTIVE'
            },
            create: {
                name: 'Samsung Protect Max Certification',
                testType: 'CERTIFICATION',
                type: 'ASSESSMENT',
                totalQuestions: 10,
                duration: 15,
                passingPercentage: 60,
                status: 'ACTIVE',
                enableProctoring: true
            }
        });

        console.log('✅ Import successful!');
    } catch (error) {
        console.error('❌ Error during import:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
