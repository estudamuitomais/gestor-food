import test from 'node:test';
import assert from 'node:assert/strict';
import { Persistence } from '../src/db/persistence.js';

test('persistência permanece explícita em memória sem DATABASE_URL', async () => {
  const persistence = new Persistence({ connectionString: '' });
  assert.deepEqual(await persistence.check(), { mode: 'MEMORY', ready: true, productionReady: false, errors: [] });
  await persistence.close();
});

test('migração exige uma conexão PostgreSQL configurada', async () => {
  const persistence = new Persistence({ connectionString: '' });
  await assert.rejects(() => persistence.migrate(), /DATABASE_URL não configurada/);
  await persistence.close();
});
