import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  assessPropertyFloodRisk,
  createFloodReport,
  upvoteFloodReport,
  HISTORICAL_FLOOD_HOTSPOTS,
} from '../src/community/flood-risk';

describe('Phase 13 Urban Flood Risk & Monsoon Safety Engine', () => {
  it('correctly assesses high risk for ground floor property near Mẹ Suốt severe flood hotspot', () => {
    // Coords ~100m from Mẹ Suốt hotspot (16.0691, 108.1523)
    const assessment = assessPropertyFloodRisk({
      latitude: 16.0695,
      longitude: 108.1528,
      floorNumber: 1, // ground floor
      cityCode: 'danang',
    });

    assert.equal(assessment.hasNearbyFloodWarning, true);
    assert.equal(assessment.highestSeverity, 'severe');
    assert.equal(assessment.safetyLevel, 'high_risk');
    assert.ok(assessment.safetyScore <= 40);
    assert.ok(assessment.advisoryMessage.includes('Cảnh báo'));
    assert.ok(assessment.recommendations.some((r) => r.includes('tầng 2') || r.includes('gác lửng')));
  });

  it('provides safe bonus score for upper floor in the same flood zone', () => {
    // Same coords near Mẹ Suốt, but on 3rd floor
    const assessment = assessPropertyFloodRisk({
      latitude: 16.0695,
      longitude: 108.1528,
      floorNumber: 3,
      cityCode: 'danang',
    });

    assert.equal(assessment.hasNearbyFloodWarning, true);
    assert.ok(assessment.safetyScore > 40);
    assert.notEqual(assessment.safetyLevel, 'high_risk');
    assert.ok(assessment.advisoryMessage.includes('tầng 3 an toàn không lo ngập'));
  });

  it('reports very safe status for elevated area far from flood hotspots', () => {
    // High ground in coastal Da Nang (e.g. 16.0611, 108.2450)
    const assessment = assessPropertyFloodRisk({
      latitude: 16.0611,
      longitude: 108.2450,
      floorNumber: 1,
      cityCode: 'danang',
    });

    assert.equal(assessment.hasNearbyFloodWarning, false);
    assert.equal(assessment.highestSeverity, 'none');
    assert.equal(assessment.safetyLevel, 'very_safe');
    assert.ok(assessment.safetyScore >= 95);
  });

  it('creates community flood report and verifies after upvoting', () => {
    const report = createFloodReport({
      cityCode: 'hanoi',
      wardSlug: 'dich-vong-hau',
      streetName: 'Ngõ 165 Cầu Giấy',
      latitude: 21.0335,
      longitude: 105.7865,
      severity: 'moderate',
      depthCm: 30,
      description: 'Mưa lớn ngập lút mắt cá chân 30cm tại ngã ba ngõ.',
    });

    assert.equal(report.upvotes, 1);
    assert.equal(report.verified, false);
    assert.equal(report.severity, 'moderate');

    // Upvote once -> upvotes = 2 -> verified = true
    const upvoted = upvoteFloodReport(report);
    assert.equal(upvoted.upvotes, 2);
    assert.equal(upvoted.verified, true);
  });
});
