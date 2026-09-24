/**
 * Trọ Việt - Formatters
 * Adhering to Vietnamese formatting standards (SPEC Section 9 & 20-vietnamese-ui)
 */

/**
 * Format integer VND currency.
 * Example: 2500000 -> "2.500.000 ₫"
 */
export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Chưa cung cấp';
  }
  // Ensure integer
  const intAmount = Math.round(amount);
  const formattedNumber = intAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedNumber} ₫`;
}

/**
 * Format square meters area.
 * Example: 25 -> "25 m²"
 * Example: 25.5 -> "25,5 m²"
 */
export function formatArea(squareMeters: number | null | undefined): string {
  if (squareMeters === null || squareMeters === undefined || isNaN(squareMeters)) {
    return 'Chưa rõ diện tích';
  }
  const formatted = squareMeters.toString().replace('.', ',');
  return `${formatted} m²`;
}

/**
 * Format distance in kilometers.
 * Example: 2.5 -> "2,5 km"
 * Example: 0.8 -> "800 m"
 */
export function formatDistance(kilometers: number | null | undefined): string {
  if (kilometers === null || kilometers === undefined || isNaN(kilometers)) {
    return '';
  }
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)} m`;
  }
  const rounded = Math.round(kilometers * 10) / 10;
  return `${rounded.toString().replace('.', ',')} km`;
}

/**
 * Unaccent Vietnamese text for search normalization.
 * Example: "Hải Châu" -> "hai chau"
 */
export function normalizeVietnameseText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

/**
 * Format date in Vietnam timezone (GMT+7)
 */
export function formatVietnameseDate(dateInput: Date | string | number): string {
  const date = typeof dateInput === 'string' || typeof dateInput === 'number' 
    ? new Date(dateInput) 
    : dateInput;
    
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(date);
}
