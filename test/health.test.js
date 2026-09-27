import test from 'node:test';
import assert from 'node:assert/strict';
import { validateEnvironment } from '../src/security/config.js';

test('ambiente DEMO informa que chamadas externas estão bloqueadas', () => {
  const result = validateEnvironment({ IFOOD_INTEGRATION_ENABLED: 'false', COSTS_ENABLED: 'false' });
  assert.equal(result.valid, true);
  assert.equal(result.enabled, false);
});
