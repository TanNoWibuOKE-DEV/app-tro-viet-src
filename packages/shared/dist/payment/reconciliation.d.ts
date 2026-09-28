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
    amountIn: number;
    amountOut?: number;
    accumulated?: number;
    code?: string;
    transactionContent: string;
    referenceCode?: string;
}
export interface InvoiceReconciliationInput {
    invoiceId: string;
    invoiceCode: string;
    totalAmount: number;
    currentStatus: 'pending' | 'paid' | 'overdue' | 'cancelled' | 'partial_payment';
    landlordAccountNumber?: string;
    paidAmount?: number;
    alreadyProcessedTransactionIds?: (string | number)[];
}
export type ReconciliationOutcome = 'settled_full' | 'partial_payment' | 'over_payment' | 'already_processed' | 'already_paid' | 'invoice_not_found' | 'account_mismatch';
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
export declare function extractInvoiceCode(content: string): string | null;
/**
 * Normalizes an invoice code for robust string matching (e.g. TRV-202610-001 -> TRV202610001).
 */
export declare function normalizeInvoiceCode(code: string): string;
/**
 * Verifies authenticity of webhook request via Bearer API Token or shared secret.
 */
export declare function verifyWebhookSecret(authHeader: string | undefined, expectedToken: string): boolean;
/**
 * Performs atomic reconciliation between an incoming bank transaction and an existing invoice.
 */
export declare function reconcileBankTransaction(transaction: BankWebhookTransaction, invoice: InvoiceReconciliationInput): ReconciliationResult;
/**
 * Creates a simulated bank transaction for development testing & mobile sandbox demonstration.
 */
export declare function createMockBankTransaction(params: {
    invoiceCode: string;
    amount: number;
    accountNumber?: string;
    senderName?: string;
}): BankWebhookTransaction;
