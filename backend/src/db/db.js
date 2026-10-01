// Reusable PostgreSQL connection pool and query helpers (shared across the app).
import pg from 'pg';
import { env } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
});

// Prevent an idle-client error from crashing the process.
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

/**
 * Runs a parameterized query and returns the full pg result.
 * Always pass user input through `params` ($1, $2, ...) - never string-concatenate.
 */
export function query(text, params = []) {
  return pool.query(text, params);
}

/** Returns the first row, or null if there are no rows. */
export async function queryOne(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
}

/** Returns all rows as an array. */
export async function queryMany(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

/**
 * Runs `callback(client)` inside a transaction (BEGIN / COMMIT / ROLLBACK).
 * Handy for later game logic that must update several tables atomically.
 */
export async function withTransaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Runs a trivial query to verify the database is reachable. Throws on failure. */
export async function testConnection() {
  await pool.query('SELECT 1');
}
