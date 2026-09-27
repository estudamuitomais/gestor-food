import test from 'node:test';
import assert from 'node:assert/strict';
import { IfoodApiClient } from '../src/integrations/ifood/client.js';

test('repete erros transitórios e não repete erro 400', async () => {
  let calls = 0;
  const client = new IfoodApiClient({ enabled: true, clientId: 'id', clientSecret: 'secret', fetchImpl: async url => {
    if (url.includes('/oauth/token')) return { ok: true, json: async () => ({ accessToken: 'token', expiresIn: 3600 }) };
    calls += 1;
    return calls < 3 ? { ok: false, status: 503 } : { ok: true, status: 200, json: async () => ({ ok: true }) };
  } });
  await client.listMerchants();
  assert.equal(calls, 3);
});
