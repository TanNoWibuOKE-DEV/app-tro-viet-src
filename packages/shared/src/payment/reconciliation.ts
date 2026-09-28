/**
 * Trọ Việt - Automated VietQR Payment Reconciliation & Settlement Engine
 * Strictly adheres to SPEC Section 4 & Rules:
 * - Direct peer-to-peer bank transfer reconciliation (SePAY / Open Banking format).
 * - Exact integer VND matching to avoid rounding loopholes.
 * - Idempotent processing to prevent duplicate settlement.
 * - Underpayment protection: marks partial_payment instead of closing invoice.
 */

export interface BankWebhookTransaction {
  id: string | number;
  gateway?: string;
  transactionDate: string;
  accountNumber: string;
  subAccount?: string;
  amountIn: number; // Integer VND
  amountOut?: number;
  accumulated?: number;
  code?: string;
  transactionContent: string; // e.g. "NGUYEN VAN A CHUYEN TIEN TRV-202610-001"
  referenceCode?: string;
}

export interface InvoiceReconciliationInput {
  invoiceId: string;
  invoiceCode: string;
  totalAmount: number; // Integer VND
  currentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial_payment';
  landlordAccountNumber?: string;
  paidAmount?: number;
  alreadyProcessedTransactionIds?: (string | number)[];
}

export type ReconciliationOutcome =
  | 'settled_full'
  | 'partial_payment'
  | 'over_payment'
  | 'already_processed'
  | 'already_paid'
  | 'invoice_not_found'
  | 'account_mismatch';

export interface ReconciliationResult {
  outcome: ReconciliationOutcome;
  invoiceId?: string;
  invoiceCode?: string;
  newStatus?: 'paid' | 'partial_payment' | 'pending';
  amountReceived: number;
  expectedAmount: number;
  difference: number;
  transactionId: string | number;
  settledAt?: string;
  userFacingMessage: string;
  systemAuditLog: string;
}

/**
 * Extracts invoice reference code from transaction content.
 * Accepts prefixes: TRV, TROVIET, or INV (e.g. "TRV1029", "TRV-202610-001", "TROVIET HD01").
 */
export function extractInvoiceCode(content: string): string | null {
  if (!content) return null;
  const upper = content.toUpperCase();

  // Pattern 1: TRV-XXXXX-YYY or TRVXXXXX
  const trvMatch = upper.match(/TRV(?:[-_]?[A-Z0-9]+)+/);
  if (trvMatch) {
    return trvMatch[0];
  }

  // Pattern 2: TROVIET[-_ ]?XXXXX
  const trovietMatch = upper.match(/TROVIET(?:[-_ ]?([A-Z0-9]+(?:[-_][A-Z0-9]+)*))/);
  if (trovietMatch) {
    return trovietMatch[1] ? `TRV-${trovietMatch[1]}` : trovietMatch[0];
  }

  // Pattern 3: INV[-_]?[0-9]+
  const invMatch = upper.match(/INV(?:[-_]?[A-Z0-9]+)+/);
  if (invMatch) {
    return invMatch[0];
  }

  return null;
}

/**
 * Normalizes an invoice code for robust string matching (e.g. TRV-202610-001 -> TRV202610001).
 */
export function normalizeInvoiceCode(code: string): string {
  return code.toUpperCase().replace(/[-_\s]/g, '');
}

/**
 * Verifies authenticity of webhook request via Bearer API Token or shared secret.
 */
export function verifyWebhookSecret(authHeader: string | undefined, expectedToken: string): boolean {
  if (!expectedToken) return false;
  if (!authHeader) return false;
  const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : authHeader.trim();
  return token === expectedToken.trim();
}

/**
 * Performs atomic reconciliation between an incoming bank transaction and an existing invoice.
 */
