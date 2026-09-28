"use strict";
/**
 * Urban Flood Risk & Monsoon Safety Engine (Phase 13: Campus Hub & Neighborhood Safety)
 * Grounded in Vietnamese metropolitan topography: Da Nang, Hanoi, Ho Chi Minh City.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HISTORICAL_FLOOD_HOTSPOTS = void 0;
exports.assessPropertyFloodRisk = assessPropertyFloodRisk;
exports.createFloodReport = createFloodReport;
exports.upvoteFloodReport = upvoteFloodReport;
const distance_js_1 = require("../geo/distance.js");
// Grounded urban flood hotspots in student rental hubs
exports.HISTORICAL_FLOOD_HOTSPOTS = [
    // Đà Nẵng
    {
        id: 'fld-dn-1',
        cityCode: 'danang',
        wardSlug: 'hoa-khanh-bac',
        streetName: 'Đường Mẹ Suốt (Khu vực ĐH Bách Khoa Đà Nẵng)',
        latitude: 16.0691,
        longitude: 108.1523,
        severity: 'severe',
        depthCm: 60,
        description: 'Vùng trũng thoát nước chậm lịch sử, mưa bão lớn dâng nhanh vào nhà trọ tầng trệt.',
        upvotes: 45,
        verified: true,
        createdAt: '2026-09-15T10:00:00.000Z',
    },
    {
        id: 'fld-dn-2',
        cityCode: 'danang',
        wardSlug: 'thach-thang',
        streetName: 'Đoạn đường Quang Trung - Nguyễn Thị Minh Khai',
        latitude: 16.0754,
        longitude: 108.2198,
        severity: 'moderate',
        depthCm: 35,
        description: 'Nước dâng 30-40cm tại đoạn trũng khi mưa to liên tục, xe máy dễ chết bugi.',
        upvotes: 18,
        verified: true,
        createdAt: '2026-09-18T14:30:00.000Z',
    },
    {
        id: 'fld-dn-3',
        cityCode: 'danang',
        wardSlug: 'hoa-cuong-bac',
        streetName: 'Đường Nguyễn Tri Phương giao Lê Đình Lý',
        latitude: 16.0521,
        longitude: 108.2085,
        severity: 'light',
        depthCm: 20,
        description: 'Đọng nước cục bộ mép vỉa hè khi mưa rào, thoát nhanh sau 30 phút.',
        upvotes: 8,
        verified: true,
        createdAt: '2026-09-20T08:00:00.000Z',
    },
    // Hà Nội
    {
        id: 'fld-hn-1',
        cityCode: 'hanoi',
        wardSlug: 'dich-vong-hau',
        streetName: 'Phố Trần Thái Tông - Duy Tân (Cầu Giấy)',
        latitude: 21.0315,
        longitude: 105.7832,
        severity: 'moderate',
        depthCm: 40,
        description: 'Ngập sâu nửa bánh xe tại các điểm trũng giao lộ, giao thông sinh viên tắc nghẽn.',
        upvotes: 32,
        verified: true,
        createdAt: '2026-09-10T16:00:00.000Z',
    },
    {
        id: 'fld-hn-2',
        cityCode: 'hanoi',
        wardSlug: 'trung-van',
        streetName: 'Khu vực chợ Phùng Khoang (gần ĐH Hà Nội)',
        latitude: 20.9892,
        longitude: 105.7891,
        severity: 'severe',
        depthCm: 55,
        description: 'Hẻm trọ trũng sâu, nước tràn ngõ khi mưa xối xả kéo dài.',
        upvotes: 56,
        verified: true,
        createdAt: '2026-09-12T11:00:00.000Z',
    },
    // TP. Hồ Chí Minh
    {
        id: 'fld-hcm-1',
        cityCode: 'hcm',
        wardSlug: 'linh-trung',
        streetName: 'Đường số 6, Làng Đại học Quốc gia Thủ Đức',
        latitude: 10.8712,
        longitude: 106.7789,
        severity: 'moderate',
        depthCm: 35,
        description: 'Đoạn dốc trũng ngập bánh xe khi mưa to kết hợp triều cường.',
        upvotes: 27,
        verified: true,
        createdAt: '2026-09-14T17:00:00.000Z',
    },
    {
        id: 'fld-hcm-2',
        cityCode: 'hcm',
        wardSlug: 'phuong-26',
        streetName: 'Đường Đinh Bộ Lĩnh - Bến xe Miền Đông cũ (Bình Thạnh)',
        latitude: 10.8142,
        longitude: 106.7118,
        severity: 'severe',
        depthCm: 65,
        description: 'Ngập lụt nghiêm trọng mỗi đợt triều cường Rằm và mưa lớn, xe cộ khó qua lại.',
        upvotes: 68,
        verified: true,
        createdAt: '2026-09-19T18:00:00.000Z',
    },
];
/**
 * Assesses the urban flood safety index for a given rental property.
 */
