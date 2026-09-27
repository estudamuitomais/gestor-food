import test from 'node:test';
import assert from 'node:assert/strict';
import { logEntry, requestId, safeError } from '../src/security/logger.js';

test('log estruturado redige segredos', () => {
  const id = requestId();
  const entry = logEntry({ message: 'request', requestId: id, metadata: { accessToken: 'secret' } });
  assert.equal(entry.requestId, id);
  assert.equal(entry.metadata.accessToken, '[REDACTED]');
});

test('erro seguro não carrega stack ou payload', () => {
  const safe = safeError(new Error('falha')); 
  assert.deepEqual(safe, { name: 'Error', message: 'falha' });
  assert.equal('stack' in safe, false);
});