export function reconcileBankTransaction(
  transaction: BankWebhookTransaction,
  invoice: InvoiceReconciliationInput
): ReconciliationResult {
  const transactionId = transaction.id;
  const amountIn = Math.max(0, Math.round(transaction.amountIn));
  const expectedAmount = Math.max(0, Math.round(invoice.totalAmount));

  // 1. Idempotency Check: Transaction already processed
  if (invoice.alreadyProcessedTransactionIds && invoice.alreadyProcessedTransactionIds.includes(transactionId)) {
    return {
      outcome: 'already_processed',
      invoiceId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode,
      amountReceived: amountIn,
      expectedAmount,
      difference: 0,
      transactionId,
      userFacingMessage: 'Giao dịch này đã được xử lý trước đó.',
      systemAuditLog: `Transaction ${transactionId} already processed for invoice ${invoice.invoiceCode}. Skipped.`,
    };
  }

  // 2. Invoice is already completely paid
  if (invoice.currentStatus === 'paid') {
    return {
      outcome: 'already_paid',
      invoiceId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode,
      amountReceived: amountIn,
      expectedAmount,
      difference: amountIn,
      transactionId,
      userFacingMessage: 'Hóa đơn này đã được thanh toán đầy đủ từ trước.',
      systemAuditLog: `Invoice ${invoice.invoiceCode} is already paid. Transaction ${transactionId} flagged.`,
    };
  }

  // 3. Bank Account Validation (if provided)
  if (invoice.landlordAccountNumber) {
    const cleanLandlordAcc = invoice.landlordAccountNumber.replace(/\s+/g, '');
    const cleanTxAcc = transaction.accountNumber.replace(/\s+/g, '');
    if (cleanLandlordAcc !== cleanTxAcc) {
      return {
        outcome: 'account_mismatch',
        invoiceId: invoice.invoiceId,
        invoiceCode: invoice.invoiceCode,
        amountReceived: amountIn,
        expectedAmount,
        difference: amountIn - expectedAmount,
        transactionId,
        userFacingMessage: 'Số tài khoản nhận không khớp với tài khoản chỉ định của chủ trọ.',
        systemAuditLog: `Account mismatch: received into ${cleanTxAcc}, expected ${cleanLandlordAcc}.`,
      };
    }
  }

  // 4. Code Matching check
  const extractedCode = extractInvoiceCode(transaction.transactionContent);
  const normalizedExtracted = extractedCode ? normalizeInvoiceCode(extractedCode) : '';
  const normalizedInvoice = normalizeInvoiceCode(invoice.invoiceCode);

  if (!normalizedExtracted || !normalizedInvoice.includes(normalizedExtracted) && !normalizedExtracted.includes(normalizedInvoice)) {
    return {
      outcome: 'invoice_not_found',
      invoiceId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode,
      amountReceived: amountIn,
      expectedAmount,
      difference: amountIn - expectedAmount,
      transactionId,
      userFacingMessage: 'Nội dung chuyển khoản không khớp với mã hóa đơn cần thanh toán.',
      systemAuditLog: `Syntax mismatch: extracted [${extractedCode}], expected [${invoice.invoiceCode}].`,
    };
  }

  const nowIso = new Date().toISOString();
  const currentPaid = invoice.paidAmount ?? 0;
  const totalReceived = currentPaid + amountIn;
  const difference = totalReceived - expectedAmount;

  // 5. Amount Evaluation
  if (difference >= 0) {
    const outcome = difference === 0 ? 'settled_full' : 'over_payment';
    return {
      outcome,
      invoiceId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode,
      newStatus: 'paid',
      amountReceived: totalReceived,
      expectedAmount,
      difference,
      transactionId,
      settledAt: nowIso,
      userFacingMessage: difference === 0
        ? `Xác nhận thanh toán thành công hóa đơn ${invoice.invoiceCode}. Hóa đơn đã được gạch nợ.`
        : `Xác nhận thanh toán thành công hóa đơn ${invoice.invoiceCode}. Khách chuyển thừa ${difference.toLocaleString('vi-VN')} đ (đã ghi nhận dư có).`,
      systemAuditLog: `Invoice ${invoice.invoiceCode} settled successfully with transaction ${transactionId}. Received: ${totalReceived}, Expected: ${expectedAmount}.`,
    };
  } else {
    // Underpaid -> mark as partial_payment, do NOT mark as paid
    return {
      outcome: 'partial_payment',
      invoiceId: invoice.invoiceId,
      invoiceCode: invoice.invoiceCode,
      newStatus: 'partial_payment',
      amountReceived: totalReceived,
      expectedAmount,
      difference,
      transactionId,
      settledAt: nowIso,
      userFacingMessage: `Đã nhận ${amountIn.toLocaleString('vi-VN')} đ. Còn thiếu ${Math.abs(difference).toLocaleString('vi-VN')} đ để hoàn tất hóa đơn.`,
      systemAuditLog: `Partial payment recorded for invoice ${invoice.invoiceCode}. Received: ${totalReceived}/${expectedAmount} (shortfall: ${Math.abs(difference)}).`,
    };
  }
}

/**
 * Creates a simulated bank transaction for development testing & mobile sandbox demonstration.
 */
export function createMockBankTransaction(params: {
  invoiceCode: string;
  amount: number;
  accountNumber?: string;
  senderName?: string;
}): BankWebhookTransaction {
  const txId = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  const sender = params.senderName || 'NGUYEN VAN A';
  return {
    id: txId,
    gateway: 'VCB',
    transactionDate: dateStr,
    accountNumber: params.accountNumber || '1029384756',
    amountIn: params.amount,
    amountOut: 0,
    transactionContent: `${sender} THANH TOAN ${params.invoiceCode} QUA VIETQR`,
    referenceCode: `FT${txId}`,
  };
}
