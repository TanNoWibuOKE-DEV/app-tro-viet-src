/**
 * Trọ Việt - User Consent Management
 * Strictly adheres to Vietnam Personal Data Protection Law No. 91/2025/QH15 (Effective 01/01/2026)
 * and .agents/rules/10-security-privacy.md
 */
export type ConsentPurpose = 'service_operation' | 'anti_scam_protection' | 'analytics_improvement' | 'marketing_notifications';
export interface ConsentPurposeDetail {
    code: ConsentPurpose;
    title: string;
    description: string;
    isRequired: boolean;
}
export declare const CONSENT_PURPOSES_CONFIG: ConsentPurposeDetail[];
export interface UserConsentRecord {
    userId: string;
    consents: Record<ConsentPurpose, boolean>;
    updatedAt: string;
    version: string;
}
export declare const CURRENT_PRIVACY_POLICY_VERSION = "2026.1";
/**
 * Checks whether user has accepted all mandatory consent purposes.
 */
export declare function hasRequiredConsents(record?: UserConsentRecord | null): boolean;
/**
 * Creates a default consent record for a new user.
 */
export declare function createDefaultConsentRecord(userId: string, acceptOptional?: boolean): UserConsentRecord;
