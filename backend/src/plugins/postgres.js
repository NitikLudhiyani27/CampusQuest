// Fastify plugin: exposes the pg pool as `app.pg`, checks the DB connection
// on startup, and closes the pool on shutdown.
// The schema is managed by SQL migrations in /db (see README), not by the app.
import fp from 'fastify-plugin';
import { pool, testConnection } from '../db/db.js';

async function postgresPlugin(app) {
  app.decorate('pg', pool);

  app.addHook('onClose', async () => {
    await pool.end();
  });

  try {
    await testConnection();
    console.log('✓ PostgreSQL connected');
  } catch (err) {
    // Logged clearly but non-fatal, so the API can still boot and report health.
    console.error('✗ PostgreSQL connection FAILED');
    console.error(`  Reason: ${err.message}`);
    console.error('  Check DB_HOST / DB_PORT / DB_NAME / DB_USER / DB_PASSWORD in your environment.');
  }
}

// fastify-plugin makes the `pg` decorator visible outside this plugin's scope.
export default fp(postgresPlugin, { name: 'postgres' });
