/**
 * Trọ Việt - eKYC Chip-based Citizen ID (CCCD) Verification & Anti-Spoofing Engine
 * Strictly adheres to Vietnamese Law on Personal Data Protection (Law 91/2025/QH15)
 * and Ministry of Public Security 12-digit CCCD standards:
 * - 3 digits: Province/City birth registration code (e.g., 048 Da Nang, 001 Hanoi, 079 HCMC)
 * - 1 digit: Century & gender (20th: 0/1; 21st: 2/3)
 * - 2 digits: Last 2 digits of birth year
 * - 6 digits: Random sequential number
 */
export interface IdCardValidationResult {
    isValid: boolean;
    provinceCode?: string;
    birthYear?: number;
    gender?: 'male' | 'female';
    isAdult: boolean;
    errorMessage?: string;
}
export interface EkycVerificationParams {
    idCardNumber: string;
    fullName: string;
    dobDateStr: string;
    gender?: 'male' | 'female';
    faceMatchScore: number;
    livenessPassed: boolean;
    chipIntegrityVerified?: boolean;
}
export interface EkycEvaluationResult {
    status: 'verified' | 'rejected' | 'pending_manual_review';
    idCardLast4: string;
    idCardHash: string;
    fullNameUpper: string;
    confidenceScore: number;
    grantedLevel: 'L2' | 'none';
    reasons: string[];
    reviewedAt: string;
}
export declare const VALID_PROVINCE_CODES: Set<string>;
/**
 * Validates a Vietnamese 12-digit Citizen Identification Card (CCCD).
 */
export declare function validateVietnameseIdCardNumber(cccd: string, options?: {
    expectedDobYear?: number;
    expectedGender?: 'male' | 'female';
}): IdCardValidationResult;
/**
 * Masks a 12-digit CCCD for secure display (e.g., "********1234").
 */
export declare function maskIdCardNumber(cccd: string): string;
/**
 * Secure one-way cryptographic hash of CCCD for duplicate identity detection under Law 91/2025/QH15.
 */
export declare function hashIdCardNumber(cccd: string, salt?: string): string;
/**
 * Evaluates an eKYC submission combining document OCR, NFC chip, and biometric liveness checks.
 */
export declare function evaluateEkycVerification(params: EkycVerificationParams): EkycEvaluationResult;
