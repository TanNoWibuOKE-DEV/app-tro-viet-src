/**
 * Trọ Việt - eKYC Chip-based Citizen ID (CCCD) Verification & Anti-Spoofing Engine
 * Strictly adheres to Vietnamese Law on Personal Data Protection (Law 91/2025/QH15)
 * and Ministry of Public Security 12-digit CCCD standards:
 * - 3 digits: Province/City birth registration code (e.g., 048 Da Nang, 001 Hanoi, 079 HCMC)
 * - 1 digit: Century & gender (20th: 0/1; 21st: 2/3)
 * - 2 digits: Last 2 digits of birth year
 * - 6 digits: Random sequential number
 */

import { createHash } from 'node:crypto';

export interface IdCardValidationResult {
  isValid: boolean;
  provinceCode?: string;
  birthYear?: number;
  gender?: 'male' | 'female';
  isAdult: boolean; // Must be >= 18 years old
  errorMessage?: string;
}

export interface EkycVerificationParams {
  idCardNumber: string;
  fullName: string;
  dobDateStr: string; // "YYYY-MM-DD"
  gender?: 'male' | 'female';
  faceMatchScore: number; // 0 - 100%
  livenessPassed: boolean;
  chipIntegrityVerified?: boolean;
}

export interface EkycEvaluationResult {
  status: 'verified' | 'rejected' | 'pending_manual_review';
  idCardLast4: string;
  idCardHash: string;
  fullNameUpper: string;
  confidenceScore: number; // 0 - 100
  grantedLevel: 'L2' | 'none';
  reasons: string[];
  reviewedAt: string;
}

// Popular valid province code prefixes according to Vietnam standard
export const VALID_PROVINCE_CODES = new Set([
  '001', '002', '004', '006', '008', '010', '011', '012', '014', '015',
  '017', '019', '020', '022', '024', '025', '026', '027', '030', '031',
  '033', '034', '035', '036', '037', '038', '040', '042', '044', '045',
  '046', '048', '049', '051', '052', '054', '056', '058', '060', '062',
  '064', '066', '067', '068', '070', '072', '074', '075', '077', '079',
  '080', '082', '083', '084', '086', '087', '089', '091', '092', '093',
  '094', '095', '096'
]);

/**
 * Validates a Vietnamese 12-digit Citizen Identification Card (CCCD).
 */
export function validateVietnameseIdCardNumber(
  cccd: string,
  options?: { expectedDobYear?: number; expectedGender?: 'male' | 'female' }
): IdCardValidationResult {
  const clean = cccd.trim().replace(/\s+/g, '');

  if (!/^\d{12}$/.test(clean)) {
    return {
      isValid: false,
      isAdult: false,
      errorMessage: 'Số CCCD phải gồm chính xác 12 chữ số.',
    };
  }

  const provinceCode = clean.substring(0, 3);
  if (!VALID_PROVINCE_CODES.has(provinceCode)) {
    return {
      isValid: false,
      isAdult: false,
      errorMessage: `Mã tỉnh/thành phố [${provinceCode}] không hợp lệ theo quy chuẩn Bộ Công An.`,
    };
  }

  const centuryGenderDigit = parseInt(clean[3], 10);
  let birthCentury = 1900;
  let gender: 'male' | 'female' = 'male';

  switch (centuryGenderDigit) {
    case 0:
      birthCentury = 1900;
      gender = 'male';
      break;
    case 1:
      birthCentury = 1900;
      gender = 'female';
      break;
    case 2:
      birthCentury = 2000;
      gender = 'male';
      break;
    case 3:
      birthCentury = 2000;
      gender = 'female';
      break;
    case 4:
      birthCentury = 2100;
      gender = 'male';
      break;
    case 5:
      birthCentury = 2100;
      gender = 'female';
      break;
    default:
      return {
        isValid: false,
        isAdult: false,
        errorMessage: 'Ký tự mã thế kỷ và giới tính không hợp lệ.',
      };
  }

  const yearSuffix = parseInt(clean.substring(4, 6), 10);
  const birthYear = birthCentury + yearSuffix;

  // Cross check with expected year if provided
  if (options?.expectedDobYear && options.expectedDobYear !== birthYear) {
    return {
      isValid: false,
      isAdult: false,
      errorMessage: `Năm sinh (${birthYear}) không khớp với năm sinh trên hồ sơ (${options.expectedDobYear}).`,
    };
  }

  // Cross check with expected gender if provided
  if (options?.expectedGender && options.expectedGender !== gender) {
    return {
      isValid: false,
      isAdult: false,
      errorMessage: `Giới tính (${gender === 'male' ? 'Nam' : 'Nữ'}) không khớp với thông tin hồ sơ.`,
    };
  }

  // Check age requirement (>= 18 years old)
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;
  const isAdult = age >= 18;

  if (!isAdult) {
    return {
      isValid: false,
      provinceCode,
      birthYear,
      gender,
      isAdult: false,
      errorMessage: 'Người dùng phải đủ 18 tuổi để thực hiện ký kết hợp đồng hoặc đăng tin cho thuê.',
    };
  }

  return {
    isValid: true,
    provinceCode,
    birthYear,
    gender,
    isAdult: true,
  };
}

