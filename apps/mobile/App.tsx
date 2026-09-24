import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { Button } from './src/components/Button';
import { Badge } from './src/components/Badge';
import { CostCard } from './src/components/CostCard';
import { checkSupabaseHealth, SupabaseHealth } from './src/lib/supabase';
import {
  APP_NAME,
  APP_TAGLINE,
  ListingCosts,
  formatVND,
  formatArea,
  formatDistance,
} from '@troviet/shared';

// Sample Dev Listing Costs demonstrating transparent pricing
const SAMPLE_DEV_COSTS: ListingCosts = {
  monthlyRent: 2800000,
  deposit: 2800000,
  electricityBillingType: 'meter',
  electricityCostPerUnit: 3500,
  waterBillingType: 'meter',
  waterCostPerUnit: 15000,
  internetBillingType: 'fixed_monthly',
  internetCost: 80000,
  parkingBillingType: 'unprovided', // Landlord hasn't provided parking fee
  serviceFeeBillingType: 'unprovided', // Cleaning fee unprovided
};

const MainScreen: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const [health, setHealth] = useState<SupabaseHealth | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const runHealthCheck = async () => {
    setIsChecking(true);
    const result = await checkSupabaseHealth();
    setHealth(result);
    setIsChecking(false);
  };

  useEffect(() => {
    runHealthCheck();
  }, []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
              <Text style={styles.logoText}>TV</Text>
            </View>
            <View>
              <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>
                {APP_NAME}
              </Text>
              <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
                {APP_TAGLINE}
              </Text>
            </View>
          </View>
          <View style={styles.themeToggleContainer}>
            <Button
              title={isDark ? '☀️ Giao diện sáng' : '🌙 Giao diện tối'}
              variant="outline"
              onPress={toggleTheme}
            />
          </View>
        </View>

        {/* System & DB Status Card */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Trạng thái hệ thống (Phase 0 Healthcheck)
          </Text>
          <View style={styles.statusIndicatorRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: health?.connected ? colors.primary : colors.warning },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>
              {health ? health.message : 'Đang kiểm tra kết nối...'}
            </Text>
          </View>
          <Text style={[styles.statusMeta, { color: colors.textSecondary }]}>
            Supabase URL: {health?.url || 'http://127.0.0.1:54321'}
          </Text>
          <View style={{ marginTop: 10 }}>
            <Button
              title="Kiểm tra lại kết nối CSDL"
              variant="secondary"
              loading={isChecking}
              onPress={runHealthCheck}
            />
          </View>
        </View>

        {/* 2-Tier Administrative Boundary & Aliases Showcase */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Mô hình địa giới 2 cấp (Từ 01/07/2025)
          </Text>
          <Text style={[styles.descriptionText, { color: colors.textSecondary }]}>
            Tuân thủ cấu trúc Tỉnh/Thành phố → Xã/Phường/Đặc khu và hỗ trợ tên quen thuộc theo thói quen:
          </Text>
          <View style={styles.adminUnitList}>
            <View style={[styles.unitPill, { backgroundColor: colors.background }]}>
              <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>
                📍 Cấp 1: TP. Đà Nẵng
              </Text>
            </View>
            <View style={[styles.unitPill, { backgroundColor: colors.background, marginLeft: 16 }]}>
              <Text style={{ color: colors.textSecondary }}>
                ↳ Cấp 2: Phường Hải Châu I · Phường Phước Mỹ · Phường Hòa Khánh Bắc
              </Text>
            </View>
            <View style={[styles.unitPill, { backgroundColor: colors.background, marginLeft: 16 }]}>
              <Text style={{ color: colors.textSecondary }}>
                🏷 Bí danh tìm kiếm: "Khu Mỹ Khê" · "Gần ĐH Duy Tân" · "Quận Hải Châu cũ"
              </Text>
            </View>
          </View>
        </View>

        {/* Verification Badges Showcase */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Cấp độ xác minh an toàn (SPEC Mục 8)
          </Text>
          <View style={styles.badgeRow}>
            <Badge level="L1" />
            <Badge level="L2" />
            <Badge level="L3" />
          </View>
        </View>

        {/* Transparent Cost Calculation Demonstration */}
        <CostCard costs={SAMPLE_DEV_COSTS} />

        {/* Formatters Showcase */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            Quy chuẩn hiển thị tiếng Việt
          </Text>
          <View style={styles.formattersGrid}>
            <Text style={{ color: colors.textSecondary }}>Tiền tệ VNĐ: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatVND(3500000)}</Text></Text>
            <Text style={{ color: colors.textSecondary }}>Diện tích: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatArea(28.5)}</Text></Text>
            <Text style={{ color: colors.textSecondary }}>Khoảng cách: <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>{formatDistance(1.8)}</Text></Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Trọ Việt · Bản khởi động Phase 0 Nền móng · Sẵn sàng cho Phase 1
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <MainScreen />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 20,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandTagline: {
    fontSize: 13,
    marginTop: 2,
  },
  themeToggleContainer: {
    marginTop: 4,
  },
  sectionCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 8,
  },
  statusIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusMeta: {
    fontSize: 12,
  },
  adminUnitList: {
    marginTop: 6,
    gap: 6,
  },
  unitPill: {
    padding: 8,
    borderRadius: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  formattersGrid: {
    gap: 6,
    marginTop: 4,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
  },
});
