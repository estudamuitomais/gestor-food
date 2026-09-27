import test from 'node:test';
import assert from 'node:assert/strict';
import { configureAuditPersistence, hydrateAudit, listAudit, recordAudit } from '../src/domain/audit.js';

test('auditoria persiste e hidrata sem quebrar o fallback em memória', async () => {
  const stored = [];
  configureAuditPersistence({ append: async entry => stored.push(entry), load: async () => stored });
  const entry = recordAudit({ action: 'TEST_AUDIT', actor: 'test', entity: 'test', entityId: '1', metadata: { safe: true } });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(stored.some(item => item.id === entry.id), true);
  configureAuditPersistence({ load: async () => [{ ...entry, id: 'persisted-audit', createdAt: entry.createdAt }] });
  assert.equal(await hydrateAudit(), 1);
  assert.equal(listAudit().some(item => item.id === 'persisted-audit'), true);
  configureAuditPersistence(null);
});
