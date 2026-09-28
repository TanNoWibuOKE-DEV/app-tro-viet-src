import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  getScreenClass,
  scale,
  verticalScale,
  moderateScale,
  moderateVerticalScale,
  responsiveFontSize,
  getContentMaxWidth,
  computeSafeBottomNavHeight,
  computeSafeHeaderPaddingTop,
  resolveSafeAreaInsets,
} from '../src/utils/scaling.js';

describe('Responsive Scaling & Dimension Utilities (/fix phone proportions)', () => {
  describe('getScreenClass', () => {
    it('classifies compact screens (< 360px)', () => {
      assert.equal(getScreenClass(320), 'compact'); // iPhone SE 1st gen
      assert.equal(getScreenClass(359), 'compact');
    });

    it('classifies standard screens (360px - 409px)', () => {
      assert.equal(getScreenClass(360), 'standard'); // Standard small Android
      assert.equal(getScreenClass(375), 'standard'); // iPhone X/11 Pro/12 Mini
      assert.equal(getScreenClass(390), 'standard'); // iPhone 12/13/14
      assert.equal(getScreenClass(409), 'standard');
    });

    it('classifies large screens (410px - 599px)', () => {
      assert.equal(getScreenClass(412), 'large'); // Galaxy S20/S21/Pixel
      assert.equal(getScreenClass(428), 'large'); // iPhone 13/14 Pro Max
      assert.equal(getScreenClass(430), 'large'); // iPhone 15/16 Pro Max
    });

    it('classifies tablets and wide web screens (>= 600px)', () => {
      assert.equal(getScreenClass(600), 'tablet');
      assert.equal(getScreenClass(768), 'tablet'); // iPad Mini/Air
      assert.equal(getScreenClass(1024), 'tablet'); // iPad Pro / Desktop Web
    });
  });

  describe('scale & moderateScale', () => {
    it('scales proportionally horizontally', () => {
      // Base width = 375. If screen = 375, size 20 remains 20
      assert.equal(scale(20, 375), 20);
      // On screen = 750 (2x), size 20 becomes 40
      assert.equal(scale(20, 750), 40);
      // On screen = 320, size 20 becomes 17 (rounded)
      assert.equal(scale(20, 320), 17);
    });

    it('dampens extreme scaling via moderateScale', () => {
      // On screen = 750, raw scale is 40. With factor = 0.5: 20 + (40 - 20) * 0.5 = 30
      assert.equal(moderateScale(20, 0.5, 750), 30);
      // On standard screen (375), remains 20
      assert.equal(moderateScale(20, 0.5, 375), 20);
    });

    it('handles zero or negative screen dimensions gracefully without crashing', () => {
      assert.equal(scale(16, 0), 16);
      assert.equal(verticalScale(16, -10), 16);
      assert.equal(moderateScale(16, 0.5, 0), 16);
    });
  });

  describe('verticalScale & moderateVerticalScale', () => {
    it('scales vertically against 812 base height', () => {
      assert.equal(verticalScale(100, 812), 100);
      assert.equal(verticalScale(100, 1624), 200);
      assert.equal(moderateVerticalScale(100, 0.5, 1624), 150);
    });
  });

  describe('responsiveFontSize', () => {
    it('scales font size with bounds', () => {
      // Standard screen: font size stays equal
      assert.equal(responsiveFontSize(16, 375), 16);

      // Small screen: should scale down slightly, not below minimum (default 10)
      const smallFont = responsiveFontSize(12, 320);
      assert.equal(smallFont >= 10, true);
      assert.equal(smallFont <= 12, true);

      // Large screen: should not exceed maxFactor (1.35x)
      const largeFont = responsiveFontSize(16, 1200);
      assert.equal(largeFont <= Math.round(16 * 1.35), true);
    });
  });

  describe('getContentMaxWidth', () => {
    it('returns full width for phones', () => {
      assert.equal(getContentMaxWidth(360), 360);
      assert.equal(getContentMaxWidth(430), 430);
    });

    it('clamps width to maximum on tablets and web', () => {
      assert.equal(getContentMaxWidth(768, 720), 720);
      assert.equal(getContentMaxWidth(1200, 720), 720);
    });
  });

  describe('Safe Area Calculations for All Phone OS & Models', () => {
    it('computes safe bottom navigation height including home indicator insets', () => {
      // Android / old iPhone without bottom inset
      assert.equal(computeSafeBottomNavHeight(0), 56);

      // iPhone with home indicator (inset bottom = 34)
      assert.equal(computeSafeBottomNavHeight(34), 90);

      // Android with gesture navigation (inset bottom = 24)
      assert.equal(computeSafeBottomNavHeight(24), 80);
    });

    it('computes safe header top padding with Android fallback', () => {
      // iOS: uses exact inset
      assert.equal(computeSafeHeaderPaddingTop(47, false), 47);
      assert.equal(computeSafeHeaderPaddingTop(0, false), 0);

      // Android: guarantees at least fallback status bar height (24dp)
      assert.equal(computeSafeHeaderPaddingTop(0, true, 24), 24);
      assert.equal(computeSafeHeaderPaddingTop(32, true, 24), 32);
    });

    it('resolves safe area insets object cleanly', () => {
      const iosInsets = resolveSafeAreaInsets({ top: 48, bottom: 34, left: 0, right: 0 }, { isAndroid: false });
      assert.deepEqual(iosInsets, { top: 48, bottom: 34, left: 0, right: 0 });

      const androidNullInsets = resolveSafeAreaInsets(null, { isAndroid: true, androidDefaultTop: 28 });
      assert.deepEqual(androidNullInsets, { top: 28, bottom: 0, left: 0, right: 0 });
    });
  });
});
