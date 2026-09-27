/**
 * Trọ Việt - VietQR NAPAS 24/7 Payment & Rent Invoicing Engine
 * Strictly adheres to SPEC Section 4 & .agents/rules/10-security-privacy.md:
 * - Direct peer-to-peer payment to landlord bank account (NO unauthorized intermediary fund holding).
 * - Standard VietQR NAPAS parameters with automated unique invoice description.
 * - Integer VND calculations without floating point errors.
 */
export interface RentInvoiceCalculationParams {
    contractId: string;
    invoiceCode: string;
    periodMonth: string;
    monthlyRent: number;
    electricityBillingType: 'meter' | 'fixed' | 'free';
    previousElectricityMeter?: number;
    currentElectricityMeter?: number;
    electricityCostPerUnit?: number;
    waterBillingType: 'meter' | 'fixed' | 'free';
    previousWaterMeter?: number;
    currentWaterMeter?: number;
    waterCostPerUnit?: number;
    numberOfTenants?: number;
    internetCost?: number;
    parkingCost?: number;
    serviceCost?: number;
    otherCost?: number;
    otherCostDescription?: string;
}
export interface RentInvoiceLineItem {
    id: string;
    name: string;
    detail: string;
    amount: number;
}
export interface RentInvoiceResult {
    invoiceCode: string;
    periodMonth: string;
    lineItems: RentInvoiceLineItem[];
    totalAmount: number;
    electricityUsageKwh?: number;
    waterUsageM3?: number;
}
export interface VietQROptions {
    bankBin: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
}
export declare const POPULAR_VIETNAMESE_BANKS: Record<string, {
    bin: string;
    name: string;
    shortName: string;
}>;
/**
 * Calculates itemized rent invoice with precise integer VND amounts.
 */
export declare function calculateMonthlyInvoice(params: RentInvoiceCalculationParams): RentInvoiceResult;
/**
 * Generates VietQR standard quick image URL and deep-link payload.
 * Compliant with NAPAS 24/7 bank transfer standards.
 */
export declare function generateVietQRLink(options: VietQROptions): {
    qrImageUrl: string;
    transferSyntax: string;
    sanitizedAmount: number;
};