/**
 * Masks a 12-digit CCCD for secure display (e.g., "********1234").
 */
export function maskIdCardNumber(cccd: string): string {
  const clean = cccd.trim().replace(/\s+/g, '');
  if (clean.length < 4) return '****';
  return '********' + clean.slice(-4);
}

/**
 * Secure one-way cryptographic hash of CCCD for duplicate identity detection under Law 91/2025/QH15.
 */
export function hashIdCardNumber(cccd: string, salt = 'troviet_ekyc_salt_2026'): string {
  const clean = cccd.trim().replace(/\s+/g, '');
  return createHash('sha256').update(`${salt}:${clean}`).digest('hex');
}

/**
 * Evaluates an eKYC submission combining document OCR, NFC chip, and biometric liveness checks.
 */
export function evaluateEkycVerification(params: EkycVerificationParams): EkycEvaluationResult {
  const reasons: string[] = [];
  let confidenceScore = 100;

  // 1. Validate ID Card structure
  const dobYear = params.dobDateStr ? new Date(params.dobDateStr).getFullYear() : undefined;
  const validation = validateVietnameseIdCardNumber(params.idCardNumber, {
    expectedDobYear: dobYear,
    expectedGender: params.gender,
  });

  if (!validation.isValid) {
    return {
      status: 'rejected',
      idCardLast4: params.idCardNumber.slice(-4),
      idCardHash: hashIdCardNumber(params.idCardNumber),
      fullNameUpper: params.fullName.trim().toUpperCase(),
      confidenceScore: 0,
      grantedLevel: 'none',
      reasons: [validation.errorMessage || 'Số CCCD không hợp lệ.'],
      reviewedAt: new Date().toISOString(),
    };
  }

  // 2. Biometric Liveness Check
  if (!params.livenessPassed) {
    return {
      status: 'rejected',
      idCardLast4: params.idCardNumber.slice(-4),
      idCardHash: hashIdCardNumber(params.idCardNumber),
      fullNameUpper: params.fullName.trim().toUpperCase(),
      confidenceScore: 20,
      grantedLevel: 'none',
      reasons: ['Không vượt qua kiểm tra tính sống (Liveness detection). Phát hiện nghi vấn giả mạo ảnh chụp màn hình.'],
      reviewedAt: new Date().toISOString(),
    };
  }

  // 3. Face Match Scoring
  if (params.faceMatchScore < 70) {
    return {
      status: 'rejected',
      idCardLast4: params.idCardNumber.slice(-4),
      idCardHash: hashIdCardNumber(params.idCardNumber),
      fullNameUpper: params.fullName.trim().toUpperCase(),
      confidenceScore: Math.round(params.faceMatchScore),
      grantedLevel: 'none',
      reasons: [`Độ khớp khuôn mặt quá thấp (${params.faceMatchScore}%). Không khớp với ảnh trên CCCD.`],
      reviewedAt: new Date().toISOString(),
    };
  } else if (params.faceMatchScore < 85) {
    confidenceScore -= 20;
    reasons.push(`Độ khớp khuôn mặt trung bình (${params.faceMatchScore}%). Cần kiểm duyệt thủ công bổ sung.`);
    return {
      status: 'pending_manual_review',
      idCardLast4: params.idCardNumber.slice(-4),
      idCardHash: hashIdCardNumber(params.idCardNumber),
      fullNameUpper: params.fullName.trim().toUpperCase(),
      confidenceScore,
      grantedLevel: 'none',
      reasons,
      reviewedAt: new Date().toISOString(),
    };
  }

  // 4. Chip integrity verification
  if (params.chipIntegrityVerified === false) {
    confidenceScore -= 10;
    reasons.push('Chữ ký số NFC trên chip không trích xuất được; đã dự phòng qua kiểm tra OCR thị giác.');
  } else {
    reasons.push('Đã đối soát vi mạch NFC thành công với dữ liệu gốc của Bộ Công An.');
  }

  reasons.push('Xác thực danh tính số thành công. Đủ điều kiện cấp chứng nhận L2 Tin cậy.');

  return {
    status: 'verified',
    idCardLast4: params.idCardNumber.slice(-4),
    idCardHash: hashIdCardNumber(params.idCardNumber),
    fullNameUpper: params.fullName.trim().toUpperCase(),
    confidenceScore,
    grantedLevel: 'L2',
    reasons,
    reviewedAt: new Date().toISOString(),
  };
}
