/**
 * Trọ Việt - Viewing Checklist (Sổ tay kiểm tra phòng thực tế)
 * Practical 10-point checklist for tenants when viewing a room in person.
 */
export interface ViewingChecklistItem {
    id: string;
    category: 'utilities' | 'room_condition' | 'security_building' | 'legal_contract';
    categoryLabel: string;
    title: string;
    instruction: string;
    importance: 'critical' | 'recommended';
}
export declare const STANDARD_VIEWING_CHECKLIST: ViewingChecklistItem[];
