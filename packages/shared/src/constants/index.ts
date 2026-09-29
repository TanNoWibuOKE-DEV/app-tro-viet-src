/**
 * Trọ Việt - Constants & Error Mappings
 * Strictly adheres to SPEC Section 9 & 20-vietnamese-ui rule
 */

export const APP_NAME = 'Trọ Việt';
export const APP_TAGLINE = 'Tìm đúng chỗ — Thuê an tâm.';

export const ERROR_MESSAGES: Record<string, string> = {
  PROPERTY_NOT_FOUND: 'Không tìm thấy phòng này.',
  RISK_ASSESSMENT_HIGH: 'Có một số thông tin cần kiểm tra thêm trước khi bạn đặt cọc.',
  NETWORK_ERROR: 'Kết nối đang chập chờn. Bạn thử lại nhé.',
  UNAUTHORIZED: 'Vui lòng đăng nhập để tiếp tục.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  VALIDATION_ERROR: 'Vui lòng kiểm tra lại thông tin đã nhập.',
  SERVER_ERROR: 'Hệ thống đang bảo trì tạm thời. Bạn quay lại sau nhé.',
  GENERIC_ERROR: 'Đã có lỗi xảy ra. Bạn thử lại nhé.',
};

export function getFriendlyErrorMessage(code: string | undefined): string {
  if (!code) return ERROR_MESSAGES.GENERIC_ERROR;
  return ERROR_MESSAGES[code] || ERROR_MESSAGES.GENERIC_ERROR;
}

// Brand Colors & Design Tokens (Aligned with Reference UI - Trust Pine Teal)
export const COLORS = {
  light: {
    primary: '#085F56',       // Pine Dark Teal - Trust, Stability, Vietnamese rental standard
    primaryHover: '#064E46',
    primaryLight: '#E6F4F1',  // Soft minty teal background
    primarySubtle: '#EDF5F3',
    background: '#F8FAFC',    // Soft clean light background
    card: '#FFFFFF',
    textPrimary: '#0F172A',
    textSecondary: '#64748B',
    border: '#E2E8F0',
    accentBlue: '#E0F2FE',    // Light sky blue chip
    accentBlueText: '#0284C7',
    badgeL1: '#DBEAFE',       // Light blue
    badgeL1Text: '#1E40AF',
    badgeL2: '#D1FAE5',       // Light green
    badgeL2Text: '#065F46',
    warning: '#F59E0B',
    danger: '#EF4444',
    error: '#EF4444',
    success: '#085F56',
  },
  dark: {
    primary: '#10B981',
    primaryHover: '#34D399',
    primaryLight: '#064E3B',
    primarySubtle: '#0F2922',
    background: '#0F172A',    // Slate dark
    card: '#1E293B',
    textPrimary: '#F9FAFB',
    textSecondary: '#94A3B8',
    border: '#334155',
    accentBlue: '#1E3A8A',
    accentBlueText: '#93C5FD',
    badgeL1: '#1E3A8A',
    badgeL1Text: '#93C5FD',
    badgeL2: '#064E3B',
    badgeL2Text: '#6EE7B7',
    warning: '#FBBF24',
    danger: '#F87171',
    error: '#F87171',
    success: '#10B981',
  },
};
