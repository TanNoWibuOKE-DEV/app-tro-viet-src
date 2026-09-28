import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateVietnameseIdCardNumber,
  maskIdCardNumber,
  hashIdCardNumber,
  evaluateEkycVerification,
} from '../src/ekyc/verification.js';

describe('Phase 10 eKYC Chip-based Citizen ID & Anti-Spoofing', () => {
  it('validates a standard Vietnamese 12-digit CCCD correctly', () => {
    // 048 (Da Nang), 0 (Male, 20th century), 95 (1995), 123456
    const res = validateVietnameseIdCardNumber('048095123456', {
      expectedDobYear: 1995,
      expectedGender: 'male',
    });
    assert.equal(res.isValid, true);
    assert.equal(res.provinceCode, '048');
    assert.equal(res.birthYear, 1995);
    assert.equal(res.gender, 'male');
    assert.equal(res.isAdult, true);
  });

  it('validates a female born in 2002 from Hanoi', () => {
    // 001 (Hanoi), 3 (Female, 21st century), 02 (2002), 987654
    const res = validateVietnameseIdCardNumber('001302987654', {
      expectedDobYear: 2002,
      expectedGender: 'female',
    });
    assert.equal(res.isValid, true);
    assert.equal(res.provinceCode, '001');
    assert.equal(res.birthYear, 2002);
    assert.equal(res.gender, 'female');
    assert.equal(res.isAdult, true);
  });

  it('rejects invalid CCCD length and invalid province codes', () => {
    const invalidLen = validateVietnameseIdCardNumber('12345');
    assert.equal(invalidLen.isValid, false);
    assert.ok(invalidLen.errorMessage?.includes('12 chữ số'));

    const invalidProv = validateVietnameseIdCardNumber('999095123456');
    assert.equal(invalidProv.isValid, false);
    assert.ok(invalidProv.errorMessage?.includes('không hợp lệ'));
  });

  it('rejects minors (< 18 years old)', () => {
    // 079 (HCMC), 2 (Male 21st century), 15 (2015 -> 11 years old)
    const res = validateVietnameseIdCardNumber('079215123456');
    assert.equal(res.isValid, false);
    assert.equal(res.isAdult, false);
    assert.ok(res.errorMessage?.includes('phải đủ 18 tuổi'));
  });

  it('masks CCCD securely according to Law 91/2025/QH15', () => {
    assert.equal(maskIdCardNumber('048095123456'), '********3456');
    assert.equal(maskIdCardNumber('001302987654'), '********7654');
  });

  it('hashes CCCD consistently with SHA-256', () => {
    const hash1 = hashIdCardNumber('048095123456');
    const hash2 = hashIdCardNumber('048095123456');
    const hashDiff = hashIdCardNumber('048095123457');

    assert.equal(hash1, hash2);
    assert.notEqual(hash1, hashDiff);
    assert.equal(hash1.length, 64); // SHA-256 hex length
  });

  it('evaluates complete eKYC with high confidence and grants L2 certification', () => {
    const res = evaluateEkycVerification({
      idCardNumber: '048095123456',
      fullName: 'Trần Văn An',
      dobDateStr: '1995-04-15',
      gender: 'male',
      faceMatchScore: 92,
      livenessPassed: true,
      chipIntegrityVerified: true,
    });

    assert.equal(res.status, 'verified');
    assert.equal(res.grantedLevel, 'L2');
    assert.equal(res.idCardLast4, '3456');
    assert.equal(res.fullNameUpper, 'TRẦN VĂN AN');
    assert.ok(res.confidenceScore >= 90);
  });

  it('rejects eKYC when liveness fails (spoofing attempt)', () => {
    const res = evaluateEkycVerification({
      idCardNumber: '048095123456',
      fullName: 'Trần Văn An',
      dobDateStr: '1995-04-15',
      faceMatchScore: 95,
      livenessPassed: false, // FAILED liveness!
    });

    assert.equal(res.status, 'rejected');
    assert.equal(res.grantedLevel, 'none');
    assert.ok(res.reasons.some((r) => r.includes('Liveness')));
  });

  it('routes to manual review when face match is marginal (70-84%)', () => {
    const res = evaluateEkycVerification({
      idCardNumber: '048095123456',
      fullName: 'Trần Văn An',
      dobDateStr: '1995-04-15',
      faceMatchScore: 78,
      livenessPassed: true,
    });

    assert.equal(res.status, 'pending_manual_review');
    assert.equal(res.grantedLevel, 'none');
  });
});
