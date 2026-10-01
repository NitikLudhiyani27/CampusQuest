// Builds and configures the Fastify instance (no listening here).
import Fastify from 'fastify';
import postgresPlugin from './plugins/postgres.js';
import healthRoutes from './routes/health.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';

export async function buildApp() {
  const app = Fastify({ logger: true });

  // Filled in by the auth middleware on protected routes.
  app.decorateRequest('user', null);

  // Consistent JSON errors: { "error": "..." }
  app.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ error: 'Not found' });
  });

  app.setErrorHandler((err, request, reply) => {
    // Unique-constraint violation (e.g. email already used by another account)
    if (err.code === '23505') {
      return reply.code(409).send({ error: 'User already exists with this email' });
    }

    const status = err.statusCode && err.statusCode < 500 ? err.statusCode : 500;
    if (status >= 500) request.log.error(err);

    reply.code(status).send({ error: status >= 500 ? 'Internal Server Error' : err.message });
  });

  // Plugins
  await app.register(postgresPlugin);

  // Routes
  await app.register(healthRoutes);
  await app.register(authRoutes);
  await app.register(userRoutes);

  return app;
}
