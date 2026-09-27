import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('schema SQL preserva isolamento e trilhas operacionais', async () => {
  const schema = await readFile(new URL('../src/db/schema.sql', import.meta.url), 'utf8');
  for (const table of ['schema_migrations', 'companies', 'users', 'stores', 'store_memberships', 'sessions', 'orders', 'order_costs', 'order_items', 'audit_logs', 'ifood_events', 'forecasts', 'approvals', 'notifications']) {
    assert.match(schema, new RegExp(`CREATE TABLE (?:IF NOT EXISTS )?${table}\\b`));
  }
  assert.match(schema, /company_id TEXT NOT NULL REFERENCES companies\(id\)/);
  assert.match(schema, /gross_cents BIGINT NOT NULL/);
  assert.match(schema, /token_hash TEXT NOT NULL UNIQUE/);
  assert.match(schema, /external_event_id TEXT NOT NULL UNIQUE/);
  assert.match(schema, /price_cents BIGINT NOT NULL CHECK \(price_cents >= 0\)/);
  assert.match(schema, /quantity INTEGER NOT NULL CHECK \(quantity > 0\)/);
  assert.match(schema, /amount_cents BIGINT NOT NULL CHECK \(amount_cents >= 0\)/);
});

test('schema SQL possui índices para consultas operacionais', async () => {
  const schema = await readFile(new URL('../src/db/schema.sql', import.meta.url), 'utf8');
  for (const index of ['idx_stores_company', 'idx_orders_store_created', 'idx_events_order_processed', 'idx_audit_company_created', 'idx_approvals_company_status']) {
    assert.match(schema, new RegExp(`CREATE INDEX (?:IF NOT EXISTS )?${index}\\b`));
  }
});
