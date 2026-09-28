/**
 * Utility Regulations & Legal Dispute Engine (Phase 12: Tenant Life Hub & Legal Concierge)
 * Strictly adheres to 00-core.md, Vietnamese Law 91/2025/QH15, Quyết định 2941/QĐ-BCT & Nghị định 17/2022/NĐ-CP.
 */

export interface UtilityTier {
  tier: number;
  minKwh: number;
  maxKwh: number;
  rateVnd: number;
  name: string;
}

export interface ElectricityBillCalculation {
  totalKwh: number;
  numberOfTenants: number;
  quotaCount: number;
  subtotalWithoutVat: number;
  vatAmount: number;
  totalCostVnd: number;
  averageRatePerKwh: number;
  tierBreakdown: Array<{
    tier: number;
    name: string;
    kwh: number;
    rateVnd: number;
    amountVnd: number;
  }>;
}

export type RiskSeverity = 'fair' | 'elevated' | 'excessive_illegal';

export interface UtilityRateAssessment {
  utilityType: 'electricity' | 'water';
  billedRate: number;
  recommendedLegalRate: number;
  isOvercharged: boolean;
  riskSeverity: RiskSeverity;
  percentageOverRate: number;
  penaltyNotice: string;
  legalBasis: string;
  actionRecommendation: string;
}

export type DisputeType =
  | 'electricity_overcharge'
  | 'water_overcharge'
  | 'deposit_refund'
  | 'maintenance_neglect';

export interface DisputeLetterInput {
  disputeType: DisputeType;
  tenantName: string;
  tenantPhone: string;
  landlordName: string;
  roomAddress: string;
  contractStartDate?: string;
  billedRate?: number;
  actualUsage?: number;
  excessAmountClaimed?: number;
  depositAmount?: number;
  handoverDate?: string;
  deadlineDays?: number;
}

export interface DisputeLetterOutput {
  disputeCode: string;
  title: string;
  legalBasis: string[];
  letterContent: string;
  disclaimer: string;
}

// EVN 6-tier residential tariff (Quyết định số 2941/QĐ-BCT ban hành bởi Bộ Công Thương)
export const EVN_RESIDENTIAL_TIERS: UtilityTier[] = [
  { tier: 1, minKwh: 0, maxKwh: 50, rateVnd: 1893, name: 'Bậc 1 (0 - 50 kWh)' },
  { tier: 2, minKwh: 51, maxKwh: 100, rateVnd: 1956, name: 'Bậc 2 (51 - 100 kWh)' },
  { tier: 3, minKwh: 101, maxKwh: 200, rateVnd: 2271, name: 'Bậc 3 (101 - 200 kWh)' },
  { tier: 4, minKwh: 201, maxKwh: 300, rateVnd: 2860, name: 'Bậc 4 (201 - 300 kWh)' },
  { tier: 5, minKwh: 301, maxKwh: 400, rateVnd: 3197, name: 'Bậc 5 (301 - 400 kWh)' },
  { tier: 6, minKwh: 401, maxKwh: 999999, rateVnd: 3302, name: 'Bậc 6 (từ 401 kWh trở lên)' },
];

export const MAX_FAIR_ELECTRICITY_RATE_VND = 3500;
export const ILLEGAL_ELECTRICITY_THRESHOLD_VND = 4000;
export const MAX_FAIR_WATER_RATE_VND = 25000;
export const ILLEGAL_WATER_THRESHOLD_VND = 35000;

export const MANDATORY_LEGAL_DISCLAIMER =
  'Khuyến cáo pháp lý: Trọ Việt cung cấp tài liệu này nhằm hỗ trợ người thuê thương lượng, đối thoại hòa giải trên tinh thần tôn trọng pháp luật và hợp đồng dân sự. Văn bản không thay thế cho quyết định xử phạt của cơ quan có thẩm quyền hoặc bản án của Tòa án nhân dân.';

/**
 * Calculates official residential EVN electricity bill according to 6-tier system & household quotas.
 * Every 4 tenants count as 1 household quota (Thông tư 09/2023/TT-BCT).
 */
