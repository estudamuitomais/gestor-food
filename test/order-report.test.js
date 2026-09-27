import test from 'node:test';
import assert from 'node:assert/strict';
import { ordersToCsv } from '../src/domain/reports.js';

test('exporta composição financeira dos pedidos', () => {
  const csv = ordersToCsv([{ id: 'o1', storeId: 's1', status: 'CONCLUDED', createdAt: '2026-09-26T10:00:00Z', grossCents: 10000, storeDiscountCents: 500, commissionCents: 1000, paymentFeeCents: 300, storePromotionCents: 0, storeDeliveryCents: 0, otherCostsCents: 0 }]);
  assert.match(csv, /"Pedido";"Loja"/);
  assert.match(csv, /R\$\s*82,00/);
});
