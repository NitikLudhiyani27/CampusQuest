// Fastify preHandler that authenticates requests using a Firebase ID token.
import { verifyIdToken, AuthNotConfiguredError } from './firebase.js';

/**
 * Usage: app.get('/route', { preHandler: authenticate }, handler)
 * On success it sets request.user = { uid, email, name, picture }.
 */
export async function authenticate(request, reply) {
  // 1. Read "Authorization: Bearer <token>"
  const match = /^Bearer\s+(\S+)$/i.exec(request.headers.authorization ?? '');
  if (!match) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  // 2. Verify the token with Firebase
  try {
    const decoded = await verifyIdToken(match[1]);

    // 3. Attach the user to the request
    request.user = {
      uid: decoded.uid,
      email: decoded.email ?? null,
      name: decoded.name ?? null,
      picture: decoded.picture ?? null,
    };
  } catch (err) {
    if (err instanceof AuthNotConfiguredError) {
      request.log.error('Firebase Admin is not configured; cannot verify tokens');
      return reply.code(500).send({ error: 'Authentication is not configured' });
    }
    // Invalid, expired, or malformed token
    return reply.code(401).send({ error: 'Unauthorized' });
  }
}
