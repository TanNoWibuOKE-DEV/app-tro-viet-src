import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';
import {
  STANDARD_VIEWING_CHECKLIST,
  ViewingChecklistItem,
  ListingSummary,
} from '@troviet/shared';

interface ViewingChecklistModalProps {
  visible: boolean;
  listing: ListingSummary;
  onClose: () => void;
}

export const ViewingChecklistModal: React.FC<ViewingChecklistModalProps> = ({
  visible,
  listing,
  onClose,
}) => {
  const { colors, isDark } = useTheme();

  // Track checked states and custom notes for each item
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [activeNoteItemId, setActiveNoteItemId] = useState<string | null>(null);

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleUpdateNote = (id: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [id]: text,
    }));
  };

  const completedCount = Object.values(checkedIds).filter(Boolean).length;
  const totalCount = STANDARD_VIEWING_CHECKLIST.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  // Group checklist by category
  const categories = [
    { key: 'utilities', label: '⚡ Điện & Nước' },
    { key: 'room_condition', label: '🏡 Cơ sở vật chất' },
    { key: 'security_building', label: '🛡️ An ninh & Tiện ích chung' },
    { key: 'legal_contract', label: '📑 Pháp lý & Tiền cọc' },
  ];

  return (
    <Modal visible={visible} animationType="slide">
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Sổ tay kiểm tra phòng
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Room Context Banner */}
          <View style={[styles.roomCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.roomTitle, { color: colors.textPrimary }]} numberOfLines={1}>
              📍 {listing.title}
            </Text>
            <Text style={[styles.roomAddress, { color: colors.textSecondary }]}>
              {listing.houseNumber} {listing.street}, {listing.wardName}
            </Text>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                  Tiến độ thẩm định thực tế
                </Text>
                <Text style={[styles.progressVal, { color: colors.primary }]}>
                  {completedCount}/{totalCount} mục ({progressPercent}%)
                </Text>
              </View>
              <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${progressPercent}%`,
                      backgroundColor: progressPercent === 100 ? colors.success : colors.primary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Checklist Sections */}
          {categories.map((cat) => {
            const items = STANDARD_VIEWING_CHECKLIST.filter((i) => i.category === cat.key);
            return (
              <View key={cat.key} style={styles.categorySection}>
                <Text style={[styles.categoryHeader, { color: colors.primary }]}>
                  {cat.label}
                </Text>

                {items.map((item) => {
                  const isChecked = !!checkedIds[item.id];
                  const itemNote = notes[item.id] || '';
                  const isEditingNote = activeNoteItemId === item.id;

                  return (
                    <View
                      key={item.id}
                      style={[
                        styles.itemCard,
                        {
                          backgroundColor: colors.card,
                          borderColor: isChecked ? colors.success : colors.border,
                        },
                      ]}
                    >
                      <TouchableOpacity
                        style={styles.itemMainRow}
                        onPress={() => toggleCheck(item.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: isChecked ? colors.success : colors.background,
                              borderColor: isChecked ? colors.success : colors.border,
                            },
                          ]}
                        >
                          {isChecked && <Text style={styles.checkmark}>✓</Text>}
                        </View>

                        <View style={{ flex: 1 }}>
                          <View style={styles.itemTitleRow}>
                            <Text
                              style={[
                                styles.itemTitle,
                                {
                                  color: colors.textPrimary,
                                  textDecorationLine: isChecked ? 'line-through' : 'none',
                                },
                              ]}
                            >
                              {item.title}
                            </Text>
                            {item.importance === 'critical' && (
                              <View
                                style={[
                                  styles.criticalTag,
                                  { backgroundColor: isDark ? '#4a1515' : '#fee2e2' },
                                ]}
                              >
                                <Text style={[styles.criticalTagText, { color: colors.error }]}>
                                  Quan trọng
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.itemInstruction, { color: colors.textSecondary }]}>
                            {item.instruction}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {/* Item Note Area */}
                      {itemNote.length > 0 && !isEditingNote && (
                        <View style={[styles.noteDisplayBox, { backgroundColor: colors.background }]}>
                          <Text style={[styles.noteDisplayText, { color: colors.textPrimary }]}>
                            📝 Ghi chú: {itemNote}
                          </Text>
                        </View>
                      )}

                      {/* Note Button / Editor */}
                      {isEditingNote ? (
                        <View style={styles.noteEditorRow}>
                          <TextInput
                            style={[
                              styles.noteInput,
                              {
                                backgroundColor: colors.background,
                                borderColor: colors.border,
                                color: colors.textPrimary,
                              },
                            ]}
                            placeholder="Nhập ghi chú (VD: số điện 1450, vòi sen nước yếu...)"
                            placeholderTextColor={colors.textSecondary}
                            value={itemNote}
                            onChangeText={(txt) => handleUpdateNote(item.id, txt)}
                            autoFocus
                          />
                          <TouchableOpacity
                            style={[styles.noteSaveBtn, { backgroundColor: colors.primary }]}
                            onPress={() => setActiveNoteItemId(null)}
                          >
                            <Text style={styles.noteSaveBtnText}>Lưu</Text>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.addNoteBtn}
                          onPress={() => setActiveNoteItemId(item.id)}
                        >
                          <Text style={[styles.addNoteBtnText, { color: colors.primary }]}>
                            {itemNote ? '✏️ Sửa ghi chú' : '+ Thêm ghi chú cho mục này'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                })}
              </View>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Button
            title={`Hoàn tất kiểm tra (${completedCount}/${totalCount})`}
            variant="primary"
            onPress={onClose}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  roomCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 18,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  roomAddress: {
    fontSize: 13,
    marginBottom: 12,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  itemCard: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  criticalTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  criticalTagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  itemInstruction: {
    fontSize: 12,
    lineHeight: 17,
  },
  noteDisplayBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    marginLeft: 36,
  },
  noteDisplayText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  addNoteBtn: {
    marginTop: 6,
    marginLeft: 36,
    paddingVertical: 2,
  },
  addNoteBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  noteEditorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 36,
    gap: 8,
  },
  noteInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
  },
  noteSaveBtn: {
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
});
