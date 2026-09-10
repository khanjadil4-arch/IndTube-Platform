/**
 * Portable PostgreSQL connection layer.
 *
 * Uses the `pg` package (node-postgres) — a standard, non-ORM driver that works
 * with any PostgreSQL instance (self-hosted, managed, or local). The connection
 * pool is initialized lazily: if DATABASE_URL is not set, the pool is not
 * created and the server still starts (health endpoint works without a DB).
 *
 * No fake database implementation. No vendor-specific features.
 */

import { Pool, type PoolClient } from 'pg';
export type { PoolClient };
import { config } from '../config/index.js';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    if (!config.databaseUrl) {
      throw new Error('DATABASE_URL is not set. Cannot connect to PostgreSQL.');
    }
    pool = new Pool({
      connectionString: config.databaseUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }
  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  const client = await getPool().connect();
  try {
    const result = await client.query<T>(text, params);
    return result.rows;
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function testConnection(): Promise<boolean> {
  try {
    const client = await getPool().connect();
    client.release();
    return true;
  } catch {
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
