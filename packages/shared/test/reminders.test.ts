import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  checkRentInvoiceReminders,
  checkContractExpiryReminders,
} from '../src/scheduler/reminders.js';
import { RentInvoice, RentalContract } from '../src/types/index.js';

describe('Phase 7 Automated Tenancy & Invoicing Reminders Scheduler', () => {
  const mockInvoices: RentInvoice[] = [
    {
      id: 'inv-due-soon',
      contractId: 'ctr-1',
      listingId: 'list-1',
      listingTitle: 'Phòng studio trung tâm',
      landlordId: 'll-1',
      landlordName: 'Chủ An',
      tenantId: 'tn-1',
      tenantName: 'Khang',
      monthYear: '10/2026',
      rentAmount: 3000000,
      electricityAmount: 300000,
      waterAmount: 50000,
      internetAmount: 50000,
      serviceAmount: 0,
      totalAmount: 3400000,
      status: 'pending',
      vietqrUrl: 'https://img.vietqr.io/image/970422-123-compact2.png',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'inv-already-paid',
      contractId: 'ctr-2',
      listingId: 'list-2',
      listingTitle: 'Phòng đã nộp tiền',
      landlordId: 'll-1',
      landlordName: 'Chủ An',
      tenantId: 'tn-1',
      tenantName: 'Khang',
      monthYear: '10/2026',
      rentAmount: 2500000,
      electricityAmount: 200000,
      waterAmount: 50000,
      internetAmount: 0,
      serviceAmount: 0,
      totalAmount: 2750000,
      status: 'paid',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ];

  const mockContracts: RentalContract[] = [
    {
      id: 'ctr-expiring',
      listingId: 'list-1',
      listingTitle: 'Phòng trọ Hải Châu',
      landlordId: 'll-1',
      landlordName: 'Chủ An',
      tenantId: 'tn-1',
      tenantName: 'Khang',
      status: 'active',
      monthlyRent: 3500000,
      depositAmount: 3500000,
      startDate: '2025-11-01T00:00:00Z',
      endDate: '2026-11-01T00:00:00Z',
      contractText: '...',
      createdAt: '2025-11-01T00:00:00Z',
    },
    {
      id: 'ctr-far-future',
      listingId: 'list-2',
      listingTitle: 'Phòng trọ dài hạn',
      landlordId: 'll-1',
      landlordName: 'Chủ An',
      tenantId: 'tn-2',
      tenantName: 'Bình',
      status: 'active',
      monthlyRent: 4000000,
      depositAmount: 4000000,
      startDate: '2026-06-01T00:00:00Z',
      endDate: '2027-06-01T00:00:00Z',
      contractText: '...',
      createdAt: '2026-06-01T00:00:00Z',
    },
  ];

  it('detects upcoming invoice 3 days before due date (due date 05/10/2026 vs current date 03/10/2026)', () => {
    const referenceDate = new Date(2026, 9, 3, 10, 0, 0); // 03/10/2026
    const reminders = checkRentInvoiceReminders(mockInvoices, referenceDate);

    assert.strictEqual(reminders.length, 1);
    assert.strictEqual(reminders[0].type, 'rent_due_soon');
    assert.strictEqual(reminders[0].targetId, 'inv-due-soon');
    assert.strictEqual(reminders[0].amount, 3400000);
    assert.ok(reminders[0].message.includes('sau 3 ngày'));
  });

  it('detects contract expiring within 30 days and notifies both tenant and landlord', () => {
    const referenceDate = new Date(2026, 9, 15, 10, 0, 0); // 15/10/2026 (endDate is 01/11/2026, ~17 days left)
    const reminders = checkContractExpiryReminders(mockContracts, referenceDate);

    assert.strictEqual(reminders.length, 2); // 1 for tenant, 1 for landlord
    assert.ok(reminders.some((r) => r.userId === 'tn-1'));
    assert.ok(reminders.some((r) => r.userId === 'll-1'));
    assert.strictEqual(reminders[0].type, 'contract_expiring_soon');
  });

  it('ignores invoices that are already paid or contracts with distant expiry dates', () => {
    const referenceDate = new Date(2026, 5, 15, 10, 0, 0); // 15/06/2026
    const contractReminders = checkContractExpiryReminders(mockContracts, referenceDate);
    assert.strictEqual(contractReminders.length, 0);
  });
});
