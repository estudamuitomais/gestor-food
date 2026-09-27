import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { createIfoodClient, IfoodApiClient } from '../src/integrations/ifood/client.js';

test('integração permanece bloqueada por padrão', async () => {
  const client = new IfoodApiClient();
  await assert.rejects(() => client.listMerchants(), /desativada/);
});

test('valida assinatura HMAC do webhook sobre o body bruto', () => {
  const body = Buffer.from('{"code":"PLACED"}');
  const secret = 'test-secret';
  const signature = createHmac('sha256', secret).update(body).digest('hex');
  assert.equal(IfoodApiClient.verifyWebhookSignature(body, signature, secret), true);
  assert.equal(IfoodApiClient.verifyWebhookSignature(body, signature.replace(/.$/, '0'), secret), false);
});

test('cliente iFood aplica timeout configurável às chamadas', async () => {
  let receivedSignal;
  const client = new IfoodApiClient({ clientId: 'id', clientSecret: 'secret', enabled: true, requestTimeoutMs: 50, fetchImpl: async (_url, options) => { receivedSignal = options.signal; return { ok: true, json: async () => ({ accessToken: 'token', expiresIn: 3600 }) }; } });
  await client.token();
  assert.equal(receivedSignal instanceof AbortSignal, true);
  assert.throws(() => new IfoodApiClient({ requestTimeoutMs: 0 }), /Timeout HTTP inválido/);
});

test('cliente iFood lê timeout do ambiente', () => {
  assert.equal(createIfoodClient({ IFOOD_REQUEST_TIMEOUT_MS: '2500' }).requestTimeoutMs, 2500);
});
