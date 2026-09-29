import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from 'react-native';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { AppProvider, useApp } from './src/context/AppContext';
import { useResponsiveLayout } from './src/utils/responsive';
import { HomeScreen } from './src/screens/HomeScreen';
import { SearchScreen } from './src/screens/SearchScreen';
import { MapScreen } from './src/screens/MapScreen';
import { FavoritesScreen } from './src/screens/FavoritesScreen';
import { MyRoomScreen } from './src/screens/MyRoomScreen';
import { AuthOnboardingScreen } from './src/screens/AuthOnboardingScreen';
import { PropertyDetailModal } from './src/screens/PropertyDetailModal';
import { PropertyComparisonModal } from './src/screens/PropertyComparisonModal';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatRoomModal } from './src/screens/ChatRoomModal';
import { NotificationsModal } from './src/screens/NotificationsModal';
import { NetworkStatusBanner } from './src/components/NetworkStatusBanner';
import { APP_NAME } from '@troviet/shared';

// Navigation: Strictly 4 core modules matching Reference Designs (Images 1 & 3)
type TabKey = 'home' | 'saved' | 'my-room' | 'profile';

const SUPPORTED_LOCATIONS = [
  { code: 'tdt', name: 'ĐH Tôn Đức Thắng', shortName: 'ĐH Tôn Đức T...', provinceCode: '79', active: true },
  { code: 'fpt', name: 'ĐH FPT TP.HCM', shortName: 'ĐH FPT TP.HCM', provinceCode: '79', active: true },
  { code: 'rmit', name: 'ĐH RMIT Nam Sài Gòn', shortName: 'ĐH RMIT Q.7', provinceCode: '79', active: true },
  { code: 'danang', name: 'TP. Đà Nẵng', shortName: 'Đà Nẵng', provinceCode: '48', active: true },
  { code: 'hanoi', name: 'TP. Hà Nội', shortName: 'Hà Nội', provinceCode: '01', active: true },
  { code: 'hcm', name: 'TP. Hồ Chí Minh', shortName: 'Hồ Chí Minh', provinceCode: '79', active: true },
];

