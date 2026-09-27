import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeReviews, criticalReviews } from '../src/domain/review-service.js';

test('identifica avaliação crítica e categoria', () => {
  const result = analyzeReviews([{ id: 'r1', rating: 2, comment: 'Chegou fria' }, { id: 'r2', rating: 5, comment: 'Muito bom' }]);
  assert.equal(result[0].critical, true);
  assert.equal(result[0].category, 'TEMPERATURA');
  assert.equal(criticalReviews(result).length, 1);
});
