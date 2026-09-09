import crypto from 'node:crypto';

/**
 * Computes an HMAC SHA-256 signature encoded as a hex string.
 */
export function computeHmacSha256Hex(secret: string, data: string): string {
  return crypto.createHmac('sha256', secret).update(data, 'utf8').digest('hex');
}

/**
 * Performs timing-safe string comparison to prevent timing attacks.
 */
export function timingSafeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Generates a cryptographically secure random UUID v4 string using node:crypto.
 */
export function generateUuid(): string {
  return crypto.randomUUID();
}
