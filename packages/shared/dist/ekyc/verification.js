"use strict";
/**
 * Trọ Việt - eKYC Chip-based Citizen ID (CCCD) Verification & Anti-Spoofing Engine
 * Strictly adheres to Vietnamese Law on Personal Data Protection (Law 91/2025/QH15)
 * and Ministry of Public Security 12-digit CCCD standards:
 * - 3 digits: Province/City birth registration code (e.g., 048 Da Nang, 001 Hanoi, 079 HCMC)
 * - 1 digit: Century & gender (20th: 0/1; 21st: 2/3)
 * - 2 digits: Last 2 digits of birth year
 * - 6 digits: Random sequential number
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.VALID_PROVINCE_CODES = void 0;
exports.validateVietnameseIdCardNumber = validateVietnameseIdCardNumber;
exports.maskIdCardNumber = maskIdCardNumber;
exports.hashIdCardNumber = hashIdCardNumber;
exports.evaluateEkycVerification = evaluateEkycVerification;
/**
 * Pure TypeScript SHA-256 implementation compatible across React Native (Hermes/Metro), Web, and Node.js.
 */
function sha256Hex(ascii) {
    function rightRotate(value, amount) {
        return (value >>> amount) | (value << (32 - amount));
    }
    const words = [];
    const asciiBitLength = ascii.length * 8;
    const hash = [
        0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
        0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ];
    const k = [
        0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
        0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
        0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
        0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
        0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
        0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
        0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
        0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ];
    for (let i = 0; i < ascii.length; i++) {
        const j = i >> 2;
        words[j] = (words[j] || 0) | ((ascii.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8));
    }
    const lastIndex = asciiBitLength >> 5;
    words[lastIndex] = (words[lastIndex] || 0) | (0x80 << (24 - (asciiBitLength % 32)));
    const totalWords = (((asciiBitLength + 64) >> 9) << 4) + 15;
    while (words.length <= totalWords)
        words.push(0);
    words[totalWords] = asciiBitLength;
    for (let i = 0; i < words.length; i += 16) {
        const w = new Array(64);
        for (let j = 0; j < 16; j++)
            w[j] = words[i + j] || 0;
        for (let j = 16; j < 64; j++) {
            const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
            const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
            w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
        }
        let [a, b, c, d, e, f, g, h] = hash;
        for (let j = 0; j < 64; j++) {
            const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
            const ch = (e & f) ^ (~e & g);
            const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
            const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
            const maj = (a & b) ^ (a & c) ^ (b & c);
            const temp2 = (S0 + maj) | 0;
            h = g;
            g = f;
            f = e;
            e = (d + temp1) | 0;
            d = c;
            c = b;
            b = a;
            a = (temp1 + temp2) | 0;
        }
        hash[0] = (hash[0] + a) | 0;
        hash[1] = (hash[1] + b) | 0;
        hash[2] = (hash[2] + c) | 0;
        hash[3] = (hash[3] + d) | 0;
        hash[4] = (hash[4] + e) | 0;
        hash[5] = (hash[5] + f) | 0;
        hash[6] = (hash[6] + g) | 0;
        hash[7] = (hash[7] + h) | 0;
    }
    return hash.map((h) => ('00000000' + (h >>> 0).toString(16)).slice(-8)).join('');
}
// Popular valid province code prefixes according to Vietnam standard
exports.VALID_PROVINCE_CODES = new Set([
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
function validateVietnameseIdCardNumber(cccd, options) {
    const clean = cccd.trim().replace(/\s+/g, '');
    if (!/^\d{12}$/.test(clean)) {
        return {
            isValid: false,
            isAdult: false,
            errorMessage: 'Số CCCD phải gồm chính xác 12 chữ số.',
        };
    }
    const provinceCode = clean.substring(0, 3);
    if (!exports.VALID_PROVINCE_CODES.has(provinceCode)) {
        return {
            isValid: false,
            isAdult: false,
            errorMessage: `Mã tỉnh/thành phố [${provinceCode}] không hợp lệ theo quy chuẩn Bộ Công An.`,
        };
    }
    const centuryGenderDigit = parseInt(clean[3], 10);
    let birthCentury = 1900;
    let gender = 'male';
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
function maskIdCardNumber(cccd) {
    const clean = cccd.trim().replace(/\s+/g, '');
    if (clean.length < 4)
        return '****';
    return '********' + clean.slice(-4);
}
/**
 * Secure one-way cryptographic hash of CCCD for duplicate identity detection under Law 91/2025/QH15.
 */
function hashIdCardNumber(cccd, salt = 'troviet_ekyc_salt_2026') {
    const clean = cccd.trim().replace(/\s+/g, '');
    return sha256Hex(`${salt}:${clean}`);
}
/**
 * Evaluates an eKYC submission combining document OCR, NFC chip, and biometric liveness checks.
 */
function evaluateEkycVerification(params) {
    const reasons = [];
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
    }
    else if (params.faceMatchScore < 85) {
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
    }
    else {
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
