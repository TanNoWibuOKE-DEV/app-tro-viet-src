import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  RoommateProfile,
  calculateRoommateCompatibility,
} from '../src/roommate/matching.js';

describe('Phase 7 AI Roommate Matching Engine', () => {
  const profileStudentA: RoommateProfile = {
    id: 'roommate-01',
    userId: 'user-student-01',
    displayName: 'Quang M.',
    gender: 'male',
    occupation: 'Sinh viên ĐH Bách Khoa ĐN',
    budgetMonthlyMax: 1800000,
    targetWards: ['48_HOAKHANHBAC', '48_HOACUONGNAM'],
    sleepSchedule: 'night_owl',
    smokingHabit: 'no_smoking',
    petHabit: 'no_pets',
    cleanlinessLevel: 'moderate',
    genderPreference: 'male_only',
    bio: 'Sinh viên IT năm 3, tính tình hòa đồng, học đêm yên tĩnh.',
    hasRoom: false,
    isActive: true,
    createdAt: '2026-09-20T00:00:00Z',
  };

  const profileStudentB: RoommateProfile = {
    id: 'roommate-02',
    userId: 'user-student-02',
    displayName: 'Hoàng V.',
    gender: 'male',
    occupation: 'Sinh viên ĐH Sư Phạm ĐN',
    budgetMonthlyMax: 1700000,
    targetWards: ['48_HOAKHANHBAC'],
    sleepSchedule: 'night_owl',
    smokingHabit: 'no_smoking',
    petHabit: 'no_pets',
    cleanlinessLevel: 'moderate',
    genderPreference: 'male_only',
    bio: 'Thích thể thao, sạch sẽ, không hút thuốc.',
    hasRoom: true,
    isActive: true,
    createdAt: '2026-09-21T00:00:00Z',
  };

  const profileWorkerC: RoommateProfile = {
    id: 'roommate-03',
    userId: 'user-worker-01',
    displayName: 'Thùy T.',
    gender: 'female',
    occupation: 'Kế toán công ty du lịch',
    budgetMonthlyMax: 3000000,
    targetWards: ['48_HAICHAU1', '48_PHUOCMY'],
    sleepSchedule: 'early_bird',
    smokingHabit: 'no_smoking',
    petHabit: 'has_cats',
    cleanlinessLevel: 'neat_freak',
    genderPreference: 'female_only',
    bio: 'Yên tĩnh, đi làm giờ hành chính, nuôi 1 bé mèo ngoan.',
    hasRoom: false,
    isActive: true,
    createdAt: '2026-09-22T00:00:00Z',
  };

  const profileSmokerD: RoommateProfile = {
    id: 'roommate-04',
    userId: 'user-smoker-01',
    displayName: 'Tuấn K.',
    gender: 'male',
    occupation: 'Tự do',
    budgetMonthlyMax: 1500000,
    targetWards: ['48_HOAKHANHBAC'],
    sleepSchedule: 'early_bird',
    smokingHabit: 'smoking_allowed',
    petHabit: 'no_pets',
    cleanlinessLevel: 'relaxed',
    genderPreference: 'any',
    bio: 'Thoải mái giờ giấc.',
    hasRoom: false,
    isActive: true,
    createdAt: '2026-09-23T00:00:00Z',
  };

  it('calculates very high compatibility for similar habits, budget, and sleep schedule', () => {
    const result = calculateRoommateCompatibility(profileStudentA, profileStudentB);

    assert.ok(result.compatibilityScore >= 85, `Score should be >= 85, got ${result.compatibilityScore}`);
    assert.strictEqual(result.compatibilityTier, 'excellent');
    assert.strictEqual(result.isGenderCompatible, true);
    assert.ok(result.matchingStrengths.some((s) => s.includes('không hút thuốc')));
    assert.ok(result.matchingStrengths.some((s) => s.includes('nhịp sinh hoạt')));
    assert.ok(result.matchingStrengths.some((s) => s.includes('ngân sách')));
  });

  it('strictly penalizes and flags incompatible gender preferences', () => {
    const result = calculateRoommateCompatibility(profileStudentA, profileWorkerC);

    assert.strictEqual(result.isGenderCompatible, false);
    assert.ok(result.compatibilityScore <= 35, `Score should be capped at 35, got ${result.compatibilityScore}`);
    assert.strictEqual(result.compatibilityTier, 'low');
    assert.ok(result.pointsToDiscuss.some((p) => p.includes('giới tính')));
  });

  it('detects smoking habit clash and flags it in points to discuss', () => {
    const result = calculateRoommateCompatibility(profileStudentA, profileSmokerD);

    assert.ok(result.pointsToDiscuss.some((p) => p.includes('hút thuốc lá')));
    assert.ok(result.pointsToDiscuss.some((p) => p.includes('Lệch múi giờ sinh hoạt')));
    assert.ok(result.compatibilityScore < 70, `Score should be < 70 due to clashes, got ${result.compatibilityScore}`);
  });
});
