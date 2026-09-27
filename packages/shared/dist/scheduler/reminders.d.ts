/**
 * Trọ Việt - Automated Tenancy & Invoicing Reminder Engine
 * Strictly adheres to SPEC Section 4, 8 & Module 30:
 * - Detects upcoming rent invoices (3 days before due date, on due date, and overdue).
 * - Detects contracts expiring within 30 days to uphold standard notice period clauses.
 * - Generates clear, polite Vietnamese notifications with action links.
 */
import { RentInvoice, RentalContract } from '../types/index.js';
export type ReminderType = 'rent_due_soon' | 'rent_due_today' | 'rent_overdue' | 'contract_expiring_soon';
export interface TenancyReminder {
    id: string;
    userId: string;
    type: ReminderType;
    title: string;
    message: string;
    daysDifference: number;
    targetId: string;
    targetTitle: string;
    amount?: number;
    vietqrUrl?: string;
    dueDate: string;
    createdAt: string;
}
/**
 * Scans pending invoices and produces due date reminders.
 * Default due day is day 5 of each month unless specified.
 */
export declare function checkRentInvoiceReminders(invoices: RentInvoice[], referenceDate?: Date): TenancyReminder[];
/**
 * Scans active contracts and produces 30-day notice reminders prior to expiry.
 */
export declare function checkContractExpiryReminders(contracts: RentalContract[], referenceDate?: Date): TenancyReminder[];
