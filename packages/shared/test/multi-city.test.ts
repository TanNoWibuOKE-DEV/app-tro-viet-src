import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SUPPORTED_CITIES,
  getSupportedCityList,
  findSupportedCity,
} from '../src/market/multi-city.js';
import { getWardAreaInsight, getAllAreaInsights } from '../src/insights/market.js';

describe('Phase 9 Multi-City Expansion & Area Market Insights', () => {
  it('provides configuration for 3 core metropolitan markets', () => {
    const list = getSupportedCityList();
    assert.equal(list.length, 3);

    const codes = list.map((c) => c.code);
    assert.ok(codes.includes('48')); // Đà Nẵng
    assert.ok(codes.includes('01')); // Hà Nội
    assert.ok(codes.includes('79')); // TP. Hồ Chí Minh
  });

  it('fuzzy matches city by names and aliases', () => {
    assert.equal(findSupportedCity('Hà Nội')?.code, '01');
    assert.equal(findSupportedCity('ha noi')?.code, '01');
    assert.equal(findSupportedCity('Sài Gòn')?.code, '79');
    assert.equal(findSupportedCity('TP. Hồ Chí Minh')?.code, '79');
    assert.equal(findSupportedCity('da nang')?.code, '48');
    assert.equal(findSupportedCity('48')?.code, '48');
    assert.equal(findSupportedCity('Unknown City'), undefined);
  });

  it('retrieves accurate grounded student-hub ward data for Hanoi', () => {
    const cauGiay = getWardAreaInsight('01_DICHVONGHAU');
    assert.equal(cauGiay.wardName, 'Phường Dịch Vọng Hậu');
    assert.ok(cauGiay.districtLegacyName.includes('Cầu Giấy'));
    assert.equal(cauGiay.roomAvgRent, 3500000);
    assert.equal(cauGiay.priceHistory.length, 6);
    assert.ok(cauGiay.highlights.some((h) => h.includes('ĐHQG')));

    const dongDa = getWardAreaInsight('01_LANGTHUONG');
    assert.equal(dongDa.wardName, 'Phường Láng Thượng');
    assert.ok(dongDa.highlights.some((h) => h.includes('Ngoại Thương')));
  });

  it('retrieves accurate grounded ward data for TP. Hồ Chí Minh', () => {
    const thuDuc = getWardAreaInsight('79_LINHTRUNG');
    assert.equal(thuDuc.wardName, 'Phường Linh Trung');
    assert.ok(thuDuc.districtLegacyName.includes('Thủ Đức'));
    assert.equal(thuDuc.roomAvgRent, 2200000);
    assert.ok(thuDuc.highlights.some((h) => h.includes('Làng Đại học')));

    const binhThanh = getWardAreaInsight('79_PHUONG25');
    assert.equal(binhThanh.wardName, 'Phường 25');
    assert.ok(binhThanh.highlights.some((h) => h.includes('HUTECH')));
  });

  it('filters all area insights by specific city code', () => {
    const all = getAllAreaInsights();
    assert.ok(all.length >= 10); // 4 Danang + 3 Hanoi + 3 HCMC

    const hanoiOnly = getAllAreaInsights('01');
    assert.ok(hanoiOnly.length >= 3);
    assert.ok(hanoiOnly.every((w) => w.wardCode.startsWith('01_')));

    const hcmcOnly = getAllAreaInsights('79');
    assert.ok(hcmcOnly.length >= 3);
    assert.ok(hcmcOnly.every((w) => w.wardCode.startsWith('79_')));

    const danangOnly = getAllAreaInsights('48');
    assert.ok(danangOnly.length >= 4);
    assert.ok(danangOnly.every((w) => w.wardCode.startsWith('48_')));
  });
});
