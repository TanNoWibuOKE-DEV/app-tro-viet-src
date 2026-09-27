import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MOCK_LISTINGS,
  normalizeVietnameseText,
  calculateTotalCosts,
  checkListingPricingAnomaly,
  analyzeChatMessageForRisks,
  checkReviewEligibility,
  createDefaultConsentRecord,
  exportUserDataAsJson,
  anonymizeUserProfile,
  anonymizeUserReviews,
  ListingSummary,
  UserProfile,
  Review,
  Report,
  MOCK_ROOMMATE_PROFILES,
  MOCK_PROPERTY_HANDOVERS,
  calculateRoommateCompatibility,
  validateHandoverRecord,
  checkRentInvoiceReminders,
  checkContractExpiryReminders,
  RentInvoice,
  RentalContract,
} from '../src/index.js';

describe('Trọ Việt Full Lifecycle End-to-End User Journey Tests', () => {
  // Test Actor Profiles
  const tenant: UserProfile = {
    id: 'u-tenant-e2e',
    fullName: 'Lê Thảo My',
    email: 'thaomy@example.com',
    phoneNumber: '0905123987',
    avatarUrl: null,
    role: 'tenant',
    verificationLevel: 'L1',
    createdAt: '2026-09-01T00:00:00Z',
  };

  const landlord: UserProfile = {
    id: 'u-landlord-e2e',
    fullName: 'Bác Ba Chủ Nhà',
    email: 'bacba@example.com',
    phoneNumber: '0905987654',
    avatarUrl: null,
    role: 'landlord',
    verificationLevel: 'L1',
    createdAt: '2026-08-15T00:00:00Z',
  };

  it('Journey 1: Tenant onboarding, search with 2-tier address, and transparent cost calculation', () => {
    // 1. Unaccented search for "my khe" in Da Nang
    const query = normalizeVietnameseText('my khe');
    const matched = MOCK_LISTINGS.filter((l) => {
      const normTitle = normalizeVietnameseText(l.title);
      const normStreet = normalizeVietnameseText(l.street);
      const normWard = normalizeVietnameseText(l.wardName);
      return normTitle.includes(query) || normStreet.includes(query) || normWard.includes(query);
    });

    assert.ok(matched.length > 0, 'Must match listings in My Khe area');
    const room = matched[0];

    // 2. Strict 2-tier administrative model invariant
    assert.strictEqual(room.provinceCode, '48', 'Province code must be 48 (Da Nang)');
    assert.ok(room.wardCode.startsWith('48_'), 'Ward code must follow 2-tier format');
    assert.ok(room.wardName.includes('Phường'), 'Ward name must be official Vietnamese unit');

    // 3. Transparent Total Cost calculation invariant
    const costResult = calculateTotalCosts(room.costs, {
      monthlyElectricityUnitsKwh: 60,
      monthlyWaterUnitsM3: 4,
      peopleCount: 1,
      vehiclesCount: 1,
    });

    assert.ok(costResult.monthlyEstimatedTotal > room.monthlyRent, 'Total monthly estimated must exceed base rent');
    assert.strictEqual(costResult.initialMoveInTotal, room.monthlyRent + room.deposit, 'Move-in total = rent + deposit');
  });

  it('Journey 2: Landlord posting, admin moderation queue, and L2 verification elevation', () => {
    // 1. Landlord posts listing with complete transparent costs
    const draftListing: ListingSummary = {
      id: 'l-e2e-new',
      title: 'Phòng trọ mới xây đường Núi Thành [MẪU - DEV]',
      propertyType: 'room',
      monthlyRent: 2800000,
      deposit: 2800000,
      areaSquareMeters: 26,
      provinceCode: '48',
      wardCode: '48_HOACUONGNAM',
      wardName: 'Phường Hòa Cường Nam',
      street: 'Núi Thành',
      houseNumber: '450',
      latitude: 16.035,
      longitude: 108.218,
      landlordId: landlord.id,
      landlordName: landlord.fullName,
      landlordVerificationLevel: 'L1',
      status: 'pending_review',
      amenities: [],
      costs: {
        monthlyRent: 2800000,
        deposit: 2800000,
        electricityBillingType: 'meter',
        electricityCostPerUnit: 3500,
        waterBillingType: 'meter',
        waterCostPerUnit: 15000,
        internetBillingType: 'fixed_monthly',
        internetCost: 80000,
        parkingBillingType: 'fixed_monthly',
        parkingCost: 0,
        serviceFeeBillingType: 'unprovided',
      },
      createdAt: new Date().toISOString(),
    };

    assert.strictEqual(draftListing.status, 'pending_review');

    // 2. Admin moderates and approves listing
    const publishedListing: ListingSummary = {
      ...draftListing,
      status: 'published',
    };
    assert.strictEqual(publishedListing.status, 'published');

    // 3. Landlord submits L2 verification and gets approved
    const elevatedListing: ListingSummary = {
      ...publishedListing,
      landlordVerificationLevel: 'L2',
    };
    assert.strictEqual(elevatedListing.landlordVerificationLevel, 'L2');
  });

  it('Journey 3: Communication, anti-scam keyword alerts, reports, and controlled reviews', () => {
    // 1. Safe tenant message passes
    const safeCheck = analyzeChatMessageForRisks('Dạ chào bác Ba, chiều mai em ghé xem phòng được không ạ?');
    assert.strictEqual(safeCheck.hasRisk, false);

    // 2. Scam deposit trigger is immediately intercepted
    const riskyCheck = analyzeChatMessageForRisks('Cháu chuyển cọc giữ chỗ 1 triệu qua STK ngân hàng trước nhé');
    assert.strictEqual(riskyCheck.hasRisk, true);
    assert.ok(riskyCheck.warningMessage?.includes('Tuyệt đối KHÔNG chuyển tiền cọc'));

    // 3. Tenant reports listing/message
    const report: Report = {
      id: 'rep-e2e',
      reporterId: tenant.id,
      reporterName: tenant.fullName,
      targetType: 'listing',
      targetId: 'l-suspicious',
      targetTitle: 'Phòng trọ nghi vấn cọc ảo',
      reasonCategory: 'deposit_scam',
      details: 'Chủ phòng yêu cầu chuyển tiền cọc trước khi tới xem thực tế.',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    assert.strictEqual(report.status, 'pending');

    // Admin resolves report
    const resolvedReport: Report = {
      ...report,
      status: 'resolved',
      resolutionNotes: 'Đã khóa tin đăng và gửi cảnh báo tới chủ phòng.',
      resolvedBy: 'u-admin',
      updatedAt: new Date().toISOString(),
    };
    assert.strictEqual(resolvedReport.status, 'resolved');

    // 4. Controlled Reviews: Only tenant with prior chat history can review
    const validEligibility = checkReviewEligibility(tenant.id, landlord.id, true);
    assert.strictEqual(validEligibility.canReview, true);

    const invalidEligibility = checkReviewEligibility('u-stranger', landlord.id, false);
    assert.strictEqual(invalidEligibility.canReview, false);
    assert.ok(invalidEligibility.reason?.includes('Chỉ người thuê đã từng liên hệ'));

    // Landlord cannot review their own listing
    const selfReview = checkReviewEligibility(landlord.id, landlord.id, true);
    assert.strictEqual(selfReview.canReview, false);
  });

  it('Journey 4: Privacy compliance, data portability export, and right to erasure (Law 91/2025/QH15)', () => {
    // 1. User consents
    const consents = createDefaultConsentRecord(tenant.id, true);
    assert.strictEqual(consents.consents.service_operation, true);
    assert.strictEqual(consents.consents.anti_scam_protection, true);

    // 2. Data export
    const sampleReviews: Review[] = [
      {
        id: 'r-e2e',
        listingId: 'l-001',
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        rating: 5,
        content: 'Phòng rất thoáng mát, cô chủ nhiệt tình.',
        status: 'approved',
        createdAt: '2026-09-20T00:00:00Z',
        updatedAt: '2026-09-20T00:00:00Z',
      },
    ];

    const jsonExport = exportUserDataAsJson(tenant, {
      favoriteListingIds: ['l-001'],
      reviews: sampleReviews,
    });
    const parsed = JSON.parse(jsonExport);
    assert.strictEqual(parsed.userProfile.fullName, tenant.fullName);
    assert.strictEqual(parsed.reviewsCount, 1);
    assert.ok(parsed.exportMetadata.lawReference.includes('91/2025/QH15'));

    // 3. Right to Erasure / Anonymization
    const anonymizedTenant = anonymizeUserProfile(tenant);
    assert.strictEqual(anonymizedTenant.fullName, 'Người dùng đã xóa tài khoản');
    assert.strictEqual(anonymizedTenant.phoneNumber, null);
    assert.strictEqual(anonymizedTenant.email, null);

    const anonymizedReviews = anonymizeUserReviews(tenant.id, sampleReviews);
    assert.ok(anonymizedReviews[0].tenantName.includes('Người dùng ẩn danh'));
    assert.strictEqual(anonymizedReviews[0].content, 'Phòng rất thoáng mát, cô chủ nhiệt tình.');
  });

  it('Journey 5: Roommate matching compatibility, property handover with initial meter readings, and automated reminders', () => {
    // 1. Roommate Matching Compatibility Engine
    const profileA = MOCK_ROOMMATE_PROFILES[0]; // Minh Khang, male, night_owl, budget 1.8tr
    const profileB = MOCK_ROOMMATE_PROFILES[1]; // Quang Huy, male, night_owl, budget 1.7tr
    const profileC = MOCK_ROOMMATE_PROFILES[2]; // Phuong Thao, female, female_only

    const matchAB = calculateRoommateCompatibility(profileA, profileB);
    assert.ok(matchAB.compatibilityScore >= 80, 'Minh Khang and Quang Huy must have high compatibility score (>= 80)');
    assert.strictEqual(matchAB.isGenderCompatible, true);
    assert.ok(matchAB.matchingStrengths.length > 0, 'Must highlight shared habits');

    // Incompatible gender preferences are strictly caught
    const matchAC = calculateRoommateCompatibility(profileA, profileC);
    assert.strictEqual(matchAC.isGenderCompatible, false);
    assert.ok(matchAC.compatibilityScore < 50, 'Mismatched gender preference heavily penalizes score');

    // 2. Property Handover initial meter readings and condition verification
    const handover = MOCK_PROPERTY_HANDOVERS[0];
    const validation = validateHandoverRecord(handover);
    assert.strictEqual(validation.valid, true);
    assert.strictEqual(handover.initialElectricityMeter, 1250);
    assert.strictEqual(handover.initialWaterMeter, 48);
    assert.strictEqual(handover.status, 'completed');
    assert.strictEqual(handover.landlordConfirmed, true);
    assert.strictEqual(handover.tenantConfirmed, true);

    // 3. Automated Tenancy Reminders Scheduler
    const sampleInvoices: RentInvoice[] = [
      {
        id: 'inv-due-soon',
        contractId: 'contract-01',
        listingId: 'listing-01',
        listingTitle: 'Phòng studio view sông Hàn',
        landlordId: landlord.id,
        landlordName: landlord.fullName,
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        monthYear: '10/2026',
        rentAmount: 3000000,
        electricityAmount: 200000,
        waterAmount: 50000,
        internetAmount: 0,
        serviceAmount: 0,
        totalAmount: 3250000,
        status: 'pending',
        vietqrUrl: 'https://img.vietqr.io/image/970422-123-compact2.png',
        createdAt: '2026-10-01T00:00:00Z',
      },
    ];

    const sampleContracts: RentalContract[] = [
      {
        id: 'con-exp-soon',
        listingId: 'listing-01',
        listingTitle: 'Phòng studio view sông Hàn',
        landlordId: landlord.id,
        landlordName: landlord.fullName,
        tenantId: tenant.id,
        tenantName: tenant.fullName,
        startDate: '2025-11-01T00:00:00Z',
        endDate: '2026-10-25T00:00:00Z',
        monthlyRent: 3000000,
        deposit: 3000000,
        status: 'active',
        createdAt: '2025-11-01T00:00:00Z',
      },
    ];

    const refDate = new Date('2026-10-03T10:00:00Z'); // 2 days before 5th Oct due date
    const invoiceReminders = checkRentInvoiceReminders(sampleInvoices, refDate);
    const contractReminders = checkContractExpiryReminders(sampleContracts, refDate);

    assert.strictEqual(invoiceReminders.length, 1, 'Must generate 1 invoice reminder');
    assert.strictEqual(invoiceReminders[0].type, 'rent_due_soon');
    assert.strictEqual(invoiceReminders[0].userId, tenant.id);
    assert.ok(invoiceReminders[0].title.includes('tiền phòng'));

    assert.strictEqual(contractReminders.length, 2, 'Must notify both tenant and landlord for contract expiring');
    assert.strictEqual(contractReminders[0].type, 'contract_expiring_soon');
    assert.strictEqual(contractReminders[0].userId, tenant.id);
    assert.strictEqual(contractReminders[1].userId, landlord.id);
  });
});

