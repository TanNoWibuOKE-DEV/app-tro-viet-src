/**
 * Trọ Việt - Secure Deposit Escrow Protocol (Phase 11)
 * Protects tenants from deposit fraud and protects landlords from uncommitted bookings.
 * 48-Hour holding window with verification upon property handover.
 * Integer VND and UTC timestamps with Vietnam display.
 */
export type DepositEscrowStatus = 'holding' | 'released' | 'disputed' | 'refunded' | 'cancelled';
export interface DepositEscrowRecord {
    id: string;
    escrowCode: string;
    listingId: string;
    listingTitle: string;
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    landlordId: string;
    landlordName: string;
    landlordPhone: string;
    amount: number;
    status: DepositEscrowStatus;
    createdAt: string;
    holdUntil: string;
    handoverId?: string;
    paymentReference?: string;
    disputeReason?: string;
    resolutionNotes?: string;
    releasedAt?: string;
    refundedAt?: string;
}
export interface CreateEscrowParams {
    listingId: string;
    listingTitle: string;
    tenantId: string;
    tenantName: string;
    tenantPhone: string;
    landlordId: string;
    landlordName: string;
    landlordPhone: string;
    amount: number;
    monthlyRent?: number;
    holdingHours?: number;
}
export declare const MIN_DEPOSIT_ESCROW_AMOUNT = 200000;
/**
 * Generates an escrow code for VietQR transfer memo (e.g. "DEP829104")
 */
export declare function generateDepositEscrowCode(): string;
/**
 * Initiates a new deposit escrow holding record.
 */
export declare function createDepositEscrow(params: CreateEscrowParams): DepositEscrowRecord;
/**
 * Evaluates remaining time or expiry of the 48-hour escrow window.
 */
export declare function checkEscrowExpiry(escrow: DepositEscrowRecord, referenceTime?: string | Date): {
    isExpired: boolean;
    remainingHours: number;
    remainingMinutes: number;
    totalRemainingMs: number;
};
/**
 * Releases deposit to landlord once tenant confirms inspection or signs handover.
 */
export declare function releaseDepositEscrow(escrow: DepositEscrowRecord, options?: {
    handoverId?: string;
    notes?: string;
}): DepositEscrowRecord;
/**
 * Raises a dispute against the escrow (e.g. room condition misrepresented, landlord absent).
 */
export declare function disputeDepositEscrow(escrow: DepositEscrowRecord, disputeReason: string): DepositEscrowRecord;
/**
 * Resolves a disputed escrow either by refunding the tenant or releasing to the landlord.
 */
export declare function resolveDisputedEscrow(escrow: DepositEscrowRecord, outcome: 'refund_to_tenant' | 'release_to_landlord', resolutionNotes: string): DepositEscrowRecord;
/**
 * Auto-resolves unconfirmed escrows once the 48h limit expires without disputes.
 * According to policy: If tenant doesn't dispute within 48h, deposit compensates landlord's opportunity cost.
 */
export declare function evaluateAutoReleaseAfterExpiry(escrow: DepositEscrowRecord, currentTime?: string | Date): DepositEscrowRecord;
