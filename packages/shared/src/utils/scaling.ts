/**
 * Responsive Scaling & Dimension Utilities for TroViet Mobile
 * Provides proportional scaling, screen classification, and safe-area calculations
 * across all smartphone form-factors (compact, standard, large, tablet, web).
 */

export const GUIDELINE_BASE_WIDTH = 375;
export const GUIDELINE_BASE_HEIGHT = 812;

export type ScreenClass = 'compact' | 'standard' | 'large' | 'tablet';

export interface SafeAreaInsetsInput {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface ResolvedSafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * Classifies screen width into form factor categories
 */
export function getScreenClass(width: number): ScreenClass {
  if (width < 360) return 'compact';
  if (width < 410) return 'standard';
  if (width < 600) return 'large';
  return 'tablet';
}

/**
 * Horizontal proportional scale
 */
export function scale(size: number, screenWidth: number, baseWidth: number = GUIDELINE_BASE_WIDTH): number {
  if (baseWidth <= 0 || screenWidth <= 0) return size;
  return Math.round((screenWidth / baseWidth) * size);
}

/**
 * Vertical proportional scale
 */
export function verticalScale(size: number, screenHeight: number, baseHeight: number = GUIDELINE_BASE_HEIGHT): number {
  if (baseHeight <= 0 || screenHeight <= 0) return size;
  return Math.round((screenHeight / baseHeight) * size);
}

/**
 * Moderate scale with damping factor (default 0.5)
 * Prevents elements from growing or shrinking too aggressively on extreme screen sizes
 */
export function moderateScale(
  size: number,
  factor: number = 0.5,
  screenWidth: number,
  baseWidth: number = GUIDELINE_BASE_WIDTH
): number {
  if (baseWidth <= 0 || screenWidth <= 0) return size;
  const rawScaled = (screenWidth / baseWidth) * size;
  return Math.round(size + (rawScaled - size) * factor);
}

/**
 * Moderate vertical scale with damping factor
 */
export function moderateVerticalScale(
  size: number,
  factor: number = 0.5,
  screenHeight: number,
  baseHeight: number = GUIDELINE_BASE_HEIGHT
): number {
  if (baseHeight <= 0 || screenHeight <= 0) return size;
  const rawScaled = (screenHeight / baseHeight) * size;
  return Math.round(size + (rawScaled - size) * factor);
}

/**
 * Responsive font size calculator with sensible minimum and maximum bounds
 */
export function responsiveFontSize(
  fontSize: number,
  screenWidth: number,
  minSize: number = 10,
  maxFactor: number = 1.35
): number {
  const scaled = moderateScale(fontSize, 0.4, screenWidth);
  const minAllowed = Math.min(fontSize, minSize);
  const maxAllowed = Math.round(fontSize * maxFactor);
  return Math.max(minAllowed, Math.min(scaled, maxAllowed));
}

/**
 * Clamps maximum container width on tablets and wide displays
 * so phone-oriented layouts do not look stretched awkwardly
 */
export function getContentMaxWidth(screenWidth: number, tabletMaxWidth: number = 720): number {
  return screenWidth >= 600 ? tabletMaxWidth : screenWidth;
}

/**
 * Calculates adaptive bottom navigation height incorporating safe area insets
 * Guarantees buttons and labels are never overlapped by home indicator or 3-button nav
 */
export function computeSafeBottomNavHeight(insetsBottom: number = 0): number {
  const baseNavHeight = 56;
  const safeBottom = Math.max(0, insetsBottom);
  return baseNavHeight + safeBottom;
}

/**
 * Computes safe header top padding ensuring status bar clearance
 * On Android, guarantees at least minimum status bar height (typically 24-32dp)
 */
export function computeSafeHeaderPaddingTop(
  insetsTop: number = 0,
  isAndroid: boolean = false,
  androidFallback: number = 24
): number {
  if (isAndroid) {
    return Math.max(insetsTop, androidFallback);
  }
  return Math.max(0, insetsTop);
}

/**
 * Resolves safe area insets with fallback guarantees
 */
export function resolveSafeAreaInsets(
  rawInsets?: SafeAreaInsetsInput | null,
  options?: { isAndroid?: boolean; androidDefaultTop?: number }
): ResolvedSafeAreaInsets {
  const top = rawInsets?.top ?? 0;
  const bottom = rawInsets?.bottom ?? 0;
  const left = rawInsets?.left ?? 0;
  const right = rawInsets?.right ?? 0;

  const resolvedTop = options?.isAndroid ? Math.max(top, options.androidDefaultTop ?? 24) : top;

  return {
    top: resolvedTop,
    bottom: Math.max(0, bottom),
    left: Math.max(0, left),
    right: Math.max(0, right),
  };
}
