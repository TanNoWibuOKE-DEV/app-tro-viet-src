/**
 * Trọ Việt - AI Natural Language Search Parser (Disciplined AI)
 * Adheres strictly to SPEC Section 7 & .agents/rules/30-ai-features.md:
 * - Converts raw Vietnamese queries into structured SearchFilterParams (JSON validated).
 * - Handles unaccented, abbreviation, and colloquial expressions of Vietnamese students & workers.
 * - Always generates a friendly human-readable explanation of understood criteria.
 * - Never hallucinates criteria outside system-supported schema.
 */

import { SearchFilterParams, PropertyType } from '../types/index.js';
import { normalizeVietnameseText } from '../formatters/index.js';

export interface AISearchDetectedCriterion {
  type: 'budget' | 'property_type' | 'ward_or_landmark' | 'amenities';
  label: string;
  value: unknown;
}

export interface AISearchParseResult {
  parsedFilter: SearchFilterParams;
  explanation: string;
  detectedCriteria: AISearchDetectedCriterion[];
  confidence: number;
}

/**
 * Parses a natural language Vietnamese search query into structured search filter parameters.
 */
export function parseNaturalLanguageSearch(rawQuery: string): AISearchParseResult {
  const norm = normalizeVietnameseText(rawQuery).trim();
  const criteria: AISearchDetectedCriterion[] = [];
  const explanationParts: string[] = [];

  let minRent: number | undefined;
  let maxRent: number | undefined;
  let propertyType: PropertyType | undefined;
  let wardCode: string | undefined;
  const amenityCodes: string[] = [];

  // 1. Budget extraction
  // Handles "duoi 2tr5", "duoi 3tr", "duoi 3 trieu", "< 3tr"
  const underTrMatch = norm.match(/(?:duoi|<|nho hon|toi da)\s*(\d+)tr(\d+)/);
  if (underTrMatch) {
    const rawVal = parseFloat(`${underTrMatch[1]}.${underTrMatch[2]}`);
    maxRent = rawVal * 1000000;
    criteria.push({
      type: 'budget',
      label: `Giá dưới ${(maxRent / 1000000).toLocaleString('vi-VN')} triệu`,
      value: maxRent,
    });
    explanationParts.push(`Dưới ${(maxRent / 1000000).toLocaleString('vi-VN')} triệu ₫`);
  } else {
    const underMatch = norm.match(/(?:duoi|<|nho hon|toi da)\s*(\d+(?:[.,]\d+)?)\s*(?:tr|trieu|m|k)?/);
    if (underMatch) {
      const rawVal = parseFloat(underMatch[1].replace(',', '.'));
      maxRent = rawVal < 100 ? rawVal * 1000000 : rawVal;
      criteria.push({
        type: 'budget',
        label: `Giá dưới ${(maxRent / 1000000).toLocaleString('vi-VN')} triệu`,
        value: maxRent,
      });
      explanationParts.push(`Dưới ${(maxRent / 1000000).toLocaleString('vi-VN')} triệu ₫`);
    }
  }

  const rangeMatch = norm.match(/(?:tu)\s*(\d+(?:[.,]\d+)?)\s*(?:den|-)\s*(\d+(?:[.,]\d+)?)\s*(?:tr|trieu)?/);
  if (rangeMatch) {
    const minVal = parseFloat(rangeMatch[1].replace(',', '.'));
    const maxVal = parseFloat(rangeMatch[2].replace(',', '.'));
    minRent = minVal < 100 ? minVal * 1000000 : minVal;
    maxRent = maxVal < 100 ? maxVal * 1000000 : maxVal;
    criteria.push({
      type: 'budget',
      label: `Từ ${(minRent / 1000000)} đến ${(maxRent / 1000000)} triệu`,
      value: { minRent, maxRent },
    });
    explanationParts.push(`Từ ${(minRent / 1000000)} - ${(maxRent / 1000000)} triệu ₫`);
  }

  // 2. Property Type (nha nguyen can must precede can ho)
  if (norm.includes('nha nguyen can') || norm.includes('thue nha')) {
    propertyType = 'house';
    criteria.push({ type: 'property_type', label: 'Nhà nguyên căn', value: 'house' });
    explanationParts.push('Nhà nguyên căn');
  } else if (norm.includes('o ghep') || norm.includes('tim ban o')) {
    propertyType = 'shared';
    criteria.push({ type: 'property_type', label: 'Ở ghép', value: 'shared' });
    explanationParts.push('Ở ghép');
  } else if (/\bcan ho\b/.test(norm) || norm.includes('chung cu mini') || norm.includes('chmn')) {
    propertyType = 'apartment';
    criteria.push({ type: 'property_type', label: 'Căn hộ mini', value: 'apartment' });
    explanationParts.push('Căn hộ mini');
  } else if (norm.includes('phong tro') || norm.includes('nha tro') || norm.includes('phong')) {
    propertyType = 'room';
    criteria.push({ type: 'property_type', label: 'Phòng trọ', value: 'room' });
    explanationParts.push('Phòng trọ');
  }

  // 3. Landmarks and Wards (Da Nang)
  if (norm.includes('duy tan') || norm.includes('dtu') || norm.includes('hai chau')) {
    wardCode = '48_HAICHAU1';
    criteria.push({ type: 'ward_or_landmark', label: 'Khu vực ĐH Duy Tân / Hải Châu', value: '48_HAICHAU1' });
    explanationParts.push('Khu vực ĐH Duy Tân (Hải Châu)');
  } else if (norm.includes('bach khoa') || norm.includes('dut') || norm.includes('hoa khanh')) {
    wardCode = '48_HOAKHANHBAC';
    criteria.push({ type: 'ward_or_landmark', label: 'Khu vực ĐH Bách Khoa / Hòa Khánh', value: '48_HOAKHANHBAC' });
    explanationParts.push('Khu vực ĐH Bách Khoa (Hòa Khánh)');
  } else if (norm.includes('my khe') || norm.includes('phuoc my') || norm.includes('gan bien')) {
    wardCode = '48_PHUOCMY';
    criteria.push({ type: 'ward_or_landmark', label: 'Khu vực biển Mỹ Khê (Phước Mỹ)', value: '48_PHUOCMY' });
    explanationParts.push('Khu vực biển Mỹ Khê (Phước Mỹ)');
  } else if (norm.includes('hoa cuong')) {
    wardCode = '48_HOACUONGNAM';
    criteria.push({ type: 'ward_or_landmark', label: 'Phường Hòa Cường Nam', value: '48_HOACUONGNAM' });
    explanationParts.push('Hòa Cường Nam');
  }

  // 4. Amenities Recognition
  const amenityPatterns: Array<{ keywords: string[]; code: string; label: string }> = [
    { keywords: ['may lanh', 'dieu hoa', 'ac'], code: 'air_conditioner', label: 'Máy lạnh' },
    { keywords: ['wc rieng', 'khep kin', 've sinh rieng', 'toilet rieng'], code: 'private_bathroom', label: 'WC riêng' },
    { keywords: ['gac lung', 'gac xep', 'co gac'], code: 'mezzanine', label: 'Gác lửng' },
    { keywords: ['may giat'], code: 'washing_machine', label: 'Máy giặt' },
    { keywords: ['tu lanh'], code: 'refrigerator', label: 'Tủ lạnh' },
    { keywords: ['ban cong'], code: 'balcony', label: 'Ban công' },
    { keywords: ['nong lanh', 'binh nong lanh'], code: 'water_heater', label: 'Nóng lạnh' },
    { keywords: ['gio tu do', 'gio giac tu do', 'khong chung chu', 'tu do'], code: 'free_hours', label: 'Giờ tự do' },
    { keywords: ['thang may'], code: 'elevator', label: 'Thang máy' },
    { keywords: ['bep rieng', 'nau an'], code: 'kitchen', label: 'Bếp nấu ăn' },
  ];

  for (const item of amenityPatterns) {
    if (item.keywords.some((kw) => norm.includes(kw))) {
      amenityCodes.push(item.code);
      criteria.push({ type: 'amenities', label: item.label, value: item.code });
      explanationParts.push(item.label);
    }
  }

  // Form structured filter
  const parsedFilter: SearchFilterParams = {
    query: rawQuery,
    minRent,
    maxRent,
    propertyType,
    wardCode,
    amenityCodes: amenityCodes.length > 0 ? amenityCodes : undefined,
    sortBy: 'newest',
  };

  const explanation =
    explanationParts.length > 0
      ? `Đã hiểu: ${explanationParts.join(' • ')}`
      : `Đã hiểu: Tìm kiếm từ khóa "${rawQuery}"`;

  const confidence = criteria.length > 0 ? Math.min(1, 0.4 + criteria.length * 0.2) : 0.3;

  return {
    parsedFilter,
    explanation,
    detectedCriteria: criteria,
    confidence,
  };
}
