/**
 * Trọ Việt - Data Subject Rights Implementation
 * Implements Right to Access, Right to Portability and Right to Erasure
 * pursuant to Vietnam Law on Personal Data Protection No. 91/2025/QH15.
 */
import { UserProfile, UserPreferences, Review, Conversation } from '../types/index.js';
export interface UserDataExportBundle {
    exportMetadata: {
        platform: string;
        version: string;
        exportedAt: string;
        lawReference: string;
    };
    userProfile: {
        id: string;
        fullName: string;
        email: string | null;
        phoneNumber: string | null;
        role: string;
        verificationLevel: string;
        createdAt: string;
    };
    preferences?: UserPreferences | null;
    favoriteListingIds?: string[];
    reviewsCount?: number;
    reviews?: Review[];
    conversationsCount?: number;
}
/**
 * Packages all collected user data into a portable machine-readable JSON string.
 */
export declare function exportUserDataAsJson(user: UserProfile, options?: {
    preferences?: UserPreferences | null;
    favoriteListingIds?: string[];
    reviews?: Review[];
    conversations?: Conversation[];
}): string;
/**
 * Anonymizes user profile upon account deletion request (Right to Erasure).
 * Removes all PII while leaving the account deactivated.
 */
export declare function anonymizeUserProfile(user: UserProfile): UserProfile;
/**
 * Anonymizes tenant names on existing reviews to preserve community trust data
 * without keeping personal identifiable information.
 */
export declare function anonymizeUserReviews(userId: string, reviews: Review[]): Review[];
