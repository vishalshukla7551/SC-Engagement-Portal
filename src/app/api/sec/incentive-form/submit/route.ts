import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserFromCookies } from '@/lib/auth';

/**
 * Flagship device model names for the Reliance Digital 2026 campaign.
 * These devices receive higher incentives (ADLD: ₹200, COMBO: ₹400).
 * All other devices are Non-Flagship (ADLD: ₹100, COMBO: ₹200).
 */
const FLAGSHIP_MODEL_KEYWORDS = [
  'z flip 6', 'z flip6',
  'z flip 7', 'z flip7',
  'z fold 6', 'z fold6',
  'z fold 7', 'z fold7',
  's24 ultra', 's24ultra',
  's24+',
  's24 plus',
  's24',
  's25 ultra', 's25ultra',
  's25+',
  's25 plus',
  's25 edge',
  's25',
];

/**
 * Campaign configuration for Reliance Digital 2026
 */
const RELIANCE_CAMPAIGN = {
  startDate: new Date('2026-02-19T00:00:00.000+05:30'),
  storePrefix: 'Reliance Digital',
  boosterThreshold: 75000,      // ₹75,000 cumulative plan sales
  boosterAmount: 1000,           // ₹1,000 one-time booster
  incentives: {
    flagship: {
      ADLD_1_YR: 200,
      COMBO_2_YRS: 400,
    },
    nonFlagship: {
      ADLD_1_YR: 100,
      COMBO_2_YRS: 200,
    },
  },
};

/**
 * Check if a device is a flagship based on its model name.
 * Checks both Category and ModelName fields.
 */
function isFlagshipDevice(category: string, modelName: string): boolean {
  const combined = `${category} ${modelName}`.toLowerCase();
  return FLAGSHIP_MODEL_KEYWORDS.some(keyword => combined.includes(keyword.toLowerCase()));
}

/**
 * Calculate spot incentive for this submission based on device type and plan type.
 */
function calculateBaseIncentive(isFlagship: boolean, planType: string): number {
  const tier = isFlagship ? RELIANCE_CAMPAIGN.incentives.flagship : RELIANCE_CAMPAIGN.incentives.nonFlagship;

  if (planType === 'ADLD_1_YR') return tier.ADLD_1_YR;
  if (planType === 'COMBO_2_YRS') return tier.COMBO_2_YRS;

  // Screen Protect, Extended Warranty, etc. → no spot incentive in this campaign
  return 0;
}

/**
 * POST /api/sec/incentive-form/submit
 *
 * RELIANCE DIGITAL CAMPAIGN 2026
 * - Only Reliance Digital store SECs can submit
 * - Profile must be complete (photo, DOB, marital status)
 * - Flagship vs Non-Flagship tiered incentives
 * - One-time ₹1,000 booster when cumulative plan sales ≥ ₹75,000
 * - Selfie with POSM image URL stored in metadata
 */
