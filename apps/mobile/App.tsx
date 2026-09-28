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
import { AuthOnboardingScreen } from './src/screens/AuthOnboardingScreen';
import { PropertyDetailModal } from './src/screens/PropertyDetailModal';
import { PropertyComparisonModal } from './src/screens/PropertyComparisonModal';
import { ChatListScreen } from './src/screens/ChatListScreen';
import { ChatRoomModal } from './src/screens/ChatRoomModal';
import { NotificationsModal } from './src/screens/NotificationsModal';
import { NetworkStatusBanner } from './src/components/NetworkStatusBanner';
import { APP_NAME } from '@troviet/shared';

// Navigation: Strictly 5 core modules (Section 6, 30, 36)
type TabKey = 'home' | 'search' | 'map' | 'saved' | 'profile';

const SUPPORTED_CITIES = [
  { code: 'danang', name: 'TP. Đà Nẵng', provinceCode: '48', active: true },
  { code: 'hanoi', name: 'TP. Hà Nội', provinceCode: '01', active: true },
  { code: 'hcm', name: 'TP. Hồ Chí Minh', provinceCode: '79', active: true },
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
  const [selectedCity, setSelectedCity] = useState(SUPPORTED_CITIES[0]);
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState('');
  const [searchInitialCriteria, setSearchInitialCriteria] = useState<any>(null);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  // Unread messages count / active threads
  const unreadMessagesCount = conversations.length;
  const { insets, bottomNavHeight, contentMaxWidth } = useResponsiveLayout();

  const navigateToSearchWithQuery = (query?: string) => {
    setSearchInitialCriteria(null);
    setSearchInitialQuery(query || '');
    setActiveTab('search');
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ExpoStatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header: Location Selector (Left) + Messages, Notifications, Theme (Right) (Section 8) */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: insets.top,
            height: 54 + insets.top,
          },
        ]}
      >
        {/* Location Selector (Left) */}
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={() => setIsCityModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="location-sharp" size={17} color={colors.primary} style={{ marginRight: 4 }} />
          <Text style={[styles.locationCityName, { color: colors.textPrimary }]}>
            {selectedCity.name.replace('TP. ', '')}
          </Text>
          <Ionicons name="chevron-down" size={13} color={colors.textSecondary} style={{ marginLeft: 3 }} />
        </TouchableOpacity>

        {/* Right Header Actions */}
        <View style={styles.headerRightActions}>
          {/* In-App Messages (Header → Messages) */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setIsMessagesOpen(true)}
            accessibilityRole="button"
          >
            <Ionicons name="chatbubbles-outline" size={18} color={colors.textPrimary} />
            {unreadMessagesCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.error }]}>
                <Text style={styles.badgePillText}>{unreadMessagesCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Notifications Bell */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={() => setIsNotificationsOpen(true)}
            accessibilityRole="button"
          >
            <Ionicons name="notifications-outline" size={18} color={colors.textPrimary} />
            {unreadNotificationsCount > 0 && (
              <View style={[styles.badgePill, { backgroundColor: colors.error }]}>
                <Text style={styles.badgePillText}>{unreadNotificationsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Light / Dark Mode Switcher */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
            onPress={toggleTheme}
            accessibilityRole="button"
          >
            <Ionicons name={isDark ? 'sunny' : 'moon'} size={17} color={isDark ? '#F59E0B' : '#6366F1'} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Resilience Banner */}
      <NetworkStatusBanner />

      {/* Screen Content: 5 Core Modules */}
      <View style={[styles.screenContainer, { maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }]}>
        {activeTab === 'home' && (
          <HomeScreen
            onNavigateToSearch={navigateToSearchWithQuery}
            selectedCity={selectedCity.name}
            onOpenCitySelector={() => setIsCityModalOpen(true)}
          />
        )}
        {activeTab === 'search' && (
          <SearchScreen
            initialQuery={searchInitialQuery}
            initialCriteria={searchInitialCriteria}
          />
        )}
        {activeTab === 'map' && <MapScreen />}
        {activeTab === 'saved' && (
          <FavoritesScreen
            onOpenComparison={() => setIsComparisonOpen(true)}
            onSelectSavedSearch={(criteria) => {
              setSearchInitialCriteria(criteria);
              setActiveTab('search');
            }}
          />
        )}
        {activeTab === 'profile' && <AuthOnboardingScreen />}
      </View>

      {/* Bottom Navigation: Strictly 5 items (Section 30 & 36) */}
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
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          accessibilityRole="button"
        >
          <Ionicons
            name={activeTab === 'home' ? 'home' : 'home-outline'}
            size={22}
            color={activeTab === 'home' ? colors.primary : colors.textSecondary}
          />
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
          <Ionicons
            name={activeTab === 'search' ? 'search' : 'search-outline'}
            size={22}
            color={activeTab === 'search' ? colors.primary : colors.textSecondary}
          />
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
          <Ionicons
            name={activeTab === 'map' ? 'map' : 'map-outline'}
            size={22}
            color={activeTab === 'map' ? colors.primary : colors.textSecondary}
          />
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
          onPress={() => setActiveTab('saved')}
          accessibilityRole="button"
        >
          <View style={styles.iconWithBadge}>
            <Ionicons
              name={activeTab === 'saved' ? 'heart' : 'heart-outline'}
              size={22}
              color={activeTab === 'saved' ? colors.primary : colors.textSecondary}
            />
            {favoriteIds.length > 0 && (
              <View style={[styles.dotBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.dotBadgeText}>{favoriteIds.length}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'saved' ? colors.primary : colors.textSecondary },
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
          <Ionicons
            name={activeTab === 'profile' ? 'person' : 'person-outline'}
            size={22}
            color={activeTab === 'profile' ? colors.primary : colors.textSecondary}
          />
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
            colors={['#059669', '#10B981']}
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

      {/* City Location Selector Modal */}
      <Modal visible={isCityModalOpen} transparent={true} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsCityModalOpen(false)}
        >
          <View style={[styles.cityPickerSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cityPickerTitle, { color: colors.textPrimary }]}>
              Chọn Tỉnh / Thành phố
            </Text>
            {SUPPORTED_CITIES.map((city) => (
              <TouchableOpacity
                key={city.code}
                style={[
                  styles.cityOptionItem,
                  { borderBottomColor: colors.border },
                ]}
                onPress={() => {
                  setSelectedCity(city);
                  setIsCityModalOpen(false);
                }}
              >
                <Text style={[styles.cityNameText, { color: colors.textPrimary }]}>
                  {city.name}
                </Text>
                {city.code === selectedCity.code ? (
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>✓ Đang chọn</Text>
                ) : !city.active ? (
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Sắp ra mắt</Text>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Messages Modal (Header → Messages) */}
      <Modal visible={isMessagesOpen} animationType="slide">
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
            <TouchableOpacity onPress={() => setIsMessagesOpen(false)} style={{ padding: 6 }}>
              <Text style={{ color: colors.primary, fontSize: 15, fontWeight: '700' }}>← Trở lại</Text>
            </TouchableOpacity>
            <Text style={{ fontSize: 16, fontWeight: '800', color: colors.textPrimary }}>Tin nhắn</Text>
            <View style={{ width: 60 }} />
          </View>
          <View style={{ flex: 1, maxWidth: contentMaxWidth, width: '100%', alignSelf: 'center' }}>
            <ChatListScreen
              onOpenConversation={(id) => {
                setIsMessagesOpen(false);
                setActiveConversationId(id);
              }}
            />
          </View>
        </View>
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

      {/* Chat Room Modal */}
      <ChatRoomModal
        visible={activeConversationId !== null}
        onClose={() => setActiveConversationId(null)}
        conversationId={activeConversationId}
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
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  locationCityName: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  dropdownArrow: {
    fontSize: 10,
    marginLeft: 6,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badgePill: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgePillText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
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
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '600',
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
