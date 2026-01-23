import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument } from 'pdf-lib';

const prisma = new PrismaClient();

/**
 * Script to upload Protect Max Training Deck PDF (pages 9-17 only)
 * This will delete any existing claim procedure PDFs and upload the new one
 */
async function uploadProtectMaxPDF() {
    try {
        console.log('🚀 Starting Protect Max PDF upload process...\n');

        // Path to the PDF file
        const sourcePDFPath = path.join(process.cwd(), 'Protect Max Training Deck.pdf');

        // Check if file exists
        if (!fs.existsSync(sourcePDFPath)) {
            throw new Error(`PDF file not found at: ${sourcePDFPath}`);
        }

        console.log('📄 Reading source PDF...');
        const existingPdfBytes = fs.readFileSync(sourcePDFPath);

        // Load the PDF
        console.log('✂️  Extracting pages 9-17...');
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const totalPages = pdfDoc.getPageCount();

        console.log(`   Total pages in source: ${totalPages}`);

        if (totalPages < 17) {
            throw new Error(`PDF doesn't have enough pages. Found ${totalPages}, need at least 17`);
        }

        // Create a new PDF document with only pages 9-17
        const newPdfDoc = await PDFDocument.create();

        // Copy pages 9-17 (index 8-16 in 0-based indexing)
        const pagesToExtract = [8, 9, 10, 11, 12, 13, 14, 15, 16]; // Pages 9-17 (0-indexed)

        for (const pageIndex of pagesToExtract) {
            const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex]);
            newPdfDoc.addPage(copiedPage);
        }

        // Save the new PDF to bytes
        const newPdfBytes = await newPdfDoc.save();

        console.log(`   Extracted ${pagesToExtract.length} pages successfully\n`);

        // Convert to base64 for storage
        const base64Data = Buffer.from(newPdfBytes).toString('base64');
        const fileSize = newPdfBytes.length;

        // Delete ALL existing PDFs
        console.log('🗑️  Deleting existing claim procedure PDFs...');
        const deleteResult = await prisma.claimProcedurePDF.deleteMany({});
        console.log(`   Deleted ${deleteResult.count} existing PDF(s)\n`);

        // Store the new PDF in database
        console.log('💾 Uploading new PDF to database...');
        const pdfRecord = await prisma.claimProcedurePDF.create({
            data: {
                title: 'SC+ Claim Raise Procedure - Protect Max',
                description: 'Samsung Care+ Protect Max claim raise procedure training material (Pages 9-17)',
                fileName: 'Protect_Max_Training_Pages_9-17.pdf',
                fileSize: fileSize,
                fileData: base64Data,
                category: 'PROTECT_MAX',
                uploadedAt: new Date(),
                isActive: true,
            },
        });

        console.log('✅ PDF uploaded successfully!\n');
        console.log('📋 Details:');
        console.log(`   Record ID: ${pdfRecord.id}`);
        console.log(`   Title: ${pdfRecord.title}`);
        console.log(`   Description: ${pdfRecord.description}`);
        console.log(`   File Name: ${pdfRecord.fileName}`);
        console.log(`   File Size: ${(fileSize / 1024).toFixed(2)} KB`);
        console.log(`   Category: ${pdfRecord.category}`);
        console.log(`   Pages: 9-17 (${pagesToExtract.length} pages)`);
        console.log(`   Active: ${pdfRecord.isActive ? 'Yes ✓' : 'No ✗'}\n`);

        console.log('🎉 Process completed successfully!');
        console.log('   Users can now view this PDF by clicking "SC+ Claim Raise Procedure" on the home page.\n');

    } catch (error) {
        console.error('❌ Error uploading PDF:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run the script
uploadProtectMaxPDF()
    .then(() => {
        console.log('✨ Script finished!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('💥 Script failed:', error);
        process.exit(1);
    });
