export class IfoodSyncService {
  constructor({ client, eventRepository = new MemoryEventRepository(), orderRepository = new MemoryOrderRepository() } = {}) {
    this.client = client;
    this.events = eventRepository;
    this.orders = orderRepository;
    this.processing = new Set();
  }

  async syncOnce() {
    const response = await this.client.pollEvents();
    const incoming = response?.events ?? response ?? [];
    const processedIds = [];
    for (const event of incoming) {
      const result = await this.ingestEvent(event);
      if (result.processed) processedIds.push(event.id);
    }
    if (processedIds.length) await this.client.acknowledgeEvents(processedIds);
    return { received: incoming.length, processed: processedIds.length, acknowledged: processedIds };
  }

  async ingestEvent(event) {
    if (!event?.id) return { processed: false, duplicate: false };
    if (this.events.has(event.id) || this.processing.has(event.id)) return { processed: false, duplicate: true };
    this.processing.add(event.id);
    try {
      await this.processEvent(event);
      this.events.add(event);
      return { processed: true, duplicate: false };
    } finally {
      this.processing.delete(event.id);
    }
  }

  async processEvent(event) {
    const orderId = event.orderId ?? event.metadata?.orderId ?? event.metadata?.id;
    if (orderId) {
      let details = null;
      if (['PLACED', 'CONFIRMED', 'ORDER_PLACED', 'ORDER_CONFIRMED'].includes(event.code) && typeof this.client.getOrder === 'function') details = await this.client.getOrder(orderId);
      this.orders.upsert({ externalId: orderId, status: event.code ?? event.fullCode ?? 'UNKNOWN', eventId: event.id, merchantId: event.merchantId, details });
    }
  }

  reconcile() {
    const events = this.events.list();
    const orders = this.orders.list();
    const orderIds = new Set(orders.map(order => order.externalId));
    const eventOrderIds = new Set(events.map(event => event.orderId).filter(Boolean));
    return { events: events.length, orders: orders.length, eventsWithoutOrder: events.filter(event => event.orderId && !orderIds.has(event.orderId)).map(event => event.id), ordersWithoutEvent: orders.filter(order => order.externalId && !eventOrderIds.has(order.externalId)).map(order => order.externalId) };
  }
}

export class MemoryEventRepository {
  constructor() { this.ids = new Set(); this.rows = new Map(); }
  has(id) { return this.ids.has(id); }
  add(event) { const row = typeof event === 'string' ? { id: event } : { ...event }; this.ids.add(row.id); this.rows.set(row.id, { ...row, receivedAt: row.receivedAt ?? new Date().toISOString(), processedAt: new Date().toISOString() }); }
  get(id) { return this.rows.get(id); }
  list() { return [...this.rows.values()]; }
}

export class MemoryOrderRepository {
  constructor() { this.rows = new Map(); }
  upsert(order) { this.rows.set(order.externalId, { ...this.rows.get(order.externalId), ...order, updatedAt: new Date().toISOString() }); }
  get(externalId) { return this.rows.get(externalId); }
  list() { return [...this.rows.values()]; }
}
