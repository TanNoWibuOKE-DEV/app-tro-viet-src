import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Modal,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { MapScreen } from './src/screens/MapScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { LandlordPostScreen } from './src/screens/LandlordPostScreen';
import { AdminModerationScreen } from './src/screens/AdminModerationScreen';
import { AuthOnboardingScreen } from './src/screens/AuthOnboardingScreen';
import { PropertyDetailModal } from './src/screens/PropertyDetailModal';
import { PropertyComparisonModal } from './src/screens/PropertyComparisonModal';
import { APP_NAME, APP_TAGLINE } from '@troviet/shared';

type TabKey = 'home' | 'search' | 'map' | 'favorites' | 'post' | 'admin' | 'profile';

const MainApp: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    currentUser,
    listings,
    selectedListing,
    setSelectedListing,
    favoriteIds,
    comparisonIds,
    verificationRequests,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const pendingListingsCount = listings.filter((l) => l.status === 'pending_review').length;
  const pendingVerificationsCount = verificationRequests.filter((v) => v.status === 'pending').length;
  const totalAdminTasks = pendingListingsCount + pendingVerificationsCount;

  const navigateToSearchWithQuery = (query?: string) => {
    setSearchInitialQuery(query || '');
    setActiveTab('search');
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />

      {/* Persistent Brand Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Text style={styles.logoText}>TV</Text>
          </View>
          <View>
            <Text style={[styles.brandTitle, { color: colors.textPrimary }]}>{APP_NAME}</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>{APP_TAGLINE}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* Quick Post button */}
          <TouchableOpacity
            style={[styles.headerActionBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setActiveTab('post')}
          >
            <Text style={{ fontSize: 13 }}>➕ Đăng tin</Text>
          </TouchableOpacity>

          {/* Admin Moderation Button if admin */}
          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={[
                styles.headerActionBtn,
                {
                  backgroundColor: totalAdminTasks > 0 ? colors.warning : colors.background,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setActiveTab('admin')}
            >
              <Text style={{ fontSize: 12, fontWeight: '800', color: totalAdminTasks > 0 ? '#000000' : colors.textPrimary }}>
                🛡️ {totalAdminTasks > 0 ? `${totalAdminTasks}` : 'Admin'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Theme switcher */}
          <TouchableOpacity
            style={[styles.themeBtn, { borderColor: colors.border }]}
            onPress={toggleTheme}
            accessibilityRole="button"
          >
            <Text style={{ fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen onNavigateToSearch={navigateToSearchWithQuery} />
        )}
        {activeTab === 'search' && (
          <SearchScreen initialQuery={searchInitialQuery} />
        )}
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'favorites' && (
          <FavoritesScreen onOpenComparison={() => setIsComparisonOpen(true)} />
        )}
        {activeTab === 'post' && (
          <LandlordPostScreen onSuccess={() => setActiveTab('home')} />
        )}
        {activeTab === 'admin' && <AdminModerationScreen />}
        {activeTab === 'profile' && <AuthOnboardingScreen />}
      </View>

      {/* Bottom Navigation Bar (Following SPEC Section 9) */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 17 }}>🏠</Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'home' ? colors.primary : colors.textSecondary },
            ]}
          >
            Trang chủ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            setSearchInitialQuery('');
            setActiveTab('search');
          }}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 17 }}>🔍</Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'search' ? colors.primary : colors.textSecondary },
            ]}
          >
            Tìm kiếm
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('map')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 17 }}>🗺️</Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'map' ? colors.primary : colors.textSecondary },
            ]}
          >
            Bản đồ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('favorites')}
          accessibilityRole="button"
        >
          <View style={styles.iconWithBadge}>
            <Text style={{ fontSize: 17 }}>❤️</Text>
            {favoriteIds.length > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeDotText}>{favoriteIds.length}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'favorites' ? colors.primary : colors.textSecondary },
            ]}
          >
            Đã lưu
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 17 }}>👤</Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'profile' ? colors.primary : colors.textSecondary },
            ]}
          >
            Cá nhân
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Compare Pill if 2-3 items selected */}
      {comparisonIds.length >= 2 && activeTab !== 'favorites' && (
        <TouchableOpacity
          style={[styles.floatingCompareBtn, { backgroundColor: colors.primary }]}
          onPress={() => setIsComparisonOpen(true)}
        >
          <Text style={styles.floatingCompareText}>
            ⚖️ So sánh {comparisonIds.length} phòng đã chọn
          </Text>
        </TouchableOpacity>
      )}

      {/* Property Detail Modal */}
      <Modal visible={selectedListing !== null} animationType="slide">
        {selectedListing && (
          <PropertyDetailModal
            listing={selectedListing}
            onClose={() => setSelectedListing(null)}
            isLoggedIn={currentUser !== null}
          />
        )}
      </Modal>

      {/* Property Comparison Modal */}
      <PropertyComparisonModal
        visible={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: StatusBar.currentHeight || 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  brandTagline: {
    fontSize: 11,
  },
  headerActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
  },
  themeBtn: {
    padding: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  navText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  iconWithBadge: {
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: -4,
    right: -8,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDotText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingCompareBtn: {
    position: 'absolute',
    bottom: 68,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  floatingCompareText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
});
