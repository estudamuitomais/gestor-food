import { createHmac, timingSafeEqual } from 'node:crypto';

const API_BASE = 'https://merchant-api.ifood.com.br';

export class IfoodApiClient {
  constructor({ clientId, clientSecret, enabled = false, fetchImpl = fetch, requestTimeoutMs = 10000 } = {}) {
    if (!Number.isFinite(requestTimeoutMs) || requestTimeoutMs <= 0) throw new Error('Timeout HTTP inválido.');
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.enabled = enabled;
    this.fetch = fetchImpl;
    this.requestTimeoutMs = requestTimeoutMs;
    this.accessToken = null;
    this.expiresAt = 0;
  }

  assertEnabled() {
    if (!this.enabled) throw new Error('Integração iFood desativada por segurança.');
    if (!this.clientId || !this.clientSecret) throw new Error('Credenciais iFood não configuradas.');
  }

  async token() {
    this.assertEnabled();
    if (this.accessToken && Date.now() < this.expiresAt - 60000) return this.accessToken;
    const body = new URLSearchParams({ grantType: 'client_credentials', clientId: this.clientId, clientSecret: this.clientSecret });
    const response = await this.fetchWithTimeout(`${API_BASE}/authentication/v1.0/oauth/token`, { method: 'POST', headers: { accept: 'application/json', 'content-type': 'application/x-www-form-urlencoded' }, body });
    if (!response.ok) throw new Error(`Falha ao autenticar no iFood: HTTP ${response.status}`);
    const data = await response.json();
    this.accessToken = data.accessToken;
    this.expiresAt = Date.now() + Number(data.expiresIn ?? 0) * 1000;
    return this.accessToken;
  }

  async request(path, options = {}) {
    const token = await this.token();
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const response = await this.fetchWithTimeout(`${API_BASE}${path}`, { ...options, headers: { Authorization: `Bearer ${token}`, accept: 'application/json', ...(options.headers ?? {}) } });
      if (response.ok) return response.status === 204 ? null : response.json();
      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) throw new Error(`Erro na API iFood ${path}: HTTP ${response.status}`);
      await new Promise(resolve => setTimeout(resolve, 2 ** attempt));
    }
  }

  async fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);
    try { return await this.fetch(url, { ...options, signal: controller.signal }); }
    finally { clearTimeout(timeout); }
  }

  listMerchants() { return this.request('/merchant/v1.0/merchants'); }
  getMerchantStatus(merchantId) { return this.request(`/merchant/v1.0/merchants/${encodeURIComponent(merchantId)}/status`); }
  getOrder(orderId) { return this.request(`/order/v1.0/orders/${encodeURIComponent(orderId)}`); }
  listCatalogs(merchantId) { return this.request(`/catalog/v2.0/merchants/${encodeURIComponent(merchantId)}/catalogs`); }
  listSellableItems(merchantId, catalogId) { return this.request(`/catalog/v2.0/merchants/${encodeURIComponent(merchantId)}/catalogs/${encodeURIComponent(catalogId)}/sellableItems`); }
  listReviews(merchantId, query = '') { return this.request(`/review/v2.0/merchants/${encodeURIComponent(merchantId)}/reviews${query ? `?${query}` : ''}`); }
  replyReview(merchantId, reviewId, text) { return this.request(`/review/v2.0/merchants/${encodeURIComponent(merchantId)}/reviews/${encodeURIComponent(reviewId)}/answers`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text }) }); }
  pollEvents() { return this.request('/order/v1.0/events:polling'); }
  acknowledgeEvents(eventIds) { return this.request('/order/v1.0/events/acknowledgment', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ acknowledgedEventIds: eventIds }) }); }

  static verifyWebhookSignature(rawBody, receivedSignature, secret) {
    if (!receivedSignature || !secret) return false;
    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const actual = Buffer.from(receivedSignature, 'hex');
    const wanted = Buffer.from(expected, 'hex');
    return actual.length === wanted.length && timingSafeEqual(actual, wanted);
  }
}

export function createIfoodClient(env = process.env) {
  return new IfoodApiClient({ clientId: env.IFOOD_CLIENT_ID, clientSecret: env.IFOOD_CLIENT_SECRET, enabled: env.IFOOD_INTEGRATION_ENABLED === 'true', requestTimeoutMs: env.IFOOD_REQUEST_TIMEOUT_MS === undefined ? 10000 : Number(env.IFOOD_REQUEST_TIMEOUT_MS) });
}
