/**
 * Trọ Việt - Secure Deposit Escrow Protocol (Phase 11)
 * Protects tenants from deposit fraud and protects landlords from uncommitted bookings.
 * 48-Hour holding window with verification upon property handover.
 * Integer VND and UTC timestamps with Vietnam display.
 */

export type DepositEscrowStatus =
  | 'holding'
  | 'released'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export interface DepositEscrowRecord {
  id: string;
  escrowCode: string; // e.g. "DEP829104"
  listingId: string;
  listingTitle: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  landlordId: string;
  landlordName: string;
  landlordPhone: string;
  amount: number; // Integer VND
  status: DepositEscrowStatus;
  createdAt: string; // ISO UTC
  holdUntil: string; // ISO UTC (48h by default)
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
  holdingHours?: number; // Defaults to 48 hours
}

export const MIN_DEPOSIT_ESCROW_AMOUNT = 200000; // 200,000 VND min

/**
 * Generates an escrow code for VietQR transfer memo (e.g. "DEP829104")
 */
export function generateDepositEscrowCode(): string {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000).toString();
  return `DEP${randomSuffix}`;
}

/**
 * Initiates a new deposit escrow holding record.
 */
export function createDepositEscrow(params: CreateEscrowParams): DepositEscrowRecord {
  const amount = Math.round(params.amount);

  if (amount < MIN_DEPOSIT_ESCROW_AMOUNT) {
    throw new Error(
      `Số tiền đặt cọc giữ phòng tối thiểu là ${MIN_DEPOSIT_ESCROW_AMOUNT.toLocaleString('vi-VN')} ₫.`
    );
  }

  if (params.monthlyRent && amount > params.monthlyRent) {
    throw new Error(
      `Số tiền đặt cọc giữ phòng không được vượt quá 1 tháng tiền phòng (${params.monthlyRent.toLocaleString('vi-VN')} ₫).`
    );
  }

  const now = new Date();
  const holdingHours = params.holdingHours ?? 48;
  const holdUntil = new Date(now.getTime() + holdingHours * 60 * 60 * 1000);

  const escrowCode = generateDepositEscrowCode();

  return {
    id: `escrow-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    escrowCode,
    listingId: params.listingId,
    listingTitle: params.listingTitle,
    tenantId: params.tenantId,
    tenantName: params.tenantName,
    tenantPhone: params.tenantPhone,
    landlordId: params.landlordId,
    landlordName: params.landlordName,
    landlordPhone: params.landlordPhone,
    amount,
    status: 'holding',
    createdAt: now.toISOString(),
    holdUntil: holdUntil.toISOString(),
    paymentReference: escrowCode,
  };
}

/**
 * Evaluates remaining time or expiry of the 48-hour escrow window.
 */
export function checkEscrowExpiry(
  escrow: DepositEscrowRecord,
  referenceTime?: string | Date
): {
  isExpired: boolean;
  remainingHours: number;
  remainingMinutes: number;
  totalRemainingMs: number;
} {
  const refMs = referenceTime ? new Date(referenceTime).getTime() : Date.now();
  const holdUntilMs = new Date(escrow.holdUntil).getTime();
  const diffMs = holdUntilMs - refMs;

  if (diffMs <= 0) {
    return {
      isExpired: true,
      remainingHours: 0,
      remainingMinutes: 0,
      totalRemainingMs: 0,
    };
  }

  const totalRemainingMinutes = Math.floor(diffMs / (60 * 1000));
  const remainingHours = Math.floor(totalRemainingMinutes / 60);
  const remainingMinutes = totalRemainingMinutes % 60;

  return {
    isExpired: false,
    remainingHours,
    remainingMinutes,
    totalRemainingMs: diffMs,
  };
}

/**
 * Releases deposit to landlord once tenant confirms inspection or signs handover.
 */
export function releaseDepositEscrow(
  escrow: DepositEscrowRecord,
  options?: { handoverId?: string; notes?: string }
): DepositEscrowRecord {
  if (escrow.status !== 'holding') {
    throw new Error(
      `Không thể giải ngân khoản cọc ở trạng thái "${escrow.status}". Chỉ áp dụng cho trạng thái đang giữ chỗ (holding).`
    );
  }

  const now = new Date().toISOString();
  return {
    ...escrow,
    status: 'released',
    handoverId: options?.handoverId || escrow.handoverId,
    resolutionNotes: options?.notes || 'Người thuê đã xác nhận nhận phòng thành công.',
    releasedAt: now,
  };
}

/**
 * Raises a dispute against the escrow (e.g. room condition misrepresented, landlord absent).
 */
export function disputeDepositEscrow(
  escrow: DepositEscrowRecord,
  disputeReason: string
): DepositEscrowRecord {
  if (escrow.status !== 'holding') {
    throw new Error(`Chỉ có thể gửi khiếu nại đối với khoản cọc đang giữ chỗ.`);
  }

  if (!disputeReason || disputeReason.trim().length < 5) {
    throw new Error('Vui lòng nêu rõ lý do khiếu nại (tối thiểu 5 ký tự).');
  }

  return {
    ...escrow,
    status: 'disputed',
    disputeReason: disputeReason.trim(),
  };
}

/**
 * Resolves a disputed escrow either by refunding the tenant or releasing to the landlord.
 */
export function resolveDisputedEscrow(
  escrow: DepositEscrowRecord,
  outcome: 'refund_to_tenant' | 'release_to_landlord',
  resolutionNotes: string
): DepositEscrowRecord {
  if (escrow.status !== 'disputed') {
    throw new Error('Chỉ có thể phân xử khoản cọc đang ở trạng thái khiếu nại (disputed).');
  }

  const now = new Date().toISOString();

  if (outcome === 'refund_to_tenant') {
    return {
      ...escrow,
      status: 'refunded',
      resolutionNotes,
      refundedAt: now,
    };
  } else {
    return {
      ...escrow,
      status: 'released',
      resolutionNotes,
      releasedAt: now,
    };
  }
}

/**
 * Auto-resolves unconfirmed escrows once the 48h limit expires without disputes.
 * According to policy: If tenant doesn't dispute within 48h, deposit compensates landlord's opportunity cost.
 */
export function evaluateAutoReleaseAfterExpiry(
  escrow: DepositEscrowRecord,
  currentTime?: string | Date
): DepositEscrowRecord {
  if (escrow.status !== 'holding') {
    return escrow;
  }

  const expiry = checkEscrowExpiry(escrow, currentTime);
  if (expiry.isExpired) {
    return {
      ...escrow,
      status: 'released',
      resolutionNotes: 'Tự động giải ngân cho chủ trọ do hết thời hạn giữ chỗ 48h không có khiếu nại.',
      releasedAt: new Date().toISOString(),
    };
  }

  return escrow;
}
