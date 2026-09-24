/**
 * Trọ Việt - Property Handover & In-Person Viewing Companion Engine
 * Strictly adheres to SPEC Section 2, 7 & Module 22:
 * - Records initial electricity (kWh) & water (m³) meter readings at move-in.
 * - Standard inventory & condition checklist for transparent deposit return later.
 * - Two-party digital confirmation between landlord and tenant.
 */

export type HandoverItemCondition = 'good' | 'fair' | 'damaged' | 'missing';

export interface HandoverItemCheck {
  id: string;
  name: string;
  category: 'keys_security' | 'furniture_appliances' | 'infrastructure';
  condition: HandoverItemCondition;
  notes?: string;
}

export interface PropertyHandoverRecord {
  id: string;
  contractId: string;
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  handoverDate: string; // ISO date
  initialElectricityMeter: number; // kWh
  electricityMeterPhotoUrl?: string;
  initialWaterMeter: number; // m3
  waterMeterPhotoUrl?: string;
  itemChecklist: HandoverItemCheck[];
  generalNotes?: string;
  landlordConfirmed: boolean;
  tenantConfirmed: boolean;
  landlordConfirmedAt?: string;
  tenantConfirmedAt?: string;
  status: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
}

export const STANDARD_HANDOVER_ITEMS: Array<{ id: string; name: string; category: HandoverItemCheck['category'] }> = [
  { id: 'h-key-01', name: 'Chìa khóa phòng & thẻ từ thang máy/cửa cổng', category: 'keys_security' },
  { id: 'h-app-01', name: 'Máy điều hòa & Remote điều khiển', category: 'furniture_appliances' },
  { id: 'h-app-02', name: 'Bình nước nóng lạnh (hoạt động tốt)', category: 'furniture_appliances' },
  { id: 'h-app-03', name: 'Tủ lạnh & bóng đèn chiếu sáng trong phòng', category: 'furniture_appliances' },
  { id: 'h-inf-01', name: 'Vòi nước, bồn cầu & thoát sàn vệ sinh không tắc', category: 'infrastructure' },
  { id: 'h-inf-02', name: 'Cửa sổ, chốt khóa an toàn & tường không thấm mốc', category: 'infrastructure' },
];

/**
 * Validates handover meter readings and required items.
 */
export function validateHandoverRecord(record: Partial<PropertyHandoverRecord>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (record.initialElectricityMeter === undefined || record.initialElectricityMeter < 0) {
    errors.push('Chỉ số đồng hồ điện ban đầu phải là số nguyên không âm (kWh).');
  }

  if (record.initialWaterMeter === undefined || record.initialWaterMeter < 0) {
    errors.push('Chỉ số đồng hồ nước ban đầu phải là số không âm (m³).');
  }

  if (!record.landlordId || !record.tenantId) {
    errors.push('Biên bản bàn giao phải xác định rõ chủ trọ và người thuê.');
  }

  if (!record.handoverDate) {
    errors.push('Chưa chọn ngày bàn giao phòng thực tế.');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Generates an initial handover template with standard items.
 */
export function createDefaultHandoverRecord(params: {
  id: string;
  contractId: string;
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
}): PropertyHandoverRecord {
  const now = new Date().toISOString();
  return {
    id: params.id,
    contractId: params.contractId,
    listingId: params.listingId,
    listingTitle: params.listingTitle,
    landlordId: params.landlordId,
    landlordName: params.landlordName,
    tenantId: params.tenantId,
    tenantName: params.tenantName,
    handoverDate: now.split('T')[0],
    initialElectricityMeter: 0,
    initialWaterMeter: 0,
    itemChecklist: STANDARD_HANDOVER_ITEMS.map((item) => ({
      ...item,
      condition: 'good',
      notes: '',
    })),
    landlordConfirmed: false,
    tenantConfirmed: false,
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}