export async function POST(req: NextRequest) {
  try {
    const cookies = await (await import('next/headers')).cookies();
    const authUser = await getAuthenticatedUserFromCookies(cookies as any);

    if (!authUser || authUser.role !== 'SEC') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { deviceId, planId, imei, dateOfSale, clientSecPhone, clientStoreId, selfieUrl } = body;

    // ─── Auth: Get SEC phone from server (cannot be manipulated) ───────────────
    const secPhone = authUser.username;

    if (clientSecPhone && clientSecPhone !== secPhone) {
      return NextResponse.json(
        { error: 'Security violation: SEC phone mismatch detected. Please logout and login again.' },
        { status: 403 }
      );
    }

    // ─── Fetch SEC user ────────────────────────────────────────────────────────
    const secUser = await prisma.sEC.findUnique({
      where: { phone: secPhone },
      include: {
        store: {
          select: { id: true, name: true, city: true },
        },
      },
    });

    if (!secUser) {
      return NextResponse.json(
        { error: 'SEC profile not found. Please complete onboarding first.' },
        { status: 404 }
      );
    }

    const storeId = secUser.storeId;

    if (!storeId || !secUser.store) {
      return NextResponse.json(
        { error: 'No store assigned to your profile. Please complete onboarding.' },
        { status: 400 }
      );
    }

    if (clientStoreId && clientStoreId !== storeId) {
      return NextResponse.json(
        { error: 'Security violation: Store ID mismatch detected. Please logout and login again.' },
        { status: 403 }
      );
    }

    // ─── CHECK 1: Reliance Digital Store Only ─────────────────────────────────
    const storeName = secUser.store.name || '';
    const isRelianceStore = storeName.startsWith(RELIANCE_CAMPAIGN.storePrefix);

    if (!isRelianceStore) {
      return NextResponse.json(
        {
          error: 'Sales submissions are currently closed.',
          code: 'SUBMISSIONS_CLOSED',
        },
        { status: 403 }
      );
    }

    // ─── CHECK 2: Profile Completeness ────────────────────────────────────────
    const otherProfile = secUser.otherProfileInfo as any;
    const hasPhoto = !!(otherProfile?.photoUrl);
    const hasDOB = !!(otherProfile?.birthday);
    const hasMaritalStatus = otherProfile?.maritalStatus !== undefined && otherProfile?.maritalStatus !== null;

    if (!hasPhoto || !hasDOB || !hasMaritalStatus) {
      const missing = [];
      if (!hasPhoto) missing.push('Profile Photo');
      if (!hasDOB) missing.push('Date of Birth');
      if (!hasMaritalStatus) missing.push('Marital Status');

      return NextResponse.json(
        {
          error: `Please complete your profile to submit: ${missing.join(', ')} missing.`,
          code: 'PROFILE_INCOMPLETE',
          missingFields: missing,
        },
        { status: 403 }
      );
    }

    // ─── CHECK 3: Selfie with POSM is mandatory ───────────────────────────────
    if (!selfieUrl || typeof selfieUrl !== 'string' || !selfieUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Selfie with Samsung ProtectMax POSM is mandatory. Please upload your selfie.' },
        { status: 400 }
      );
    }

    // ─── CHECK 4: Required fields ─────────────────────────────────────────────
    if (!deviceId || !planId || !imei) {
      return NextResponse.json(
        { error: 'All fields are required: deviceId, planId, imei' },
        { status: 400 }
      );
    }

    // ─── CHECK 5: IMEI format ─────────────────────────────────────────────────
    const imeiRegex = /^\d{15}$/;
    if (!imeiRegex.test(imei)) {
      return NextResponse.json(
        { error: 'IMEI must be exactly 15 digits' },
        { status: 400 }
      );
    }

    // ─── CHECK 6: IMEI duplicate ──────────────────────────────────────────────
    const existingSpotReport = await prisma.spotIncentiveReport.findUnique({
      where: { imei },
    });

    if (existingSpotReport) {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
      );
    }

    // ─── Validate device ──────────────────────────────────────────────────────
    const device = await prisma.samsungSKU.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    // ─── Validate plan ────────────────────────────────────────────────────────
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    if (plan.samsungSKUId !== deviceId) {
      return NextResponse.json(
        { error: 'Selected plan does not belong to the selected device' },
        { status: 400 }
      );
    }

    // ─── INCENTIVE CALCULATION ────────────────────────────────────────────────

    // Step 1: Flagship check
    const flagship = isFlagshipDevice(device.Category, device.ModelName);

    // Step 2: Base incentive
    const baseIncentive = calculateBaseIncentive(flagship, plan.planType);

    // Step 3: Booster check
    // Fetch all previous submissions by this SEC in the campaign period
    const previousReports = await prisma.spotIncentiveReport.findMany({
      where: {
        secId: secUser.id,
        Date_of_sale: { gte: RELIANCE_CAMPAIGN.startDate },
      },
      include: {
        plan: { select: { price: true } },
      },
    });

    // Sum of all previous plan sales values
    const previousCumulativeSales = previousReports.reduce(
      (sum, report) => sum + (report.plan?.price || 0),
      0
    );

    // New cumulative total including this submission
    const newCumulativeSales = previousCumulativeSales + plan.price;

    // Check if booster was already given in any previous submission
    const boosterAlreadyGiven = previousReports.some(
      (report) => (report.metadata as any)?.boosterApplied === true
    );

    // Apply booster if threshold crossed for the first time
    let boosterAmount = 0;
    let boosterTriggered = false;

    if (!boosterAlreadyGiven && newCumulativeSales >= RELIANCE_CAMPAIGN.boosterThreshold) {
      boosterAmount = RELIANCE_CAMPAIGN.boosterAmount;
      boosterTriggered = true;
    }

    const totalIncentive = baseIncentive + boosterAmount;

    // ─── Sale date ────────────────────────────────────────────────────────────
    const now = new Date();
    const saleDate = dateOfSale ? new Date(dateOfSale) : now;

    // ─── Create SpotIncentiveReport ───────────────────────────────────────────
    const spotReport = await prisma.spotIncentiveReport.create({
      data: {
        secId: secUser.id,
        storeId: secUser.store.id,
        samsungSKUId: device.id,
        planId: plan.id,
        imei,
        spotincentiveEarned: totalIncentive,
        isCompaignActive: true,
        Date_of_sale: saleDate,
        metadata: {
          campaign: 'RELIANCE_DIGITAL_2026',
          isFlagship: flagship,
          baseIncentive,
          boosterApplied: boosterTriggered,
          boosterAmount,
          selfieUrl,
          totalCumulativeSales: newCumulativeSales,
          storeName,
        },
      },
      include: {
        secUser: { select: { id: true, phone: true, fullName: true } },
        store: { select: { id: true, name: true, city: true } },
        samsungSKU: { select: { id: true, Category: true, ModelName: true } },
        plan: { select: { id: true, planType: true, price: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Spot incentive report submitted successfully',
        salesReport: {
          id: spotReport.id,
          imei: spotReport.imei,
          incentiveEarned: spotReport.spotincentiveEarned,
          dateOfSale: spotReport.Date_of_sale,
          isCampaignActive: spotReport.isCompaignActive,
          store: spotReport.store,
          device: spotReport.samsungSKU,
          plan: spotReport.plan,
        },
        incentiveBreakdown: {
          isFlagship: flagship,
          baseIncentive,
          boosterApplied: boosterTriggered,
          boosterAmount,
          totalIncentive,
          cumulativePlanSales: newCumulativeSales,
          remainingToBooster: boosterAlreadyGiven
            ? 0
            : Math.max(0, RELIANCE_CAMPAIGN.boosterThreshold - newCumulativeSales),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sec/incentive-form/submit', error);

    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This IMEI has already been submitted' },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
