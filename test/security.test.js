import test from 'node:test';
import assert from 'node:assert/strict';
import { IdempotencyStore, SlidingWindowLimiter, redactSecrets, validateEnvironment } from '../src/security/config.js';

test('redige segredos recursivamente', () => {
  const safe = redactSecrets({ accessToken: 'secret', nested: { clientSecret: 'secret2' }, value: 'ok' });
  assert.equal(safe.accessToken, '[REDACTED]');
  assert.equal(safe.nested.clientSecret, '[REDACTED]');
  assert.equal(safe.value, 'ok');
});

test('modo real exige credenciais e mantém custos bloqueados', () => {
  assert.equal(validateEnvironment({ IFOOD_INTEGRATION_ENABLED: 'true' }).valid, false);
  assert.match(validateEnvironment({ IFOOD_INTEGRATION_ENABLED: 'true', IFOOD_CLIENT_ID: 'id', IFOOD_CLIENT_SECRET: 'secret' }).errors.join(' '), /REQUIRE_AUTH/);
  assert.equal(validateEnvironment({ IFOOD_INTEGRATION_ENABLED: 'false', COSTS_ENABLED: 'false' }).valid, true);
});

test('idempotência bloqueia repetição dentro do TTL', () => {
  const store = new IdempotencyStore();
  assert.equal(store.claim('event-1'), true);
  assert.equal(store.claim('event-1'), false);
});

test('idempotência valida TTL e remove chaves expiradas', () => {
  const store = new IdempotencyStore();
  assert.throws(() => store.claim('event-1', 0), /TTL de idempotência inválido/);
  store.keys.set('expired', Date.now() - 1);
  store.prune();
  assert.equal(store.keys.has('expired'), false);
});

test('limiter bloqueia excesso de requisições', () => {
  const limiter = new SlidingWindowLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(limiter.allow('ip'), true);
  assert.equal(limiter.allow('ip'), true);
  assert.equal(limiter.allow('ip'), false);
});

test('limiter descarta janela expirada antes de registrar novo acesso', () => {
  const limiter = new SlidingWindowLimiter({ limit: 1, windowMs: 10 });
  assert.equal(limiter.allow('ip'), true);
  limiter.hits.set('ip', [Date.now() - 20]);
  assert.equal(limiter.allow('ip'), true);
  assert.equal(limiter.hits.get('ip').length, 1);
});
