/**
 * Trọ Việt - VietQR NAPAS 24/7 Payment & Rent Invoicing Engine
 * Strictly adheres to SPEC Section 4 & .agents/rules/10-security-privacy.md:
 * - Direct peer-to-peer payment to landlord bank account (NO unauthorized intermediary fund holding).
 * - Standard VietQR NAPAS parameters with automated unique invoice description.
 * - Integer VND calculations without floating point errors.
 */

export interface RentInvoiceCalculationParams {
  contractId: string;
  invoiceCode: string;
  periodMonth: string; // e.g. "10/2026"
  monthlyRent: number; // integer VND

  // Electricity
  electricityBillingType: 'meter' | 'fixed' | 'free';
  previousElectricityMeter?: number;
  currentElectricityMeter?: number;
  electricityCostPerUnit?: number; // VND per kWh

  // Water
  waterBillingType: 'meter' | 'fixed' | 'free';
  previousWaterMeter?: number;
  currentWaterMeter?: number;
  waterCostPerUnit?: number; // VND per m3 or fixed per person
  numberOfTenants?: number;

  // Other utilities
  internetCost?: number;
  parkingCost?: number;
  serviceCost?: number;
  otherCost?: number;
  otherCostDescription?: string;
}

export interface RentInvoiceLineItem {
  id: string;
  name: string;
  detail: string;
  amount: number; // integer VND
}

export interface RentInvoiceResult {
  invoiceCode: string;
  periodMonth: string;
  lineItems: RentInvoiceLineItem[];
  totalAmount: number; // integer VND
  electricityUsageKwh?: number;
  waterUsageM3?: number;
}

export interface VietQROptions {
  bankBin: string; // e.g. '970407' (Techcombank), '970436' (Vietcombank), '970415' (VietinBank), '970418' (BIDV), '970422' (MB)
  bankName: string;
  accountNumber: string;
  accountName: string;
  amount: number; // integer VND
  description: string; // e.g. "TROVIET HD20261001"
}

// Popular Vietnamese Bank BIN codes for convenience
export const POPULAR_VIETNAMESE_BANKS: Record<string, { bin: string; name: string; shortName: string }> = {
  VCB: { bin: '970436', name: 'Ngân hàng TMCP Ngoại thương Việt Nam', shortName: 'Vietcombank' },
  TCB: { bin: '970407', name: 'Ngân hàng TMCP Kỹ thương Việt Nam', shortName: 'Techcombank' },
  MB: { bin: '970422', name: 'Ngân hàng TMCP Quân đội', shortName: 'MBBank' },
  CTG: { bin: '970415', name: 'Ngân hàng TMCP Công thương Việt Nam', shortName: 'VietinBank' },
  BIDV: { bin: '970418', name: 'Ngân hàng TMCP Đầu tư và Phát triển VN', shortName: 'BIDV' },
  ACB: { bin: '970416', name: 'Ngân hàng TMCP Á Châu', shortName: 'ACB' },
  TPB: { bin: '970423', name: 'Ngân hàng TMCP Tiên Phong', shortName: 'TPBank' },
};

/**
 * Calculates itemized rent invoice with precise integer VND amounts.
 */
