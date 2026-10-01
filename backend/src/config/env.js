// Loads environment variables from .env (if present) and exposes
// a single config object for the rest of the app.
import 'dotenv/config';

/**
 * Service-account private keys are multiline. In .env / Docker they usually
 * arrive with literal "\n" sequences (and sometimes wrapped in quotes),
 * so convert them back into real PEM line breaks.
 */
function normalizePrivateKey(value) {
  if (!value) return '';
  return value
    .trim()
    .replace(/^["']|["']$/g, '') // strip wrapping quotes, if any
    .replace(/\\n/g, '\n'); // literal \n -> real newline
}

export const env = {
  PORT: Number(process.env.PORT) || 3000,

  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'campusquest',
  DB_USER: process.env.DB_USER || 'campus',
  DB_PASSWORD: process.env.DB_PASSWORD || 'campus123',

  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || '',
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || '',
  FIREBASE_PRIVATE_KEY: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
};
