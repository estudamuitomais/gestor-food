-- Fundação do modelo multiempresa/multiloja. Valores financeiros são BIGINT em centavos.
CREATE TABLE schema_migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL);
CREATE TABLE companies (id TEXT PRIMARY KEY, name TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE stores (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), name TEXT NOT NULL, timezone TEXT NOT NULL DEFAULT 'America/Sao_Paulo', created_at TEXT NOT NULL);
CREATE TABLE store_memberships (user_id TEXT NOT NULL REFERENCES users(id), store_id TEXT NOT NULL REFERENCES stores(id), role TEXT NOT NULL, PRIMARY KEY (user_id, store_id));
CREATE TABLE sessions (id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id), token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL, revoked_at TEXT);
CREATE TABLE products (id TEXT PRIMARY KEY, store_id TEXT NOT NULL REFERENCES stores(id), name TEXT NOT NULL, price_cents BIGINT NOT NULL CHECK (price_cents >= 0), max_discount_cents BIGINT NOT NULL DEFAULT 0 CHECK (max_discount_cents >= 0));
CREATE TABLE orders (id TEXT PRIMARY KEY, store_id TEXT NOT NULL REFERENCES stores(id), external_id TEXT, status TEXT NOT NULL, gross_cents BIGINT NOT NULL CHECK (gross_cents >= 0), source TEXT NOT NULL, original_payload TEXT, created_at TEXT NOT NULL);
CREATE TABLE order_costs (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), kind TEXT NOT NULL, amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0), borne_by TEXT NOT NULL, allocation_method TEXT);
CREATE TABLE order_items (id TEXT PRIMARY KEY, order_id TEXT NOT NULL REFERENCES orders(id), product_id TEXT, quantity INTEGER NOT NULL CHECK (quantity > 0), gross_cents BIGINT NOT NULL CHECK (gross_cents >= 0));
CREATE TABLE audit_logs (id TEXT PRIMARY KEY, company_id TEXT, store_id TEXT, actor TEXT NOT NULL, action TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT, metadata_json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE ifood_events (id TEXT PRIMARY KEY, company_id TEXT, store_id TEXT, external_event_id TEXT NOT NULL UNIQUE, code TEXT NOT NULL, merchant_id TEXT, order_id TEXT, raw_payload TEXT NOT NULL, received_at TEXT NOT NULL, processed_at TEXT, acknowledged_at TEXT);
CREATE TABLE forecasts (id TEXT PRIMARY KEY, store_id TEXT NOT NULL REFERENCES stores(id), expected_closing_cents BIGINT NOT NULL, confidence TEXT NOT NULL, inputs_json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE approvals (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), store_id TEXT REFERENCES stores(id), status TEXT NOT NULL, title TEXT NOT NULL, action_json TEXT NOT NULL, decided_by TEXT, decided_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE notifications (id TEXT PRIMARY KEY, company_id TEXT NOT NULL REFERENCES companies(id), store_id TEXT REFERENCES stores(id), type TEXT NOT NULL, severity TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, read_at TEXT, created_at TEXT NOT NULL);

CREATE INDEX idx_stores_company ON stores(company_id);
CREATE INDEX idx_orders_store_created ON orders(store_id, created_at);
CREATE INDEX idx_order_costs_order ON order_costs(order_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_events_order_processed ON ifood_events(order_id, processed_at);
CREATE INDEX idx_audit_company_created ON audit_logs(company_id, created_at);
CREATE INDEX idx_approvals_company_status ON approvals(company_id, status);
