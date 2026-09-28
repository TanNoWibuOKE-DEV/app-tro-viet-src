import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  extractInvoiceCode,
  normalizeInvoiceCode,
  verifyWebhookSecret,
  reconcileBankTransaction,
  createMockBankTransaction,
  type BankWebhookTransaction,
  type InvoiceReconciliationInput,
} from '../src/payment/reconciliation.js';

describe('Phase 9 Automated VietQR Payment Reconciliation Engine', () => {
  it('extracts invoice codes from various Vietnamese banking transfer syntax', () => {
    assert.equal(extractInvoiceCode('NGUYEN VAN A CHUYEN TIEN TRV-202610-001 QUA MB'), 'TRV-202610-001');
    assert.equal(extractInvoiceCode('troviet 20261001 tien phong'), 'TRV-20261001');
    assert.equal(extractInvoiceCode('TRV1029'), 'TRV1029');
    assert.equal(extractInvoiceCode('INV-999'), 'INV-999');
    assert.equal(extractInvoiceCode('CHUYEN TIEN AN COM TRUA'), null);
  });

  it('normalizes invoice codes for robust fuzzy matching', () => {
    assert.equal(normalizeInvoiceCode('TRV-202610-001'), 'TRV202610001');
    assert.equal(normalizeInvoiceCode('TRV_202610_001'), 'TRV202610001');
    assert.equal(normalizeInvoiceCode('trv 202610 001'), 'TRV202610001');
  });

  it('verifies webhook Bearer token securely', () => {
    assert.equal(verifyWebhookSecret('Bearer secret_token_xyz', 'secret_token_xyz'), true);
    assert.equal(verifyWebhookSecret('secret_token_xyz', 'secret_token_xyz'), true);
    assert.equal(verifyWebhookSecret('Bearer wrong_token', 'secret_token_xyz'), false);
    assert.equal(verifyWebhookSecret(undefined, 'secret_token_xyz'), false);
  });

  it('settles invoice in full when exact amount is transferred', () => {
    const invoice: InvoiceReconciliationInput = {
      invoiceId: 'inv-101',
      invoiceCode: 'TRV-202610-001',
      totalAmount: 3500000,
      currentStatus: 'pending',
      landlordAccountNumber: '1029384756',
    };

    const transaction: BankWebhookTransaction = {
      id: 'tx-001',
      gateway: 'VCB',
      transactionDate: '2026-10-05 10:15:00',
      accountNumber: '1029384756',
      amountIn: 3500000,
      transactionContent: 'LE THI B CHUYEN TIEN TRV-202610-001',
    };

    const result = reconcileBankTransaction(transaction, invoice);
    assert.equal(result.outcome, 'settled_full');
    assert.equal(result.newStatus, 'paid');
    assert.equal(result.difference, 0);
    assert.equal(result.amountReceived, 3500000);
    assert.ok(result.settledAt);
  });

  it('handles overpayment gracefully by marking paid and recording excess credit', () => {
    const invoice: InvoiceReconciliationInput = {
      invoiceId: 'inv-102',
      invoiceCode: 'TRV-202610-002',
      totalAmount: 2000000,
      currentStatus: 'pending',
    };

    const transaction: BankWebhookTransaction = {
      id: 'tx-002',
      transactionDate: '2026-10-05 11:00:00',
      accountNumber: '999888',
      amountIn: 2200000, // 200k overpaid
      transactionContent: 'THANH TOAN TRV-202610-002 DONG DU TIEN',
    };

    const result = reconcileBankTransaction(transaction, invoice);
    assert.equal(result.outcome, 'over_payment');
    assert.equal(result.newStatus, 'paid');
    assert.equal(result.difference, 200000);
  });

  it('does NOT mark invoice as paid upon underpayment and protects landlord', () => {
    const invoice: InvoiceReconciliationInput = {
      invoiceId: 'inv-103',
      invoiceCode: 'TRV-202610-003',
      totalAmount: 4000000,
      currentStatus: 'pending',
    };

    const transaction: BankWebhookTransaction = {
      id: 'tx-003',
      transactionDate: '2026-10-05 12:00:00',
      accountNumber: '999888',
      amountIn: 2500000, // 1.5m short
      transactionContent: 'CHUYEN TIEN DOT 1 TRV-202610-003',
    };

    const result = reconcileBankTransaction(transaction, invoice);
    assert.equal(result.outcome, 'partial_payment');
    assert.equal(result.newStatus, 'partial_payment');
    assert.equal(result.difference, -1500000);
    assert.ok(result.userFacingMessage.includes('Còn thiếu 1.500.000 đ'));
  });

  it('enforces idempotency and skips already processed transaction IDs', () => {
    const invoice: InvoiceReconciliationInput = {
      invoiceId: 'inv-104',
      invoiceCode: 'TRV-202610-004',
      totalAmount: 3000000,
      currentStatus: 'paid',
      alreadyProcessedTransactionIds: ['tx-processed-99'],
    };

    const duplicateTransaction: BankWebhookTransaction = {
      id: 'tx-processed-99',
      transactionDate: '2026-10-05 14:00:00',
      accountNumber: '999888',
      amountIn: 3000000,
      transactionContent: 'TRV-202610-004',
    };

    const result = reconcileBankTransaction(duplicateTransaction, invoice);
    assert.equal(result.outcome, 'already_processed');
  });

  it('flags account mismatch when transfer destination is different', () => {
    const invoice: InvoiceReconciliationInput = {
      invoiceId: 'inv-105',
      invoiceCode: 'TRV-202610-005',
      totalAmount: 3000000,
      currentStatus: 'pending',
      landlordAccountNumber: '0123456789',
    };

    const wrongAccountTx: BankWebhookTransaction = {
      id: 'tx-005',
      transactionDate: '2026-10-05 15:00:00',
      accountNumber: '9876543210', // Different account!
      amountIn: 3000000,
      transactionContent: 'TRV-202610-005',
    };

    const result = reconcileBankTransaction(wrongAccountTx, invoice);
    assert.equal(result.outcome, 'account_mismatch');
  });

  it('generates mock transaction sandbox helper', () => {
    const mockTx = createMockBankTransaction({
      invoiceCode: 'TRV-202610-SANDBOX',
      amount: 4500000,
      senderName: 'TRAN VAN C',
    });

    assert.ok(mockTx.id);
    assert.equal(mockTx.amountIn, 4500000);
    assert.ok(mockTx.transactionContent.includes('TRV-202610-SANDBOX'));
    assert.ok(mockTx.transactionContent.includes('TRAN VAN C'));
  });
});
