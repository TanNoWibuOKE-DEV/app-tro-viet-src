"use strict";
/**
 * Responsive Scaling & Dimension Utilities for TroViet Mobile
 * Provides proportional scaling, screen classification, and safe-area calculations
 * across all smartphone form-factors (compact, standard, large, tablet, web).
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUIDELINE_BASE_HEIGHT = exports.GUIDELINE_BASE_WIDTH = void 0;
exports.getScreenClass = getScreenClass;
exports.scale = scale;
exports.verticalScale = verticalScale;
exports.moderateScale = moderateScale;
exports.moderateVerticalScale = moderateVerticalScale;
exports.responsiveFontSize = responsiveFontSize;
exports.getContentMaxWidth = getContentMaxWidth;
exports.computeSafeBottomNavHeight = computeSafeBottomNavHeight;
exports.computeSafeHeaderPaddingTop = computeSafeHeaderPaddingTop;
exports.resolveSafeAreaInsets = resolveSafeAreaInsets;
exports.GUIDELINE_BASE_WIDTH = 375;
exports.GUIDELINE_BASE_HEIGHT = 812;
/**
 * Classifies screen width into form factor categories
 */
function getScreenClass(width) {
    if (width < 360)
        return 'compact';
    if (width < 410)
        return 'standard';
    if (width < 600)
        return 'large';
    return 'tablet';
}
/**
 * Horizontal proportional scale
 */
function scale(size, screenWidth, baseWidth = exports.GUIDELINE_BASE_WIDTH) {
    if (baseWidth <= 0 || screenWidth <= 0)
        return size;
    return Math.round((screenWidth / baseWidth) * size);
}
/**
 * Vertical proportional scale
 */
function verticalScale(size, screenHeight, baseHeight = exports.GUIDELINE_BASE_HEIGHT) {
    if (baseHeight <= 0 || screenHeight <= 0)
        return size;
    return Math.round((screenHeight / baseHeight) * size);
}
/**
 * Moderate scale with damping factor (default 0.5)
 * Prevents elements from growing or shrinking too aggressively on extreme screen sizes
 */
function moderateScale(size, factor = 0.5, screenWidth, baseWidth = exports.GUIDELINE_BASE_WIDTH) {
    if (baseWidth <= 0 || screenWidth <= 0)
        return size;
    const rawScaled = (screenWidth / baseWidth) * size;
    return Math.round(size + (rawScaled - size) * factor);
}
/**
 * Moderate vertical scale with damping factor
 */
function moderateVerticalScale(size, factor = 0.5, screenHeight, baseHeight = exports.GUIDELINE_BASE_HEIGHT) {
    if (baseHeight <= 0 || screenHeight <= 0)
        return size;
    const rawScaled = (screenHeight / baseHeight) * size;
    return Math.round(size + (rawScaled - size) * factor);
}
/**
 * Responsive font size calculator with sensible minimum and maximum bounds
 */
function responsiveFontSize(fontSize, screenWidth, minSize = 10, maxFactor = 1.35) {
    const scaled = moderateScale(fontSize, 0.4, screenWidth);
    const minAllowed = Math.min(fontSize, minSize);
    const maxAllowed = Math.round(fontSize * maxFactor);
    return Math.max(minAllowed, Math.min(scaled, maxAllowed));
}
/**
 * Clamps maximum container width on tablets and wide displays
 * so phone-oriented layouts do not look stretched awkwardly
 */
function getContentMaxWidth(screenWidth, tabletMaxWidth = 720) {
    return screenWidth >= 600 ? tabletMaxWidth : screenWidth;
}
/**
 * Calculates adaptive bottom navigation height incorporating safe area insets
 * Guarantees buttons and labels are never overlapped by home indicator or 3-button nav
 */
function computeSafeBottomNavHeight(insetsBottom = 0) {
    const baseNavHeight = 56;
    const safeBottom = Math.max(0, insetsBottom);
    return baseNavHeight + safeBottom;
}
/**
 * Computes safe header top padding ensuring status bar clearance
 * On Android, guarantees at least minimum status bar height (typically 24-32dp)
 */
function computeSafeHeaderPaddingTop(insetsTop = 0, isAndroid = false, androidFallback = 24) {
    if (isAndroid) {
        return Math.max(insetsTop, androidFallback);
    }
    return Math.max(0, insetsTop);
}
/**
 * Resolves safe area insets with fallback guarantees
 */
function resolveSafeAreaInsets(rawInsets, options) {
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