export function calculateEvnResidentialElectricity(
  totalKwh: number,
  numberOfTenants = 1
): ElectricityBillCalculation {
  const safeKwh = Math.max(0, Math.round(totalKwh));
  const safeTenants = Math.max(1, numberOfTenants);
  const quotaCount = Math.max(1, Math.ceil(safeTenants / 4));

  let remainingKwh = safeKwh;
  let subtotalWithoutVat = 0;
  const tierBreakdown: ElectricityBillCalculation['tierBreakdown'] = [];

  const tierLimits = [
    50 * quotaCount, // tier 1
    50 * quotaCount, // tier 2
    100 * quotaCount, // tier 3
    100 * quotaCount, // tier 4
    100 * quotaCount, // tier 5
    Infinity, // tier 6
  ];

  for (let i = 0; i < EVN_RESIDENTIAL_TIERS.length; i++) {
    const tier = EVN_RESIDENTIAL_TIERS[i];
    const tierLimit = tierLimits[i];

    if (remainingKwh <= 0) {
      tierBreakdown.push({
        tier: tier.tier,
        name: tier.name,
        kwh: 0,
        rateVnd: tier.rateVnd,
        amountVnd: 0,
      });
      continue;
    }

    const kwhInThisTier = Math.min(remainingKwh, tierLimit);
    const amountVnd = Math.round(kwhInThisTier * tier.rateVnd);
    subtotalWithoutVat += amountVnd;
    remainingKwh -= kwhInThisTier;

    tierBreakdown.push({
      tier: tier.tier,
      name: tier.name,
      kwh: kwhInThisTier,
      rateVnd: tier.rateVnd,
      amountVnd,
    });
  }

  const vatAmount = Math.round(subtotalWithoutVat * 0.08); // 8% VAT
  const totalCostVnd = subtotalWithoutVat + vatAmount;
  const averageRatePerKwh = safeKwh > 0 ? Math.round(totalCostVnd / safeKwh) : 0;

  return {
    totalKwh: safeKwh,
    numberOfTenants: safeTenants,
    quotaCount,
    subtotalWithoutVat,
    vatAmount,
    totalCostVnd,
    averageRatePerKwh,
    tierBreakdown,
  };
}

/**
 * Assesses whether a landlord's billed rate exceeds statutory limits.
 */
export function assessUtilityRate(
  utilityType: 'electricity' | 'water',
  billedRate: number
): UtilityRateAssessment {
  if (utilityType === 'electricity') {
    const recommendedLegalRate = EVN_RESIDENTIAL_TIERS[2].rateVnd; // Bậc 3: 2,271 ₫/kWh
    const isOvercharged = billedRate > MAX_FAIR_ELECTRICITY_RATE_VND;
    const isIllegal = billedRate >= ILLEGAL_ELECTRICITY_THRESHOLD_VND;

    let riskSeverity: RiskSeverity = 'fair';
    let penaltyNotice = 'Mức giá nằm trong biên độ thỏa thuận chấp nhận được.';
    let actionRecommendation = 'Tiếp tục theo dõi chỉ số điện hàng tháng và đối soát hóa đơn.';

    if (isIllegal) {
      riskSeverity = 'excessive_illegal';
      penaltyNotice =
        'Theo Khoản 6 Điều 12 Nghị định 134/2013/NĐ-CP (sửa đổi bởi Nghị định 17/2022/NĐ-CP): Hành vi thu tiền điện cao hơn giá quy định bị xử phạt tiền từ 20.000.000 ₫ đến 30.000.000 ₫.';
      actionRecommendation =
        'Gửi Thư đề nghị điều chỉnh đơn giá điện về giá bậc thang nhà nước hoặc giá bậc 3 thỏa thuận theo Thông tư 09/2023/TT-BCT.';
    } else if (isOvercharged) {
      riskSeverity = 'elevated';
      penaltyNotice =
        'Giá điện cao hơn mức bán lẻ sinh hoạt trung bình của EVN (khoảng 2.000 - 3.000 ₫/kWh).';
      actionRecommendation =
        'Nên trao đổi với chủ trọ để đăng ký định mức điện sinh hoạt theo số lượng người tạm trú.';
    }

    const percentageOverRate = Math.round(
      ((billedRate - recommendedLegalRate) / recommendedLegalRate) * 100
    );

    return {
      utilityType,
      billedRate,
      recommendedLegalRate,
      isOvercharged,
      riskSeverity,
      percentageOverRate: Math.max(0, percentageOverRate),
      penaltyNotice,
      legalBasis:
        'Quyết định 2941/QĐ-BCT, Thông tư 09/2023/TT-BCT và Nghị định 17/2022/NĐ-CP của Chính phủ.',
      actionRecommendation,
    };
  }

  // Water Assessment
  const recommendedLegalRate = 16000; // Định mức trung bình đô thị
  const isOvercharged = billedRate > MAX_FAIR_WATER_RATE_VND;
  const isIllegal = billedRate >= ILLEGAL_WATER_THRESHOLD_VND;

  let riskSeverity: RiskSeverity = 'fair';
  let penaltyNotice = 'Đơn giá nước sinh hoạt nằm trong mức thông lệ thị trường.';
  let actionRecommendation = 'Ghi nhận chỉ số đồng hồ nước tại biên bản bàn giao phòng.';

  if (isIllegal) {
    riskSeverity = 'excessive_illegal';
    penaltyNotice =
      'Đơn giá nước vượt 35.000 ₫/m³ thường bao gồm chi phí hao hụt không minh bạch, cao hơn 2-3 lần đơn giá quy chuẩn đô thị.';
    actionRecommendation =
      'Đề nghị chủ trọ kiểm tra rò rỉ đường ống hoặc cung cấp hóa đơn gốc của công ty cấp nước địa phương.';
  } else if (isOvercharged) {
    riskSeverity = 'elevated';
    penaltyNotice = 'Đơn giá nước cao hơn định mức thông thường tại các đô thị.';
    actionRecommendation = 'Thỏa thuận đăng ký định mức theo nhân khẩu tạm trú với công ty cấp nước.';
  }

  const percentageOverRate = Math.round(
    ((billedRate - recommendedLegalRate) / recommendedLegalRate) * 100
  );

  return {
    utilityType,
    billedRate,
    recommendedLegalRate,
    isOvercharged,
    riskSeverity,
    percentageOverRate: Math.max(0, percentageOverRate),
    penaltyNotice,
    legalBasis: 'Khung giá tiêu chuẩn nước sinh hoạt đô thị và Luật Giá 2023.',
    actionRecommendation,
  };
}

