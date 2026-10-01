// GET /me - returns the authenticated player's profile (creating it on first login).
import { authenticate } from '../auth/middleware.js';
import { queryOne } from '../db/db.js';

// Atomic "insert or update": creates the user on first login, otherwise refreshes
// profile info from Google and bumps last_seen. Only public profile columns are returned.
// users.name is required, so a token without a name falls back to the email's local part
// (an existing name is never overwritten by that fallback).
const UPSERT_USER_SQL = `
  INSERT INTO users (firebase_uid, name, email, avatar_url, last_seen)
  VALUES ($1, COALESCE($2::text, split_part($3, '@', 1)), $3, $4, NOW())
  ON CONFLICT (firebase_uid) DO UPDATE
    SET name       = COALESCE($2::text, users.name),
        email      = EXCLUDED.email,
        avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
        last_seen  = NOW()
  RETURNING id, name, email, team_id, avatar_url, created_at, last_seen
`;

export default async function authRoutes(app) {
  app.get('/me', { preHandler: authenticate }, async (request, reply) => {
    const { uid, email, name, picture } = request.user;

    // Our users table requires an email (Google login always provides one).
    if (!email) {
      return reply.code(400).send({ error: 'Token does not contain an email' });
    }

    return queryOne(UPSERT_USER_SQL, [uid, name, email, picture]);
  });
}
