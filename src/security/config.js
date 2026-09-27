const secretKeys = ['clientSecret', 'client_secret', 'accessToken', 'access_token', 'refreshToken', 'refresh_token', 'authorization'];

export function redactSecrets(value) {
  if (Array.isArray(value)) return value.map(redactSecrets);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, secretKeys.some(secret => key.toLowerCase().includes(secret.toLowerCase())) ? '[REDACTED]' : redactSecrets(item)]));
}

export function validateEnvironment(env = process.env) {
  const enabled = env.IFOOD_INTEGRATION_ENABLED === 'true';
  const errors = [];
  if (enabled && !env.IFOOD_CLIENT_ID) errors.push('IFOOD_CLIENT_ID ausente');
  if (enabled && !env.IFOOD_CLIENT_SECRET) errors.push('IFOOD_CLIENT_SECRET ausente');
  if (enabled && env.REQUIRE_AUTH !== 'true') errors.push('REQUIRE_AUTH deve ser true no modo REAL');
  if (env.COSTS_ENABLED === 'true') errors.push('COSTS_ENABLED não pode ser true sem autorização operacional explícita');
  return { valid: errors.length === 0, enabled, errors };
}

export class IdempotencyStore {
  constructor() { this.keys = new Map(); }
  claim(key, ttlMs = 86400000) {
    if (!key) throw new Error('Chave de idempotência obrigatória.');
    if (!Number.isFinite(ttlMs) || ttlMs <= 0) throw new Error('TTL de idempotência inválido.');
    const now = Date.now();
    const existing = this.keys.get(key);
    if (existing && existing > now) return false;
    if (existing && existing <= now) this.keys.delete(key);
    this.keys.set(key, now + ttlMs);
    return true;
  }
  prune() {
    const now = Date.now();
    for (const [key, expiresAt] of this.keys) if (expiresAt <= now) this.keys.delete(key);
  }
}

export class SlidingWindowLimiter {
  constructor({ limit = 60, windowMs = 60000 } = {}) { this.limit = limit; this.windowMs = windowMs; this.hits = new Map(); }
  allow(key) {
    const now = Date.now();
    const active = (this.hits.get(key) ?? []).filter(timestamp => timestamp > now - this.windowMs);
    if (active.length >= this.limit) { this.hits.set(key, active); return false; }
    if (!active.length) this.hits.delete(key);
    active.push(now); this.hits.set(key, active); return true;
  }
}
