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
import { LandlordPostScreen } from './src/screens/LandlordPostScreen';
import { AdminModerationScreen } from './src/screens/AdminModerationScreen';
import { AuthOnboardingScreen } from './src/screens/AuthOnboardingScreen';
import { PropertyDetailModal } from './src/screens/PropertyDetailModal';
import { APP_NAME, APP_TAGLINE } from '@troviet/shared';

type TabKey = 'home' | 'search' | 'post' | 'admin' | 'profile';

const MainApp: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { currentUser, listings, selectedListing, setSelectedListing } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [searchInitialQuery, setSearchInitialQuery] = useState('');

  const pendingCount = listings.filter((l) => l.status === 'pending_review').length;

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

        <TouchableOpacity
          style={[styles.themeBtn, { borderColor: colors.border }]}
          onPress={toggleTheme}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 16 }}>{isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

      {/* Screen Content */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen onNavigateToSearch={navigateToSearchWithQuery} />
        )}
        {activeTab === 'search' && (
          <SearchScreen initialQuery={searchInitialQuery} />
        )}
        {activeTab === 'post' && (
          <LandlordPostScreen onSuccess={() => setActiveTab('home')} />
        )}
        {activeTab === 'admin' && <AdminModerationScreen />}
        {activeTab === 'profile' && <AuthOnboardingScreen />}
      </View>

      {/* Bottom Navigation Bar */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 18 }}>🏠</Text>
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
          <Text style={{ fontSize: 18 }}>🔍</Text>
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
          onPress={() => setActiveTab('post')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 18 }}>➕</Text>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'post' ? colors.primary : colors.textSecondary },
            ]}
          >
            Đăng tin
          </Text>
        </TouchableOpacity>

        {/* Admin Moderation Tab */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('admin')}
          accessibilityRole="button"
        >
          <View style={styles.iconWithBadge}>
            <Text style={{ fontSize: 18 }}>🛡️</Text>
            {pendingCount > 0 && (
              <View style={[styles.badgeDot, { backgroundColor: colors.warning }]}>
                <Text style={styles.badgeDotText}>{pendingCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navText,
              { color: activeTab === 'admin' ? colors.primary : colors.textSecondary },
            ]}
          >
            Quản trị
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          accessibilityRole="button"
        >
          <Text style={{ fontSize: 18 }}>👤</Text>
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
  themeBtn: {
    padding: 8,
    borderRadius: 8,
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
    height: 60,
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
    color: '#000000',
    fontSize: 9,
    fontWeight: '800',
  },
});
