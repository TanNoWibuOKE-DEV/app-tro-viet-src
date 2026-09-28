/**
 * Utility Regulations & Legal Dispute Engine (Phase 12: Tenant Life Hub & Legal Concierge)
 * Strictly adheres to 00-core.md, Vietnamese Law 91/2025/QH15, Quyết định 2941/QĐ-BCT & Nghị định 17/2022/NĐ-CP.
 */
export interface UtilityTier {
    tier: number;
    minKwh: number;
    maxKwh: number;
    rateVnd: number;
    name: string;
}
export interface ElectricityBillCalculation {
    totalKwh: number;
    numberOfTenants: number;
    quotaCount: number;
    subtotalWithoutVat: number;
    vatAmount: number;
    totalCostVnd: number;
    averageRatePerKwh: number;
    tierBreakdown: Array<{
        tier: number;
        name: string;
        kwh: number;
        rateVnd: number;
        amountVnd: number;
    }>;
}
export type RiskSeverity = 'fair' | 'elevated' | 'excessive_illegal';
export interface UtilityRateAssessment {
    utilityType: 'electricity' | 'water';
    billedRate: number;
    recommendedLegalRate: number;
    isOvercharged: boolean;
    riskSeverity: RiskSeverity;
    percentageOverRate: number;
    penaltyNotice: string;
    legalBasis: string;
    actionRecommendation: string;
}
export type DisputeType = 'electricity_overcharge' | 'water_overcharge' | 'deposit_refund' | 'maintenance_neglect';
export interface DisputeLetterInput {
    disputeType: DisputeType;
    tenantName: string;
    tenantPhone: string;
    landlordName: string;
    roomAddress: string;
    contractStartDate?: string;
    billedRate?: number;
    actualUsage?: number;
    excessAmountClaimed?: number;
    depositAmount?: number;
    handoverDate?: string;
    deadlineDays?: number;
}
export interface DisputeLetterOutput {
    disputeCode: string;
    title: string;
    legalBasis: string[];
    letterContent: string;
    disclaimer: string;
}
export declare const EVN_RESIDENTIAL_TIERS: UtilityTier[];
export declare const MAX_FAIR_ELECTRICITY_RATE_VND = 3500;
export declare const ILLEGAL_ELECTRICITY_THRESHOLD_VND = 4000;
export declare const MAX_FAIR_WATER_RATE_VND = 25000;
export declare const ILLEGAL_WATER_THRESHOLD_VND = 35000;
export declare const MANDATORY_LEGAL_DISCLAIMER = "Khuy\u1EBFn c\u00E1o ph\u00E1p l\u00FD: Tr\u1ECD Vi\u1EC7t cung c\u1EA5p t\u00E0i li\u1EC7u n\u00E0y nh\u1EB1m h\u1ED7 tr\u1EE3 ng\u01B0\u1EDDi thu\u00EA th\u01B0\u01A1ng l\u01B0\u1EE3ng, \u0111\u1ED1i tho\u1EA1i h\u00F2a gi\u1EA3i tr\u00EAn tinh th\u1EA7n t\u00F4n tr\u1ECDng ph\u00E1p lu\u1EADt v\u00E0 h\u1EE3p \u0111\u1ED3ng d\u00E2n s\u1EF1. V\u0103n b\u1EA3n kh\u00F4ng thay th\u1EBF cho quy\u1EBFt \u0111\u1ECBnh x\u1EED ph\u1EA1t c\u1EE7a c\u01A1 quan c\u00F3 th\u1EA9m quy\u1EC1n ho\u1EB7c b\u1EA3n \u00E1n c\u1EE7a T\u00F2a \u00E1n nh\u00E2n d\u00E2n.";
/**
 * Calculates official residential EVN electricity bill according to 6-tier system & household quotas.
 * Every 4 tenants count as 1 household quota (Thông tư 09/2023/TT-BCT).
 */
export declare function calculateEvnResidentialElectricity(totalKwh: number, numberOfTenants?: number): ElectricityBillCalculation;
/**
 * Assesses whether a landlord's billed rate exceeds statutory limits.
 */
export declare function assessUtilityRate(utilityType: 'electricity' | 'water', billedRate: number): UtilityRateAssessment;
/**
 * Generates an authoritative, respectful legal negotiation letter for tenants.
 */
export declare function generateDisputeLetter(input: DisputeLetterInput): DisputeLetterOutput;
