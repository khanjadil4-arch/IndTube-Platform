/**
 * Simple, portable migration runner.
 *
 * Reads SQL files from backend/migrations/ in filename order, tracks applied
 * migrations in a `schema_migrations` table, and skips already-applied ones.
 *
 * Usage:  npm run migrate
 *
 * Requires DATABASE_URL to be set. Does not run automatically — must be called
 * explicitly. No ORM, no proprietary framework.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPool, withTransaction, type PoolClient } from '../db/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, '..', '..', 'migrations');

async function ensureMigrationsTable(client: PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename  TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(client: PoolClient): Promise<Set<string>> {
  const result = await client.query<{ filename: string }>(
    'SELECT filename FROM schema_migrations ORDER BY filename',
  );
  return new Set(result.rows.map((r: { filename: string }) => r.filename));
}

async function runMigrations(): Promise<void> {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found.');
    return;
  }

  const pool = getPool();

  for (const filename of files) {
    const applied = await withTransaction(async (client) => {
      await ensureMigrationsTable(client);
      const appliedSet = await getAppliedMigrations(client);

      if (appliedSet.has(filename)) {
        console.log(`  SKIP  ${filename} (already applied)`);
        return false;
      }

      const sql = readFileSync(join(MIGRATIONS_DIR, filename), 'utf-8');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations (filename) VALUES ($1)',
        [filename],
      );
      console.log(`  APPLY ${filename}`);
      return true;
    });

    if (applied) {
      console.log(`  DONE  ${filename}`);
    }
  }

  await pool.end();
  console.log('Migrations complete.');
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
