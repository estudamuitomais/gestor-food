import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecoveryPlan, calculateStoreHealth, detectWeakSales, forecastClosing } from '../src/domain/analytics.js';
import { ACTION_CLASSIFICATION, classifyAction } from '../src/domain/strategy-engine.js';

test('previsão combina ritmo atual e histórico com confiança explícita', () => {
  const result = forecastClosing({ realizedCents: 50000n, elapsedRatio: 0.5, historicalExpectedCents: 100000n });
  assert.equal(result.expectedClosingCents, 100000n);
  assert.equal(result.confidence, 'MÉDIA');
});

test('saúde expõe componentes e estado', () => {
  const result = calculateStoreHealth({ salesVariancePercent: -20, ticketVariancePercent: -5, cancellationRate: 4, reviewScore: 4 });
  assert.equal(result.state, 'RECUPERAÇÃO');
  assert.ok(result.components.sales < 40);
});

test('queda agressiva dispara em 10%', () => {
  assert.equal(detectWeakSales({ realizedCents: 9000n, expectedCents: 10000n }).triggered, true);
});

test('classificação respeita API, custo e impacto', () => {
  assert.equal(classifyAction({ apiSupported: false }), ACTION_CLASSIFICATION.ASSISTED);
  assert.equal(classifyAction({ apiSupported: true, costCents: 1n }), ACTION_CLASSIFICATION.APPROVAL);
  assert.equal(classifyAction({ apiSupported: true }), ACTION_CLASSIFICATION.AUTOMATIC);
});

test('plano de recuperação calcula gap e pedidos adicionais', () => {
  const plan = buildRecoveryPlan({ storeId: 's1', forecastCents: 8000n, goalCents: 10000n, topProducts: [{ averageTicketCents: 1000n }] });
  assert.equal(plan.gapCents, 2000n);
  assert.equal(plan.additionalOrdersEstimate, 2);
});
