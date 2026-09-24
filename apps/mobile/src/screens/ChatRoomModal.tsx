import React, { useState, useRef } from 'react';
import {
  Modal,
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import {
  formatVND,
  analyzeChatMessageForRisks,
  ChatMessage,
} from '@troviet/shared';

interface ChatRoomModalProps {
  visible: boolean;
  onClose: () => void;
  conversationId: string | null;
  onOpenReportModal?: (targetType: 'message' | 'listing' | 'user', targetId: string, title: string) => void;
}

const QUICK_SUGGESTIONS = [
  'Phòng này hiện còn trống không ạ?',
  'Chiều nay 15h em qua xem phòng được không?',
  'Tiền điện nước và phí dịch vụ tính thế nào ạ?',
  'Phòng có chỗ để xe máy miễn phí không?',
];

export const ChatRoomModal: React.FC<ChatRoomModalProps> = ({
  visible,
  onClose,
  conversationId,
  onOpenReportModal,
}) => {
  const { colors, isDark } = useTheme();
  const {
    currentUser,
    conversations,
    messages,
    sendMessage,
    listings,
    setSelectedListing,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  if (!conversationId) return null;

  const conv = conversations.find((c) => c.id === conversationId);
  const conversationMessages = messages[conversationId] || [];
  const listing = listings.find((l) => l.id === conv?.listingId);

  // Live anti-scam analysis on current input text
  const liveInputAnalysis = analyzeChatMessageForRisks(inputText);

  // Check if any message in the chat had risky signals
  const hasAnyRiskyMessage = conversationMessages.some(
    (m) => m.detectedRisks && m.detectedRisks.length > 0
  );

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(conversationId, inputText);
    setInputText('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSendSuggestion = (text: string) => {
    sendMessage(conversationId, text);
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleViewListing = () => {
    if (listing) {
      setSelectedListing(listing);
    }
  };

  const handleReportMessage = (msg: ChatMessage) => {
    if (onOpenReportModal) {
      onOpenReportModal('message', msg.id, `Tin nhắn từ ${msg.senderName}: "${msg.content.substring(0, 30)}..."`);
    } else {
      Alert.alert('Báo cáo tin nhắn', 'Đã ghi nhận yêu cầu báo cáo tin nhắn vi phạm.');
    }
  };

  const partnerName =
    currentUser?.id === conv?.tenantId ? conv?.landlordName : conv?.tenantName;

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Top Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backBtn} onPress={onClose}>
            <Text style={[styles.backText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>

          <View style={styles.headerTitleCol}>
            <Text style={[styles.partnerName, { color: colors.textPrimary }]} numberOfLines={1}>
              {partnerName || 'Trò chuyện'}
            </Text>
            <View style={styles.partnerStatusRow}>
              <View style={[styles.onlineDot, { backgroundColor: colors.success }]} />
              <Text style={[styles.partnerSub, { color: colors.textSecondary }]}>
                Đang trực tuyến • Trọ Việt Chat
              </Text>
            </View>
          </View>

          {listing && (
            <TouchableOpacity
              style={[styles.headerActionBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => {
                if (onOpenReportModal) {
                  onOpenReportModal('user', conv?.landlordId || '', `Người dùng ${partnerName}`);
                }
              }}
            >
              <Text style={{ fontSize: 13 }}>🚩 Báo cáo</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Pinned Listing Mini-Card */}
        {listing && (
          <TouchableOpacity
            style={[styles.pinnedListing, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleViewListing}
            activeOpacity={0.8}
          >
            <View style={[styles.listingIconBox, { backgroundColor: colors.background }]}>
              <Text style={{ fontSize: 20 }}>🏡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pinnedTitle, { color: colors.textPrimary }]} numberOfLines={1}>
                {listing.title}
              </Text>
              <Text style={[styles.pinnedPrice, { color: colors.primary }]}>
                {formatVND(listing.monthlyRent)}/tháng • {listing.wardName}
              </Text>
            </View>
            <Text style={[styles.pinnedViewBtn, { color: colors.primary }]}>Xem phòng →</Text>
          </TouchableOpacity>
        )}

        {/* Persistent Safety Reminder Banner */}
        <View style={[styles.safetyBanner, { backgroundColor: isDark ? '#2a2310' : '#fff9db', borderColor: '#fcc419' }]}>
          <Text style={{ fontSize: 14, marginRight: 6 }}>💡</Text>
          <Text style={[styles.safetyBannerText, { color: isDark ? '#ffe066' : '#855e00' }]}>
            <Text style={{ fontWeight: '700' }}>Lời khuyên an toàn: </Text>
            Tuyệt đối không chuyển tiền cọc khi chưa gặp chủ trọ và xem phòng trực tiếp.
          </Text>
        </View>

        {/* Dynamic Anti-Scam Alert if risky content detected */}
        {(hasAnyRiskyMessage || liveInputAnalysis.hasRisk) && (
          <View style={[styles.scamAlertBanner, { backgroundColor: isDark ? '#3d1414' : '#ffe3e3', borderColor: colors.error }]}>
            <Text style={{ fontSize: 16, marginRight: 8 }}>⚠️</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.scamAlertTitle, { color: colors.error }]}>
                Cảnh báo an toàn Trọ Việt
              </Text>
              <Text style={[styles.scamAlertDesc, { color: isDark ? '#ffc9c9' : '#c92a2a' }]}>
                {liveInputAnalysis.hasRisk
                  ? liveInputAnalysis.warningMessage
                  : 'Hội thoại có dấu hiệu đề cập chuyển cọc sớm hoặc chuyển sang ứng dụng khác. Hãy thận trọng!'}
              </Text>
            </View>
          </View>
        )}

        {/* Message List */}
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          <Text style={[styles.chatIntroDate, { color: colors.textSecondary }]}>
            Bắt đầu cuộc trò chuyện được bảo vệ bởi Trọ Việt
          </Text>

          {conversationMessages.map((msg) => {
            const isMe = msg.senderId === currentUser?.id;
            const hasRisk = msg.detectedRisks && msg.detectedRisks.length > 0;

            return (
              <View
                key={msg.id}
                style={[
                  styles.messageRow,
                  isMe ? styles.messageRowMe : styles.messageRowOther,
                ]}
              >
                <View
                  style={[
                    styles.messageBubble,
                    isMe
                      ? [styles.bubbleMe, { backgroundColor: colors.primary }]
                      : [styles.bubbleOther, { backgroundColor: colors.card, borderColor: colors.border }],
                    hasRisk && { borderColor: colors.error, borderWidth: 1.5 },
                  ]}
                >
                  {!isMe && (
                    <Text style={[styles.senderLabel, { color: colors.textSecondary }]}>
                      {msg.senderName}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.messageContent,
                      { color: isMe ? '#ffffff' : colors.textPrimary },
                    ]}
                  >
                    {msg.content}
                  </Text>

                  {/* Warning tag on message if flagged */}
                  {hasRisk && (
                    <View style={styles.riskTag}>
                      <Text style={styles.riskTagText}>
                        ⚠️ Từ khóa nhạy cảm: {msg.detectedRisks?.join(', ')}
                      </Text>
                    </View>
                  )}

                  <View style={styles.bubbleFooter}>
                    <Text
                      style={[
                        styles.timeText,
                        { color: isMe ? 'rgba(255,255,255,0.7)' : colors.textSecondary },
                      ]}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {!isMe && (
                      <TouchableOpacity
                        style={styles.msgReportBtn}
                        onPress={() => handleReportMessage(msg)}
                      >
                        <Text style={{ fontSize: 10, color: colors.textSecondary }}>🚩</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Quick Suggestion Chips */}
        <View style={[styles.chipsContainer, { borderTopColor: colors.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {QUICK_SUGGESTIONS.map((chip, idx) => (
              <TouchableOpacity
                key={idx}
                style={[styles.chipItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => handleSendSuggestion(chip)}
              >
                <Text style={[styles.chipText, { color: colors.textPrimary }]}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: colors.background,
                color: colors.textPrimary,
                borderColor: liveInputAnalysis.hasRisk ? colors.error : colors.border,
              },
            ]}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              {
                backgroundColor: inputText.trim() ? colors.primary : colors.border,
              },
            ]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendBtnText}>Gửi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    height: 56,
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
  headerTitleCol: {
    flex: 1,
    alignItems: 'center',
  },
  partnerName: {
    fontSize: 15,
    fontWeight: '700',
  },
  partnerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  partnerSub: {
    fontSize: 11,
  },
  headerActionBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  pinnedListing: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    gap: 10,
  },
  listingIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinnedTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  pinnedPrice: {
    fontSize: 12,
    marginTop: 2,
  },
  pinnedViewBtn: {
    fontSize: 12,
    fontWeight: '700',
  },
  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  safetyBannerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  scamAlertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  scamAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 2,
  },
  scamAlertDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  messagesList: {
    padding: 16,
    paddingBottom: 24,
  },
  chatIntroDate: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 16,
  },
  messageRow: {
    marginVertical: 4,
    flexDirection: 'row',
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
  },
  bubbleMe: {
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    borderBottomLeftRadius: 2,
    borderWidth: 1,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  messageContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  riskTag: {
    backgroundColor: '#fff0f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  riskTagText: {
    color: '#d6336c',
    fontSize: 10,
    fontWeight: '700',
  },
  bubbleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  timeText: {
    fontSize: 10,
  },
  msgReportBtn: {
    padding: 2,
  },
  chipsContainer: {
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  chipsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 38,
    maxHeight: 100,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14,
  },
  sendBtn: {
    paddingHorizontal: 16,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
