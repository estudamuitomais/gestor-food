import test from 'node:test';
import assert from 'node:assert/strict';
import { aggregateDailyMetrics, aggregateHourlyMetrics } from '../src/domain/metrics.js';

const orders = [
  { storeId: 's1', status: 'CONCLUDED', createdAt: '2026-09-26T11:00:00-03:00', grossCents: 1000, commissionCents: 100 },
  { storeId: 's1', status: 'CANCELLED', createdAt: '2026-09-26T11:30:00-03:00', grossCents: 2000, commissionCents: 200 },
  { storeId: 's1', status: 'CONCLUDED', createdAt: '2026-09-26T12:00:00-03:00', grossCents: 3000, commissionCents: 300 }
];

test('métricas diárias separam cancelados e calculam ticket', () => {
  const [row] = aggregateDailyMetrics(orders);
  assert.equal(row.orders, 3);
  assert.equal(row.cancelledOrders, 1);
  assert.equal(row.completedOrders, 2);
  assert.equal(row.grossCents, 4000n);
  assert.equal(row.averageTicketCents, 2000n);
});

test('métricas horárias ordenam a série por hora', () => {
  const rows = aggregateHourlyMetrics(orders);
  assert.deepEqual(rows.map(row => row.hour), [11, 12]);
  assert.equal(rows[0].grossCents, 1000n);
});
