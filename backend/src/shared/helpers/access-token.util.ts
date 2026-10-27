import { randomBytes } from 'crypto';

/** Random secret of at least 40 characters for App.accessToken. */
export function generateAppAccessToken(): string {
  const token = randomBytes(32).toString('hex');
  if (token.length < 40) {
    throw new Error('Generated access token is shorter than 40 characters');
  }
  return token;
}
