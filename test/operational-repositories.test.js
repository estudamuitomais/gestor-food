import test from 'node:test';
import assert from 'node:assert/strict';
import { PostgresApprovalRepository, PostgresEventRepository } from '../src/db/operational-repositories.js';

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

test('repositório PostgreSQL de aprovações salva, atualiza e hidrata decisões', async () => {
  const queries = [];
  const persistence = { query: async (text, values) => {
    queries.push({ text, values });
    if (text.startsWith('SELECT')) return { rows: [{ id: 'a-db', company_id: 'c-1', store_id: 's-1', status: 'APPROVED', title: 'Plano', action_json: '{"action":"Aplicar","risk":"baixo","cost":"R$ 0,00","note":"ok"}', decided_by: 'admin', decided_at: '2026-01-01T00:00:02.000Z', created_at: '2026-01-01T00:00:00.000Z' }] };
    return { rows: [] };
  } };
  const repository = new PostgresApprovalRepository({ persistence });
  await repository.save({ id: 'a1', companyId: 'c-1', storeId: 's-1', status: 'PENDING', title: 'Plano', action: 'Aplicar', risk: 'baixo', cost: 'R$ 0,00', createdAt: '2026-01-01T00:00:00.000Z' });
  const items = await repository.load();
  assert.equal(items[0].status, 'APPROVED');
  assert.equal(items[0].note, 'ok');
  assert.equal(queries.length, 2);
});