/**
 * Generates an authoritative, respectful legal negotiation letter for tenants.
 */
export function generateDisputeLetter(input: DisputeLetterInput): DisputeLetterOutput {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const disputeCode = `DISP${randomSuffix}`;
  const deadlineDays = input.deadlineDays ?? 5;

  let title = '';
  const legalBasis: string[] = [];
  let bodyContent = '';

  if (input.disputeType === 'electricity_overcharge') {
    title = 'ĐƠN ĐỀ NGHỊ ĐIỀU CHỈNH ĐƠN GIÁ TIỀN ĐIỆN THEO QUY ĐỊNH PHÁP LUẬT';
    legalBasis.push('Thông tư số 09/2023/TT-BCT ngày 16/10/2023 của Bộ Công Thương');
    legalBasis.push('Nghị định số 134/2013/NĐ-CP sửa đổi bởi Nghị định số 17/2022/NĐ-CP (Khoản 6 Điều 12)');
    legalBasis.push('Quyết định số 2941/QĐ-BCT của Bộ Công Thương về biểu giá bán lẻ điện sinh hoạt');

    const excessNotice = input.excessAmountClaimed
      ? `Số tiền chênh lệch tạm tính cần đối soát: ${input.excessAmountClaimed.toLocaleString('vi-VN')} ₫.`
      : '';

    bodyContent = `Kính gửi: Ông/Bà ${input.landlordName} (Chủ nhà/Người quản lý phòng trọ),

Tôi tên là: ${input.tenantName} - Số điện thoại: ${input.tenantPhone}
Hiện đang thuê và sinh sống tại: ${input.roomAddress}

Bằng văn bản này, tôi xin phép được trao đổi và trân trọng đề nghị Ông/Bà xem xét điều chỉnh lại đơn giá thu tiền điện sinh hoạt đang áp dụng tại phòng trọ của tôi, cụ thể như sau:

1. Hiện tại, phòng tôi đang được thông báo thu tiền điện với đơn giá là: ${input.billedRate?.toLocaleString('vi-VN') || '[Chưa điền]'} ₫/kWh.
2. Căn cứ theo quy định tại Thông tư 09/2023/TT-BCT của Bộ Công Thương: Đối với người thuê nhà để ở, nếu không thể kê khai số người để cấp định mức thì áp dụng giá bán lẻ điện bậc 3 (2.271 ₫/kWh chưa gồm VAT) cho toàn bộ sản lượng đo đếm được. Trường hợp đăng ký tạm trú đủ 04 người thì được cấp 01 định mức sinh hoạt bậc thang của EVN.
3. Đồng thời, Khoản 6 Điều 12 Nghị định 134/2013/NĐ-CP (được sửa đổi bởi Nghị định 17/2022/NĐ-CP) quy định mức xử phạt vi phạm hành chính từ 20.000.000 ₫ đến 30.000.000 ₫ đối với hành vi thu tiền điện của người thuê nhà cao hơn giá quy định.
${excessNotice}

Tôi rất mong muốn đôi bên tiếp tục duy trì mối quan hệ thuê nhà thuận hòa, minh bạch và đúng pháp luật. Do đó, tôi kính đề nghị Ông/Bà:
- Hỗ trợ làm thủ tục đăng ký tạm trú và kê khai định mức điện với chi nhánh Điện lực địa phương (EVN), HOẶC
- Điều chỉnh áp dụng thu tiền điện theo đúng biểu giá quy định của Nhà nước kể từ kỳ thanh toán này.

Kính mong nhận được phản hồi quý báu từ Ông/Bà trong vòng ${deadlineDays} ngày làm việc kể từ ngày nhận được thông báo này.`;
  } else if (input.disputeType === 'deposit_refund') {
    title = 'THƯ ĐỀ NGHỊ HOÀN TRẢ TIỀN ĐẶT CỌC THUÊ NHÀ';
    legalBasis.push('Điều 328 Bộ luật Dân sự 2015 (Quy định về Đặt cọc)');
    legalBasis.push('Điều 472 và Điều 482 Bộ luật Dân sự 2015 (Nghĩa vụ trả lại tài sản thuê)');
    legalBasis.push('Luật Nhà ở 2023');

    const depositFormatted = input.depositAmount
      ? `${input.depositAmount.toLocaleString('vi-VN')} ₫`
      : '[Mức tiền cọc]';

    bodyContent = `Kính gửi: Ông/Bà ${input.landlordName},

Tôi tên là: ${input.tenantName} - Số điện thoại: ${input.tenantPhone}
Là bên thuê nhà tại địa chỉ: ${input.roomAddress}

Tôi viết thư này để chính thức đề nghị Ông/Bà thực hiện nghĩa vụ hoàn trả khoản tiền đặt cọc thuê nhà theo đúng thỏa thuận hợp đồng và quy định của pháp luật:

1. Khoản tiền cọc đã bàn giao: ${depositFormatted}.
2. Ngày bàn giao phòng và chấm dứt thuê: ${input.handoverDate || 'Theo thỏa thuận hai bên'}.
3. Tôi đã thực hiện đầy đủ nghĩa vụ:
   - Thông báo trước thời hạn chấm dứt hợp đồng theo quy định.
   - Thanh toán đầy đủ các hóa đơn tiền phòng, tiền điện, nước đến thời điểm bàn giao.
   - Bàn giao lại hiện trạng phòng trọ và trang thiết bị nguyên vẹn như biên bản giao nhận.

Căn cứ Điều 328 Bộ luật Dân sự 2015, khi hợp đồng chấm dứt mà bên thuê không có vi phạm nghĩa vụ, bên nhận đặt cọc có nghĩa vụ hoàn trả lại toàn bộ tài sản đặt cọc cho bên đặt cọc.

Kính đề nghị Ông/Bà thực hiện chuyển khoản hoàn trả số tiền cọc nói trên vào tài khoản của tôi trong thời hạn ${deadlineDays} ngày kể từ ngày nhận được thư này. Trường hợp quá thời hạn mà không nhận được phản hồi hoặc giải quyết thỏa đáng, tôi sẽ buộc phải kiến nghị lên UBND/Công an Phường nơi có bất động sản để nhờ can thiệp hòa giải theo pháp luật.`;
  } else {
    title = 'VĂN BẢN KIẾN NGHỊ VỀ QUYỀN LỢI VÀ HỢP ĐỒNG THUÊ TRỌ';
    legalBasis.push('Bộ luật Dân sự 2015');
    legalBasis.push('Luật Nhà ở hiện hành');

    bodyContent = `Kính gửi: Ông/Bà ${input.landlordName},

Tôi là ${input.tenantName}, hiện đang thuê phòng tại ${input.roomAddress}.
Tôi làm đơn này kính đề nghị Ông/Bà phối hợp kiểm tra, bảo trì trang thiết bị và đối soát các chi phí sinh hoạt phát sinh theo đúng cam kết trong Hợp đồng thuê phòng.

Rất mong nhận được sự hỗ trợ và phản hồi từ Ông/Bà trong thời gian sớm nhất.`;
  }

  return {
    disputeCode,
    title,
    legalBasis,
    letterContent: bodyContent,
    disclaimer: MANDATORY_LEGAL_DISCLAIMER,
  };
}
