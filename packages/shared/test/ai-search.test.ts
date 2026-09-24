import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseNaturalLanguageSearch,
  runAISearchEval,
} from '../src/index.js';

describe('Phase 5 AI Natural Language Search & Evaluation Suite', () => {
  it('parses unaccented complex query into valid structured filter', () => {
    const result = parseNaturalLanguageSearch('phong tro duoi 3tr gan duy tan co may lanh wc rieng');

    assert.strictEqual(result.parsedFilter.propertyType, 'room');
    assert.strictEqual(result.parsedFilter.maxRent, 3000000);
    assert.strictEqual(result.parsedFilter.wardCode, '48_HAICHAU1');
    assert.ok(result.parsedFilter.amenityCodes?.includes('air_conditioner'));
    assert.ok(result.parsedFilter.amenityCodes?.includes('private_bathroom'));
    assert.ok(result.explanation.includes('Dưới 3 triệu ₫'));
    assert.ok(result.explanation.includes('ĐH Duy Tân'));
    assert.ok(result.confidence >= 0.8);
  });

  it('runs AI Search Eval Suite with ≥ 90% accuracy', () => {
    const evalResult = runAISearchEval();
    assert.ok(
      evalResult.accuracyRate >= 0.9,
      `AI Search accuracy ${evalResult.accuracyRate * 100}% should be >= 90%. Failures: ${JSON.stringify(evalResult.failures)}`
    );
    assert.strictEqual(evalResult.failures.length, 0);
  });

  it('provides safe fallback for completely unfamiliar queries without hallucination', () => {
    const result = parseNaturalLanguageSearch('alo 123 xyz');
    assert.strictEqual(result.parsedFilter.propertyType, undefined);
    assert.strictEqual(result.parsedFilter.maxRent, undefined);
    assert.strictEqual(result.parsedFilter.query, 'alo 123 xyz');
    assert.ok(result.explanation.includes('alo 123 xyz'));
  });
});
