/**
 * Trọ Việt - Multi-City Administrative & Market Configuration
 * Strictly adheres to 2-tier administrative model (Province/City -> Ward/Commune)
 * under Vietnamese Law 91/2025/QH15 and SPEC Section 6.
 * Covers 3 core metropolitan markets: TP. Đà Nẵng, TP. Hà Nội, TP. Hồ Chí Minh.
 */

export interface WardReference {
  code: string;
  name: string;
  districtLegacy: string; // Historical district reference for search convenience
  studentHubs?: string[];
  approxCoords: { latitude: number; longitude: number };
}

export interface SupportedCity {
  code: string;
  name: string;
  shortName: string;
  defaultCoordinates: { latitude: number; longitude: number };
  popularWards: WardReference[];
}

export const SUPPORTED_CITIES: Record<string, SupportedCity> = {
  DANANG: {
    code: '48',
    name: 'Thành phố Đà Nẵng',
    shortName: 'Đà Nẵng',
    defaultCoordinates: { latitude: 16.0728, longitude: 108.2215 },
    popularWards: [
      {
        code: '48_HAICHAU1',
        name: 'Phường Hải Châu I',
        districtLegacy: 'Quận Hải Châu',
        studentHubs: ['ĐH Duy Tân', 'ĐH Kỹ thuật Y Dược'],
        approxCoords: { latitude: 16.0728, longitude: 108.2215 },
      },
      {
        code: '48_PHUOCMY',
        name: 'Phường Phước Mỹ',
        districtLegacy: 'Quận Sơn Trà',
        studentHubs: ['Cao đẳng Du lịch', 'Khu du lịch Biển Mỹ Khê'],
        approxCoords: { latitude: 16.062, longitude: 108.2435 },
      },
      {
        code: '48_HOAKHANHBAC',
        name: 'Phường Hòa Khánh Bắc',
        districtLegacy: 'Quận Liên Chiểu',
        studentHubs: ['ĐH Bách Khoa Đà Nẵng', 'ĐH Sư Phạm Đà Nẵng'],
        approxCoords: { latitude: 16.075, longitude: 108.153 },
      },
      {
        code: '48_HOACUONGNAM',
        name: 'Phường Hòa Cường Nam',
        districtLegacy: 'Quận Hải Châu',
        studentHubs: ['ĐH Ngoại Ngữ', 'ĐH Kiến Trúc', 'ĐH Đông Á'],
        approxCoords: { latitude: 16.035, longitude: 108.218 },
      },
    ],
  },
  HANOI: {
    code: '01',
    name: 'Thành phố Hà Nội',
    shortName: 'Hà Nội',
    defaultCoordinates: { latitude: 21.0285, longitude: 105.8542 },
    popularWards: [
      {
        code: '01_DICHVONGHAU',
        name: 'Phường Dịch Vọng Hậu',
        districtLegacy: 'Quận Cầu Giấy',
        studentHubs: ['ĐHQG Hà Nội', 'ĐH Sư Phạm Hà Nội', 'Học viện Báo chí & Tuyên truyền'],
        approxCoords: { latitude: 21.0368, longitude: 105.7874 },
      },
      {
        code: '01_LANGTHUONG',
        name: 'Phường Láng Thượng',
        districtLegacy: 'Quận Đống Đa',
        studentHubs: ['ĐH Ngoại Thương', 'Học viện Ngoại Giao', 'ĐH Luật Hà Nội'],
        approxCoords: { latitude: 21.0245, longitude: 105.8089 },
      },
      {
        code: '01_BACHKHOA',
        name: 'Phường Bách Khoa',
        districtLegacy: 'Quận Hai Bà Trưng',
        studentHubs: ['ĐH Bách Khoa Hà Nội', 'ĐH Kinh tế Quốc dân', 'ĐH Xây dựng'],
        approxCoords: { latitude: 21.0044, longitude: 105.8453 },
      },
      {
        code: '01_MYDINH1',
        name: 'Phường Mỹ Đình 1',
        districtLegacy: 'Quận Nam Từ Liêm',
        studentHubs: ['Khu liên hợp Thể thao Mỹ Đình', 'Khu văn phòng The Manor / Keangnam'],
        approxCoords: { latitude: 21.0189, longitude: 105.7728 },
      },
    ],
  },
  HCMC: {
    code: '79',
    name: 'Thành phố Hồ Chí Minh',
    shortName: 'TP. Hồ Chí Minh',
    defaultCoordinates: { latitude: 10.7769, longitude: 106.7009 },
    popularWards: [
      {
        code: '79_LINHTRUNG',
        name: 'Phường Linh Trung',
        districtLegacy: 'Thành phố Thủ Đức',
        studentHubs: ['ĐHQG TP.HCM (Làng Đại học)', 'ĐH Nông Lâm', 'ĐH Sư Phạm Kỹ Thuật'],
        approxCoords: { latitude: 10.8703, longitude: 106.7782 },
      },
      {
        code: '79_PHUONG25',
        name: 'Phường 25',
        districtLegacy: 'Quận Bình Thạnh',
        studentHubs: ['ĐH HUTECH', 'ĐH Ngoại Thương CS2', 'ĐH Giao Thông Vận Tải'],
        approxCoords: { latitude: 10.8016, longitude: 106.7138 },
      },
      {
        code: '79_BENNGHE',
        name: 'Phường Bến Nghé',
        districtLegacy: 'Quận 1',
        studentHubs: ['ĐH KHXH&NV TP.HCM', 'ĐH Y Dược TP.HCM', 'Phố đi bộ Nguyễn Huệ'],
        approxCoords: { latitude: 10.7797, longitude: 106.7027 },
      },
      {
        code: '79_TANHUNG',
        name: 'Phường Tân Hưng',
        districtLegacy: 'Quận 7',
        studentHubs: ['ĐH Tôn Đức Thắng', 'ĐH RMIT', 'Siêu thị Lotte Mart Q7'],
        approxCoords: { latitude: 10.7431, longitude: 106.7011 },
      },
    ],
  },
};

/**
 * Returns supported cities as an array for UI dropdowns and pickers.
 */
export function getSupportedCityList(): SupportedCity[] {
  return Object.values(SUPPORTED_CITIES);
}

/**
 * Finds a city by code ('48', '01', '79') or normalized name.
 */
export function findSupportedCity(query: string): SupportedCity | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();

  for (const city of Object.values(SUPPORTED_CITIES)) {
    if (city.code === q || city.shortName.toLowerCase() === q || city.name.toLowerCase() === q) {
      return city;
    }
  }

  if (q.includes('hà nội') || q.includes('ha noi')) return SUPPORTED_CITIES.HANOI;
  if (q.includes('hồ chí minh') || q.includes('ho chi minh') || q.includes('sài gòn') || q.includes('sai gon') || q.includes('hcm')) {
    return SUPPORTED_CITIES.HCMC;
  }
  if (q.includes('đà nẵng') || q.includes('da nang')) return SUPPORTED_CITIES.DANANG;

  return undefined;
}
