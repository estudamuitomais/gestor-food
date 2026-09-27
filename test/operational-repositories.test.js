import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresEventRepository } from '../src/db/operational-repositories.js';

test('repositório PostgreSQL de eventos deduplica no cache e hidrata registros', async () => {
  const queries = [];
  const persistence = { query: async (text, values) => {
    queries.push({ text, values });
    if (text.startsWith('SELECT')) return { rows: [{ id: 'db-1', external_event_id: 'evt-db', code: 'PLACED', merchant_id: 'm-1', order_id: 'o-1', raw_payload: '{"extra":true}', received_at: '2026-01-01T00:00:00.000Z', processed_at: '2026-01-01T00:00:01.000Z' }] };
    return { rows: [] };
  } };
  const repository = new PostgresEventRepository({ persistence });
  repository.add({ id: 'evt-1', code: 'PLACED', orderId: 'o-1' });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(repository.has('evt-1'), true);
  assert.equal(queries.length, 1);
  await repository.hydrate();
  assert.equal(repository.get('evt-db').orderId, 'o-1');
  assert.equal(repository.get('evt-db').extra, true);
});
