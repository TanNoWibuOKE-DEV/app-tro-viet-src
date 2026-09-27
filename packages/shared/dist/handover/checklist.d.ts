/**
 * Trọ Việt - Property Handover & In-Person Viewing Companion Engine
 * Strictly adheres to SPEC Section 2, 7 & Module 22:
 * - Records initial electricity (kWh) & water (m³) meter readings at move-in.
 * - Standard inventory & condition checklist for transparent deposit return later.
 * - Two-party digital confirmation between landlord and tenant.
 */
export type HandoverItemCondition = 'good' | 'fair' | 'damaged' | 'missing';
export interface HandoverItemCheck {
    id: string;
    name: string;
    category: 'keys_security' | 'furniture_appliances' | 'infrastructure';
    condition: HandoverItemCondition;
    notes?: string;
}
export interface PropertyHandoverRecord {
    id: string;
    contractId: string;
    listingId: string;
    listingTitle: string;
    landlordId: string;
    landlordName: string;
    tenantId: string;
    tenantName: string;
    handoverDate: string;
    initialElectricityMeter: number;
    electricityMeterPhotoUrl?: string;
    initialWaterMeter: number;
    waterMeterPhotoUrl?: string;
    itemChecklist: HandoverItemCheck[];
    generalNotes?: string;
    landlordConfirmed: boolean;
    tenantConfirmed: boolean;
    landlordConfirmedAt?: string;
    tenantConfirmedAt?: string;
    status: 'draft' | 'completed';
    createdAt: string;
    updatedAt: string;
}
export declare const STANDARD_HANDOVER_ITEMS: Array<{
    id: string;
    name: string;
    category: HandoverItemCheck['category'];
}>;
/**
 * Validates handover meter readings and required items.
 */
export declare function validateHandoverRecord(record: Partial<PropertyHandoverRecord>): {
    valid: boolean;
    errors: string[];
};
/**
 * Generates an initial handover template with standard items.
 */
export declare function createDefaultHandoverRecord(params: {
    id: string;
    contractId: string;
    listingId: string;
    listingTitle: string;
    landlordId: string;
    landlordName: string;
    tenantId: string;
    tenantName: string;
}): PropertyHandoverRecord;
