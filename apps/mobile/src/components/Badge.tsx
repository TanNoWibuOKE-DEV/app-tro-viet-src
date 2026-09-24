import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { VerificationLevel } from '@troviet/shared';

interface BadgeProps {
  level: VerificationLevel;
}

export const Badge: React.FC<BadgeProps> = ({ level }) => {
  const { colors } = useTheme();

  if (level === 'none') {
    return null;
  }

  let label = '';
  let bgColor = colors.badgeL1;
  let textColor = colors.badgeL1Text;

  switch (level) {
    case 'L1':
      label = '✓ SĐT đã xác thực';
      bgColor = colors.badgeL1;
      textColor = colors.badgeL1Text;
      break;
    case 'L2':
      label = '✓ Danh tính đã xác minh';
      bgColor = colors.badgeL2;
      textColor = colors.badgeL2Text;
      break;
    case 'L3':
      label = '★ Đã kiểm tra thực địa & quyền thuê';
      bgColor = colors.primary;
      textColor = '#FFFFFF';
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
