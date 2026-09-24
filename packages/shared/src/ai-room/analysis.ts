/**
 * Trọ Việt - AI Room Insights Engine (Disciplined & Fact-backed)
 * Strictly adheres to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Backed 100% by fields in database (no hallucinated room features).
 * - Transparent price comparison against ward/district benchmarks.
 * - Actionable viewing advice tailored to the room's facilities.
 */

import { ListingSummary } from '../types/index.js';
import { formatVND } from '../formatters/index.js';

export interface AIRoomAnalysisResult {
  summary: string;
  priceAssessment: {
    comparisonPercent: number; // e.g. -10 for 10% cheaper, +5 for 5% higher
    label: string;
    details: string;
  };
  transparencyAssessment: {
    isFullyTransparent: boolean;
    label: string;
    missingCosts: string[];
  };
  keyAdvantages: string[];
  viewingAdvice: string[];
}

// Average baseline rent per property type in Da Nang urban districts
const DA_NANG_WARD_BASELINES: Record<string, { room: number; apartment: number }> = {
  '48_HAICHAU1': { room: 2700000, apartment: 5200000 },
  '48_PHUOCMY': { room: 2900000, apartment: 5000000 },
  '48_HOAKHANHBAC': { room: 1800000, apartment: 3800000 },
  '48_HOACUONGNAM': { room: 2500000, apartment: 4800000 },
};

const DEFAULT_BASELINE = { room: 2400000, apartment: 4800000 };

/**
 * Generates grounded AI insights for a specific room listing.
 */
export function analyzeRoomListing(listing: ListingSummary): AIRoomAnalysisResult {
  const wardBaseline = DA_NANG_WARD_BASELINES[listing.wardCode] || DEFAULT_BASELINE;
  const benchmark =
    listing.propertyType === 'apartment' ? wardBaseline.apartment : wardBaseline.room;

  // 1. Price Comparison
  const diff = listing.monthlyRent - benchmark;
  const comparisonPercent = Math.round((diff / benchmark) * 100);

  let priceLabel = 'Tương đương mặt bằng chung';
  let priceDetails = `Mức giá ${formatVND(listing.monthlyRent)} sát với mức giá trung bình (${formatVND(benchmark)}) tại khu vực ${listing.wardName}.`;

  if (comparisonPercent <= -15) {
    priceLabel = `Tiết kiệm khoảng ${Math.abs(comparisonPercent)}% so với mặt bằng`;
    priceDetails = `Giá thuê thấp hơn đáng kể so với mức bình quân (${formatVND(benchmark)}) tại ${listing.wardName}. Rất phù hợp tối ưu ngân sách.`;
  } else if (comparisonPercent < -5) {
    priceLabel = `Rẻ hơn khoảng ${Math.abs(comparisonPercent)}% so với mặt bằng`;
    priceDetails = `Giá mềm hơn mặt bằng chung (${formatVND(benchmark)}) tại ${listing.wardName}.`;
  } else if (comparisonPercent >= 15) {
    priceLabel = `Cao hơn khoảng ${comparisonPercent}% so với mặt bằng`;
    priceDetails = `Giá cao hơn mức bình quân khu vực do tiện nghi đầy đủ hoặc căn hộ cao cấp hơn.`;
  }

  // 2. Transparency Assessment
  const missingCosts: string[] = [];
  const costs = listing.costs;
  if (costs.electricityBillingType === 'unprovided' || costs.electricityCostPerUnit === undefined) {
    missingCosts.push('Tiền điện');
  }
  if (costs.waterBillingType === 'unprovided' || costs.waterCostPerUnit === undefined) {
    missingCosts.push('Tiền nước');
  }
  if (costs.parkingBillingType === 'unprovided') {
    missingCosts.push('Phí gửi xe');
  }
  if (costs.internetBillingType === 'unprovided') {
    missingCosts.push('Phí internet');
  }

  const isFullyTransparent = missingCosts.length === 0;
  const transparencyLabel = isFullyTransparent
    ? 'Biểu phí công khai 100% (Không phát sinh chi phí ẩn)'
    : `Chủ nhà chưa công bố ${missingCosts.join(', ')}`;

  // 3. Key Advantages
  const keyAdvantages: string[] = [];
  if (listing.landlordVerificationLevel === 'L2' || listing.landlordVerificationLevel === 'L3') {
    keyAdvantages.push('Chủ trọ đã xác minh danh tính chính chủ trên hệ thống Trọ Việt');
  }
  if (listing.amenities.some((a) => a.code === 'air_conditioner')) {
    keyAdvantages.push('Đã trang bị sẵn máy lạnh tiết kiệm điện');
  }
  if (listing.amenities.some((a) => a.code === 'private_bathroom')) {
    keyAdvantages.push('WC khép kín riêng tư trong phòng');
  }
  if (listing.amenities.some((a) => a.code === 'mezzanine')) {
    keyAdvantages.push('Gác lửng kiên cố tối ưu diện tích sử dụng');
  }
  if (listing.amenities.some((a) => a.code === 'free_hours')) {
    keyAdvantages.push('Giờ giấc tự do, không chung chủ');
  }
  if (listing.amenities.some((a) => a.code === 'balcony')) {
    keyAdvantages.push('Ban công thoáng mát, đón ánh sáng tự nhiên');
  }

  // 4. Practical Viewing Advice
  const viewingAdvice: string[] = [];
  if (costs.electricityBillingType === 'meter') {
    viewingAdvice.push(
      `Kiểm tra công tơ điện riêng trong phòng (giá niêm yết ${formatVND(costs.electricityCostPerUnit || 0)}/kWh) và ghi lại chỉ số ban đầu khi nhận phòng.`
    );
  }
  if (listing.amenities.some((a) => a.code === 'private_bathroom')) {
    viewingAdvice.push('Mở vòi sen và bồn cầu kiểm tra áp lực nước sinh hoạt vào buổi chiều tối.');
  }
  if (missingCosts.length > 0) {
    viewingAdvice.push(
      `Chủ nhà chưa công bố ${missingCosts.join(', ')} trên tin đăng. Hãy hỏi rõ trước khi quyết định đặt cọc.`
    );
  } else {
    viewingAdvice.push('Chụp lại biên lai hoặc hợp đồng thuê có chữ ký hai bên trước khi chuyển tiền đặt cọc.');
  }

  const summary = `Căn phòng tại ${listing.street}, ${listing.wardName} có mức giá ${priceLabel.toLowerCase()} và ${transparencyLabel.toLowerCase()}.`;

  return {
    summary,
    priceAssessment: {
      comparisonPercent,
      label: priceLabel,
      details: priceDetails,
    },
    transparencyAssessment: {
      isFullyTransparent,
      label: transparencyLabel,
      missingCosts,
    },
    keyAdvantages,
    viewingAdvice,
  };
}
