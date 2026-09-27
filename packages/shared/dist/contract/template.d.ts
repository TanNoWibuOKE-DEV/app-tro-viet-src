/**
 * Trọ Việt - Standard Lease Agreement Template (Hợp đồng thuê phòng trọ mẫu)
 * Standard Vietnamese residential rental agreement structure.
 * Currency in integer VND, 2-tier address system.
 */
export interface ContractParty {
    fullName: string;
    phoneNumber: string;
    idCardNumber?: string;
    address?: string;
}
export interface ContractUtilityTerms {
    electricityBillingType: 'meter' | 'fixed' | 'free';
    electricityPricePerUnit?: number;
    waterBillingType: 'meter' | 'fixed' | 'free';
    waterPricePerUnit?: number;
    internetPriceMonthly?: number;
    parkingPriceMonthly?: number;
    servicePriceMonthly?: number;
}
export interface LeaseContractData {
    id: string;
    contractNumber: string;
    listingId: string;
    landlord: ContractParty;
    tenant: ContractParty;
    propertyAddress: {
        houseNumber: string;
        street: string;
        wardName: string;
        wardCode: string;
        provinceName: string;
        provinceCode: string;
    };
    startDate: string;
    endDate: string;
    monthlyRent: number;
    depositAmount: number;
    paymentDayOfMonth: number;
    utilities: ContractUtilityTerms;
    additionalRules?: string[];
    landlordSignature?: {
        signedAt: string;
        signedByName: string;
    };
    tenantSignature?: {
        signedAt: string;
        signedByName: string;
    };
    status: 'draft' | 'pending_signature' | 'active' | 'terminated' | 'expired';
    createdAt: string;
    updatedAt: string;
}
/**
 * Generates human-readable contract text from structured contract data.
 */
export declare function generateContractText(contract: LeaseContractData): string;
