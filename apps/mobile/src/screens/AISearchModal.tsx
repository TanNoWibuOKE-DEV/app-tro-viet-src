import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Button } from '../components/Button';

interface AISearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSearch: (prompt: string) => void;
}

const AI_SUGGESTIONS = [
  'Phòng dưới 2 triệu',
  'Gần Đại học Duy Tân',
  'Có máy lạnh',
  'WC riêng',
  'Khu Phước Mỹ gần biển',
  'Phòng trọ có gác lửng',
  'Giờ giấc tự do, không chung chủ',
];

export const AISearchModal: React.FC<AISearchModalProps> = ({
  visible,
  onClose,
  onSearch,
}) => {
  const { colors } = useTheme();
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (textToSearch?: string) => {
    const query = (textToSearch || prompt).trim();
    if (!query) return;
    onSearch(query);
    onClose();
    setPrompt('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityRole="button">
            <Text style={[styles.backText, { color: colors.primary }]}>← Trở lại</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Tìm phòng bằng AI
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Question Title */}
          <Text style={[styles.heading, { color: colors.textPrimary }]}>
            Bạn đang tìm gì?
          </Text>
          <Text style={[styles.subheading, { color: colors.textSecondary }]}>
            Mô tả bằng ngôn ngữ tự nhiên: khu vực, ngân sách hoặc tiện nghi mong muốn.
          </Text>

          {/* Prompt Input Box */}
          <View style={[styles.inputBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              style={[styles.input, { color: colors.textPrimary }]}
              placeholder="VD: Phòng dưới 2 triệu gần Đại học Duy Tân có máy lạnh..."
              placeholderTextColor={colors.textSecondary}
              value={prompt}
              onChangeText={setPrompt}
              multiline
              numberOfLines={4}
              autoFocus={true}
              textAlignVertical="top"
            />
            {prompt.length > 0 && (
              <TouchableOpacity
                onPress={() => setPrompt('')}
                style={styles.clearBtn}
                accessibilityRole="button"
              >
                <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Xóa nhập lại</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Suggestions Section */}
          <Text style={[styles.suggestionsLabel, { color: colors.textSecondary }]}>
            Gợi ý tìm kiếm phổ biến:
          </Text>
          <View style={styles.suggestionsWrap}>
            {AI_SUGGESTIONS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.suggestionChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
                onPress={() => {
                  setPrompt(item);
                  handleSubmit(item);
                }}
              >
                <Text style={[styles.chipText, { color: colors.textPrimary }]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Button */}
          <View style={styles.actionContainer}>
            <Button
              title="🔍 Tìm phòng"
              variant="primary"
              onPress={() => handleSubmit()}
              disabled={prompt.trim().length === 0}
            />
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  subheading: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  inputBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    minHeight: 120,
    marginBottom: 24,
  },
  input: {
    fontSize: 15,
    lineHeight: 22,
    minHeight: 80,
  },
  clearBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  suggestionsLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  suggestionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionContainer: {
    marginTop: 8,
  },
});
