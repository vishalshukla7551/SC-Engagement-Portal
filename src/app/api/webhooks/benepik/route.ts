import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';


function decryptPayload(encryptedData: string, secretKey: string): any {
  try {
    const buffer = Buffer.from(encryptedData, 'base64');
    const iv = buffer.subarray(0, 16);
    const encrypted = buffer.subarray(16);
    
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString('utf8');
  //return JSON.parse(decrypted.toString('utf8'));
  } catch (error) {
    console.error('❌ Failed to decrypt payload:', error);
    throw new Error('Decryption failed');
  }
}

function generateHmacSignature(timestamp: string, rawJson: string, base64SignatureKey: string) {
    const dataToSign = `${timestamp}\n${rawJson}`;
    const hmacKey = Buffer.from(base64SignatureKey, 'base64');
    return crypto.createHmac('sha256', hmacKey).update(dataToSign).digest('hex');

}

export async function POST(req: NextRequest) {
  try {
    // Validate Content-Type header
    const contentType = req.headers.get('Content-Type');
    if (contentType !== 'text/plain') {
      console.error('❌ Invalid Content-Type. Expected: text/plain, Got:', contentType);
      return NextResponse.json(
        { error: 'Invalid Content-Type. Expected: text/plain' },
        { status: 400 }
      );
    }

    // Get the raw body (encrypted) for HMAC verification
    const rawBody = await req.text();
    
    // Get webhook secret for decryption
    const webhookSecret = process.env.WEBHOOK_SECRET_KEY;
    const signatureKey = process.env.WEBHOOK_SIGNATURE_KEY;
    console.log('🔐 Using webhook secret:', webhookSecret);
    console.log('🔐 Using webhook secret:', signatureKey);
    
    if (!webhookSecret) {
      console.error('❌ WEBHOOK_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    if (!signatureKey) {
      console.error('❌ WEBHOOK_SIGNATURE_KEY not configured');
      return NextResponse.json(
        { error: 'Webhook signature key not configured' },
        { status: 500 }
      );
    }

    // Decrypt the payload
    const rawJson = decryptPayload(rawBody, webhookSecret);
    const payload = JSON.parse(rawJson);
    console.log('🔓 Decrypted payload:', rawJson);

    
    // Stringify the decrypted payload for signature verification

    // Get required headers
    const signature = req.headers.get('X-Webhook-Signature');
    console.log('🔐 Signature:', signature);
    const timestamp = req.headers.get('X-Timestamp');
    console.log('⏰ Timestamp:', timestamp);
    
    if (!signature) {
      console.error('❌ Missing X-Webhook-Signature header');
      return NextResponse.json(
        { error: 'Missing X-Webhook-Signature header' },
        { status: 401 }
      );
    }

    if (!timestamp) {
      console.error('❌ Missing X-Timestamp header');
      return NextResponse.json(
        { error: 'Missing X-Timestamp header' },
        { status: 401 }
      );
    }



    // Verify HMAC signature (using encrypted payload and timestamp with newline)
    const expectedSignature = generateHmacSignature(timestamp, rawJson, signatureKey);
    
    // Remove 'sha256=' prefix if present in received signature
    const receivedSignature = signature.startsWith('sha256=') 
      ? signature.substring(7) 
      : signature;
    
    if (receivedSignature !== expectedSignature) {
      console.error('❌ Invalid HMAC signature');
      console.error('Expected:', expectedSignature);
      console.error('Received:', receivedSignature);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }
        //Validate timestamp (prevent replay attacks - allow 5 minute window)
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const requestTimestamp = parseInt(timestamp, 10);
    const timeDifference = Math.abs(currentTimestamp - requestTimestamp);
    const maxTimeDifference = 300; // 5 minutes

    if (timeDifference > maxTimeDifference) {
      console.error(`❌ Timestamp validation failed. Difference: ${timeDifference}s (max: ${maxTimeDifference}s)`);
      return NextResponse.json(
        { error: 'Requested timestamp is too old or in the future'},
        { status: 401 }
      );
    }
    console.log('✅ HMAC signature verified');
    console.log('✅ Timestamp validated');
    console.log('📨 Webhook Event:', payload.eventType || payload.communicationSource);

    // Verify Entity ID
    const entityId = process.env.BENEPIK_ENTITY_ID;
    if (!entityId) {
      console.error('❌ BENEPIK_ENTITY_ID not configured');
      return NextResponse.json(
        { error: 'Entity ID not configured' },
        { status: 500 }
      );
    }

    // Check entity ID - can be at top level (batch) or in transaction details (individual)
    const topLevelEntityId = payload.entityId;
    const transactionEntityId = payload.rewardTransactionDetails?.[0]?.entityId;
    const receivedEntityId = topLevelEntityId || transactionEntityId;

    if (receivedEntityId !== entityId) {
      console.error('❌ Invalid Entity ID in webhook');
      console.error('Expected:', entityId);
      console.error('Received:', receivedEntityId);
      return NextResponse.json(
        { error: 'Invalid Entity ID' },
        { status: 401 }
      );
    }
    console.log('✅ Entity ID verified:', receivedEntityId);

    const { eventType, rewardTransactionDetails, communicationSource } = payload;

    // Check if it's individual transaction webhook (has communicationSource)
    const isIndividualTransaction = !!communicationSource;

    // Find the transaction by transactionId
    if (!rewardTransactionDetails || rewardTransactionDetails.length === 0) {
      console.error('❌ No transaction details in payload');
      return NextResponse.json(
        { error: 'No transaction details' },
        { status: 400 }
      );
    }

    console.log(`📦 Processing ${rewardTransactionDetails.length} transaction(s) - Type: ${isIndividualTransaction ? 'Individual' : 'Batch'}`);

    // Process all transactions in the array
    const processedReports: string[] = [];
    const failedTransactions: string[] = [];

    for (const transactionDetail of rewardTransactionDetails) {
      const transactionId = transactionDetail.transactionId;
      const rewardAmount = transactionDetail.rewardAmount || transactionDetail.amountDisbursed;
      const transactionStatus = transactionDetail.transactionStatus;

      console.log(`🔍 Looking for transaction: ${transactionId}`);

      // Find report by transactionId
      const report = await prisma.spotIncentiveReport.findFirst({
        where: {
          transactionId: transactionId,
        },
      });

      if (!report) {
        console.warn(`⚠️  Report not found for transaction: ${transactionId}`);
        failedTransactions.push(transactionId);
        continue;
      }

      console.log(`📋 Found report: ${report.id}`);

      // Check if transaction is already successfully processed
      const metadata = report.transactionMetadata as any;
      const benepikResponse = metadata?.benepikResponse as any;
      const existingBatchResponse = benepikResponse?.data?.batchResponse?.[0] || benepikResponse?.batchResponse?.[0];
      
      if (existingBatchResponse?.code === 1000 && existingBatchResponse?.success === 1) {
        console.warn(`⚠️  Transaction already successfully processed for ${report.id}`);
        processedReports.push(report.id);
        continue;
      }

      // Helper to safely get metadata values
      const getMetadataValue = (key: string, defaultValue: any = null) => {
        const metadata = report.transactionMetadata as any;
        return metadata?.[key] ?? defaultValue;
      };

      // Handle individual transaction webhook (communicationSource present)
      if (isIndividualTransaction) {
        if (transactionStatus === 'SUCCESS') {
          console.log(`✅ Individual Transaction SUCCESS`);
          console.log(`   Transaction ID: ${transactionId}`);
          console.log(`   Report ID: ${report.id}`);
          console.log(`   Amount Disbursed: ${rewardAmount}`);
          console.log(`   Communication Source: ${communicationSource}`);
        } else {
          console.log(`❌ Individual Transaction FAILED`);
          console.log(`   Transaction ID: ${transactionId}`);
          console.log(`   Report ID: ${report.id}`);
          console.log(`   Status: ${transactionStatus}`);
        }
        processedReports.push(report.id);
        continue;
      }

      // Handle batch webhook (eventType present)
      switch (eventType) {
        case 'REWARD_PROCESSED': {
          // Case 1: Reward Approved - Update with success status
          console.log(`✅ Processing REWARD_PROCESSED for ${report.id}`);
          
          const updatedMetadata = {
            payload: getMetadataValue('payload'),
            benepikResponse: {
              success: true,
              data: {
                code: 1000,
                success: 1,
                message: 'Reward processed successfully',
                batchResponse: [
                  {
                    code: 1000,
                    success: 1,
                    message: 'Reward processed successfully',
                    txns: [
                      {
                        transactionId: transactionId,
                        rewardAmount: rewardAmount,
                      },
                    ],
                  },
                ],
              },
            },
            sentAt: getMetadataValue('sentAt'),
            status: 'SUCCESS',
            webhookProcessedAt: new Date().toISOString(),
            webhookEventType: eventType,
          };

          await prisma.spotIncentiveReport.update({
            where: { id: report.id },
            data: {
              spotincentivepaidAt: new Date(),
              transactionMetadata: updatedMetadata,
            },
          });

          console.log(`✅ Updated report ${report.id} with SUCCESS status`);
          processedReports.push(report.id);
          break;
        }

        case 'REWARD_REJECTED': {
          // Case 2: Reward Rejected - Update batchResponse with rejection
          console.log(`❌ Processing REWARD_REJECTED for ${report.id}`);
          
          await prisma.spotIncentiveReport.update({
            where: { id: report.id },
            data: {
              transactionId: null,
              transactionMetadata: null,
              spotincentivepaidAt: null
            },
          });

          console.log(`✅ Updated report ${report.id} with REJECTED status`);
          processedReports.push(report.id);
          break;
        }

        case 'INSUFFICIENT_FUNDS': {
          // Case 3: Insufficient Funds - Remove transactionId and transactionMetadata
          console.log(`⚠️  Processing INSUFFICIENT_FUNDS for ${report.id}`);
          
          console.log(`✅ Cleared transaction data for report ${report.id}`);
          processedReports.push(report.id);
          break;
        }

        case 'REWARD_VALIDATION_FAILED': {
          // Case 4: Validation Failed - Remove transactionId and transactionMetadata
          console.log(`⚠️  Processing REWARD_VALIDATION_FAILED for ${report.id}`);
          
          console.log(`✅ Cleared transaction data for report ${report.id}`);
          processedReports.push(report.id);
          break;
        }

        default:
          console.warn(`⚠️  Unknown event type: ${eventType}`);
          failedTransactions.push(transactionId);
      }
    }

    // Return success response
    return NextResponse.json({
      success: true,
      message: `Webhook processed: ${eventType || communicationSource || 'INDIVIDUAL_TRANSACTION'}`,
      processed: processedReports.length,
      failed: failedTransactions.length,
      processedReports: processedReports,
      failedTransactions: failedTransactions,
    });

  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
