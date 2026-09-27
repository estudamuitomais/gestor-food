export class PostgresEventRepository {
  constructor({ persistence }) {
    this.persistence = persistence;
    this.rows = new Map();
  }

  has(id) { return this.rows.has(id); }
  get(id) { return this.rows.get(id); }
  list() { return [...this.rows.values()]; }

  add(event) {
    const row = {
      ...event,
      id: event.id,
      orderId: event.orderId ?? event.metadata?.orderId ?? event.metadata?.id,
      receivedAt: event.receivedAt ?? new Date().toISOString(),
      processedAt: event.processedAt ?? new Date().toISOString()
    };
    this.rows.set(row.id, row);
    void this.persistence.query(
      `INSERT INTO ifood_events (id, external_event_id, code, merchant_id, order_id, raw_payload, received_at, processed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (external_event_id) DO NOTHING`,
      [row.id, row.id, row.code ?? row.fullCode ?? 'UNKNOWN', row.merchantId ?? null, row.orderId ?? null, JSON.stringify(row), row.receivedAt, row.processedAt]
    ).catch(() => {});
  }

  async hydrate() {
    const result = await this.persistence.query(
      'SELECT id, external_event_id, code, merchant_id, order_id, raw_payload, received_at, processed_at FROM ifood_events ORDER BY received_at ASC'
    );
    for (const row of result.rows) {
      let payload = {};
      try { payload = JSON.parse(row.raw_payload); } catch { payload = {}; }
      this.rows.set(row.external_event_id, { ...payload, id: row.external_event_id, code: row.code, merchantId: row.merchant_id, orderId: row.order_id, receivedAt: row.received_at, processedAt: row.processed_at });
    }
    return result.rows.length;
  }
}
