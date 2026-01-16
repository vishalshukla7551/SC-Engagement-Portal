
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = '696a2128577233531d2f282a'; // ID from user screenshot
    console.log(`Fetching submission with ID: ${id}`);

    const submission = await prisma.testSubmission.findUnique({
        where: { id },
    });

    if (!submission) {
        console.log('Submission NOT FOUND');
    } else {
        console.log('Submission found:');
        console.log('ID:', submission.id);
        console.log('Responses Type:', typeof submission.responses);
        console.log('Responses Value:', JSON.stringify(submission.responses, null, 2));
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
