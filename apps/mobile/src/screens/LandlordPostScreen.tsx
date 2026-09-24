import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import {
  PropertyType,
  STANDARD_AMENITIES,
  Amenity,
} from '@troviet/shared';

const WARDS = [
  { code: '48_HAICHAU1', name: 'Phường Hải Châu I' },
  { code: '48_PHUOCMY', name: 'Phường Phước Mỹ' },
  { code: '48_HOAKHANHBAC', name: 'Phường Hòa Khánh Bắc' },
  { code: '48_HOACUONGNAM', name: 'Phường Hòa Cường Nam' },
];

export const LandlordPostScreen: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { colors } = useTheme();
  const { currentUser, createListing } = useApp();

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('room');
  const [areaSquareMeters, setAreaSquareMeters] = useState('25');
  const [selectedWardCode, setSelectedWardCode] = useState(WARDS[0].code);
  const [street, setStreet] = useState('');
  const [houseNumber, setHouseNumber] = useState('');

  // Costs (Integer VND)
  const [monthlyRent, setMonthlyRent] = useState('2500000');
  const [deposit, setDeposit] = useState('2500000');
  const [electricityRate, setElectricityRate] = useState('3500');
  const [waterRate, setWaterRate] = useState('50000');
  const [internetRate, setInternetRate] = useState('80000');
  const [parkingRate, setParkingRate] = useState('50000');
  const [hasParking, setHasParking] = useState(true);

  // Selected Amenities
  const [selectedAmenityCodes, setSelectedAmenityCodes] = useState<string[]>([
    'air_conditioner',
    'private_bathroom',
  ]);

  const toggleAmenity = (code: string) => {
    setSelectedAmenityCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  const handleSubmit = () => {
    if (!title.trim() || !street.trim() || !houseNumber.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập đầy đủ tiêu đề phòng và địa chỉ chi tiết.');
      return;
    }

    const rentNum = parseInt(monthlyRent.replace(/\D/g, ''), 10) || 0;
    const depositNum = parseInt(deposit.replace(/\D/g, ''), 10) || 0;

    if (rentNum <= 0) {
      Alert.alert('Giá phòng không hợp lệ', 'Giá thuê hàng tháng phải lớn hơn 0 đồng.');
      return;
    }

    const wardObj = WARDS.find((w) => w.code === selectedWardCode) || WARDS[0];
    const selectedAmenitiesList: Amenity[] = STANDARD_AMENITIES.filter((a) =>
      selectedAmenityCodes.includes(a.code)
    );

    createListing({
      title: title.trim(),
      propertyType,
      monthlyRent: rentNum,
      deposit: depositNum,
      areaSquareMeters: parseFloat(areaSquareMeters) || 20,
      provinceCode: '48',
      wardCode: wardObj.code,
      wardName: wardObj.name,
      street: street.trim(),
      houseNumber: houseNumber.trim(),
      landlordId: currentUser?.id || 'u-landlord-anon',
      landlordName: currentUser?.fullName || 'Chủ nhà mới',
      landlordVerificationLevel: currentUser?.verificationLevel || 'L1',
      amenities: selectedAmenitiesList,
      costs: {
        monthlyRent: rentNum,
        deposit: depositNum,
        electricityBillingType: 'meter',
        electricityCostPerUnit: parseInt(electricityRate, 10) || 3500,
        waterBillingType: 'fixed_monthly',
        waterCostPerUnit: parseInt(waterRate, 10) || 50000,
        internetBillingType: 'fixed_monthly',
        internetCost: parseInt(internetRate, 10) || 80000,
        parkingBillingType: hasParking ? 'fixed_monthly' : 'unprovided',
        parkingCost: hasParking ? parseInt(parkingRate, 10) || 0 : undefined,
        serviceFeeBillingType: 'unprovided',
      },
    });

    Alert.alert(
      'Đăng tin thành công!',
      'Tin đăng của bạn đã được gửi vào hàng đợi duyệt. Admin sẽ kiểm tra và phê duyệt trước khi hiển thị công khai.',
      [{ text: 'Đồng ý', onPress: onSuccess }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>
        Đăng tin cho thuê phòng
      </Text>
      <Text style={[styles.subHeading, { color: colors.textSecondary }]}>
        Minh bạch chi phí — Tăng 80% tỷ lệ liên hệ thành công
      </Text>

      {/* Basic Info */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Thông tin cơ bản</Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tiêu đề tin đăng *</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Ví dụ: Phòng trọ gác lửng ban công gần ĐH Duy Tân"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Loại hình</Text>
        <View style={styles.chipRow}>
          {[
            { type: 'room', label: 'Phòng trọ' },
            { type: 'apartment', label: 'Căn hộ mini' },
            { type: 'house', label: 'Nhà nguyên căn' },
          ].map((item) => (
            <TouchableOpacity
              key={item.type}
              style={[
                styles.chip,
                {
                  backgroundColor: propertyType === item.type ? colors.primary : colors.background,
                  borderColor: propertyType === item.type ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setPropertyType(item.type as PropertyType)}
            >
              <Text style={{ color: propertyType === item.type ? '#FFFFFF' : colors.textPrimary, fontWeight: '600', fontSize: 13 }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Diện tích sử dụng (m²)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={areaSquareMeters}
          onChangeText={setAreaSquareMeters}
        />
      </View>

      {/* 2-tier Address */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Địa chỉ chuẩn 2 cấp</Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Thành phố</Text>
        <View style={[styles.inputDisabled, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>TP. Đà Nẵng</Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Phường / Xã *</Text>
        <View style={styles.chipRow}>
          {WARDS.map((w) => (
            <TouchableOpacity
              key={w.code}
              style={[
                styles.chip,
                {
                  backgroundColor: selectedWardCode === w.code ? colors.primary : colors.background,
                  borderColor: selectedWardCode === w.code ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedWardCode(w.code)}
            >
              <Text style={{ color: selectedWardCode === w.code ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                {w.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Tên đường *</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Ví dụ: Nguyễn Du, Võ Nguyên Giáp..."
          placeholderTextColor={colors.textSecondary}
          value={street}
          onChangeText={setStreet}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Số nhà / Kiệt hẻm *</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          placeholder="Ví dụ: 124/6"
          placeholderTextColor={colors.textSecondary}
          value={houseNumber}
          onChangeText={setHouseNumber}
        />
      </View>

      {/* Mandatory Transparent Costs */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Biểu phí minh bạch (VNĐ)</Text>

        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tiền thuê tháng (VNĐ) *</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={monthlyRent}
          onChangeText={setMonthlyRent}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Tiền cọc phòng (VNĐ)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={deposit}
          onChangeText={setDeposit}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Tiền điện (VNĐ / kWh)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={electricityRate}
          onChangeText={setElectricityRate}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Tiền nước (VNĐ / người / tháng)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={waterRate}
          onChangeText={setWaterRate}
        />

        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 12 }]}>Internet / Wifi (VNĐ / tháng)</Text>
        <TextInput
          style={[styles.input, { color: colors.textPrimary, borderColor: colors.border, backgroundColor: colors.background }]}
          keyboardType="numeric"
          value={internetRate}
          onChangeText={setInternetRate}
        />
      </View>

      {/* Amenities */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Tiện nghi phòng</Text>
        <View style={styles.chipRow}>
          {STANDARD_AMENITIES.map((a) => {
            const checked = selectedAmenityCodes.includes(a.code);
            return (
              <TouchableOpacity
                key={a.code}
                style={[
                  styles.chip,
                  {
                    backgroundColor: checked ? colors.primary : colors.background,
                    borderColor: checked ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => toggleAmenity(a.code)}
              >
                <Text style={{ color: checked ? '#FFFFFF' : colors.textPrimary, fontSize: 12, fontWeight: '600' }}>
                  {checked ? '✓ ' : '+ '}
                  {a.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Submit Button */}
      <View style={{ marginTop: 12, marginBottom: 40 }}>
        <Button title="Gửi duyệt tin đăng" variant="primary" onPress={handleSubmit} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 90,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 13,
    marginBottom: 16,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  inputDisabled: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
});
