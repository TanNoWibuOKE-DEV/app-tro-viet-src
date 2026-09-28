/**
 * Campus Community Hub Engine (Phase 13: Student Ecosystem)
 * Grounded campus locations in Da Nang, Hanoi, and Ho Chi Minh City.
 */

import { calculateHaversineDistance } from '../geo/distance.js';

export interface CampusProfile {
  id: string;
  code: string;
  name: string;
  shortName: string;
  cityCode: 'danang' | 'hanoi' | 'hcm';
  address: string;
  latitude: number;
  longitude: number;
  popularWards: string[];
  averageStudentRent: number; // Integer VND
  studentTips: string[];
}

export const CAMPUS_PROFILES: CampusProfile[] = [
  // Đà Nẵng
  {
    id: 'campus-dut',
    code: 'DUT_DANANG',
    name: 'Trường Đại học Bách Khoa - Đại học Đà Nẵng',
    shortName: 'ĐH Bách Khoa ĐN',
    cityCode: 'danang',
    address: '54 Nguyễn Lương Bằng, Hòa Khánh Bắc, Liên Chiểu, Đà Nẵng',
    latitude: 16.0748,
    longitude: 108.1498,
    popularWards: ['hoa-khanh-bac', 'hoa-khanh-nam', 'hoa-minh'],
    averageStudentRent: 1800000,
    studentTips: [
      'Nên chọn trọ khu vực đường Ngô Thì Nhậm hoặc Tôn Đức Thắng để đi bộ đến giảng đường.',
      'Mùa mưa lưu ý hỏi kỹ chủ trọ về ngập lụt tại các hẻm đường Mẹ Suốt.',
      'Chợ Hòa Khánh và chợ đêm sinh viên ngay gần trường, chi phí ăn uống rất rẻ.',
    ],
  },
  {
    id: 'campus-due',
    code: 'DUE_DANANG',
    name: 'Trường Đại học Kinh Tế - Đại học Đà Nẵng',
    shortName: 'ĐH Kinh Tế ĐN',
    cityCode: 'danang',
    address: '71 Ngũ Hành Sơn, Bắc Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
    latitude: 16.0505,
    longitude: 108.2415,
    popularWards: ['bac-my-an', 'my-an', 'an-hai-tay'],
    averageStudentRent: 2600000,
    studentTips: [
      'Gần bãi biển Mỹ Khê và khu phố Tây An Thượng, phòng ốc mới nhưng giá cao hơn mạn Liên Chiểu.',
      'Tìm trọ đường Châu Thị Vĩnh Tế hoặc Bà Huyện Thanh Quan có nhiều quán ăn sinh viên giá hợp lý.',
    ],
  },
  {
    id: 'campus-dtu',
    code: 'DTU_DANANG',
    name: 'Trường Đại học Duy Tân (Cơ sở Nguyễn Văn Linh & Hải Phòng)',
    shortName: 'ĐH Duy Tân',
    cityCode: 'danang',
    address: '254 Nguyễn Văn Linh & 182 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
    latitude: 16.0611,
    longitude: 108.2132,
    popularWards: ['thach-thang', 'hai-chau-1', 'hai-chau-2', 'chinh-gian'],
    averageStudentRent: 2800000,
    studentTips: [
      'Nằm ở trung tâm thành phố, phòng trọ thường là căn hộ mini hoặc nhà nguyên căn chia phòng.',
      'Nên ghép 2-3 bạn để chia tiền phòng và tiền điện nước tiết kiệm.',
    ],
  },
  // Hà Nội
  {
    id: 'campus-vnu-hn',
    code: 'VNU_HN_CAUGIAY',
    name: 'Đại học Quốc gia Hà Nội & ĐH Sư phạm Hà Nội',
    shortName: 'ĐHQG Hà Nội (Cầu Giấy)',
    cityCode: 'hanoi',
    address: '144 Xuân Thủy, Dịch Vọng Hậu, Cầu Giấy, Hà Nội',
    latitude: 21.0372,
    longitude: 105.7825,
    popularWards: ['dich-vong-hau', 'mai-dich', 'dich-vong'],
    averageStudentRent: 3200000,
    studentTips: [
      'Khu vực ngõ 175 và ngõ 233 Xuân Thủy, ngõ Chợ Nhà Xanh tập trung mật độ trọ sinh viên dày đặc.',
      'Lưu ý kiểm tra hệ thống PCCC và thang thoát hiểm vì ngõ Cầu Giấy rất sâu và hẹp.',
    ],
  },
  {
    id: 'campus-hust',
    code: 'HUST_HANOI',
    name: 'Đại học Bách Khoa Hà Nội & ĐH Kinh tế Quốc dân',
    shortName: 'ĐH Bách Khoa HN',
    cityCode: 'hanoi',
    address: 'Số 1 Đại Cồ Việt, Bách Khoa, Hai Bà Trưng, Hà Nội',
    latitude: 21.0055,
    longitude: 105.8432,
    popularWards: ['bach-khoa', 'dong-tam', 'le-dai-hanh'],
    averageStudentRent: 2900000,
    studentTips: [
      'Khu Tam Giác Bách Khoa - Xây Dựng - Kinh Tế trọ đông vui, tiện đi bộ sang các trường.',
      'Giá điện nước thường tính theo giá kinh doanh nếu chủ nhà chưa đăng ký định mức tạm trú.',
    ],
  },
  // TP. Hồ Chí Minh
  {
    id: 'campus-vnu-hcm',
    code: 'VNU_HCM_THUDUC',
    name: 'Đại học Quốc gia TP. Hồ Chí Minh (Làng Đại học)',
    shortName: 'ĐHQG TP.HCM (Thủ Đức)',
    cityCode: 'hcm',
    address: 'Khu phố 6, Linh Trung, TP. Thủ Đức, TP. Hồ Chí Minh',
    latitude: 10.8702,
    longitude: 106.7782,
    popularWards: ['linh-trung', 'linh-chieu', 'dong-hoa'],
    averageStudentRent: 2100000,
    studentTips: [
      'Khu vực hồ Đá và chợ đêm Làng ĐH trọ rất rẻ, nhiều bạn chọn ở Ký túc xá khu A/B.',
      'Nếu thuê trọ ngoài, ưu tiên khu vực có xe buýt số 8, 19, 53 chạy qua để tiện đi học.',
    ],
  },
  {
    id: 'campus-hutech',
    code: 'HUTECH_HCM',
    name: 'Trường Đại học Công nghệ TP.HCM (HUTECH)',
    shortName: 'ĐH HUTECH (Bình Thạnh)',
    cityCode: 'hcm',
    address: '475A Điện Biên Phủ, Phường 25, Bình Thạnh, TP. Hồ Chí Minh',
    latitude: 10.8016,
    longitude: 106.7145,
    popularWards: ['phuong-25', 'phuong-26', 'phuong-27'],
    averageStudentRent: 3500000,
    studentTips: [
      'Gần ngã tư Hàng Xanh, giao thông đông đúc, phòng trọ đa số là studio hiện đại.',
      'Cần kiểm tra triều cường ngập nước trên các tuyến đường nhánh ven kênh rạch mùa mưa.',
    ],
  },
];

/**
 * Returns campuses located within a specific city.
 */
export function getCampusesByCity(cityCode: 'danang' | 'hanoi' | 'hcm'): CampusProfile[] {
  return CAMPUS_PROFILES.filter((c) => c.cityCode === cityCode);
}

/**
 * Finds the nearest university campus given geographical coordinates.
 */
export function findNearestCampus(
  latitude: number,
  longitude: number
): { campus: CampusProfile; distanceKm: number } | null {
  if (CAMPUS_PROFILES.length === 0) return null;

  let nearest = CAMPUS_PROFILES[0];
  let minDistance = calculateHaversineDistance(
    { latitude, longitude },
    { latitude: nearest.latitude, longitude: nearest.longitude }
  );

  for (let i = 1; i < CAMPUS_PROFILES.length; i++) {
    const candidate = CAMPUS_PROFILES[i];
    const dist = calculateHaversineDistance(
      { latitude, longitude },
      { latitude: candidate.latitude, longitude: candidate.longitude }
    );
    if (dist < minDistance) {
      minDistance = dist;
      nearest = candidate;
    }
  }

  return {
    campus: nearest,
    distanceKm: Math.round(minDistance * 10) / 10,
  };
}
