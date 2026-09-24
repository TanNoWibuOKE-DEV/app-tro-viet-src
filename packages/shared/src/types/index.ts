/**
 * Trọ Việt - Shared Types
 * Strictly following TroViet SPEC & Core Invariants
 */

// 1. Administrative Units & Geography (2-tier system: Province/City -> Ward/Commune/Special Zone)
export type AdminUnitLevel = 1 | 2;

export type AdminUnitType = 
  | 'province'         // Tỉnh
  | 'centrally_run_city' // Thành phố trực thuộc Trung ương
  | 'ward'             // Phường
  | 'commune'          // Xã
  | 'special_zone';    // Đặc khu

export interface AdminUnit {
  id: string;
  code: string;
  name: string;
  type: AdminUnitType;
  level: AdminUnitLevel;
  parentId: string | null;
  validFrom: string; // ISO Date
  validTo: string | null; // ISO Date
  successorIds?: string[];
  createdAt: string;
}

export interface AdminUnitMapping {
  id: string;
  legacyCode: string;
  legacyName: string;
  newUnitId: string;
  notes?: string;
}

export interface AreaAlias {
  id: string;
  adminUnitId: string;
  aliasName: string;      // e.g. "quận Hải Châu cũ", "khu Mỹ Khê", "gần ĐH Duy Tân"
  normalizedName: string;  // unaccented lowercase for search
  marketId: string;
  category: 'legacy_district' | 'neighborhood' | 'landmark' | 'university';
}

export interface Market {
  id: string;
  code: string;           // e.g. 'DN', 'HCM', 'HN'
  name: string;           // e.g. 'Đà Nẵng', 'Hồ Chí Minh'
  provinceCodes: string[];
  isActive: boolean;
}

// 2. Users & Roles (RBAC)
export type UserRole = 'tenant' | 'landlord' | 'moderator' | 'admin';

export type VerificationLevel = 'none' | 'L1' | 'L2' | 'L3';

export interface UserProfile {
  id: string;
  phoneNumber: string | null;
  email: string | null;
  fullName: string;
  avatarUrl: string | null;
  role: UserRole;
  verificationLevel: VerificationLevel;
  createdAt: string;
}

export interface LandlordProfile {
  id: string;
  userId: string;
  businessName?: string;
  identityVerified: boolean;
  totalListingsCount: number;
  activeListingsCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
}

// 3. Properties & Listings
export type PropertyType = 'room' | 'apartment' | 'house' | 'shared';

export type ListingStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'hidden';

export interface Property {
  id: string;
  landlordId: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  provinceCode: string;
  wardCode: string;
  street: string;
  houseNumber: string;
  legacyDistrict?: string;
  latitude: number;
  longitude: number;
  areaSquareMeters: number;
  createdAt: string;
}

// Utility billing method
export type UtilityBillingType = 'meter' | 'fixed_monthly' | 'tiered' | 'unprovided';

export interface ListingCosts {
  // Integer VND amounts
  monthlyRent: number; // Tiền phòng cố định hàng tháng (VND)
  deposit: number;     // Tiền cọc (VND)
  
  // Electricity
  electricityBillingType: UtilityBillingType;
  electricityCostPerUnit?: number; // VND / kWh (nếu theo đồng hồ hoặc khoán)

  // Water
  waterBillingType: UtilityBillingType;
  waterCostPerUnit?: number; // VND / m³ hoặc VND / người / tháng

  // Internet / Wifi
  internetBillingType: UtilityBillingType;
  internetCost?: number; // VND / tháng hoặc VND / phòng

  // Parking
  parkingBillingType: UtilityBillingType;
  parkingCost?: number; // VND / xe / tháng

  // Service / Cleaning fees
  serviceFeeBillingType: UtilityBillingType;
  serviceCost?: number;

  otherFeesNotes?: string;
}

export interface CostCalculationResult {
  monthlyEstimatedTotal: number;
  initialMoveInTotal: number;
  knownMonthlyCosts: {
    rent: number;
    electricity?: number;
    water?: number;
    internet?: number;
    parking?: number;
    service?: number;
  };
  unprovidedCostFields: Array<{
    field: string;
    label: string;
  }>;
  isFullyTransparent: boolean;
}

