import test from 'node:test';
import assert from 'node:assert/strict';
import { featureStatus } from '../src/config/features.js';

test('feature flags mantêm custos e automações sensíveis desativados', () => {
  const result = featureStatus({ IFOOD_INTEGRATION_ENABLED: 'false', COSTS_ENABLED: 'false', REQUIRE_AUTH: 'true' });
  assert.equal(result.mode, 'DEMO');
  assert.equal(result.costsBlocked, true);
  assert.equal(result.authRequired, true);
  assert.equal(result.persistence.productionReady, false);
  assert.equal(result.modules.cmv, false);
  assert.equal(result.modules.customerMessaging, false);
});
