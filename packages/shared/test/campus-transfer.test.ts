import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCampusesByCity,
  findNearestCampus,
  CAMPUS_PROFILES,
} from '../src/community/campus';
import {
  createRoomTransfer,
  calculateTransferSavings,
  createStudentPassItem,
  markPassItemSold,
  filterPassItems,
} from '../src/community/transfer-pass';

describe('Phase 13 Campus Community & Room Transfer Engine', () => {
  it('retrieves campuses by city accurately', () => {
    const daNangCampuses = getCampusesByCity('danang');
    assert.ok(daNangCampuses.length >= 3);
    assert.ok(daNangCampuses.some((c) => c.code === 'DUT_DANANG'));
    assert.ok(daNangCampuses.some((c) => c.code === 'DUE_DANANG'));

    const hanoiCampuses = getCampusesByCity('hanoi');
    assert.ok(hanoiCampuses.some((c) => c.code === 'VNU_HN_CAUGIAY'));

    const hcmCampuses = getCampusesByCity('hcm');
    assert.ok(hcmCampuses.some((c) => c.code === 'VNU_HCM_THUDUC'));
  });

  it('accurately identifies the nearest campus given GPS coordinates', () => {
    // 50m from DUT (ĐH Bách Khoa Đà Nẵng: 16.0748, 108.1498)
    const result = findNearestCampus(16.0750, 108.1500);
    assert.ok(result !== null);
    assert.equal(result.campus.code, 'DUT_DANANG');
    assert.ok(result.distanceKm <= 0.2);
  });

  it('creates valid room transfer record with integer VND deposit and rent', () => {
    const transfer = createRoomTransfer({
      tenantId: 'user-senior-student',
      title: 'Nhượng phòng trọ gần ĐH Sư Phạm Đà Nẵng full đồ',
      monthlyRent: 2200000,
      depositAmount: 2200000,
      roomAddress: 'K120 Tôn Đức Thắng, Hòa Khánh Nam, Liên Chiểu',
      wardSlug: 'hoa-khanh-nam',
      cityCode: 'danang',
      availableDate: '2026-10-15',
      contractMonthsLeft: 5,
      landlordConsent: true,
      incentiveNote: 'Tặng 500k tiền hỗ trợ dọn phòng',
      contactPhone: '0905987654',
    });

    assert.ok(transfer.transferCode.startsWith('TRF'));
    assert.equal(transfer.monthlyRent, 2200000);
    assert.equal(transfer.depositAmount, 2200000);
    assert.equal(transfer.status, 'active');
    assert.equal(transfer.contractMonthsLeft, 5);
  });

  it('calculates net transfer deposit savings correctly', () => {
    const savings = calculateTransferSavings({
      depositAmount: 2500000,
      incentiveDiscountVnd: 500000,
    });

    assert.equal(savings.depositReclaimedVnd, 2500000);
    assert.equal(savings.incentiveDiscountVnd, 500000);
    assert.equal(savings.netTransferCostVnd, 2000000);
  });

  it('manages student pass-items and filters by category and max price', () => {
    const item1 = createStudentPassItem({
      sellerId: 'student-1',
      title: 'Quạt lửng Senko còn mới 95%',
      category: 'appliances',
      priceVnd: 120000,
      condition: 'like_new',
      campusNear: 'ĐH Bách Khoa ĐN',
      description: 'Quạt chạy êm mát, pass lại vì dọn về quê.',
      pickupLocation: 'K54 Nguyễn Lương Bằng, Liên Chiểu',
      contactPhone: '0905111222',
    });

    const item2 = createStudentPassItem({
      sellerId: 'student-2',
      title: 'Bàn học gấp sinh viên',
      category: 'furniture',
      priceVnd: 50000,
      condition: 'good',
      campusNear: 'ĐH Bách Khoa ĐN',
      description: 'Bàn học gỗ ép chắc chắn.',
      pickupLocation: 'Đường Ngô Thì Nhậm, Liên Chiểu',
      contactPhone: '0905333444',
    });

    const items = [item1, item2];

    // Filter by category
    const appliances = filterPassItems(items, { category: 'appliances' });
    assert.equal(appliances.length, 1);
    assert.equal(appliances[0].title, 'Quạt lửng Senko còn mới 95%');

    // Filter by max price <= 100k
    const cheapItems = filterPassItems(items, { maxPriceVnd: 100000 });
    assert.equal(cheapItems.length, 1);
    assert.equal(cheapItems[0].priceVnd, 50000);

    // Mark as sold
    const soldItem = markPassItemSold(item1);
    assert.equal(soldItem.status, 'sold');

    // Filter available only
    const availableOnly = filterPassItems([soldItem, item2], { availableOnly: true });
    assert.equal(availableOnly.length, 1);
    assert.equal(availableOnly[0].itemCode, item2.itemCode);
  });
});
