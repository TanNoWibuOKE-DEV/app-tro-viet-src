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
    displayName: string;
    gender: 'male' | 'female' | 'other';
    age?: number;
    occupation: string;
    budgetMonthlyMax: number;
    targetWards: string[];
    sleepSchedule: SleepSchedule;
    smokingHabit: SmokingHabit;
    petHabit: PetHabit;
    cleanlinessLevel: CleanlinessLevel;
    genderPreference: GenderPreference;
    bio: string;
    hasRoom: boolean;
    existingListingId?: string;
    existingListingTitle?: string;
    isActive: boolean;
    createdAt: string;
}
export interface RoommateCompatibilityResult {
    compatibilityScore: number;
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
export declare function calculateRoommateCompatibility(seeker: RoommateProfile, candidate: RoommateProfile): RoommateCompatibilityResult;
