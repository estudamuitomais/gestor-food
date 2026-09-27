import test from 'node:test';
import assert from 'node:assert/strict';
import { IfoodApiClient } from '../src/integrations/ifood/client.js';

test('adaptadores de catálogo e avaliações montam endpoints oficiais', async () => {
  const calls = [];
  const client = new IfoodApiClient({ enabled: true, clientId: 'id', clientSecret: 'secret', fetchImpl: async (url, options) => {
    calls.push({ url, options });
    if (url.includes('/oauth/token')) return { ok: true, json: async () => ({ accessToken: 'token', expiresIn: 3600 }) };
    return { ok: true, json: async () => ({ ok: true }) };
  } });
  await client.listCatalogs('m1');
  await client.listSellableItems('m1', 'c1');
  await client.listReviews('m1', 'page=1');
  await client.replyReview('m1', 'r1', 'Obrigado pelo feedback.');
  assert.match(calls[1].url, /catalog\/v2\.0\/merchants\/m1\/catalogs$/);
  assert.match(calls[4].url, /review\/v2\.0\/merchants\/m1\/reviews\/r1\/answers$/);
});