const MainApp: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const {
    currentUser,
    selectedListing,
    setSelectedListing,
    favoriteIds,
    comparisonIds,
    activeConversationId,
    setActiveConversationId,
    unreadNotificationsCount,
    conversations,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedLocation, setSelectedLocation] = useState(SUPPORTED_LOCATIONS[0]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [searchInitialCriteria, setSearchInitialCriteria] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const unreadMessagesCount = conversations.length;
  const { insets, bottomNavHeight, contentMaxWidth } = useResponsiveLayout();

  const navigateToSearchWithQuery = (query?: string) => {
    setSearchInitialCriteria(null);
    setSearchInitialQuery(query || '');
    setIsSearchModalOpen(true);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />

      {/* Top Header: Logo TroViet (Left), Location Pill (Center), Bell & Avatar (Right) */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
            height: 56 + insets.top,
          },
        ]}
      >
        {/* Brand Logo (Left) */}
        <TouchableOpacity
          style={styles.logoRow}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <View style={styles.logoBadge}>
            <Ionicons name="home" size={13} color="#085F56" />
          </View>
          <Text style={[styles.logoText, { color: colors.textPrimary }]}>TroViet</Text>
        </TouchableOpacity>

        {/* Location Dropdown Pill (Center) */}
        <TouchableOpacity
          style={[styles.locationPill, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }]}
          onPress={() => setIsLocationModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-outline" size={13} color="#085F56" style={{ marginRight: 3 }} />
          <Text style={[styles.locationName, { color: colors.textPrimary }]} numberOfLines={1}>
            {selectedLocation.shortName}
          </Text>
          <Ionicons name="chevron-down" size={11} color={colors.textSecondary} style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        {/* Right Header Actions */}
        <View style={styles.headerRightActions}>
          {/* Notification Bell with red unread dot */}
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => setIsNotificationsOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Thông báo"
          >
            <Ionicons name="notifications-outline" size={20} color={colors.textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={styles.redDot} />
            )}
          </TouchableOpacity>

          {/* User Profile Avatar */}
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={() => setActiveTab('profile')}
            accessibilityRole="button"
            accessibilityLabel="Hồ sơ tài khoản"
          >
            <Ionicons name="person" size={14} color="#64748B" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Resilience Banner */}
      <NetworkStatusBanner />

      {/* Screen Content: 4 Core Modules */}
      <View style={[styles.screenContainer, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToSearch={navigateToSearchWithQuery}
            onOpenMap={() => setIsMapModalOpen(true)}
            selectedCity={selectedLocation.name}
            onOpenCitySelector={() => setIsLocationModalOpen(true)}
            onSelectProperty={(listing) => setSelectedListing(listing)}
          />
        )}
        {activeTab === 'saved' && (
          <FavoritesScreen
            onOpenComparison={() => setIsComparisonOpen(true)}
            onSelectSavedSearch={(criteria) => {
              setSearchInitialCriteria(criteria);
              setIsSearchModalOpen(true);
            }}
          />
        )}
        {activeTab === 'my-room' && <MyRoomScreen />}
        {activeTab === 'profile' && <AuthOnboardingScreen />}
      </View>

      {/* Bottom Navigation: 4 Items matching Image 1 & 3 */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
            height: bottomNavHeight,
          },
        ]}
      >
        {/* Tab 1: Tìm trọ */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          accessibilityRole="button"
        >
          <Ionicons
            name={activeTab === 'home' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'home' ? '#085F56' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'home' ? '#085F56' : colors.textSecondary, fontWeight: activeTab === 'home' ? '800' : '500' },
            ]}
          >
            Tìm trọ
          </Text>
        </TouchableOpacity>

        {/* Tab 2: Đã lưu */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('saved')}
          accessibilityRole="button"
        >
          <View style={styles.iconWithBadge}>
            <Ionicons
              name={activeTab === 'saved' ? 'heart' : 'heart-outline'}
              size={22}
              color={activeTab === 'saved' ? '#085F56' : colors.textSecondary}
            />
            {favoriteIds.length > 0 && (
              <View style={[styles.dotBadge, { backgroundColor: '#085F56' }]}>
                <Text style={styles.dotBadgeText}>{favoriteIds.length}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'saved' ? '#085F56' : colors.textSecondary, fontWeight: activeTab === 'saved' ? '800' : '500' },
            ]}
          >
            Đã lưu
          </Text>
        </TouchableOpacity>

        {/* Tab 3: Phòng tôi */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('my-room')}
          accessibilityRole="button"
        >
          <Ionicons
            name={activeTab === 'my-room' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'my-room' ? '#085F56' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'my-room' ? '#085F56' : colors.textSecondary, fontWeight: activeTab === 'my-room' ? '800' : '500' },
            ]}
          >
            Phòng tôi
          </Text>
        </TouchableOpacity>

        {/* Tab 4: Tài khoản */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          accessibilityRole="button"
        >
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? '#085F56' : colors.textSecondary}
          />
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'profile' ? '#085F56' : colors.textSecondary, fontWeight: activeTab === 'profile' ? '800' : '500' },
            ]}
          >
            Tài khoản
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Compare Button */}
      {comparisonIds.length >= 2 && activeTab !== 'saved' && (
        <TouchableOpacity
          style={[
            styles.floatingCompareBtn,
            {
              bottom: bottomNavHeight + 12,
            },
          ]}
          onPress={() => setIsComparisonOpen(true)}
          activeOpacity={0.88}
        >
          <LinearGradient
            colors={['#064E46', '#085F56']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.floatingCompareGradient}
          >
            <Ionicons name="git-compare-outline" size={17} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.floatingCompareText}>
              So sánh {comparisonIds.length} phòng đã chọn
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {/* Fullscreen Map Modal */}
      <Modal visible={isMapModalOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <MapScreen onBackToHome={() => setIsMapModalOpen(false)} />
        </View>
      </Modal>

      {/* Search Feed Modal */}
      <Modal visible={isSearchModalOpen} animationType="slide">
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <View
            style={[
              styles.modalHeader,
              {
                backgroundColor: colors.card,
                borderBottomColor: colors.border,
                paddingTop: insets.top,
                height: 52 + insets.top,
              },
            ]}
          >
            <TouchableOpacity onPress={() => setIsSearchModalOpen(false)} style={{ padding: 6 }}>
              <Text style={{ color: '#085F56', fontSize: 15, fontWeight: '700' }}>← Quay lại</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Tìm kiếm phòng</Text>
            <View style={{ width: 60 }} />
          </View>
          <SearchScreen
            initialQuery={searchInitialQuery}
            initialCriteria={searchInitialCriteria}
          />
        </View>
      </Modal>

      {/* Location Selector Modal */}
      <Modal visible={isLocationModalOpen} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsLocationModalOpen(false)}
        >
          <View style={[styles.cityPickerSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cityPickerTitle, { color: colors.textPrimary }]}>
              Chọn Trường ĐH / Khu vực tìm trọ
            </Text>
            {SUPPORTED_LOCATIONS.map((loc) => (
              <TouchableOpacity
                key={loc.code}
                style={[
                  styles.cityOptionItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setSelectedLocation(loc);
                  setIsLocationModalOpen(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="location-sharp" size={16} color="#085F56" style={{ marginRight: 8 }} />
                  <Text style={[styles.cityNameText, { color: colors.textPrimary }]}>
                    {loc.name}
                  </Text>
                </View>
                {loc.code === selectedLocation.code ? (
                  <Text style={{ color: '#085F56', fontWeight: '800' }}>✓ Đang chọn</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

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

      {/* Notifications Modal */}
      <NotificationsModal
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </View>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppProvider>
          <MainApp />
        </AppProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 7,
    backgroundColor: '#E6F4F1',
    borderWidth: 1,
    borderColor: '#085F56',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  logoText: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 160,
  },
  locationName: {
    fontSize: 12,
    fontWeight: '700',
    maxWidth: 100,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  redDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#EF4444',
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  screenContainer: {
    flex: 1,
  },
  bottomNav: {
    height: 58,
    flexDirection: 'row',
    borderTopWidth: 1,
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
  },
  iconWithBadge: {
    position: 'relative',
  },
  dotBadge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  dotBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
  },
  floatingCompareBtn: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  floatingCompareGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
  },
  floatingCompareText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  cityPickerSheet: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  cityPickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
  },
  cityOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  cityNameText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalHeader: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
});
