import React from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { AppNotification } from '@troviet/shared';

interface NotificationsModalProps {
  visible: boolean;
  onClose: () => void;
}

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'anti_scam_warning':
      return '🚨';
    case 'chat_message':
      return '💬';
    case 'review_received':
    case 'review_approved':
      return '⭐';
    case 'listing_approved':
      return '✅';
    case 'listing_rejected':
      return '❌';
    case 'verification_approved':
      return '🛡️';
    case 'report_resolved':
      return '⚖️';
    default:
      return '🔔';
  }
};

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  visible,
  onClose,
}) => {
  const { colors, isDark } = useTheme();
  const {
    notifications,
    unreadNotificationsCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useApp();

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Thông báo</Text>
          {unreadNotificationsCount > 0 ? (
            <TouchableOpacity onPress={markAllNotificationsAsRead}>
              <Text style={[styles.readAllText, { color: colors.primary }]}>Đã đọc hết</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ width: 50 }} />
          )}
        </View>

        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 44, marginBottom: 12 }}>🔔</Text>
            <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
              Không có thông báo mới
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Các cập nhật quan trọng về tin nhắn, duyệt tin và cảnh báo an toàn sẽ hiển thị tại đây.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {notifications.map((n: AppNotification) => {
              const isUnread = !n.isRead;
              return (
                <TouchableOpacity
                  key={n.id}
                  style={[
                    styles.notifCard,
                    {
                      backgroundColor: isUnread
                        ? isDark
                          ? '#1e2820'
                          : '#f0fdf4'
                        : colors.card,
                      borderColor: isUnread ? colors.primary : colors.border,
                      borderWidth: isUnread ? 1.5 : 1,
                    },
                  ]}
                  onPress={() => markNotificationAsRead(n.id)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24 }}>{getNotificationIcon(n.type)}</Text>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>
                        {n.title}
                      </Text>
                      {isUnread && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
                    </View>
                    <Text style={[styles.cardBody, { color: colors.textSecondary }]}>
                      {n.body}
                    </Text>
                    <Text style={[styles.cardTime, { color: colors.textSecondary }]}>
                      {new Date(n.createdAt).toLocaleString('vi-VN', {
                        day: 'numeric',
                        month: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 10,
  },
  backText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  readAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 6,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  cardTime: {
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
