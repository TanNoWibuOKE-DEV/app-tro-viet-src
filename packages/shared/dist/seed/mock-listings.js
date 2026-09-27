"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MOCK_LISTINGS = void 0;
const amenities_js_1 = require("../constants/amenities.js");
exports.MOCK_LISTINGS = [
    {
        id: 'l-001',
        title: 'Phòng trọ gác lửng thoáng mát gần ĐH Duy Tân [MẪU - DEV]',
        propertyType: 'room',
        monthlyRent: 2500000,
        deposit: 2500000,
        areaSquareMeters: 25,
        provinceCode: '48',
        wardCode: '48_HAICHAU1',
        wardName: 'Phường Hải Châu I',
        street: 'Nguyễn Du',
        houseNumber: '124/6',
        latitude: 16.0728,
        longitude: 108.2215,
        landlordId: 'u-landlord-1',
        landlordName: 'Cô Lan (Chủ nhà)',
        landlordVerificationLevel: 'L2',
        status: 'published',
        amenities: [
            amenities_js_1.STANDARD_AMENITIES[0], // Máy lạnh
            amenities_js_1.STANDARD_AMENITIES[1], // WC riêng
            amenities_js_1.STANDARD_AMENITIES[3], // Gác lửng
            amenities_js_1.STANDARD_AMENITIES[8], // Giờ tự do
        ],
        costs: {
            monthlyRent: 2500000,
            deposit: 2500000,
            electricityBillingType: 'meter',
            electricityCostPerUnit: 3500,
            waterBillingType: 'fixed_monthly',
            waterCostPerUnit: 60000,
            internetBillingType: 'fixed_monthly',
            internetCost: 80000,
            parkingBillingType: 'fixed_monthly',
            parkingCost: 0, // Miễn phí để xe
            serviceFeeBillingType: 'fixed_monthly',
            serviceCost: 30000,
        },
        createdAt: '2026-09-20T08:00:00Z',
    },
    {
        id: 'l-002',
        title: 'Căn hộ mini ban công lộng gió gần biển Mỹ Khê [MẪU - DEV]',
        propertyType: 'apartment',
        monthlyRent: 4800000,
        deposit: 4800000,
        areaSquareMeters: 38,
        provinceCode: '48',
        wardCode: '48_PHUOCMY',
        wardName: 'Phường Phước Mỹ',
        street: 'Hồ Nghinh',
        houseNumber: '55',
        latitude: 16.0620,
        longitude: 108.2435,
        landlordId: 'u-landlord-2',
        landlordName: 'Anh Minh Căn Hộ',
        landlordVerificationLevel: 'L1',
        status: 'published',
        amenities: [
            amenities_js_1.STANDARD_AMENITIES[0], // Máy lạnh
            amenities_js_1.STANDARD_AMENITIES[1], // WC riêng
            amenities_js_1.STANDARD_AMENITIES[2], // Bình nóng lạnh
            amenities_js_1.STANDARD_AMENITIES[4], // Tủ lạnh
            amenities_js_1.STANDARD_AMENITIES[5], // Máy giặt
            amenities_js_1.STANDARD_AMENITIES[7], // Ban công
            amenities_js_1.STANDARD_AMENITIES[10], // Thang máy
        ],
        costs: {
            monthlyRent: 4800000,
            deposit: 4800000,
            electricityBillingType: 'meter',
            electricityCostPerUnit: 3800,
            waterBillingType: 'meter',
            waterCostPerUnit: 18000,
            internetBillingType: 'fixed_monthly',
            internetCost: 100000,
            parkingBillingType: 'unprovided', // Minh bạch: Chưa cung cấp
            serviceFeeBillingType: 'fixed_monthly',
            serviceCost: 100000,
        },
        createdAt: '2026-09-22T09:30:00Z',
    },
    {
        id: 'l-003',
        title: 'Phòng giá rẻ sinh viên gần ĐH Bách Khoa [MẪU - DEV]',
        propertyType: 'room',
        monthlyRent: 1600000,
        deposit: 1000000,
        areaSquareMeters: 18,
        provinceCode: '48',
        wardCode: '48_HOAKHANHBAC',
        wardName: 'Phường Hòa Khánh Bắc',
        street: 'Ngô Sĩ Liên',
        houseNumber: '42',
        latitude: 16.0760,
        longitude: 108.1510,
        landlordId: 'u-landlord-1',
        landlordName: 'Cô Lan (Chủ nhà)',
        landlordVerificationLevel: 'L2',
        status: 'published',
        amenities: [
            amenities_js_1.STANDARD_AMENITIES[1], // WC riêng
            amenities_js_1.STANDARD_AMENITIES[3], // Gác lửng
            amenities_js_1.STANDARD_AMENITIES[8], // Giờ tự do
            amenities_js_1.STANDARD_AMENITIES[11], // Chỗ để xe
        ],
        costs: {
            monthlyRent: 1600000,
            deposit: 1000000,
            electricityBillingType: 'meter',
            electricityCostPerUnit: 3200,
            waterBillingType: 'fixed_monthly',
            waterCostPerUnit: 50000,
            internetBillingType: 'fixed_monthly',
            internetCost: 50000,
            parkingBillingType: 'fixed_monthly',
            parkingCost: 0,
            serviceFeeBillingType: 'unprovided',
        },
        createdAt: '2026-09-23T14:15:00Z',
    },
    {
        id: 'l-004',
        title: 'Studio full nội thất view Cầu Rồng [MẪU - DEV]',
        propertyType: 'apartment',
        monthlyRent: 6000000,
        deposit: 6000000,
        areaSquareMeters: 42,
        provinceCode: '48',
        wardCode: '48_HAICHAU1',
        wardName: 'Phường Hải Châu I',
        street: 'Bạch Đằng',
        houseNumber: '88',
        latitude: 16.0625,
        longitude: 108.2240,
        landlordId: 'u-landlord-3',
        landlordName: 'Bảo Hoàng House',
        landlordVerificationLevel: 'L3',
        status: 'published',
        amenities: amenities_js_1.STANDARD_AMENITIES,
        costs: {
            monthlyRent: 6000000,
            deposit: 6000000,
            electricityBillingType: 'meter',
            electricityCostPerUnit: 4000,
            waterBillingType: 'fixed_monthly',
            waterCostPerUnit: 100000,
            internetBillingType: 'fixed_monthly',
            internetCost: 0, // Miễn phí wifi
            parkingBillingType: 'fixed_monthly',
            parkingCost: 100000,
            serviceFeeBillingType: 'fixed_monthly',
            serviceCost: 150000,
        },
        createdAt: '2026-09-24T03:00:00Z',
    },
    {
        id: 'l-pending-001',
        title: 'Phòng trọ mới xây đường 2 Tháng 9 cần kiểm duyệt [MẪU - DEV]',
        propertyType: 'room',
        monthlyRent: 3200000,
        deposit: 3200000,
        areaSquareMeters: 28,
        provinceCode: '48',
        wardCode: '48_HOACUONGNAM',
        wardName: 'Phường Hòa Cường Nam',
        street: 'Đường 2 Tháng 9',
        houseNumber: '310',
        latitude: 16.0450,
        longitude: 108.2210,
        landlordId: 'u-landlord-4',
        landlordName: 'Bác Tuấn',
        landlordVerificationLevel: 'L1',
        status: 'pending_review', // Đang chờ admin duyệt!
        amenities: [
            amenities_js_1.STANDARD_AMENITIES[0],
            amenities_js_1.STANDARD_AMENITIES[1],
            amenities_js_1.STANDARD_AMENITIES[7],
        ],
        costs: {
            monthlyRent: 3200000,
            deposit: 3200000,
            electricityBillingType: 'meter',
            electricityCostPerUnit: 3500,
            waterBillingType: 'meter',
            waterCostPerUnit: 15000,
            internetBillingType: 'fixed_monthly',
            internetCost: 80000,
            parkingBillingType: 'fixed_monthly',
            parkingCost: 50000,
            serviceFeeBillingType: 'unprovided',
        },
        createdAt: '2026-09-24T06:00:00Z',
    }
];