export function calculateMonthlyInvoice(params: RentInvoiceCalculationParams): RentInvoiceResult {
  const lineItems: RentInvoiceLineItem[] = [];
  let total = 0;

  // 1. Room Rent
  const rent = Math.round(params.monthlyRent);
  lineItems.push({
    id: 'room-rent',
    name: 'Tiền thuê phòng',
    detail: `Tiền phòng tháng ${params.periodMonth}`,
    amount: rent,
  });
  total += rent;

  // 2. Electricity
  let electricityUsageKwh: number | undefined;
  if (params.electricityBillingType === 'meter') {
    const prev = params.previousElectricityMeter ?? 0;
    const curr = params.currentElectricityMeter ?? prev;
    electricityUsageKwh = Math.max(0, curr - prev);
    const unitPrice = params.electricityCostPerUnit ?? 3500;
    const elecAmount = Math.round(electricityUsageKwh * unitPrice);

    lineItems.push({
      id: 'electricity',
      name: 'Tiền điện',
      detail: `${electricityUsageKwh} kWh (${prev} → ${curr}) × ${unitPrice.toLocaleString('vi-VN')} đ`,
      amount: elecAmount,
    });
    total += elecAmount;
  } else if (params.electricityBillingType === 'fixed') {
    const fixedElec = Math.round(params.electricityCostPerUnit ?? 0);
    if (fixedElec > 0) {
      lineItems.push({
        id: 'electricity',
        name: 'Tiền điện',
        detail: 'Khoán cố định hàng tháng',
        amount: fixedElec,
      });
      total += fixedElec;
    }
  }

  // 3. Water
  let waterUsageM3: number | undefined;
  if (params.waterBillingType === 'meter') {
    const prev = params.previousWaterMeter ?? 0;
    const curr = params.currentWaterMeter ?? prev;
    waterUsageM3 = Math.max(0, curr - prev);
    const unitPrice = params.waterCostPerUnit ?? 15000;
    const waterAmount = Math.round(waterUsageM3 * unitPrice);

    lineItems.push({
      id: 'water',
      name: 'Tiền nước',
      detail: `${waterUsageM3} m³ (${prev} → ${curr}) × ${unitPrice.toLocaleString('vi-VN')} đ`,
      amount: waterAmount,
    });
    total += waterAmount;
  } else if (params.waterBillingType === 'fixed') {
    const tenants = params.numberOfTenants ?? 1;
    const rate = params.waterCostPerUnit ?? 50000;
    const waterAmount = Math.round(rate * tenants);

    lineItems.push({
      id: 'water',
      name: 'Tiền nước',
      detail: `${tenants} người × ${rate.toLocaleString('vi-VN')} đ/người`,
      amount: waterAmount,
    });
    total += waterAmount;
  }

  // 4. Internet
  if (params.internetCost && params.internetCost > 0) {
    const net = Math.round(params.internetCost);
    lineItems.push({
      id: 'internet',
      name: 'Tiền mạng internet',
      detail: 'Cước cố định tháng',
      amount: net,
    });
    total += net;
  }

  // 5. Parking
  if (params.parkingCost && params.parkingCost > 0) {
    const park = Math.round(params.parkingCost);
    lineItems.push({
      id: 'parking',
      name: 'Phí giữ xe',
      detail: 'Phí giữ xe tháng',
      amount: park,
    });
    total += park;
  }

  // 6. Service / Cleaning
  if (params.serviceCost && params.serviceCost > 0) {
    const srv = Math.round(params.serviceCost);
    lineItems.push({
      id: 'service',
      name: 'Phí dịch vụ & rác',
      detail: 'Vệ sinh hành lang & rác thải sinh hoạt',
      amount: srv,
    });
    total += srv;
  }

  // 7. Other
  if (params.otherCost && params.otherCost > 0) {
    const oth = Math.round(params.otherCost);
    lineItems.push({
      id: 'other',
      name: params.otherCostDescription || 'Phí khác',
      detail: 'Chi phí phát sinh đã thỏa thuận',
      amount: oth,
    });
    total += oth;
  }

  return {
    invoiceCode: params.invoiceCode,
    periodMonth: params.periodMonth,
    lineItems,
    totalAmount: total,
    electricityUsageKwh,
    waterUsageM3,
  };
}

/**
 * Generates VietQR standard quick image URL and deep-link payload.
 * Compliant with NAPAS 24/7 bank transfer standards.
 */
export function generateVietQRLink(options: VietQROptions): {
  qrImageUrl: string;
  transferSyntax: string;
  sanitizedAmount: number;
} {
  const sanitizedAmount = Math.max(0, Math.round(options.amount));
  const encodedAccountName = encodeURIComponent(options.accountName.toUpperCase());
  const encodedDescription = encodeURIComponent(options.description.trim());

  // Compact2 template from VietQR official format
  const qrImageUrl = `https://img.vietqr.io/image/${options.bankBin}-${options.accountNumber}-compact2.png?amount=${sanitizedAmount}&addInfo=${encodedDescription}&accountName=${encodedAccountName}`;

  return {
    qrImageUrl,
    transferSyntax: options.description.trim(),
    sanitizedAmount,
  };
}
