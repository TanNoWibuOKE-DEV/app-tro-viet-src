/**
 * Trọ Việt - Standard Lease Agreement Template (Hợp đồng thuê phòng trọ mẫu)
 * Standard Vietnamese residential rental agreement structure.
 * Currency in integer VND, 2-tier address system.
 */

export interface ContractParty {
  fullName: string;
  phoneNumber: string;
  idCardNumber?: string;
  address?: string;
}

export interface ContractUtilityTerms {
  electricityBillingType: 'meter' | 'fixed' | 'free';
  electricityPricePerUnit?: number; // integer VND per kWh
  waterBillingType: 'meter' | 'fixed' | 'free';
  waterPricePerUnit?: number; // integer VND per m3 or per person
  internetPriceMonthly?: number; // integer VND
  parkingPriceMonthly?: number; // integer VND
  servicePriceMonthly?: number; // integer VND
}

export interface LeaseContractData {
  id: string;
  contractNumber: string;
  listingId: string;
  landlord: ContractParty;
  tenant: ContractParty;
  propertyAddress: {
    houseNumber: string;
    street: string;
    wardName: string;
    wardCode: string;
    provinceName: string;
    provinceCode: string;
  };
  startDate: string; // ISO Date YYYY-MM-DD
  endDate: string; // ISO Date YYYY-MM-DD
  monthlyRent: number; // integer VND
  depositAmount: number; // integer VND
  paymentDayOfMonth: number; // 1-31
  utilities: ContractUtilityTerms;
  additionalRules?: string[];
  landlordSignature?: {
    signedAt: string;
    signedByName: string;
  };
  tenantSignature?: {
    signedAt: string;
    signedByName: string;
  };
  status: 'draft' | 'pending_signature' | 'active' | 'terminated' | 'expired';
  createdAt: string;
  updatedAt: string;
}

/**
 * Generates human-readable contract text from structured contract data.
 */
export function generateContractText(contract: LeaseContractData): string {
  return `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc
-------------------------------
HỢP ĐỒNG THUÊ PHÒNG TRỌ
Số: ${contract.contractNumber}

Hôm nay, ngày ký kết hợp đồng, hai bên gồm có:

BÊN CHO THUÊ (BÊN A):
- Họ và tên: ${contract.landlord.fullName}
- Số điện thoại: ${contract.landlord.phoneNumber}
- Số CCCD: ${contract.landlord.idCardNumber || 'Chưa cung cấp'}

BÊN THUÊ (BÊN B):
- Họ và tên: ${contract.tenant.fullName}
- Số điện thoại: ${contract.tenant.phoneNumber}
- Số CCCD: ${contract.tenant.idCardNumber || 'Chưa cung cấp'}

Sau khi trao đổi, hai bên đồng ý ký kết hợp đồng thuê phòng với các điều khoản sau:

ĐIỀU 1: ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ
1.1. Bên A đồng ý cho Bên B thuê phòng tại: Số ${contract.propertyAddress.houseNumber} ${contract.propertyAddress.street}, ${contract.propertyAddress.wardName}, ${contract.propertyAddress.provinceName}.
1.2. Thời hạn thuê: Từ ngày ${contract.startDate} đến ngày ${contract.endDate}.

ĐIỀU 2: GIÁ THUÊ VÀ PHƯƠNG THỨC THANH TOÁN
2.1. Giá thuê phòng: ${contract.monthlyRent.toLocaleString('vi-VN')} đ/tháng (Bằng chữ: Số tiền đã được hai bên thống nhất).
2.2. Tiền đặt cọc: ${contract.depositAmount.toLocaleString('vi-VN')} đ (Bảo đảm thực hiện hợp đồng).
2.3. Ngày thanh toán: Vào ngày ${contract.paymentDayOfMonth} hàng tháng.

ĐIỀU 3: BIỂU PHÍ DỊCH VỤ VÀ ĐIỆN NƯỚC
3.1. Tiền điện: ${contract.utilities.electricityBillingType === 'meter' ? `${contract.utilities.electricityPricePerUnit?.toLocaleString('vi-VN')} đ/kWh (theo đồng hồ riêng)` : 'Theo thỏa thuận cố định'}.
3.2. Tiền nước: ${contract.utilities.waterBillingType === 'meter' ? `${contract.utilities.waterPricePerUnit?.toLocaleString('vi-VN')} đ/m³ (theo đồng hồ riêng)` : `${contract.utilities.waterPricePerUnit?.toLocaleString('vi-VN')} đ/người/tháng`}.
3.3. Tiền internet: ${contract.utilities.internetPriceMonthly ? `${contract.utilities.internetPriceMonthly.toLocaleString('vi-VN')} đ/phòng` : 'Đã bao gồm hoặc miễn phí'}.
3.4. Phí giữ xe: ${contract.utilities.parkingPriceMonthly ? `${contract.utilities.parkingPriceMonthly.toLocaleString('vi-VN')} đ/xe` : 'Miễn phí'}.

ĐIỀU 4: ĐIỀU KIỆN TRẢ PHÒNG VÀ HOÀN CỌC
4.1. Khi kết thúc hợp đồng đúng thời hạn và Bên B thanh toán đầy đủ các khoản tiền phòng, điện nước, Bên A có trách nhiệm hoàn trả 100% tiền đặt cọc cho Bên B.
4.2. Nếu một trong hai bên muốn chấm dứt hợp đồng trước hạn, phải thông báo cho bên kia bằng văn bản hoặc qua ứng dụng trước ít nhất 30 ngày. Khi đó Bên B được nhận lại đầy đủ tiền cọc.
4.3. Bên A cam kết giữ nguyên giá thuê phòng trong suốt thời hạn hợp đồng, không tự ý tăng giá khi chưa có sự đồng ý của Bên B.

Hợp đồng được lập thành bản điện tử lưu trữ trên ứng dụng Trọ Việt, có giá trị ràng buộc trách nhiệm giữa hai bên.`;
}
