import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));

export class Persistence {
  constructor({ connectionString = process.env.DATABASE_URL } = {}) {
    this.connectionString = connectionString?.trim() || '';
    this.mode = this.connectionString ? 'POSTGRES' : 'MEMORY';
    this.pool = this.connectionString
      ? new Pool({
          connectionString: this.connectionString,
          max: Number(process.env.DATABASE_POOL_MAX ?? 5),
          connectionTimeoutMillis: Number(process.env.DATABASE_CONNECT_TIMEOUT_MS ?? 5000),
          ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false }
        })
      : null;
  }

  async check() {
    if (!this.pool) return { mode: 'MEMORY', ready: true, productionReady: false, errors: [] };
    try {
      await this.pool.query('SELECT 1');
      return { mode: 'POSTGRES', ready: true, productionReady: true, errors: [] };
    } catch {
      return { mode: 'POSTGRES', ready: false, productionReady: false, errors: ['Banco de dados indisponível.'] };
    }
  }

  async query(text, values = []) {
    if (!this.pool) throw new Error('DATABASE_URL não configurada.');
    return this.pool.query(text, values);
  }

  async migrate() {
    if (!this.pool) throw new Error('DATABASE_URL não configurada.');
    const schema = await readFile(schemaPath, 'utf8');
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(schema);
      await client.query(
        `INSERT INTO schema_migrations (version, applied_at)
         VALUES ($1, $2)
         ON CONFLICT (version) DO UPDATE SET applied_at = EXCLUDED.applied_at`,
        ['001_initial_schema', new Date().toISOString()]
      );
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async close() {
    await this.pool?.end();
  }
}
