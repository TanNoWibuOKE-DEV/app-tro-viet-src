"use strict";
/**
 * Trọ Việt - Phase 6 Mock Contracts & Invoices
 * Used for AppContext initial state, tests, and mock demonstrations.
 * Adheres strictly to 2-tier administrative boundaries, integer VND, and NAPAS VietQR standard.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_INVOICES = exports.MOCK_CONTRACTS = exports.MOCK_CONTRACT_2_TEXT = exports.MOCK_CONTRACT_1_TEXT = void 0;
const template_js_1 = require("../contract/template.js");
const vietqr_js_1 = require("../payment/vietqr.js");
exports.MOCK_CONTRACT_1_TEXT = (0, template_js_1.generateContractText)({
    id: 'contract-dn-001',
    contractNumber: 'HD-2026-DN-001',
    listingId: 'listing-danang-01',
    landlord: {
        fullName: 'Trần Văn An',
        phoneNumber: '0905123456',
        idCardNumber: '048092001234',
        address: '45 Bạch Đằng, Phường Hải Châu 1, Thành phố Đà Nẵng'
    },
    tenant: {
        fullName: 'Nguyễn Minh Khang',
        phoneNumber: '0912345678',
        idCardNumber: '048098005678',
        address: '12 Nguyễn Chí Thanh, Phường Hải Châu 1, Thành phố Đà Nẵng'
    },
    propertyAddress: {
        houseNumber: '45/12',
        street: 'Bạch Đằng',
        wardName: 'Phường Hải Châu 1',
        wardCode: 'VN-DANANG-HC1',
        provinceName: 'Thành phố Đà Nẵng',
        provinceCode: 'VN-DANANG'
    },
    startDate: '2026-03-01',
    endDate: '2027-03-01',
    monthlyRent: 4500000,
    depositAmount: 4500000,
    paymentDayOfMonth: 5,
    utilities: {
        electricityBillingType: 'meter',
        electricityPricePerUnit: 3500,
        waterBillingType: 'meter',
        waterPricePerUnit: 15000,
        internetPriceMonthly: 50000,
        parkingPriceMonthly: 0
    },
    status: 'active',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-03-01T09:30:00Z'
});
exports.MOCK_CONTRACT_2_TEXT = (0, template_js_1.generateContractText)({
    id: 'contract-dn-002',
    contractNumber: 'HD-2026-DN-002',
    listingId: 'listing-danang-02',
    landlord: {
        fullName: 'Lê Thị Bích',
        phoneNumber: '0905987654',
        idCardNumber: '048190008899',
        address: '120 Ngô Sĩ Liên, Phường Hòa Khánh Bắc, Thành phố Đà Nẵng'
    },
    tenant: {
        fullName: 'Nguyễn Minh Khang',
        phoneNumber: '0912345678',
        idCardNumber: '048098005678',
        address: 'Phường Hòa Khánh Bắc, Thành phố Đà Nẵng'
    },
    propertyAddress: {
        houseNumber: '120/5',
        street: 'Ngô Sĩ Liên',
        wardName: 'Phường Hòa Khánh Bắc',
        wardCode: 'VN-DANANG-HKB',
        provinceName: 'Thành phố Đà Nẵng',
        provinceCode: 'VN-DANANG'
    },
    startDate: '2026-10-01',
    endDate: '2027-10-01',
    monthlyRent: 3200000,
    depositAmount: 3200000,
    paymentDayOfMonth: 1,
    utilities: {
        electricityBillingType: 'meter',
        electricityPricePerUnit: 3500,
        waterBillingType: 'fixed',
        waterPricePerUnit: 50000,
        internetPriceMonthly: 50000,
        parkingPriceMonthly: 0
    },
    status: 'pending_signature',
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
});
exports.MOCK_CONTRACTS = [
    {
        id: 'contract-dn-001',
        listingId: 'listing-danang-01',
        listingTitle: 'Phòng studio cao cấp view sông Hàn',
        landlordId: 'user-landlord-01',
        landlordName: 'Trần Văn An',
        tenantId: 'user-tenant-01',
        tenantName: 'Nguyễn Minh Khang',
        status: 'active',
        monthlyRent: 4500000,
        depositAmount: 4500000,
        startDate: '2026-03-01T00:00:00Z',
        endDate: '2027-03-01T00:00:00Z',
        landlordSignedAt: '2026-03-01T08:30:00Z',
        tenantSignedAt: '2026-03-01T09:15:00Z',
        contractText: exports.MOCK_CONTRACT_1_TEXT,
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-03-01T09:15:00Z'
    },
    {
        id: 'contract-dn-002',
        listingId: 'listing-danang-02',
        listingTitle: 'Căn hộ mini ban công thoáng mát gần ĐH Bách Khoa',
        landlordId: 'user-landlord-02',
        landlordName: 'Lê Thị Bích',
        tenantId: 'user-tenant-01',
        tenantName: 'Nguyễn Minh Khang',
        status: 'pending_signature',
        monthlyRent: 3200000,
        depositAmount: 3200000,
        startDate: '2026-10-01T00:00:00Z',
        endDate: '2027-10-01T00:00:00Z',
        landlordSignedAt: '2026-09-20T10:00:00Z',
        tenantSignedAt: undefined,
        contractText: exports.MOCK_CONTRACT_2_TEXT,
        createdAt: '2026-09-20T10:00:00Z',
        updatedAt: '2026-09-20T10:00:00Z'
    }
];
exports.MOCK_INVOICES = [
    {
        id: 'inv-dn-2026-08',
        contractId: 'contract-dn-001',
        listingId: 'listing-danang-01',
        listingTitle: 'Phòng studio cao cấp view sông Hàn',
        landlordId: 'user-landlord-01',
        landlordName: 'Trần Văn An',
        tenantId: 'user-tenant-01',
        tenantName: 'Nguyễn Minh Khang',
        monthYear: '08/2026',
        rentAmount: 4500000,
        electricityAmount: 350000,
        electricityKwh: 100,
        waterAmount: 60000,
        waterM3: 4,
        internetAmount: 50000,
        serviceAmount: 0,
        totalAmount: 4960000,
        status: 'paid',
        vietqrUrl: (0, vietqr_js_1.generateVietQRLink)({
            bankBin: '970422',
            bankName: 'MBBank',
            accountNumber: '0905123456',
            accountName: 'TRAN VAN AN',
            amount: 4960000,
            description: 'TROVIET INV 0826 01'
        }).qrImageUrl,
        paidAt: '2026-08-04T15:20:00Z',
        createdAt: '2026-08-01T07:00:00Z',
        updatedAt: '2026-08-04T15:20:00Z'
    },
    {
        id: 'inv-dn-2026-09',
        contractId: 'contract-dn-001',
        listingId: 'listing-danang-01',
        listingTitle: 'Phòng studio cao cấp view sông Hàn',
        landlordId: 'user-landlord-01',
        landlordName: 'Trần Văn An',
        tenantId: 'user-tenant-01',
        tenantName: 'Nguyễn Minh Khang',
        monthYear: '09/2026',
        rentAmount: 4500000,
        electricityAmount: 385000,
        electricityKwh: 110,
        waterAmount: 75000,
        waterM3: 5,
        internetAmount: 50000,
        serviceAmount: 0,
        totalAmount: 5010000,
        status: 'pending',
        vietqrUrl: (0, vietqr_js_1.generateVietQRLink)({
            bankBin: '970422',
            bankName: 'MBBank',
            accountNumber: '0905123456',
            accountName: 'TRAN VAN AN',
            amount: 5010000,
            description: 'TROVIET INV 0926 01'
        }).qrImageUrl,
        paidAt: undefined,
        createdAt: '2026-09-01T07:00:00Z',
        updatedAt: '2026-09-01T07:00:00Z'
    }
];
