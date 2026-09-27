/**
 * Trọ Việt - Formatters
 * Adhering to Vietnamese formatting standards (SPEC Section 9 & 20-vietnamese-ui)
 */
/**
 * Format integer VND currency.
 * Example: 2500000 -> "2.500.000 ₫"
 */
export declare function formatVND(amount: number | null | undefined): string;
/**
 * Format square meters area.
 * Example: 25 -> "25 m²"
 * Example: 25.5 -> "25,5 m²"
 */
export declare function formatArea(squareMeters: number | null | undefined): string;
/**
 * Format distance in kilometers.
 * Example: 2.5 -> "2,5 km"
 * Example: 0.8 -> "800 m"
 */
export declare function formatDistance(kilometers: number | null | undefined): string;
/**
 * Unaccent Vietnamese text for search normalization.
 * Example: "Hải Châu" -> "hai chau"
 */
export declare function normalizeVietnameseText(str: string): string;
/**
 * Format date in Vietnam timezone (GMT+7)
 */
export declare function formatVietnameseDate(dateInput: Date | string | number): string;
