import test from 'node:test';
import assert from 'node:assert/strict';
import { allocateOrderCosts, productFinancialReport } from '../src/domain/product-finance.js';

const order = { status: 'CONCLUDED', grossCents: 10000, commissionCents: 1000, paymentFeeCents: 300, items: [{ productId: 'p1', productName: 'A', quantity: 1, grossCents: 6000 }, { productId: 'p2', productName: 'B', quantity: 2, grossCents: 4000 }] };

test('rateia custos proporcionalmente ao bruto do item', () => {
  const rows = allocateOrderCosts(order);
  assert.equal(rows[0].allocatedCostCents, 780n);
  assert.equal(rows[1].allocatedCostCents, 520n);
  assert.equal(rows[0].allocationMethod, 'RATEIO_PROPORCIONAL_AO_BRUTO_DO_ITEM');
});

test('exclui pedido cancelado do relatório de produtos', () => {
  const report = productFinancialReport([order, { ...order, status: 'CANCELLED' }]);
  assert.equal(report.length, 2);
  assert.equal(report[0].grossCents, 6000n);
});