// 4. Amenities & User Preferences
export interface Amenity {
  id: string;
  code: string;
  name: string;
  category: 'general' | 'room_features' | 'building';
  icon?: string;
  sortOrder: number;
}

export interface UserPreferences {
  userId: string;
  preferredPropertyTypes: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  preferredWardCodes?: string[];
  preferredAmenityCodes?: string[];
}

export interface SearchFilterParams {
  query?: string;
  propertyType?: PropertyType;
  minRent?: number;
  maxRent?: number;
  wardCode?: string;
  amenityCodes?: string[];
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'area_desc';
}

export interface ListingSummary {
  id: string;
  title: string;
  propertyType: PropertyType;
  monthlyRent: number;
  deposit: number;
  areaSquareMeters: number;
  provinceCode: string;
  wardCode: string;
  wardName: string;
  street: string;
  houseNumber: string;
  latitude: number;
  longitude: number;
  coverImageUrl?: string;
  landlordId: string;
  landlordName: string;
  landlordVerificationLevel: VerificationLevel;
  amenities: Amenity[];
  costs: ListingCosts;
  status: ListingStatus;
  createdAt: string;
}

// 5. Phase 3: Chat, Reviews, Reports, and Notifications
export interface Conversation {
  id: string;
  listingId: string | null;
  listingTitle?: string;
  tenantId: string;
  tenantName: string;
  landlordId: string;
  landlordName: string;
  lastMessagePreview: string | null;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  detectedRisks?: string[];
}

export interface Review {
  id: string;
  listingId: string;
  tenantId: string;
  tenantName: string;
  rating: number; // 1-5
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  landlordResponse?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ReportCategory =
  | 'deposit_scam'
  | 'fake_listing'
  | 'wrong_price'
  | 'inappropriate_behavior'
  | 'other';

export type ReportTargetType = 'listing' | 'user' | 'review' | 'message';

export type ReportStatus = 'pending' | 'investigating' | 'resolved' | 'dismissed';

export interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reasonCategory: ReportCategory;
  details: string;
  status: ReportStatus;
  resolutionNotes?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'chat_message'
  | 'review_received'
  | 'review_approved'
  | 'listing_approved'
  | 'listing_rejected'
  | 'verification_approved'
  | 'verification_rejected'
  | 'report_resolved'
  | 'anti_scam_warning'
  | 'saved_search_match'
  | 'contract_pending'
  | 'contract_signed'
  | 'invoice_issued'
  | 'invoice_paid';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// 6. Phase 5: Saved Searches & L3 Verifications
export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  criteria: SearchFilterParams;
  notifyNewMatches: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LandlordVerification {
  id: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  level: VerificationLevel;
  status: 'pending' | 'approved' | 'rejected';
  documentType: 'id_card' | 'business_license' | 'land_ownership_certificate' | 'lease_authorization';
  documentUrl?: string;
  propertyId?: string | null;
  propertyTitle?: string;
  notes?: string;
  verifiedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
}

// 7. Phase 6: Contracts & Rent Invoicing
export type ContractStatus = 'draft' | 'pending_signature' | 'active' | 'terminated' | 'expired';

export interface RentalContract {
  id: string;
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  status: ContractStatus;
  monthlyRent: number;
  depositAmount: number;
  startDate: string;
  endDate: string;
  landlordSignedAt?: string;
  tenantSignedAt?: string;
  contractText: string;
  createdAt: string;
  updatedAt?: string;
}

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

export interface RentInvoice {
  id: string;
  contractId: string;
  listingId: string;
  listingTitle: string;
  landlordId: string;
  landlordName: string;
  tenantId: string;
  tenantName: string;
  monthYear: string; // e.g. "10/2026"
  rentAmount: number;
  electricityAmount: number;
  electricityKwh?: number;
  waterAmount: number;
  waterM3?: number;
  internetAmount: number;
  serviceAmount: number;
  totalAmount: number;
  status: InvoiceStatus;
  vietqrUrl?: string;
  paidAt?: string;
  createdAt: string;
  updatedAt?: string;
}

