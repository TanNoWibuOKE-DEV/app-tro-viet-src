"use strict";
/**
 * Trọ Việt - Automated Tenancy & Invoicing Reminder Engine
 * Strictly adheres to SPEC Section 4, 8 & Module 30:
 * - Detects upcoming rent invoices (3 days before due date, on due date, and overdue).
 * - Detects contracts expiring within 30 days to uphold standard notice period clauses.
 * - Generates clear, polite Vietnamese notifications with action links.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRentInvoiceReminders = checkRentInvoiceReminders;
exports.checkContractExpiryReminders = checkContractExpiryReminders;
const index_js_1 = require("../formatters/index.js");
/**
 * Scans pending invoices and produces due date reminders.
 * Default due day is day 5 of each month unless specified.
 */
function checkRentInvoiceReminders(invoices, referenceDate = new Date()) {
    const reminders = [];
    for (const inv of invoices) {
        if (inv.status !== 'pending')
            continue;
        // Parse monthYear "MM/YYYY" e.g. "10/2026"
        const [monthStr, yearStr] = inv.monthYear.split('/');
        const month = parseInt(monthStr, 10);
        const year = parseInt(yearStr, 10);
        if (isNaN(month) || isNaN(year))
            continue;
        // Standard payment due date is the 5th of that month
        const dueDate = new Date(year, month - 1, 5, 23, 59, 59);
        const diffTime = dueDate.getTime() - referenceDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 3 && diffDays > 0) {
            reminders.push({
                id: `rem-inv-${inv.id}-soon`,
                userId: inv.tenantId,
                type: 'rent_due_soon',
                title: `Nhắc tiền phòng tháng ${inv.monthYear} 💳`,
                message: `Hóa đơn tiền phòng "${inv.listingTitle}" (${(0, index_js_1.formatVND)(inv.totalAmount)}) sẽ đến hạn sau ${diffDays} ngày. Quét VietQR để thanh toán nhanh!`,
                daysDifference: diffDays,
                targetId: inv.id,
                targetTitle: inv.listingTitle,
                amount: inv.totalAmount,
                vietqrUrl: inv.vietqrUrl,
                dueDate: dueDate.toISOString(),
                createdAt: referenceDate.toISOString(),
            });
        }
        else if (diffDays === 0) {
            reminders.push({
                id: `rem-inv-${inv.id}-today`,
                userId: inv.tenantId,
                type: 'rent_due_today',
                title: `Hôm nay đến hạn nộp tiền phòng tháng ${inv.monthYear} ⏰`,
                message: `Hôm nay là hạn thanh toán hóa đơn tiền phòng (${(0, index_js_1.formatVND)(inv.totalAmount)}). Vui lòng chuyển khoản sớm để hoàn tất nghĩa vụ hợp đồng.`,
                daysDifference: 0,
                targetId: inv.id,
                targetTitle: inv.listingTitle,
                amount: inv.totalAmount,
                vietqrUrl: inv.vietqrUrl,
                dueDate: dueDate.toISOString(),
                createdAt: referenceDate.toISOString(),
            });
        }
        else if (diffDays < 0) {
            reminders.push({
                id: `rem-inv-${inv.id}-overdue`,
                userId: inv.tenantId,
                type: 'rent_overdue',
                title: `Hóa đơn tiền phòng tháng ${inv.monthYear} đã quá hạn ⚠️`,
                message: `Hóa đơn tiền phòng (${(0, index_js_1.formatVND)(inv.totalAmount)}) đã quá hạn ${Math.abs(diffDays)} ngày. Vui lòng thanh toán trực tiếp qua VietQR hoặc liên hệ chủ trọ.`,
                daysDifference: diffDays,
                targetId: inv.id,
                targetTitle: inv.listingTitle,
                amount: inv.totalAmount,
                vietqrUrl: inv.vietqrUrl,
                dueDate: dueDate.toISOString(),
                createdAt: referenceDate.toISOString(),
            });
        }
    }
    return reminders;
}
/**
 * Scans active contracts and produces 30-day notice reminders prior to expiry.
 */
function checkContractExpiryReminders(contracts, referenceDate = new Date()) {
    const reminders = [];
    for (const contract of contracts) {
        if (contract.status !== 'active')
            continue;
        const endDate = new Date(contract.endDate);
        const diffTime = endDate.getTime() - referenceDate.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        // Remind between 1 and 30 days before expiration
        if (diffDays <= 30 && diffDays > 0) {
            // Notify tenant
            reminders.push({
                id: `rem-ctr-tenant-${contract.id}`,
                userId: contract.tenantId,
                type: 'contract_expiring_soon',
                title: `Hợp đồng thuê phòng sắp hết hạn (Còn ${diffDays} ngày) 📋`,
                message: `Hợp đồng thuê "${contract.listingTitle}" sẽ kết thúc vào ngày ${contract.endDate.split('T')[0]}. Vui lòng thống nhất gia hạn hoặc chuẩn bị bàn giao phòng trước 30 ngày.`,
                daysDifference: diffDays,
                targetId: contract.id,
                targetTitle: contract.listingTitle,
                dueDate: contract.endDate,
                createdAt: referenceDate.toISOString(),
            });
            // Also notify landlord
            reminders.push({
                id: `rem-ctr-landlord-${contract.id}`,
                userId: contract.landlordId,
                type: 'contract_expiring_soon',
                title: `Hợp đồng khách thuê sắp hết hạn (Còn ${diffDays} ngày) 🏠`,
                message: `Hợp đồng căn phòng "${contract.listingTitle}" của khách thuê ${contract.tenantName} sắp hết hạn vào ngày ${contract.endDate.split('T')[0]}.`,
                daysDifference: diffDays,
                targetId: contract.id,
                targetTitle: contract.listingTitle,
                dueDate: contract.endDate,
                createdAt: referenceDate.toISOString(),
            });
        }
    }
    return reminders;
}
