import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Conversation } from '@troviet/shared';

interface ChatListScreenProps {
  onOpenConversation: (conversationId: string) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({
  onOpenConversation,
}) => {
  const { colors } = useTheme();
  const { currentUser, conversations } = useApp();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.screenHeader, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>Tin nhắn & Liên hệ</Text>
        <Text style={[styles.screenSub, { color: colors.textSecondary }]}>
          Trò chuyện trực tiếp, minh bạch và an toàn
        </Text>
      </View>

      {conversations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>💬</Text>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
            Chưa có tin nhắn nào
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
            Hãy tìm phòng ưng ý và nhấn nút "💬 Nhắn tin với chủ trọ" để bắt đầu trao đổi.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {conversations.map((conv: Conversation) => {
            const partnerName =
              currentUser?.id === conv.tenantId ? conv.landlordName : conv.tenantName;

            return (
              <TouchableOpacity
                key={conv.id}
                style={[
                  styles.convCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => onOpenConversation(conv.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>{partnerName.charAt(0)}</Text>
                </View>

                <View style={styles.convDetails}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.partnerName, { color: colors.textPrimary }]} numberOfLines={1}>
                      {partnerName}
                    </Text>
                    {conv.lastMessageAt && (
                      <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                        {new Date(conv.lastMessageAt).toLocaleDateString('vi-VN', {
                          month: 'numeric',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                  </View>

                  {conv.listingTitle && (
                    <Text style={[styles.listingTag, { color: colors.primary }]} numberOfLines={1}>
                      🏡 {conv.listingTitle}
                    </Text>
                  )}

                  <Text
                    style={[styles.messagePreview, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {conv.lastMessagePreview || 'Bắt đầu cuộc trò chuyện...'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  screenHeader: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  screenSub: {
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
  },
  convDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
  },
  listingTag: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 19,
  },
});
