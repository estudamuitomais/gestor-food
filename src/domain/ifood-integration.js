/**
 * Contrato local. Os métodos reais só devem ser implementados após credenciais,
 * seleção de módulos e homologação oficial do iFood.
 */
export class IfoodIntegrationService {
  constructor({ mode = 'DEMO' } = {}) { this.mode = mode; }
  async listMerchants() { return this.notAvailable('Merchant'); }
  async receiveEvents() { return this.notAvailable('Events'); }
  async getOrder() { return this.notAvailable('Order'); }
  async getCatalog() { return this.notAvailable('Catalog'); }
  async getReviews() { return this.notAvailable('Review'); }
  async getFinancialData() { return this.notAvailable('Financial'); }
  notAvailable(module) { return { mode: this.mode, module, available: false, reason: 'Integração oficial ainda não habilitada na Fase 1.' }; }
}
