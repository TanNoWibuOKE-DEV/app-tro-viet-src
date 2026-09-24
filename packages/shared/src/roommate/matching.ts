/**
 * Trọ Việt - AI Roommate Matching Engine
 * Strictly adheres to SPEC Section 2, 7 & Module 20:
 * - Transparent compatibility scoring (0–100%) based on living habits.
 * - Privacy protection: only nicknames/display names and habits shown before messaging.
 * - Integer VND currency for budget sharing.
 */

export type SleepSchedule = 'early_bird' | 'night_owl' | 'flexible';
export type SmokingHabit = 'no_smoking' | 'balcony_only' | 'smoking_allowed';
export type PetHabit = 'no_pets' | 'has_cats' | 'has_dogs' | 'pet_friendly';
export type CleanlinessLevel = 'neat_freak' | 'moderate' | 'relaxed';
export type GenderPreference = 'male_only' | 'female_only' | 'any';

export interface RoommateProfile {
  id: string;
  userId: string;
  displayName: string; // e.g. "Minh K." (privacy friendly)
  gender: 'male' | 'female' | 'other';
  age?: number;
  occupation: string; // e.g. "Sinh viên ĐH Bách Khoa", "Lập trình viên"
  budgetMonthlyMax: number; // integer VND (e.g. 2.000.000)
  targetWards: string[]; // ward codes e.g. ['48_HOAKHANHBAC', '48_HAICHAU1']
  sleepSchedule: SleepSchedule;
  smokingHabit: SmokingHabit;
  petHabit: PetHabit;
  cleanlinessLevel: CleanlinessLevel;
  genderPreference: GenderPreference;
  bio: string;
  hasRoom: boolean; // true if looking for someone to move in, false if looking for room together
  existingListingId?: string;
  existingListingTitle?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RoommateCompatibilityResult {
  compatibilityScore: number; // 0 to 100
  compatibilityTier: 'excellent' | 'good' | 'moderate' | 'low';
  tierLabel: string;
  matchingStrengths: string[];
  pointsToDiscuss: string[];
  isGenderCompatible: boolean;
}

/**
 * Calculates living compatibility between two potential roommates.
 * Always transparent and explainable with concrete reasons.
 */
export function calculateRoommateCompatibility(
  seeker: RoommateProfile,
  candidate: RoommateProfile
): RoommateCompatibilityResult {
  const matchingStrengths: string[] = [];
  const pointsToDiscuss: string[] = [];

  // 1. Gender Preference Check (Crucial for safety & privacy)
  let isGenderCompatible = true;
  if (seeker.genderPreference === 'female_only' && candidate.gender !== 'female') {
    isGenderCompatible = false;
  } else if (seeker.genderPreference === 'male_only' && candidate.gender !== 'male') {
    isGenderCompatible = false;
  } else if (candidate.genderPreference === 'female_only' && seeker.gender !== 'female') {
    isGenderCompatible = false;
  } else if (candidate.genderPreference === 'male_only' && seeker.gender !== 'male') {
    isGenderCompatible = false;
  }

  if (isGenderCompatible) {
    if (seeker.genderPreference !== 'any' || candidate.genderPreference !== 'any') {
      matchingStrengths.push('Phù hợp tiêu chí giới tính mong muốn');
    }
  } else {
    pointsToDiscuss.push('Không khớp tiêu chí giới tính mong muốn');
  }

  // 2. Smoking Habit Matching (Weight: 25 points)
  let smokingScore = 0;
  if (seeker.smokingHabit === 'no_smoking' && candidate.smokingHabit === 'no_smoking') {
    smokingScore = 25;
    matchingStrengths.push('Cùng không hút thuốc lá (Không gian sống trong lành)');
  } else if (
    (seeker.smokingHabit === 'no_smoking' && candidate.smokingHabit === 'smoking_allowed') ||
    (candidate.smokingHabit === 'no_smoking' && seeker.smokingHabit === 'smoking_allowed')
  ) {
    smokingScore = 0;
    pointsToDiscuss.push('Khác biệt lớn về thói quen hút thuốc lá');
  } else {
    // Balcony only or acceptable
    smokingScore = 15;
    matchingStrengths.push('Có thể thỏa thuận khu vực hút thuốc (chỉ ngoài ban công)');
  }

  // 3. Sleep Schedule Matching (Weight: 20 points)
  let sleepScore = 0;
  if (seeker.sleepSchedule === candidate.sleepSchedule) {
    sleepScore = 20;
    const scheduleName =
      seeker.sleepSchedule === 'early_bird'
        ? 'ngủ sớm dậy sớm'
        : seeker.sleepSchedule === 'night_owl'
        ? 'cú đêm học tập / làm việc muộn'
        : 'giờ giấc linh hoạt';
    matchingStrengths.push(`Đồng điệu về nhịp sinh hoạt (${scheduleName})`);
  } else if (
    (seeker.sleepSchedule === 'early_bird' && candidate.sleepSchedule === 'night_owl') ||
    (seeker.sleepSchedule === 'night_owl' && candidate.sleepSchedule === 'early_bird')
  ) {
    sleepScore = 5;
    pointsToDiscuss.push('Lệch múi giờ sinh hoạt (người ngủ sớm vs người thức khuya)');
  } else {
    sleepScore = 15;
    matchingStrengths.push('Nhịp sinh hoạt tương đối linh hoạt, dễ điều chỉnh');
  }

  // 4. Budget Compatibility (Weight: 20 points)
  let budgetScore = 0;
  const budgetDiff = Math.abs(seeker.budgetMonthlyMax - candidate.budgetMonthlyMax);
  const minBudget = Math.min(seeker.budgetMonthlyMax, candidate.budgetMonthlyMax);
  const ratio = minBudget > 0 ? budgetDiff / minBudget : 1;

  if (ratio <= 0.15) {
    budgetScore = 20;
    matchingStrengths.push('Mức ngân sách đóng góp tương đương nhau');
  } else if (ratio <= 0.35) {
    budgetScore = 14;
    matchingStrengths.push('Khoảng ngân sách tiền phòng chênh lệch ít');
  } else {
    budgetScore = 5;
    pointsToDiscuss.push(
      `Ngân sách có sự chênh lệch (${seeker.budgetMonthlyMax.toLocaleString('vi-VN')} đ vs ${candidate.budgetMonthlyMax.toLocaleString('vi-VN')} đ)`
    );
  }

  // 5. Pet Habit Matching (Weight: 15 points)
  let petScore = 0;
  if (seeker.petHabit === candidate.petHabit) {
    petScore = 15;
    if (seeker.petHabit === 'no_pets') {
      matchingStrengths.push('Cùng không nuôi thú cưng trong phòng');
    } else {
      matchingStrengths.push('Cùng yêu thích hoặc nuôi thú cưng');
    }
  } else if (
    (seeker.petHabit === 'no_pets' && (candidate.petHabit === 'has_cats' || candidate.petHabit === 'has_dogs')) ||
    (candidate.petHabit === 'no_pets' && (seeker.petHabit === 'has_cats' || seeker.petHabit === 'has_dogs'))
  ) {
    petScore = 2;
    pointsToDiscuss.push('Khác biệt về nuôi thú cưng (dị ứng lông động vật hoặc mùi hôi)');
  } else {
    petScore = 10;
  }

  // 6. Cleanliness Level Matching (Weight: 10 points)
  let cleanScore = 0;
  if (seeker.cleanlinessLevel === candidate.cleanlinessLevel) {
    cleanScore = 10;
    matchingStrengths.push('Quan điểm về vệ sinh và ngăn nắp đồng nhất');
  } else if (
    (seeker.cleanlinessLevel === 'neat_freak' && candidate.cleanlinessLevel === 'relaxed') ||
    (seeker.cleanlinessLevel === 'relaxed' && candidate.cleanlinessLevel === 'neat_freak')
  ) {
    cleanScore = 2;
    pointsToDiscuss.push('Mức độ yêu cầu ngăn nắp có khoảng cách lớn');
  } else {
    cleanScore = 7;
  }

  // 7. Location Overlap Matching (Weight: 10 points)
  let locationScore = 0;
  const commonWards = seeker.targetWards.filter((w) => candidate.targetWards.includes(w));
  if (commonWards.length > 0) {
    locationScore = 10;
    matchingStrengths.push(`Cùng hướng tới khu vực thuê tương đồng (${commonWards.length} phường trùng khớp)`);
  } else {
    locationScore = 2;
    pointsToDiscuss.push('Chưa trùng khớp phường/khu vực ưu tiên tìm phòng');
  }

  // Sum total score
  let totalScore = smokingScore + sleepScore + budgetScore + petScore + cleanScore + locationScore;

  // Severe penalty if gender preference is strictly violated
  if (!isGenderCompatible) {
    totalScore = Math.min(totalScore, 35);
  }

  totalScore = Math.max(0, Math.min(100, Math.round(totalScore)));

  let compatibilityTier: 'excellent' | 'good' | 'moderate' | 'low';
  let tierLabel: string;

  if (totalScore >= 85) {
    compatibilityTier = 'excellent';
    tierLabel = `Rất hòa hợp (${totalScore}%)`;
  } else if (totalScore >= 70) {
    compatibilityTier = 'good';
    tierLabel = `Khá tương đồng (${totalScore}%)`;
  } else if (totalScore >= 50) {
    compatibilityTier = 'moderate';
    tierLabel = `Cần trao đổi thêm (${totalScore}%)`;
  } else {
    compatibilityTier = 'low';
    tierLabel = `Ít tương thích (${totalScore}%)`;
  }

  return {
    compatibilityScore: totalScore,
    compatibilityTier,
    tierLabel,
    matchingStrengths,
    pointsToDiscuss,
    isGenderCompatible,
  };
}
