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

export const STANDARD_VIEWING_CHECKLIST: ViewingChecklistItem[] = [
  {
    id: 'chk-01',
    category: 'utilities',
    categoryLabel: '⚡ Điện & Nước',
    title: 'Kiểm tra công tơ điện riêng',
    instruction: 'Xác nhận phòng có đồng hồ điện riêng biệt. Chụp ảnh lại chỉ số công tơ tại thời điểm nhận phòng.',
    importance: 'critical',
  },
  {
    id: 'chk-02',
    category: 'utilities',
    categoryLabel: '⚡ Điện & Nước',
    title: 'Áp lực nước vòi sen & bồn cầu',
    instruction: 'Mở thử vòi sen, vòi lavabo và xả bồn cầu để đảm bảo nước chảy mạnh, không bị tắc nghẽn hay rỉ nước.',
    importance: 'critical',
  },
  {
    id: 'chk-03',
    category: 'room_condition',
    categoryLabel: '🏡 Cơ sở vật chất',
    title: 'Bật thử máy lạnh & bình nóng lạnh',
    instruction: 'Bật điều hòa trong 5 phút xem có phả hơi lạnh sâu không, lắng nghe cục nóng xem có rung ồn bất thường.',
    importance: 'recommended',
  },
  {
    id: 'chk-04',
    category: 'room_condition',
    categoryLabel: '🏡 Cơ sở vật chất',
    title: 'Quan sát chân tường & trần nhà',
    instruction: 'Soi kỹ chân tường nhà vệ sinh và trần nhà xem có vết ố vàng, bong tróc ẩm mốc do thấm nước mùa mưa.',
    importance: 'critical',
  },
  {
    id: 'chk-05',
    category: 'room_condition',
    categoryLabel: '🏡 Cơ sở vật chất',
    title: 'Cửa sổ & độ thông thoáng',
    instruction: 'Mở cửa sổ kiểm tra chốt an toàn, độ thoáng khí và xem phòng có bị nắng gắt chiếu thẳng vào buổi chiều không.',
    importance: 'recommended',
  },
  {
    id: 'chk-06',
    category: 'security_building',
    categoryLabel: '🛡️ An ninh & Tiện ích chung',
    title: 'Sóng điện thoại & Tốc độ Wi-Fi',
    instruction: 'Thử gọi điện thoại và lướt web trong phòng xem có bị mất sóng 4G/Wi-Fi tại góc bàn học hay giường ngủ không.',
    importance: 'recommended',
  },
  {
    id: 'chk-07',
    category: 'security_building',
    categoryLabel: '🛡️ An ninh & Tiện ích chung',
    title: 'Hệ thống khóa cổng & Camera an ninh',
    instruction: 'Kiểm tra cửa cổng ra vào (khóa vân tay, thẻ từ hay khóa xích) và vị trí camera an ninh tại khu vực để xe.',
    importance: 'critical',
  },
  {
    id: 'chk-08',
    category: 'security_building',
    categoryLabel: '🛡️ An ninh & Tiện ích chung',
    title: 'Khu vực để xe máy giờ cao điểm',
    instruction: 'Quan sát lối dắt xe lên xuống có quá dốc không, hỏi rõ mỗi phòng được để tối đa mấy xe và có thu phí không.',
    importance: 'recommended',
  },
  {
    id: 'chk-09',
    category: 'security_building',
    categoryLabel: '🛡️ An ninh & Tiện ích chung',
    title: 'Giờ giấc đóng mở cửa & Tiếng ồn',
    instruction: 'Xác nhận rõ giờ đóng mở cửa cổng (tự do hay đóng lúc 23h), quan sát các hàng quán lân cận có ồn ào không.',
    importance: 'recommended',
  },
  {
    id: 'chk-10',
    category: 'legal_contract',
    categoryLabel: '📑 Pháp lý & Tiền cọc',
    title: 'Đối chiếu CCCD chủ trọ & Biên nhận cọc',
    instruction: 'Đối chiếu CCCD người nhận tiền trùng khớp với tên chủ trọ. Chỉ chuyển cọc khi có biên nhận có chữ ký 2 bên ghi rõ ngày nhận phòng.',
    importance: 'critical',
  },
];
