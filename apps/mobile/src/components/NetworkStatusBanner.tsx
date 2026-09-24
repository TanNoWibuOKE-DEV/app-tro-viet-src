import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';

interface NetworkStatusBannerProps {
  onRetry?: () => void;
}

export const NetworkStatusBanner: React.FC<NetworkStatusBannerProps> = ({ onRetry }) => {
  const { colors, isDark } = useTheme();
  const { isOnline, setIsOnline } = useApp();

  if (isOnline) return null;

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? '#3d2610' : '#fff4e6',
          borderBottomColor: '#ffa94d',
        },
      ]}
    >
      <Text style={{ fontSize: 15, marginRight: 8 }}>📶</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: isDark ? '#ffd8a8' : '#d9480f' }]}>
          Bạn đang ở chế độ ngoại tuyến
        </Text>
        <Text style={[styles.sub, { color: isDark ? '#ffc078' : '#e8590c' }]}>
          Danh sách phòng đã lưu và thông tin cấu hình vẫn khả dụng ngoại tuyến.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.retryBtn, { backgroundColor: '#fd7e14' }]}
        onPress={() => {
          setIsOnline(true);
          onRetry?.();
        }}
      >
        <Text style={styles.retryText}>Thử lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    zIndex: 999,
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  sub: {
    fontSize: 11,
    lineHeight: 14,
  },
  retryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  retryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
