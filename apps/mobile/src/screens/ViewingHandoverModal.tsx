import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  PropertyHandoverRecord,
  HandoverItemCheck,
  HandoverItemCondition,
  validateHandoverRecord,
  createDefaultHandoverRecord,
} from '@troviet/shared';

interface ViewingHandoverModalProps {
  visible: boolean;
  handover?: PropertyHandoverRecord | null;
  contractId?: string;
  listingId?: string;
  listingTitle?: string;
  onClose: () => void;
  onSaved?: (handover: PropertyHandoverRecord) => void;
}

export const ViewingHandoverModal: React.FC<ViewingHandoverModalProps> = ({
  visible,
  handover: initialHandover,
  contractId,
  listingId,
  listingTitle,
  onClose,
  onSaved,
}) => {
  const { colors, isDark } = useTheme();
  const { currentUser, contracts, handovers, saveHandover } = useApp();

  // Find linked contract if any
  const matchedContract = useMemo(() => {
    if (contractId) {
      return contracts.find((c) => c.id === contractId);
    }
    if (initialHandover?.contractId) {
      return contracts.find((c) => c.id === initialHandover.contractId);
    }
    return null;
  }, [contractId, initialHandover, contracts]);

  const targetListingId = listingId || matchedContract?.listingId || 'list-demo-01';
  const targetListingTitle = listingTitle || matchedContract?.listingTitle || 'Phòng trọ cao cấp';
  const targetContractId = contractId || initialHandover?.contractId || matchedContract?.id || 'demo-contract-01';

  // State for form
  const [currentRecord, setCurrentRecord] = useState<PropertyHandoverRecord>(() => {
    if (initialHandover) return initialHandover;
    return createDefaultHandoverRecord({
      id: `handover-${Date.now()}`,
      contractId: targetContractId,
      listingId: targetListingId,
      listingTitle: targetListingTitle,
      landlordId: matchedContract?.landlordId || 'landlord-demo',
      landlordName: matchedContract?.landlordName || 'Chủ trọ Nguyễn Văn An',
      tenantId: currentUser?.id || 'tenant-demo',
      tenantName: currentUser?.fullName || 'Người thuê Trọ Việt',
    });
  });

  const [saving, setSaving] = useState(false);
  const [newCustomItemName, setNewCustomItemName] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Sync when initialHandover or modal visibility changes
  useEffect(() => {
    if (initialHandover) {
      setCurrentRecord(initialHandover);
    } else if (visible) {
      const existing = handovers.find(
        (h) => (contractId && h.contractId === contractId) || (listingId && h.listingId === listingId)
      );
      if (existing) {
        setCurrentRecord(existing);
      } else {
        setCurrentRecord(
          createDefaultHandoverRecord({
            id: `handover-${Date.now()}`,
            contractId: targetContractId,
            listingId: targetListingId,
            listingTitle: targetListingTitle,
            landlordId: matchedContract?.landlordId || 'landlord-demo',
            landlordName: matchedContract?.landlordName || 'Chủ trọ Nguyễn Văn An',
            tenantId: currentUser?.id || 'tenant-demo',
            tenantName: currentUser?.fullName || 'Người thuê Trọ Việt',
          })
        );
      }
    }
  }, [
    initialHandover,
    visible,
    contractId,
    listingId,
    handovers,
    targetContractId,
    targetListingId,
    targetListingTitle,
    currentUser,
    matchedContract,
  ]);

  // Validation
  const validation = useMemo(() => {
    return validateHandoverRecord(currentRecord);
  }, [currentRecord]);

  // Meter reading handlers
  const handleUpdateElectricity = (val: string) => {
    const num = parseFloat(val) || 0;
    setCurrentRecord((prev) => ({
      ...prev,
      initialElectricityMeter: num,
    }));
  };

  const handleUpdateWater = (val: string) => {
    const num = parseFloat(val) || 0;
    setCurrentRecord((prev) => ({
      ...prev,
      initialWaterMeter: num,
    }));
  };

  // Item condition handlers
  const handleUpdateItemCondition = (
    itemId: string,
    condition: HandoverItemCondition
  ) => {
    setCurrentRecord((prev) => ({
      ...prev,
      itemChecklist: prev.itemChecklist.map((item) =>
        item.id === itemId ? { ...item, condition } : item
      ),
    }));
  };

  const handleUpdateItemNotes = (itemId: string, notes: string) => {
    setCurrentRecord((prev) => ({
      ...prev,
      itemChecklist: prev.itemChecklist.map((item) =>
        item.id === itemId ? { ...item, notes } : item
      ),
    }));
  };

  // Add custom equipment item
  const handleAddCustomItem = () => {
    const trimmed = newCustomItemName.trim();
    if (!trimmed) return;
    const newItem: HandoverItemCheck = {
      id: `custom_${Date.now()}`,
      category: 'furniture_appliances',
      name: trimmed,
      condition: 'good',
      notes: '',
    };
    setCurrentRecord((prev) => ({
      ...prev,
      itemChecklist: [...prev.itemChecklist, newItem],
    }));
    setNewCustomItemName('');
    setShowAddCustom(false);
  };

  // Remove custom item
  const handleRemoveCustomItem = (itemId: string) => {
    setCurrentRecord((prev) => ({
      ...prev,
      itemChecklist: prev.itemChecklist.filter((item) => item.id !== itemId),
    }));
  };

  // Sign-off toggles
  const handleToggleTenantConfirm = () => {
    setCurrentRecord((prev) => {
      const nowConfirmed = !prev.tenantConfirmed;
      const isBothConfirmed = nowConfirmed && prev.landlordConfirmed;
      return {
        ...prev,
        tenantConfirmed: nowConfirmed,
        tenantConfirmedAt: nowConfirmed ? new Date().toISOString() : undefined,
        status: isBothConfirmed ? 'completed' : 'draft',
      };
    });
  };

  const handleToggleLandlordConfirm = () => {
    setCurrentRecord((prev) => {
      const nowConfirmed = !prev.landlordConfirmed;
      const isBothConfirmed = nowConfirmed && prev.tenantConfirmed;
      return {
        ...prev,
        landlordConfirmed: nowConfirmed,
        landlordConfirmedAt: nowConfirmed ? new Date().toISOString() : undefined,
        status: isBothConfirmed ? 'completed' : 'draft',
      };
    });
  };

  // Save record
  const handleSave = async () => {
    if (!validation.valid) {
      Alert.alert(
        'Chưa thể lưu biên bản',
        `Vui lòng kiểm tra lại các thông tin bắt buộc:\n- ${validation.errors.join('\n- ')}`
      );
      return;
    }

    try {
      setSaving(true);
      await saveHandover(currentRecord);
      Alert.alert(
        'Đã lưu biên bản!',
        currentRecord.status === 'completed'
          ? 'Biên bản bàn giao đã được ký xác nhận 2 bên và hoàn tất làm căn cứ pháp lý.'
          : 'Đã lưu bản nháp biên bản bàn giao thành công.'
      );
      if (onSaved) onSaved(currentRecord);
      onClose();
    } catch {
      Alert.alert('Lỗi', 'Không thể lưu biên bản lúc này. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const categoryLabels: Record<HandoverItemCheck['category'], string> = {
    keys_security: '🔑 Chìa khóa & An ninh',
    furniture_appliances: '🛋️ Nội thất & Gia dụng',
    infrastructure: '🚿 Hạ tầng & Vệ sinh',
  };

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<HandoverItemCheck['category'], HandoverItemCheck[]> = {
      keys_security: [],
      furniture_appliances: [],
      infrastructure: [],
    };
    for (const item of currentRecord.itemChecklist) {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    }
    return groups;
  }, [currentRecord.itemChecklist]);

  const statusLabel =
    currentRecord.status === 'completed'
      ? 'Đã xác nhận 2 bên'
      : 'Bản nháp bàn giao';

  const statusColor =
    currentRecord.status === 'completed' ? colors.success : colors.warning;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: colors.border },
          ]}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={[styles.closeText, { color: colors.primary }]}>← Đóng</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
            Biên bản bàn giao phòng
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Status banner */}
          <View
            style={[
              styles.statusBanner,
              {
                backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
                borderColor: statusColor,
              },
            ]}
          >
            <View style={styles.statusRow}>
              <View style={styles.badgeRow}>
                <View
                  style={[styles.statusDot, { backgroundColor: statusColor }]}
                />
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusLabel}
                </Text>
              </View>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                Ngày lập: {currentRecord.handoverDate || new Date().toISOString().slice(0, 10)}
              </Text>
            </View>

            <Text style={[styles.propTitle, { color: colors.textPrimary }]}>
              🏡 {targetListingTitle}
            </Text>
            <Text style={[styles.propSub, { color: colors.textSecondary }]}>
              Mã hợp đồng: {currentRecord.contractId} • Mã bàn giao: {currentRecord.id}
            </Text>
          </View>

          {/* Legal Warning Notice */}
          <View
            style={[
              styles.legalNotice,
              {
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.12)' : '#EFF6FF',
                borderColor: colors.primary,
              },
            ]}
          >
            <Text style={[styles.legalNoticeTitle, { color: colors.primary }]}>
              ⚖️ Căn cứ pháp lý tính hoá đơn sinh hoạt
            </Text>
            <Text
              style={[
                styles.legalNoticeText,
                { color: isDark ? '#93C5FD' : '#1E40AF' },
              ]}
            >
              Chỉ số điện (kWh) và nước (m³) ghi nhận tại biên bản này là căn cứ
              bắt buộc để tính tiền sử dụng hàng tháng của bên thuê. Không ước tính,
              không làm tròn sai lệch.
            </Text>
          </View>

          {/* SECTION 1: Meter Readings */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ⚡ Chỉ số đồng hồ khởi điểm lúc nhận phòng
            </Text>

            {/* Electricity */}
            <View style={styles.meterRow}>
              <View style={styles.meterCol}>
                <Text style={[styles.meterLabel, { color: colors.textPrimary }]}>
                  Đồng hồ Điện (kWh) <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.meterInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor:
                        currentRecord.initialElectricityMeter < 0
                          ? colors.error
                          : colors.border,
                    },
                  ]}
                  keyboardType="numeric"
                  value={String(currentRecord.initialElectricityMeter ?? 0)}
                  onChangeText={handleUpdateElectricity}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {/* Water */}
              <View style={styles.meterCol}>
                <Text style={[styles.meterLabel, { color: colors.textPrimary }]}>
                  Đồng hồ Nước (m³) <Text style={{ color: colors.error }}>*</Text>
                </Text>
                <TextInput
                  style={[
                    styles.meterInput,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor:
                        currentRecord.initialWaterMeter < 0
                          ? colors.error
                          : colors.border,
                    },
                  ]}
                  keyboardType="numeric"
                  value={String(currentRecord.initialWaterMeter ?? 0)}
                  onChangeText={handleUpdateWater}
                  placeholder="0"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Photo evidence banner */}
            <View style={styles.photoEvidenceRow}>
              <View
                style={[
                  styles.photoChip,
                  {
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.photoChipText, { color: colors.textPrimary }]}>
                  📷 Ảnh công tơ điện: {currentRecord.electricityMeterPhotoUrl ? 'Đã đính kèm' : 'Chưa chụp'}
                </Text>
              </View>
              <View
                style={[
                  styles.photoChip,
                  {
                    backgroundColor: isDark ? '#334155' : '#F1F5F9',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.photoChipText, { color: colors.textPrimary }]}>
                  📷 Ảnh công tơ nước: {currentRecord.waterMeterPhotoUrl ? 'Đã đính kèm' : 'Chưa chụp'}
                </Text>
              </View>
            </View>
          </View>

          {/* SECTION 2: Equipment & Furniture Checklist */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                🛋️ Kiểm kê trang thiết bị ({currentRecord.itemChecklist.length} mục)
              </Text>
              <TouchableOpacity
                onPress={() => setShowAddCustom(true)}
                style={[
                  styles.addCustomBtn,
                  { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                ]}
              >
                <Text style={[styles.addCustomText, { color: colors.primary }]}>
                  + Thêm mục
                </Text>
              </TouchableOpacity>
            </View>

            {showAddCustom && (
              <View
                style={[
                  styles.addCustomBox,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: colors.primary,
                  },
                ]}
              >
                <Text style={[styles.addCustomLabel, { color: colors.textPrimary }]}>
                  Tên thiết bị / tài sản kiểm kê:
                </Text>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      backgroundColor: colors.background,
                      color: colors.textPrimary,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Ví dụ: Tủ lạnh mini, Quạt trần..."
                  placeholderTextColor={colors.textSecondary}
                  value={newCustomItemName}
                  onChangeText={setNewCustomItemName}
                />
                <View style={styles.addCustomActions}>
                  <TouchableOpacity
                    onPress={() => {
                      setShowAddCustom(false);
                      setNewCustomItemName('');
                    }}
                    style={styles.cancelCustomBtn}
                  >
                    <Text style={{ color: colors.textSecondary }}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleAddCustomItem}
                    style={[styles.confirmCustomBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Thêm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {(Object.keys(categoryLabels) as Array<HandoverItemCheck['category']>).map((catKey) => {
              const items = groupedItems[catKey] || [];
              if (items.length === 0) return null;

              return (
                <View key={catKey} style={styles.categoryBlock}>
                  <Text style={[styles.categoryHeading, { color: colors.primary }]}>
                    {categoryLabels[catKey]}
                  </Text>

                  {items.map((item) => {
                    const isCustom = item.id.startsWith('custom_');
                    return (
                      <View
                        key={item.id}
                        style={[
                          styles.itemCard,
                          {
                            backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.itemHeader}>
                          <Text
                            style={[
                              styles.itemName,
                              { color: colors.textPrimary },
                            ]}
                          >
                            {item.name}
                          </Text>
                          {isCustom && (
                            <TouchableOpacity
                              onPress={() => handleRemoveCustomItem(item.id)}
                            >
                              <Text style={{ color: colors.error, fontSize: 13 }}>
                                Xóa
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Condition selection buttons */}
                        <View style={styles.conditionRow}>
                          <TouchableOpacity
                            style={[
                              styles.conditionBtn,
                              item.condition === 'good' && {
                                backgroundColor: colors.success,
                              },
                              { borderColor: colors.border },
                            ]}
                            onPress={() =>
                              handleUpdateItemCondition(item.id, 'good')
                            }
                          >
                            <Text
                              style={[
                                styles.conditionBtnText,
                                {
                                  color:
                                    item.condition === 'good'
                                      ? '#FFFFFF'
                                      : colors.textSecondary,
                                },
                              ]}
                            >
                              ✓ Tốt
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.conditionBtn,
                              item.condition === 'fair' && {
                                backgroundColor: colors.warning,
                              },
                              { borderColor: colors.border },
                            ]}
                            onPress={() =>
                              handleUpdateItemCondition(item.id, 'fair')
                            }
                          >
                            <Text
                              style={[
                                styles.conditionBtnText,
                                {
                                  color:
                                    item.condition === 'fair'
                                      ? '#FFFFFF'
                                      : colors.textSecondary,
                                },
                              ]}
                            >
                              – Bình thường
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.conditionBtn,
                              item.condition === 'damaged' && {
                                backgroundColor: colors.error,
                              },
                              { borderColor: colors.border },
                            ]}
                            onPress={() =>
                              handleUpdateItemCondition(item.id, 'damaged')
                            }
                          >
                            <Text
                              style={[
                                styles.conditionBtnText,
                                {
                                  color:
                                    item.condition === 'damaged'
                                      ? '#FFFFFF'
                                      : colors.textSecondary,
                                },
                              ]}
                            >
                              ✕ Hỏng
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[
                              styles.conditionBtn,
                              item.condition === 'missing' && {
                                backgroundColor: isDark ? '#475569' : '#64748B',
                              },
                              { borderColor: colors.border },
                            ]}
                            onPress={() =>
                              handleUpdateItemCondition(item.id, 'missing')
                            }
                          >
                            <Text
                              style={[
                                styles.conditionBtnText,
                                {
                                  color:
                                    item.condition === 'missing'
                                      ? '#FFFFFF'
                                      : colors.textSecondary,
                                },
                              ]}
                            >
                              ? Thiếu
                            </Text>
                          </TouchableOpacity>
                        </View>

                        {/* Notes input */}
                        <TextInput
                          style={[
                            styles.itemNotesInput,
                            {
                              backgroundColor: colors.background,
                              color: colors.textPrimary,
                              borderColor: colors.border,
                            },
                          ]}
                          placeholder="Ghi chú hiện trạng (vết xước, phụ kiện đính kèm...)"
                          placeholderTextColor={colors.textSecondary}
                          value={item.notes || ''}
                          onChangeText={(t) =>
                            handleUpdateItemNotes(item.id, t)
                          }
                        />
                      </View>
                    );
                  })}
                </View>
              );
            })}
          </View>

          {/* SECTION 3: General Remarks */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              📝 Ghi chú chung & Cam kết bổ sung
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  backgroundColor: colors.background,
                  color: colors.textPrimary,
                  borderColor: colors.border,
                },
              ]}
              multiline
              numberOfLines={3}
              value={currentRecord.generalNotes || ''}
              onChangeText={(t) =>
                setCurrentRecord((prev) => ({ ...prev, generalNotes: t }))
              }
              placeholder="Ví dụ: Đã bàn giao 02 chìa khóa phòng, 01 thẻ từ thang máy..."
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* SECTION 4: Dual Party Sign-off */}
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
              ✍️ Ký số & Xác nhận 2 bên
            </Text>

            {/* Tenant Sign */}
            <View
              style={[
                styles.signBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: currentRecord.tenantConfirmed
                    ? colors.success
                    : colors.border,
                },
              ]}
            >
              <View style={styles.signHeader}>
                <Text style={[styles.signRole, { color: colors.textPrimary }]}>
                  Bên thuê (Người nhận phòng)
                </Text>
                <Text
                  style={[
                    styles.signStatusBadge,
                    {
                      color: currentRecord.tenantConfirmed
                        ? colors.success
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {currentRecord.tenantConfirmed ? '✓ Đã xác nhận' : 'Chưa xác nhận'}
                </Text>
              </View>
              <Text style={[styles.signDetail, { color: colors.textSecondary }]}>
                {currentRecord.tenantName}
                {currentRecord.tenantConfirmedAt
                  ? ` • Ký lúc ${currentRecord.tenantConfirmedAt.slice(0, 16).replace('T', ' ')}`
                  : ''}
              </Text>
              <TouchableOpacity
                style={[
                  styles.confirmToggleBtn,
                  {
                    backgroundColor: currentRecord.tenantConfirmed
                      ? isDark
                        ? '#334155'
                        : '#E2E8F0'
                      : colors.primary,
                  },
                ]}
                onPress={handleToggleTenantConfirm}
              >
                <Text
                  style={[
                    styles.confirmToggleText,
                    {
                      color: currentRecord.tenantConfirmed
                        ? colors.textPrimary
                        : '#FFFFFF',
                    },
                  ]}
                >
                  {currentRecord.tenantConfirmed
                    ? 'Huỷ xác nhận bên thuê'
                    : 'Bên thuê: Xác nhận nhận phòng & công tơ'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Landlord Sign */}
            <View
              style={[
                styles.signBox,
                {
                  backgroundColor: isDark ? '#0F172A' : '#F8FAFC',
                  borderColor: currentRecord.landlordConfirmed
                    ? colors.success
                    : colors.border,
                },
              ]}
            >
              <View style={styles.signHeader}>
                <Text style={[styles.signRole, { color: colors.textPrimary }]}>
                  Bên cho thuê (Chủ nhà)
                </Text>
                <Text
                  style={[
                    styles.signStatusBadge,
                    {
                      color: currentRecord.landlordConfirmed
                        ? colors.success
                        : colors.textSecondary,
                    },
                  ]}
                >
                  {currentRecord.landlordConfirmed ? '✓ Đã xác nhận' : 'Chưa xác nhận'}
                </Text>
              </View>
              <Text style={[styles.signDetail, { color: colors.textSecondary }]}>
                {currentRecord.landlordName}
                {currentRecord.landlordConfirmedAt
                  ? ` • Ký lúc ${currentRecord.landlordConfirmedAt.slice(0, 16).replace('T', ' ')}`
                  : ''}
              </Text>
              <TouchableOpacity
                style={[
                  styles.confirmToggleBtn,
                  {
                    backgroundColor: currentRecord.landlordConfirmed
                      ? isDark
                        ? '#334155'
                        : '#E2E8F0'
                      : colors.primary,
                  },
                ]}
                onPress={handleToggleLandlordConfirm}
              >
                <Text
                  style={[
                    styles.confirmToggleText,
                    {
                      color: currentRecord.landlordConfirmed
                        ? colors.textPrimary
                        : '#FFFFFF',
                    },
                  ]}
                >
                  {currentRecord.landlordConfirmed
                    ? 'Huỷ xác nhận chủ nhà'
                    : 'Bên cho thuê: Xác nhận bàn giao phòng'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Validation warning if errors exist */}
            {!validation.valid && (
              <View
                style={[
                  styles.warnBox,
                  {
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEF2F2',
                    borderColor: colors.error,
                  },
                ]}
              >
                <Text style={[styles.warnTitle, { color: colors.error }]}>
                  ⚠️ Lưu ý cần hoàn tất trước khi lưu:
                </Text>
                {validation.errors.map((err, idx) => (
                  <Text key={idx} style={[styles.warnItem, { color: colors.error }]}>
                    • {err}
                  </Text>
                ))}
              </View>
            )}
          </View>

          {/* Action buttons */}
          <View style={styles.actionContainer}>
            <Button
              title={saving ? 'Đang lưu...' : 'Lưu biên bản bàn giao'}
              onPress={handleSave}
              disabled={saving}
            />
          </View>
        </ScrollView>
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
    paddingTop: 48,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  closeBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  closeText: {
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBanner: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 12,
  },
  propTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  propSub: {
    fontSize: 13,
    marginTop: 2,
  },
  legalNotice: {
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  legalNoticeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  legalNoticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  meterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  meterCol: {
    flex: 1,
  },
  meterLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  meterInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoEvidenceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  photoChip: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  photoChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addCustomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addCustomText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addCustomBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
  },
  addCustomLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputField: {
    height: 40,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 14,
    marginBottom: 8,
  },
  addCustomActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    alignItems: 'center',
  },
  cancelCustomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confirmCustomBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  categoryBlock: {
    marginBottom: 14,
  },
  categoryHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  itemCard: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  conditionBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  conditionBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  itemNotesInput: {
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    fontSize: 13,
  },
  textArea: {
    height: 72,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  signBox: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  signHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  signRole: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  signStatusBadge: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  signDetail: {
    fontSize: 12,
    marginBottom: 8,
  },
  confirmToggleBtn: {
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  confirmToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  warnBox: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  warnTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warnItem: {
    fontSize: 12,
    lineHeight: 18,
  },
  actionContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
});
