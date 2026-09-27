import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoSnapshot } from '../src/domain/demo.js';

test('cenário de queda ativa oportunidade crítica', () => {
  const snapshot = buildDemoSnapshot({ scenario: 'weak-sales' });
  assert.equal(snapshot.scenario, 'weak-sales');
  assert.equal(snapshot.stores[1].health, 52);
  assert.equal(snapshot.opportunities[0].severity, 'critical');
});

test('cenário de avaliações críticas cria alerta', () => {
  const snapshot = buildDemoSnapshot({ scenario: 'critical-reviews' });
  assert.equal(snapshot.reviews.find(review => review.storeId === 'store-2').rating, 1);
  assert.equal(snapshot.alerts[0].level, 'critical');
});

test('cenário DEMO inválido retorna operação normal', () => {
  assert.equal(buildDemoSnapshot({ scenario: 'unknown' }).scenario, 'normal');
});
