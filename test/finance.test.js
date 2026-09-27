import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateOrderResult, aggregateOrders } from '../src/domain/finance.js';

test('calcula resultado sem CMV em centavos', () => {
  const result = calculateOrderResult({ grossCents: 3990, storeDiscountCents: 400, commissionCents: 439, paymentFeeCents: 127, storePromotionCents: 150, otherCostsCents: 80 });
  assert.equal(result.resultWithoutCmvCents, 2794n);
  assert.equal(result.netPercent, 70.02);
});

test('agrega múltiplos pedidos sem erro de float', () => {
  const result = aggregateOrders([{ grossCents: 10, commissionCents: 1 }, { grossCents: 10, commissionCents: 1 }]);
  assert.equal(result.grossCents, 20n);
  assert.equal(result.resultWithoutCmvCents, 18n);
});

test('subsidio do iFood não é descontado quando não é custo da loja', () => {
  const result = calculateOrderResult({ grossCents: 10000, commissionCents: 1000, ifoodSubsidyCents: 5000 });
  assert.equal(result.resultWithoutCmvCents, 9000n);
});

test('cancelamento total zera faturamento e resultado', () => {
  const result = calculateOrderResult({ status: 'CANCELLED', grossCents: 10000, commissionCents: 1000 });
  assert.equal(result.grossCents, 0n);
  assert.equal(result.resultWithoutCmvCents, 0n);
});

test('reembolso parcial reduz a venda reconhecida', () => {
  const result = calculateOrderResult({ status: 'CONCLUDED', grossCents: 10000, refundedCents: 2500, commissionCents: 750 });
  assert.equal(result.grossCents, 7500n);
  assert.equal(result.resultWithoutCmvCents, 6750n);
});
