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

test('cliente iFood monta operações obrigatórias do Merchant', async () => {
  const calls = [];
  const client = new IfoodApiClient({ clientId: 'id', clientSecret: 'secret', enabled: true, fetchImpl: async (url, options) => {
    calls.push({ url, method: options.method ?? 'GET' });
    return { ok: true, status: 200, json: async () => ({}) };
  } });
  await client.getMerchant('m1');
  await client.getMerchantStatus('m1');
  await client.getMerchantInterruptions('m1');
  await client.createMerchantInterruption('m1', { start: '2026-09-27T10:00:00Z' });
  await client.deleteMerchantInterruption('m1', 'pause-1');
  await client.getOpeningHours('m1');
  assert.deepEqual(calls.filter(call => !call.url.includes('/authentication/')), [
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1', method: 'GET' },
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1/status', method: 'GET' },
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1/interruptions', method: 'GET' },
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1/interruptions', method: 'POST' },
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1/interruptions/pause-1', method: 'DELETE' },
    { url: 'https://merchant-api.ifood.com.br/merchant/v1.0/merchants/m1/opening-hours', method: 'GET' }
  ]);
});
