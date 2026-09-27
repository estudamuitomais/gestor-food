import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateGoalProgress } from '../src/domain/goals.js';

test('calcula progresso e valor a recuperar sem float', () => {
  const result = calculateGoalProgress({ goalCents: 10000, realizedCents: 6000, expectedCents: 7000, forecastCents: 8000 });
  assert.equal(result.varianceToExpectedCents, -1000n);
  assert.equal(result.amountToRecoverCents, 2000n);
  assert.equal(result.forecastAtRisk, true);
});
