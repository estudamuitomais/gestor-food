import test from 'node:test';
import assert from 'node:assert/strict';
import { monitorMerchants } from '../src/integrations/ifood/merchant-monitor.js';

test('monitora status de todas as lojas retornadas pelo iFood', async () => {
  const client = { listMerchants: async () => [{ id: 'm1', name: 'Loja 1' }, { id: 'm2', name: 'Loja 2' }], getMerchantStatus: async id => ({ merchantId: id, state: 'OK' }) };
  const result = await monitorMerchants(client);
  assert.equal(result.length, 2);
  assert.equal(result[1].status.state, 'OK');
});
