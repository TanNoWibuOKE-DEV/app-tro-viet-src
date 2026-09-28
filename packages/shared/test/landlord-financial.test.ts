import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { calculateLandlordFinancialSummary } from '../src/analytics/financial.js';
import { RentalContract, RentInvoice } from '../src/types/index.js';

describe('Phase 10 Landlord Financial Analytics & Cash Flow Engine', () => {
  const mockContracts: RentalContract[] = [
    {
      id: 'ctr-01',
      listingId: 'l-001',
      landlordId: 'u-landlord-1',
      tenantId: 'u-tenant-1',
      landlordName: 'Cô Lan',
      tenantName: 'Lê Văn An',
      monthlyRent: 2500000,
      deposit: 2500000,
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      status: 'active',
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'ctr-02',
      listingId: 'l-002',
      landlordId: 'u-landlord-1',
      tenantId: 'u-tenant-2',
      landlordName: 'Cô Lan',
      tenantName: 'Trần Thị Bình',
      monthlyRent: 3500000,
      deposit: 3500000,
      startDate: '2026-02-01',
      endDate: '2026-12-31',
      status: 'active',
      createdAt: '2026-02-01T00:00:00Z',
    },
  ];

  const mockInvoices: RentInvoice[] = [
    {
      id: 'inv-01',
      contractId: 'ctr-01',
      landlordId: 'u-landlord-1',
      tenantId: 'u-tenant-1',
      tenantName: 'Lê Văn An',
      listingTitle: 'Phòng 101',
      monthYear: '10/2026',
      monthlyRent: 2500000,
      electricityCost: 280000,
      waterCost: 60000,
      internetCost: 80000,
      totalAmount: 2920000,
      status: 'paid',
      createdAt: '2026-10-01T00:00:00Z',
    },
    {
      id: 'inv-02',
      contractId: 'ctr-02',
      landlordId: 'u-landlord-1',
      tenantId: 'u-tenant-2',
      tenantName: 'Trần Thị Bình',
      listingTitle: 'Phòng 102',
      monthYear: '10/2026',
      monthlyRent: 3500000,
      electricityCost: 350000,
      waterCost: 80000,
      serviceCost: 100000,
      totalAmount: 4030000,
      status: 'pending',
      createdAt: '2026-10-01T00:00:00Z',
    },
  ];

  it('calculates total revenue, collection status, and breakdown accurately', () => {
    const summary = calculateLandlordFinancialSummary({
      landlordId: 'u-landlord-1',
      contracts: mockContracts,
      invoices: mockInvoices,
      totalManagedRooms: 4,
      periodMonthYear: '10/2026',
    });

    assert.equal(summary.totalRooms, 4);
    assert.equal(summary.occupiedRooms, 2);
    assert.equal(summary.occupancyRatePercent, 50.0); // 2 out of 4 = 50%

    // Total expected = 2.920.000 + 4.030.000 = 6.950.000 VND
    assert.equal(summary.totalExpectedRevenue, 6950000);
    assert.equal(summary.totalCollectedRevenue, 2920000); // 1 paid
    assert.equal(summary.totalPendingRevenue, 4030000); // 1 pending
    assert.equal(summary.totalOverdueRevenue, 0);

    // Collection rate: 1 of 2 paid = 50%
    assert.equal(summary.onTimeCollectionRatePercent, 50);

    // Breakdown check:
    // Rent: 2.5m + 3.5m = 6.000.000
    // Electricity: 280k + 350k = 630.000
    // Water: 60k + 80k = 140.000
    // Service: 80k + 100k = 180.000
    assert.equal(summary.breakdown.rentAmount, 6000000);
    assert.equal(summary.breakdown.electricityAmount, 630000);
    assert.equal(summary.breakdown.waterAmount, 140000);
    assert.equal(summary.breakdown.serviceAmount, 180000);
  });

  it('flags overdue tenant alert when status is overdue', () => {
    const overdueInvoices: RentInvoice[] = [
      ...mockInvoices,
      {
        id: 'inv-03',
        contractId: 'ctr-03',
        landlordId: 'u-landlord-1',
        tenantId: 'u-tenant-3',
        tenantName: 'Nguyễn Văn Chậm',
        listingTitle: 'Phòng 103',
        monthYear: '10/2026',
        monthlyRent: 2000000,
        totalAmount: 2200000,
        status: 'overdue',
        createdAt: '2026-10-01T00:00:00Z',
      },
    ];

    const summary = calculateLandlordFinancialSummary({
      landlordId: 'u-landlord-1',
      contracts: mockContracts,
      invoices: overdueInvoices,
      totalManagedRooms: 3,
      periodMonthYear: '10/2026',
    });

    assert.equal(summary.totalOverdueRevenue, 2200000);
    assert.equal(summary.overdueAlerts.length, 1);
    assert.equal(summary.overdueAlerts[0].tenantName, 'Nguyễn Văn Chậm');
    assert.equal(summary.overdueAlerts[0].amount, 2200000);
  });

  it('generates 6-month historical trend correctly', () => {
    const summary = calculateLandlordFinancialSummary({
      landlordId: 'u-landlord-1',
      contracts: mockContracts,
      invoices: mockInvoices,
      periodMonthYear: '10/2026',
    });

    assert.equal(summary.trend6Months.length, 6);
    assert.equal(summary.trend6Months[5].monthYear, '10/2026');
    assert.equal(summary.trend6Months[0].monthYear, '05/2026');
  });
});
