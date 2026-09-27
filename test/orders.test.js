import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoSnapshot } from '../src/domain/demo.js';

test('pedidos DEMO têm contrato detalhado e pertencem a uma loja', () => {
  const snapshot = buildDemoSnapshot();
  const orders = snapshot.stores.flatMap(store => store.orders);
  assert.equal(orders.length, 24);
  assert.equal(orders.every(order => order.id && order.storeId && order.createdAt && Number.isInteger(order.grossCents)), true);
});
