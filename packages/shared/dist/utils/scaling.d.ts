/**
 * Responsive Scaling & Dimension Utilities for TroViet Mobile
 * Provides proportional scaling, screen classification, and safe-area calculations
 * across all smartphone form-factors (compact, standard, large, tablet, web).
 */
export declare const GUIDELINE_BASE_WIDTH = 375;
export declare const GUIDELINE_BASE_HEIGHT = 812;
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
export declare function getScreenClass(width: number): ScreenClass;
/**
 * Horizontal proportional scale
 */
export declare function scale(size: number, screenWidth: number, baseWidth?: number): number;
/**
 * Vertical proportional scale
 */
export declare function verticalScale(size: number, screenHeight: number, baseHeight?: number): number;
/**
 * Moderate scale with damping factor (default 0.5)
 * Prevents elements from growing or shrinking too aggressively on extreme screen sizes
 */
export declare function moderateScale(size: number, factor: number | undefined, screenWidth: number, baseWidth?: number): number;
/**
 * Moderate vertical scale with damping factor
 */
export declare function moderateVerticalScale(size: number, factor: number | undefined, screenHeight: number, baseHeight?: number): number;
/**
 * Responsive font size calculator with sensible minimum and maximum bounds
 */
export declare function responsiveFontSize(fontSize: number, screenWidth: number, minSize?: number, maxFactor?: number): number;
/**
 * Clamps maximum container width on tablets and wide displays
 * so phone-oriented layouts do not look stretched awkwardly
 */
export declare function getContentMaxWidth(screenWidth: number, tabletMaxWidth?: number): number;
/**
 * Calculates adaptive bottom navigation height incorporating safe area insets
 * Guarantees buttons and labels are never overlapped by home indicator or 3-button nav
 */
export declare function computeSafeBottomNavHeight(insetsBottom?: number): number;
/**
 * Computes safe header top padding ensuring status bar clearance
 * On Android, guarantees at least minimum status bar height (typically 24-32dp)
 */
export declare function computeSafeHeaderPaddingTop(insetsTop?: number, isAndroid?: boolean, androidFallback?: number): number;
/**
 * Resolves safe area insets with fallback guarantees
 */
export declare function resolveSafeAreaInsets(rawInsets?: SafeAreaInsetsInput | null, options?: {
    isAndroid?: boolean;
    androidDefaultTop?: number;
}): ResolvedSafeAreaInsets;
