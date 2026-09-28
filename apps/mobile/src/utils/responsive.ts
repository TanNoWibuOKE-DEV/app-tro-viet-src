import { useWindowDimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  ScreenClass,
} from '@troviet/shared';

export interface ResponsiveLayout {
  width: number;
  height: number;
  screenClass: ScreenClass;
  isCompact: boolean;
  isStandard: boolean;
  isLarge: boolean;
  isTablet: boolean;
  contentMaxWidth: number;
  insets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  headerPaddingTop: number;
  bottomNavHeight: number;
  scale: (size: number) => number;
  verticalScale: (size: number) => number;
  moderateScale: (size: number, factor?: number) => number;
  fontScale: (fontSize: number) => number;
}

/**
 * Hook providing comprehensive responsive layout metrics and safe area handling
 * for all smartphone models (iPhone SE, Notch, Dynamic Island, Android hole-punch & gesture bar, tablets)
 */
export function useResponsiveLayout(): ResponsiveLayout {
  const { width, height } = useWindowDimensions();
  const rawInsets = useSafeAreaInsets();

  const isAndroid = Platform.OS === 'android';
  const androidStatusHeight = StatusBar.currentHeight ?? 24;

  const headerPaddingTop = computeSafeHeaderPaddingTop(rawInsets.top, isAndroid, androidStatusHeight);
  const bottomNavHeight = computeSafeBottomNavHeight(rawInsets.bottom);
  const screenClass = getScreenClass(width);
  const contentMaxWidth = getContentMaxWidth(width, 768);

  return {
    width,
    height,
    screenClass,
    isCompact: screenClass === 'compact',
    isStandard: screenClass === 'standard',
    isLarge: screenClass === 'large',
    isTablet: screenClass === 'tablet',
    contentMaxWidth,
    insets: {
      top: headerPaddingTop,
      bottom: Math.max(rawInsets.bottom, 0),
      left: Math.max(rawInsets.left, 0),
      right: Math.max(rawInsets.right, 0),
    },
    headerPaddingTop,
    bottomNavHeight,
    scale: (size: number) => scale(size, width),
    verticalScale: (size: number) => verticalScale(size, height),
    moderateScale: (size: number, factor: number = 0.5) => moderateScale(size, factor, width),
    fontScale: (fontSize: number) => responsiveFontSize(fontSize, width),
  };
}
