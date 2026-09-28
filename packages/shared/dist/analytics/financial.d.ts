/**
 * Trọ Việt - Landlord Financial Analytics & Cash Flow Engine
 * Strictly adheres to integer VND calculations without floating point errors.
 * Computes monthly revenue, collection rates, occupancy rate, breakdown, and historical trend.
 */
import { RentalContract, RentInvoice } from '../types/index.js';
export interface RevenueBreakdown {
    rentAmount: number;
    electricityAmount: number;
    waterAmount: number;
    serviceAmount: number;
}
export interface MonthlyRevenueTrendItem {
    monthYear: string;
    collectedAmount: number;
    expectedAmount: number;
}
export interface OverdueTenantAlert {
    invoiceId: string;
    tenantName: string;
    listingTitle: string;
    amount: number;
    monthYear: string;
    daysOverdue: number;
}
export interface LandlordFinancialSummary {
    periodMonthYear: string;
    totalRooms: number;
    occupiedRooms: number;
    occupancyRatePercent: number;
    totalExpectedRevenue: number;
    totalCollectedRevenue: number;
    totalPendingRevenue: number;
    totalOverdueRevenue: number;
    onTimeCollectionRatePercent: number;
    breakdown: RevenueBreakdown;
    trend6Months: MonthlyRevenueTrendItem[];
    overdueAlerts: OverdueTenantAlert[];
}
export interface FinancialAnalyticsParams {
    landlordId: string;
    contracts: RentalContract[];
    invoices: RentInvoice[];
    totalManagedRooms?: number;
    periodMonthYear: string;
    currentDate?: Date;
}
/**
 * Computes full financial health & cash flow analytics for a landlord.
 */
export declare function calculateLandlordFinancialSummary(params: FinancialAnalyticsParams): LandlordFinancialSummary;
