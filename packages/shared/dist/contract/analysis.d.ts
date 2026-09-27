/**
 * Trọ Việt - AI Contract Analysis & PII Redaction Engine
 * Strictly adheres to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Redacts personal identifiable information (CCCD, SĐT, STK) before analysis.
 * - Detects common rental traps (deposit forfeiture, unilateral price hikes, unfair penalties).
 * - Mandatory legal disclaimer: This is not professional legal advice.
 */
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
    fairnessScore: number;
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
export declare const LEGAL_DISCLAIMER = "Tr\u1EE3 l\u00FD Tr\u1ECD Vi\u1EC7t ch\u1EC9 h\u1ED7 tr\u1EE3 ph\u00E2n t\u00EDch v\u00E0 l\u01B0u \u00FD c\u00E1c \u0111i\u1EC1u kho\u1EA3n quan tr\u1ECDng trong h\u1EE3p \u0111\u1ED3ng thu\u00EA tr\u1ECD, tuy\u1EC7t \u0111\u1ED1i kh\u00F4ng thay th\u1EBF cho t\u01B0 v\u1EA5n ph\u00E1p l\u00FD chuy\u00EAn nghi\u1EC7p c\u1EE7a lu\u1EADt s\u01B0.";
/**
 * Redacts personal identifiable information (CCCD, Phone, Bank Account) from text.
 */
export declare function redactContractPII(text: string): string;
/**
 * Analyzes contract text for unfair terms, traps, and compliance with tenant protections.
 */
export declare function analyzeContractTerms(rawContractText: string): ContractAnalysisResult;
