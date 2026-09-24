/**
 * Trọ Việt - Anti-Scam Rule Engine (Explainable & Rule-based)
 * Strictly adheres to TroViet SPEC Section 7 & 8:
 * - Transparent, explainable signals (never black-box).
 * - Friendly phrasing: "Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc."
 * - Controlled review eligibility verification.
 */

import { PropertyType } from '../types/index.js';
import { normalizeVietnameseText } from '../formatters/index.js';

export interface AntiScamSignal {
  code: string;
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
}

export const RISKY_CHAT_KEYWORDS = [
  'chuyen coc',
  'coc truoc',
  'dat coc giu cho',
  'coc giu cho',
  'chuyen khoan truoc',
  'chuyen khoan gap',
  'ket ban zalo',
  'add zalo',
  'qua zalo noi chuyen',
  'nhan tin qua zalo',
  'so tai khoan',
  'stk',
];

/**
 * Checks for price anomalies in listings (e.g., unrealistically cheap rooms to lure tenants).
 */
export function checkListingPricingAnomaly(
  monthlyRent: number,
  propertyType: PropertyType,
  areaSquareMeters: number
): AntiScamSignal[] {
  const signals: AntiScamSignal[] = [];

  // Minimum realistic rent threshold in Da Nang (1.000.000 VND for private room/apartment)
  if ((propertyType === 'room' || propertyType === 'apartment') && monthlyRent < 1000000) {
    signals.push({
      code: 'PRICE_ABNORMALLY_LOW',
      severity: 'high',
      title: 'Mức giá thấp bất thường',
      description: 'Giá phòng thấp hơn đáng kể so với mặt bằng chung khu vực. Bạn cần đến tận nơi kiểm tra phòng thực tế trước khi đặt cọc.',
    });
  }

  // Price per square meter anomaly check (< 35.000 VND / m² for apartment in urban areas)
  if (propertyType === 'apartment' && areaSquareMeters > 30) {
    const pricePerM2 = monthlyRent / areaSquareMeters;
    if (pricePerM2 < 35000) {
      signals.push({
        code: 'APARTMENT_PRICE_M2_LOW',
        severity: 'medium',
        title: 'Giá thuê trên diện tích thấp bất thường',
        description: 'Giá căn hộ trên diện tích sử dụng rất thấp. Vui lòng kiểm tra kỹ tình trạng cơ sở vật chất.',
      });
    }
  }

  return signals;
}

export interface ChatKeywordAnalysisResult {
  hasRisk: boolean;
  detectedKeywords: string[];
  warningMessage?: string;
}

/**
 * Scans chat messages for early deposit demands or attempts to lure users outside app.
 */
export function analyzeChatMessageForRisks(messageText: string): ChatKeywordAnalysisResult {
  const normText = normalizeVietnameseText(messageText);
  const detected: string[] = [];

  for (const kw of RISKY_CHAT_KEYWORDS) {
    if (normText.includes(kw)) {
      detected.push(kw);
    }
  }

  if (detected.length > 0) {
    return {
      hasRisk: true,
      detectedKeywords: detected,
      warningMessage:
        'Cảnh báo an toàn Trọ Việt: Tin nhắn có dấu hiệu đề cập chuyển cọc sớm hoặc chuyển sang ứng dụng khác. Tuyệt đối KHÔNG chuyển tiền cọc khi chưa xem phòng và đối chiếu giấy tờ trực tiếp.',
    };
  }

  return {
    hasRisk: false,
    detectedKeywords: [],
  };
}

export interface ReviewEligibilityResult {
  canReview: boolean;
  reason?: string;
}

/**
 * Strict Review Control (Anti-Fake Reviews):
 * - Landlord cannot review their own listing.
 * - Tenant must have interacted / initiated a conversation with the landlord.
 */
export function checkReviewEligibility(
  userId: string,
  landlordId: string,
  hasChatHistory: boolean
): ReviewEligibilityResult {
  if (userId === landlordId) {
    return {
      canReview: false,
      reason: 'Chủ nhà không thể tự đánh giá tin đăng của chính mình.',
    };
  }

  if (!hasChatHistory) {
    return {
      canReview: false,
      reason: 'Chỉ người thuê đã từng liên hệ nhắn tin trao đổi với chủ trọ mới được gửi đánh giá phòng.',
    };
  }

  return {
    canReview: true,
  };
}
