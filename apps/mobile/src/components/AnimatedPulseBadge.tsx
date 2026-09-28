import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface AnimatedPulseBadgeProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pulseColor?: string;
  enabled?: boolean;
}

export const AnimatedPulseBadge: React.FC<AnimatedPulseBadgeProps> = ({
  children,
  style,
  pulseColor = 'rgba(16, 185, 129, 0.4)',
  enabled = true,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!enabled) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();

    return () => loop.stop();
  }, [enabled, pulseAnim]);

  return (
    <Animated.View
      style={[
        style,
        enabled && {
          transform: [{ scale: pulseAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};