function assessPropertyFloodRisk(params) {
    const reports = params.customReports || exports.HISTORICAL_FLOOD_HOTSPOTS;
    const floorNumber = params.floorNumber ?? 1;
    // Filter nearby reports (< 1.2km)
    const nearbyReportsWithDist = [];
    for (const report of reports) {
        if (params.latitude && params.longitude) {
            const distKm = (0, distance_js_1.calculateHaversineDistance)({ latitude: params.latitude, longitude: params.longitude }, { latitude: report.latitude, longitude: report.longitude });
            const distMeters = Math.round(distKm * 1000);
            if (distMeters <= 1200) {
                nearbyReportsWithDist.push({ report, distMeters });
            }
        }
        else if (params.wardSlug && report.wardSlug === params.wardSlug) {
            // Fallback matching by ward
            nearbyReportsWithDist.push({ report, distMeters: 400 });
        }
    }
    // Sort by distance ascending
    nearbyReportsWithDist.sort((a, b) => a.distMeters - b.distMeters);
    if (nearbyReportsWithDist.length === 0) {
        return {
            hasNearbyFloodWarning: false,
            highestSeverity: 'none',
            safetyScore: 98,
            safetyLevel: 'very_safe',
            advisoryMessage: 'Khu vực địa thế cao ráo, hệ thống thoát nước đô thị tốt, không ghi nhận ngập úng mùa mưa.',
            nearbyReports: [],
            recommendations: [
                'An tâm thuê phòng ở mọi tầng lầu.',
                'Xe máy đậu ở tầng trệt an toàn trong mùa mưa bão.',
            ],
        };
    }
    const nearest = nearbyReportsWithDist[0];
    const nearbyReports = nearbyReportsWithDist.map((item) => item.report);
    let highestSeverity = 'light';
    if (nearbyReports.some((r) => r.severity === 'severe')) {
        highestSeverity = 'severe';
    }
    else if (nearbyReports.some((r) => r.severity === 'moderate')) {
        highestSeverity = 'moderate';
    }
    // Calculate Base Safety Score based on distance & severity
    let baseScore = 90;
    if (highestSeverity === 'severe') {
        baseScore = nearest.distMeters <= 400 ? 35 : nearest.distMeters <= 800 ? 55 : 70;
    }
    else if (highestSeverity === 'moderate') {
        baseScore = nearest.distMeters <= 400 ? 55 : nearest.distMeters <= 800 ? 70 : 80;
    }
    else {
        baseScore = nearest.distMeters <= 400 ? 75 : 85;
    }
    // Adjust score for floor number
    // If ground floor (tầng 1) in severe flood zone -> heavily penalize
    // If higher floor (tầng 2+) -> property is safe, only parking/mobility affected
    let finalScore = baseScore;
    const recommendations = [];
    let advisoryMessage = '';
    if (floorNumber === 1) {
        if (highestSeverity === 'severe') {
            finalScore = Math.min(finalScore, 35);
            advisoryMessage = `Cảnh báo: Cách điểm ngập nặng ${nearest.distMeters}m (${nearest.report.streetName}). Phòng tầng trệt có rủi ro nước tràn khi mưa bão lớn.`;
            recommendations.push('Nên ưu tiên chọn phòng từ tầng 2 trở lên hoặc có gác lửng cao ráo.');
            recommendations.push('Hỏi kỹ chủ trọ về lịch sử ngập nước và phương án kê cao đồ đạc trong mùa mưa.');
            recommendations.push('Gửi xe máy tại điểm trông giữ cao tầng trong những ngày mưa bão kéo dài.');
        }
        else if (highestSeverity === 'moderate') {
            finalScore = Math.min(finalScore, 60);
            advisoryMessage = `Lưu ý: Cách điểm ngập vừa ${nearest.distMeters}m (${nearest.report.streetName}). Mưa to có thể đọng nước cục bộ ở ngõ.`;
            recommendations.push('Kiểm tra nền phòng trọ có cao hơn mặt đường/hẻm ít nhất 20cm.');
            recommendations.push('Chuẩn bị sẵn chân kê tủ lạnh, đệm ngủ.');
        }
        else {
            finalScore = Math.min(finalScore, 78);
            advisoryMessage = `Điểm ngập nhẹ cách ${nearest.distMeters}m, thoát nước nhanh sau mưa.`;
            recommendations.push('Quan sát độ dốc thoát nước trước cửa phòng trọ khi đi xem phòng.');
        }
    }
    else {
        // Upper floors: bonus +15 score because living space is completely dry!
        finalScore = Math.min(95, baseScore + 18);
        if (highestSeverity === 'severe') {
            advisoryMessage = `Phòng ở tầng ${floorNumber} an toàn không lo ngập nước. Tuy nhiên khu vực xung quanh (${nearest.distMeters}m) có ngập đường khi bão to.`;
            recommendations.push(`Phòng tầng ${floorNumber} hoàn toàn khô ráo, đồ đạc và sinh hoạt an toàn 100%.`);
            recommendations.push('Cần thống nhất với chủ trọ về chỗ dắt xe máy lên tầng cao khi có triều cường.');
        }
        else {
            advisoryMessage = `Phòng tầng ${floorNumber} cao ráo an toàn, khu vực ít ảnh hưởng.`;
            recommendations.push('Sinh hoạt mùa mưa thuận tiện, không lo nước dâng.');
        }
    }
    let safetyLevel = 'very_safe';
    if (finalScore < 45) {
        safetyLevel = 'high_risk';
    }
    else if (finalScore < 70) {
        safetyLevel = 'moderate_risk';
    }
    else if (finalScore < 85) {
        safetyLevel = 'low_risk';
    }
    return {
        hasNearbyFloodWarning: true,
        highestSeverity,
        safetyScore: Math.round(finalScore),
        safetyLevel,
        nearestReportDistanceMeters: nearest.distMeters,
        advisoryMessage,
        nearbyReports,
        recommendations,
    };
}
/**
 * Creates a new crowdsourced flood incident report.
 */
function createFloodReport(params) {
    return {
        id: `fld-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        cityCode: params.cityCode,
        wardSlug: params.wardSlug,
        streetName: params.streetName,
        latitude: params.latitude,
        longitude: params.longitude,
        severity: params.severity,
        depthCm: Math.max(5, params.depthCm),
        description: params.description,
        upvotes: 1,
        verified: false,
        createdAt: new Date().toISOString(),
    };
}
/**
 * Upvotes a community flood report. Marks verified when reaching threshold (>= 2).
 */
function upvoteFloodReport(report) {
    const newUpvotes = report.upvotes + 1;
    return {
        ...report,
        upvotes: newUpvotes,
        verified: newUpvotes >= 2,
    };
}
