import { Amenity } from '../types/index.js';

export const STANDARD_AMENITIES: Amenity[] = [
  { id: '1', code: 'air_conditioner', name: 'Máy lạnh', category: 'room_features', icon: 'snow', sortOrder: 1 },
  { id: '2', code: 'private_bathroom', name: 'WC riêng', category: 'room_features', icon: 'water', sortOrder: 2 },
  { id: '3', code: 'water_heater', name: 'Bình nóng lạnh', category: 'room_features', icon: 'thermometer', sortOrder: 3 },
  { id: '4', code: 'mezzanine', name: 'Gác lửng', category: 'room_features', icon: 'layers', sortOrder: 4 },
  { id: '5', code: 'refrigerator', name: 'Tủ lạnh', category: 'room_features', icon: 'box', sortOrder: 5 },
  { id: '6', code: 'washing_machine', name: 'Máy giặt', category: 'building', icon: 'disc', sortOrder: 6 },
  { id: '7', code: 'kitchen_private', name: 'Bếp riêng', category: 'room_features', icon: 'utensils', sortOrder: 7 },
  { id: '8', code: 'balcony', name: 'Ban công / Thoáng', category: 'room_features', icon: 'sun', sortOrder: 8 },
  { id: '9', code: 'free_hours', name: 'Giờ tự do', category: 'building', icon: 'clock', sortOrder: 9 },
  { id: '10', code: 'security_fingerprint', name: 'Khóa vân tay', category: 'building', icon: 'shield', sortOrder: 10 },
  { id: '11', code: 'elevator', name: 'Thang máy', category: 'building', icon: 'arrow-up', sortOrder: 11 },
  { id: '12', code: 'parking_lot', name: 'Chỗ để xe', category: 'building', icon: 'key', sortOrder: 12 },
];
