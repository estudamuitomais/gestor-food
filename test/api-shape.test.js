import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDemoSnapshot } from '../src/domain/demo.js';

test('snapshot oferece contratos de leitura necessários ao dashboard', () => {
  const snapshot = buildDemoSnapshot();
  assert.equal(snapshot.stores.length, 3);
  assert.equal(snapshot.stores.every(store => store.metrics && typeof store.health === 'number'), true);
  assert.equal(Array.isArray(snapshot.opportunities), true);
  assert.equal(Array.isArray(snapshot.approvals), true);
  assert.equal(Array.isArray(snapshot.decisions), true);
});
