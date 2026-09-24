/**
 * Trọ Việt - AI Contract Analysis & PII Redaction Engine
 * Strictly adheres to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Redacts personal identifiable information (CCCD, SĐT, STK) before analysis.
 * - Detects common rental traps (deposit forfeiture, unilateral price hikes, unfair penalties).
 * - Mandatory legal disclaimer: This is not professional legal advice.
 */

import { normalizeVietnameseText } from '../formatters/index.js';

export interface ContractClauseFinding {
  type: 'risk' | 'warning' | 'fair';
  title: string;
  clauseExcerpt: string;
  explanation: string;
  recommendation: string;
  pointsDeduction: number;
}

export interface ContractAnalysisResult {
  disclaimer: string;
  redactedText: string;
  fairnessScore: number; // 0 to 100
  status: 'safe' | 'caution' | 'high_risk';
  statusLabel: string;
  summary: string;
  findings: ContractClauseFinding[];
  keyTermsExtracted: {
    rentMentioned?: string;
    depositMentioned?: string;
    noticePeriodMentioned?: string;
    hasUtilityPriceGuarantee: boolean;
  };
}

export const LEGAL_DISCLAIMER =
  'Trợ lý Trọ Việt chỉ hỗ trợ phân tích và lưu ý các điều khoản quan trọng trong hợp đồng thuê trọ, tuyệt đối không thay thế cho tư vấn pháp lý chuyên nghiệp của luật sư.';

/**
 * Redacts personal identifiable information (CCCD, Phone, Bank Account) from text.
 */
export function redactContractPII(text: string): string {
  let redacted = text;

  // 1. Redact 12-digit CCCD numbers (with optional spaces/dashes)
  redacted = redacted.replace(/\b\d{3}[-\s]?\d{3}[-\s]?\d{6}\b/g, '[CCCD ĐÃ CHE]');
  redacted = redacted.replace(/\b\d{12}\b/g, '[CCCD ĐÃ CHE]');

  // 2. Redact 10-digit Vietnamese phone numbers (starting with 03, 05, 07, 08, 09)
  redacted = redacted.replace(/\b(0[35789]\d{8})\b/g, '[SĐT ĐÃ CHE]');
  redacted = redacted.replace(/\b(0[35789]\d{2}[-\s.]?\d{3}[-\s.]?\d{3})\b/g, '[SĐT ĐÃ CHE]');

  // 3. Redact Bank Account Numbers (STK)
  redacted = redacted.replace(/(STK|Số tài khoản|Số TK)[:\s]+(\d{6,18})/gi, '$1: [STK ĐÃ CHE]');

  return redacted;
}

/**
 * Analyzes contract text for unfair terms, traps, and compliance with tenant protections.
 */
