import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';
import axios from 'axios';
import jwt from 'jsonwebtoken';

/**
 * POST /api/zopper-administrator/spot-incentive-report/send-reward
 * Verify OTP and send rewards to multiple canvassers via Benepik API
 * 
 * Request body:
 * {
 *   reportIds: string[],
 *   otp: string
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'ZOPPER_ADMINISTRATOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin phone for OTP verification
    const zopperAdmin = await prisma.zopperAdmin.findUnique({
      where: { userId: authUser.id },
    });

    const adminPhone = zopperAdmin?.phone;
    
    if (!adminPhone) {
      return NextResponse.json(
        { error: 'Admin phone number not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body = await req.json();
    const { reportIds, otp } = body;

    // Verify OTP first
    if (!otp) {
      return NextResponse.json(
        { error: 'OTP is required' },
        { status: 400 }
      );
    }

    // Find latest OTP for this phone
    const otpRecord = await prisma.otp.findFirst({
      where: {
        phone: adminPhone,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      await prisma.otp.delete({ where: { id: otpRecord.id } });
      return NextResponse.json(
        { error: 'OTP expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Delete OTP after verification (one-time use)
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    console.log(`✅ OTP verified and deleted for phone ${adminPhone}`);

    if (!reportIds || !Array.isArray(reportIds) || reportIds.length === 0) {
      return NextResponse.json(
        { error: 'reportIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Validate all IDs are strings
    if (!reportIds.every((id: any) => typeof id === 'string')) {
      return NextResponse.json(
        { error: 'All reportIds must be strings' },
        { status: 400 }
      );
    }

    console.log(`📤 Processing rewards for ${reportIds.length} report(s)`);

    // Validate required env variables
    const benepikMailer = process.env.BENEPIK_MAILER;
    const benepikEntityId = process.env.BENEPIK_ENTITY_ID;

    if (!benepikMailer) {
      console.error('❌ BENEPIK_MAILER not configured in .env');
      return NextResponse.json(
        { error: 'BENEPIK_MAILER not configured' },
        { status: 500 }
      );
    }

    if (!benepikEntityId) {
      console.error('❌ BENEPIK_ENTITY_ID not configured in .env');
      return NextResponse.json(
        { error: 'BENEPIK_ENTITY_ID not configured' },
        { status: 500 }
      );
    }

    // 1. Fetch all reports with SEC details
    const reports = await prisma.spotIncentiveReport.findMany({
      where: {
        id: {
          in: reportIds,
        },
      },
      include: {
        secUser: true,
        plan: true,
      },
    });

    if (reports.length === 0) {
      return NextResponse.json(
        { error: 'No reports found' },
        { status: 404 }
      );
    }

    // Check for already processed reports (race condition prevention)
    const alreadyProcessed = reports.filter(r => r.transactionId);
    if (alreadyProcessed.length > 0) {
      return NextResponse.json(
        {
          error: 'Some reports already processed',
          message: `${alreadyProcessed.length} report(s) have already been processed`,
          alreadyProcessedIds: alreadyProcessed.map(r => r.id),
          pendingIds: reports.filter(r => !r.transactionId).map(r => r.id),
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Check for reports with voucher codes already assigned
    const withVoucherCodes = reports.filter(r => r.voucherCode);
    if (withVoucherCodes.length > 0) {
      return NextResponse.json(
        {
          error: 'Some reports already have voucher codes',
          message: `${withVoucherCodes.length} report(s) already have voucher codes assigned`,
          reportsWithVouchers: withVoucherCodes.map(r => ({ id: r.id, voucherCode: r.voucherCode })),
          pendingIds: reports.filter(r => !r.voucherCode).map(r => r.id),
        },
        { status: 409 } // 409 Conflict
      );
    }

    // Validate all reports have SEC details
    const reportsWithoutSec = reports.filter(r => !r.secUser);
    if (reportsWithoutSec.length > 0) {
      return NextResponse.json(
        {
          error: `${reportsWithoutSec.length} report(s) missing SEC details`,
          reportIds: reportsWithoutSec.map(r => r.id),
        },
        { status: 400 }
      );
    }

    // 2. Build Benepik payload with all rewards
    // Separate reports with zero incentive
    const reportsWithIncentive = reports.filter(r => r.spotincentiveEarned > 0);
    const reportsWithZeroIncentive = reports.filter(r => r.spotincentiveEarned === 0);

    const benepikData = reportsWithIncentive.map((report) => {
      const sec = report.secUser!;
      const rewardAmount = report.spotincentiveEarned.toString();
      const mobileNumber = sec.phone;
      const userName = sec.fullName || 'SEC';
      const emailAddress = sec.email || '';

      return {
        sno: (reportsWithIncentive.indexOf(report) + 1).toString(),
        userName: userName,
        emailAddress: emailAddress,
        countryCode: '+91',
        mobileNumber: mobileNumber,
        rewardAmount: rewardAmount,
        personalMessage: '',
        messageFrom: '',
        ccEmailAddress: '',
        bccEmailAddress: '',
        reference: report.id,
        mailer: benepikMailer,
        certificateId: '',
        transactionId: `TXN-${process.env.PROJECT_ID}-${report.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        entityId: benepikEntityId,
        column1: '',
        column2: '',
        column3: '',
        column4: '',
        column5: '',
      };
    });
//transactionId: `TXN-${process.env.PROJECT_ID}-${report.id}-${Math.random().toString(36).substring(2, 8)}
    const rewardPayload = {
      source: '0',
      isSms: '1',
      isWhatsApp: '1',
      isEmail: '0',
      data: benepikData,
    };

    console.log(`📤 Sending ${benepikData.length} reward(s) to Benepik API`);

    // 3. Generate UAT Benepik Token
    const uatTokenSecret = process.env.BENEPIK_JWT_SECRET;
    const uatClientId = process.env.BENEPIK_CLIENT_ID;

    if (!uatTokenSecret) {
      return NextResponse.json(
        { error: 'BENEPIK_JWT_SECRET not configured' },
        { status: 500 }
      );
    }

    const uatToken = jwt.sign(
      { clientId: uatClientId },
      uatTokenSecret,
      { expiresIn: '1m' }
    );

    console.log('🔐 Generated UAT Token for Benepik API');

    // 4. Call UAT Benepik API
    const benepikResponse = await axios.post(
      `https://salesdost.zopper.com/api/benepik`,
      rewardPayload,
      {
        headers: {
          'Authorization': `Bearer ${uatToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('✅ Benepik API Response:', JSON.stringify(benepikResponse.data, null, 2));

    // 5. Validate top-level response
    // Top-level code 1000 means request was processed (not necessarily all rewards succeeded)
    const benepikResponseData = benepikResponse.data?.data || benepikResponse.data;
    
    if (benepikResponse.status !== 200 || benepikResponseData?.code !== 1000) {
      console.error('❌ Benepik API returned error response:', {
        status: benepikResponse.status,
        code: benepikResponseData?.code,
        message: benepikResponseData?.message,
      });

      return NextResponse.json(
        {
          error: 'Benepik API request failed',
          details: {
            code: benepikResponseData?.code,
            message: benepikResponseData?.message,
            batchResponse: benepikResponseData?.batchResponse,
          },
        },
        { status: 400 }
      );
    }

    // 6. Process batch responses - check individual reward statuses
    const batchResponses = benepikResponseData?.batchResponse || [];
    
    if (!Array.isArray(batchResponses) || batchResponses.length === 0) {
      console.error('❌ No batch responses received from Benepik');
      return NextResponse.json(
        {
          error: 'Invalid Benepik response format',
          message: 'No batch response data received',
        },
        { status: 400 }
      );
    }

    // Benepik returns ONE batch response for ALL transactions
    const batchResponse = batchResponses[0];
    
    console.log(`📦 Batch Response Code: ${batchResponse.code}, Success: ${batchResponse.success}`);
    console.log(`📦 Total transactions in batch: ${batchResponse.txns?.length || 0}`);

    // Map batch error codes to messages
    const batchErrorMessages: Record<number, string> = {
      1012: 'Insufficient Balance - Client does not have sufficient balance',
      1013: 'No Rewards to Process - Rewards already processed or none available',
      1050: 'Pending/Request Accept - Cannot reinitiate, request already in process',
      1009: 'Required Parameter Missing - One or more mandatory fields missing',
    };

    // Determine status for ALL reports based on single batch response
    let successfulRewards: Array<{ reportId: string; txnId: string }> = [];
    let pendingRewards: Array<{ reportId: string; txnId: string; error: string }> = [];
    let failedRewards: Array<{ reportId: string; error: string }> = [];

    if (batchResponse.code === 1000 && batchResponse.success === 1) {
      // ALL transactions are successful
      successfulRewards = reportsWithIncentive.map((report, index) => ({
        reportId: report.id,
        txnId: batchResponse.txns?.[index]?.transactionId || benepikData[index].transactionId,
      }));
      console.log(`✅ All ${successfulRewards.length} transactions SUCCESSFUL`);
    } else if (batchResponse.code === 1012 && batchResponse.success === 0) {
      // ALL transactions are pending (insufficient balance)
      pendingRewards = reportsWithIncentive.map((report, index) => ({
        reportId: report.id,
        txnId: batchResponse.txns?.[index]?.transactionId || benepikData[index].transactionId,
        error: batchResponse.message,
      }));
      console.log(`⏳ All ${pendingRewards.length} transactions PENDING_BALANCE`);
    } else {
      // ALL transactions failed
      failedRewards = reportsWithIncentive.map((report, index) => ({
        reportId: report.id,
        error: batchErrorMessages[batchResponse.code] || batchResponse.message,
      }));
      console.log(`❌ All ${failedRewards.length} transactions FAILED`);
    }

    console.log(`✅ Successful: ${successfulRewards.length}, ⏳ Pending: ${pendingRewards.length}, ❌ Failed: ${failedRewards.length}`);

    // 7. Update successfully processed reports
    const successUpdatePromises = successfulRewards.map((reward) => {
      const benepikDataIndex = reportsWithIncentive.findIndex(r => r.id === reward.reportId);
      return prisma.spotIncentiveReport.update({
        where: { id: reward.reportId },
        data: {
          spotincentivepaidAt: new Date(),
          transactionId: reward.txnId,
          transactionMetadata: {
            payload: benepikData[benepikDataIndex],
            benepikResponse: benepikResponse.data,
            sentAt: new Date().toISOString(),
            status: 'SUCCESS',
          },
        },
      });
    });

    // Update pending balance reports (code 1012)
    const pendingUpdatePromises = pendingRewards.map((reward) => {
      const benepikDataIndex = reportsWithIncentive.findIndex(r => r.id === reward.reportId);
      return prisma.spotIncentiveReport.update({
        where: { id: reward.reportId },
        data: {
          transactionId: reward.txnId,
          transactionMetadata: {
            payload: benepikData[benepikDataIndex],
            benepikResponse: benepikResponse.data,
            sentAt: new Date().toISOString(),
            status: 'PENDING_BALANCE',
          },
        },
      });
    });

    // Update zero incentive reports - mark as paid with transactionId
    const zeroIncentiveUpdatePromises = reportsWithZeroIncentive.map((report) => {
      const txnId = `TXN-${process.env.PROJECT_ID}-${report.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      return prisma.spotIncentiveReport.update({
        where: { id: report.id },
        data: {
          spotincentivepaidAt: new Date(),
          transactionId: txnId,
          transactionMetadata: {
            status: 'SUCCESS',
            sentAt: new Date().toISOString(),
            note: 'Zero incentive - auto marked as paid',
          },
        },
      });
    });

    await Promise.all([...successUpdatePromises, ...pendingUpdatePromises, ...zeroIncentiveUpdatePromises]);

    // 8. Return response with successes, pending, and failures
    const hasFailures = failedRewards.length > 0;
    
    // Get Benepik's original message for display
    const benepikMessage = batchResponse.message || 'Processing completed';
    
    const totalProcessed = successfulRewards.length + reportsWithZeroIncentive.length;

    // Calculate amounts
    const totalAmountRequested = reports.reduce((sum, r) => sum + r.spotincentiveEarned, 0);
    const processedAmount = successfulRewards.reduce((sum, r) => {
      const report = reports.find(rep => rep.id === r.reportId);
      return sum + (report?.spotincentiveEarned || 0);
    }, 0) + reportsWithZeroIncentive.reduce((sum, r) => sum + r.spotincentiveEarned, 0);
    const pendingAmount = pendingRewards.reduce((sum, r) => {
      const report = reports.find(rep => rep.id === r.reportId);
      return sum + (report?.spotincentiveEarned || 0);
    }, 0);

    return NextResponse.json({
      success: !hasFailures,
      message: 
        failedRewards.length > 0
          ? `Partial success: ${totalProcessed} processed, ${pendingRewards.length} pending, ${failedRewards.length} failed. ${benepikMessage}`
          : pendingRewards.length > 0
          ? `Reason of pending: ${benepikMessage}`
          : `All ${totalProcessed} rewards processed successfully`,
      data: {
        processed: totalProcessed,
        pending: pendingRewards.length,
        zeroIncentive: reportsWithZeroIncentive.length,
        failed: failedRewards.length,
        amounts: {
          totalRequested: totalAmountRequested,
          processedAmount: processedAmount,
          pendingAmount: pendingAmount,
        },
        successfulRewards: successfulRewards.map(r => ({
          reportId: r.reportId,
          transactionId: r.txnId,
          status: 'SUCCESS',
        })),
        pendingRewards: pendingRewards.map(r => ({
          reportId: r.reportId,
          transactionId: r.txnId,
          status: 'PENDING_BALANCE',
          reason: r.error,
        })),
        zeroIncentiveRewards: reportsWithZeroIncentive.map(r => ({
          reportId: r.id,
          status: 'SUCCESS',
          note: 'Zero incentive - auto marked as paid',
        })),
        failedRewards: failedRewards.map(r => ({
          reportId: r.reportId,
          error: r.error,
          message: batchResponse.message,
        })),
        benepikResponse: benepikResponse.data,
      },
    }, { status: hasFailures ? 207 : 200 });

  } catch (error: any) {
    console.error('❌ Error sending rewards:', error.message);
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      console.error('Benepik API Error:', {
        status,
        code: data?.code,
        message: data?.message,
        batchResponse: data?.batchResponse,
        rawData: typeof data === 'string' ? data.substring(0, 200) : data,
      });

      return NextResponse.json(
        {
          error: 'Benepik API error',
          code: data?.code || status,
          message: data?.message || 'Unknown error',
          details: data,
          httpStatus: status,
        },
        { status: status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