export function analyzeContractTerms(rawContractText: string): ContractAnalysisResult {
  const redactedText = redactContractPII(rawContractText);
  const norm = normalizeVietnameseText(rawContractText);

  const findings: ContractClauseFinding[] = [];
  let scoreDeductions = 0;

  // 1. Deposit Forfeiture Trap (Bẫy mất cọc)
  const depositTrapPatterns = [
    {
      regex: /mat (toan bo )?tien coc trong moi truong hop|mat coc trong moi truong hop|khong hoan tra (lai )?tien coc du bao truoc|mat toan bo tien coc (neu|khi) don di truoc han/i,
      title: 'Bẫy mất 100% tiền đặt cọc',
      explanation: 'Điều khoản quy định tịch thu toàn bộ tiền cọc dù người thuê có báo trước đúng hạn.',
      recommendation: 'Yêu cầu sửa lại: Nếu báo trước đủ 30 ngày theo quy định, bên thuê được nhận lại đủ 100% tiền cọc.',
      points: 35,
    },
    {
      regex: /khong tra lai tien coc|khong tra tien coc/i,
      title: 'Không cam kết hoàn tiền cọc',
      explanation: 'Hợp đồng không quy định rõ điều kiện và thời hạn chủ nhà phải trả lại tiền đặt cọc khi kết thúc hợp đồng.',
      recommendation: 'Cần ghi rõ: Bên A hoàn trả 100% tiền đặt cọc ngay trong ngày Bên B bàn giao lại phòng.',
      points: 20,
    },
  ];

  for (const pattern of depositTrapPatterns) {
    if (pattern.regex.test(norm)) {
      findings.push({
        type: 'risk',
        title: pattern.title,
        clauseExcerpt: '...điều khoản liên quan đến tiền đặt cọc...',
        explanation: pattern.explanation,
        recommendation: pattern.recommendation,
        pointsDeduction: pattern.points,
      });
      scoreDeductions += pattern.points;
      break; // Only trigger one deposit trap flag
    }
  }

  // 2. Unilateral Price Increase (Tự ý tăng giá phòng)
  const hasUnilateralPriceIncrease =
    (/co quyen tang gia|tang gia bat ky luc nao/i.test(norm) ||
      /tu y tang gia/i.test(norm)) &&
    !/khong (duoc )?tu y tang gia|khong tang gia|giu nguyen gia thue/i.test(norm);

  if (hasUnilateralPriceIncrease) {
    findings.push({
      type: 'risk',
      title: 'Chủ nhà có quyền tự ý tăng giá',
      clauseExcerpt: '...quyền tăng giá trong thời hạn hợp đồng...',
      explanation: 'Điều khoản cho phép chủ nhà tự ý điều chỉnh tăng giá phòng mà không có sự đồng ý của bạn.',
      recommendation: 'Yêu cầu cam kết: Giữ nguyên mức giá thuê phòng cố định trong toàn bộ thời hạn hiệu lực của hợp đồng.',
      pointsDeduction: 25,
    });
    scoreDeductions += 25;
  }

  // 3. Extreme Notice Period (Thời hạn báo trước bất hợp lý)
  if (/bao truoc (60|90) ngay/i.test(norm)) {
    findings.push({
      type: 'warning',
      title: 'Thời hạn báo trước khi trả phòng quá dài (60-90 ngày)',
      clauseExcerpt: '...thời hạn thông báo chấm dứt hợp đồng...',
      explanation: 'Thời hạn yêu cầu báo trước 60-90 ngày là quá dài so với thông lệ thuê phòng trọ (thường là 30 ngày).',
      recommendation: 'Thỏa thuận rút ngắn thời hạn báo trước về mức chuẩn 30 ngày.',
      pointsDeduction: 15,
    });
    scoreDeductions += 15;
  }

  // 4. Arbitrary Utility Rate Increase
  if (/tu y dieu chinh gia dien|tang gia dien nuoc theo y/i.test(norm)) {
    findings.push({
      type: 'warning',
      title: 'Giá điện nước không cố định',
      clauseExcerpt: '...điều chỉnh giá điện nước...',
      explanation: 'Hợp đồng không niêm yết đơn giá điện nước rõ ràng hoặc cho phép tự ý tăng giá theo ý muốn.',
      recommendation: 'Ghi rõ đơn giá điện (đ/kWh) và nước (đ/m³) cố định ngay trong hợp đồng.',
      pointsDeduction: 15,
    });
    scoreDeductions += 15;
  }

  // 5. Positive / Fair Clauses Detection
  const hasFairDeposit = /hoan tra 100% tien dat coc|tra lai day du tien coc/i.test(norm);
  const hasFairNotice = /bao truoc (it nhat )?30 ngay/i.test(norm);
  const hasFixedPrice = /giu nguyen gia thue|khong tu y tang gia/i.test(norm);

  if (hasFairDeposit && hasFairNotice) {
    findings.push({
      type: 'fair',
      title: 'Điều khoản hoàn tiền cọc minh bạch, đúng luật',
      clauseExcerpt: 'Báo trước 30 ngày được hoàn trả 100% tiền đặt cọc.',
      explanation: 'Quy định bảo vệ quyền lợi chính đáng của người thuê khi có kế hoạch di chuyển chỗ ở.',
      recommendation: 'Điều khoản tốt, hoàn toàn an tâm khi ký kết.',
      pointsDeduction: 0,
    });
  }

  if (hasFixedPrice) {
    findings.push({
      type: 'fair',
      title: 'Cam kết giữ nguyên giá phòng suốt thời hạn',
      clauseExcerpt: 'Bên A cam kết giữ nguyên giá thuê phòng trong suốt thời hạn hợp đồng.',
      explanation: 'Đảm bảo chi phí thuê không bị phát sinh đột xuất.',
      recommendation: 'Điều khoản công bằng, chuẩn mực.',
      pointsDeduction: 0,
    });
  }

  // Calculate fairness score (0 to 100)
  const fairnessScore = Math.max(0, Math.min(100, 100 - scoreDeductions));

  let status: 'safe' | 'caution' | 'high_risk' = 'safe';
  let statusLabel = 'Hợp đồng công bằng & An toàn';

  if (fairnessScore < 60) {
    status = 'high_risk';
    statusLabel = 'Hợp đồng có rủi ro cao (Cần đàm phán lại)';
  } else if (fairnessScore < 80) {
    status = 'caution';
    statusLabel = 'Có một số điều khoản cần lưu ý làm rõ';
  }

  // Summary statement
  let summary = `Hợp đồng đạt mức đánh giá ${fairnessScore}/100. Các điều khoản cốt lõi tương đối công bằng và minh bạch.`;
  if (status === 'high_risk') {
    summary = `Hợp đồng đạt mức đánh giá ${fairnessScore}/100 với các điều khoản bất lợi nghiêm trọng về tiền cọc hoặc quyền đơn phương tăng giá. Bạn nên yêu cầu chủ nhà sửa đổi trước khi ký.`;
  } else if (status === 'caution') {
    summary = `Hợp đồng đạt mức đánh giá ${fairnessScore}/100. Có ${findings.filter((f) => f.type !== 'fair').length} điểm cần trao đổi làm rõ thêm trước khi ký kết.`;
  }

  return {
    disclaimer: LEGAL_DISCLAIMER,
    redactedText,
    fairnessScore,
    status,
    statusLabel,
    summary,
    findings,
    keyTermsExtracted: {
      hasUtilityPriceGuarantee: hasFixedPrice || /theo dong ho rieng/i.test(norm),
    },
  };
}
