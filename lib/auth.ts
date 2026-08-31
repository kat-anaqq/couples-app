import { env } from 'cloudflare:workers';

const COOKIE = 'vdvoem_session';

export function configuredHash(): string {
  const value = env.COUPLE_CODE_HASH?.trim().toLowerCase();
  if (!value || !/^[a-f0-9]{64}$/.test(value)) throw new Error('COUPLE_CODE_HASH is not configured');
  return value;
}

export async function hashCode(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return result === 0;
}

export function isAuthorized(request: Request): boolean {
  const cookie = request.headers.get('cookie') ?? '';
  const value = cookie.split(';').map(part => part.trim()).find(part => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? '';
  return constantTimeEqual(value, configuredHash());
}

export function sessionCookie(hash: string): string {
  return `${COOKIE}=${hash}; Path=/; Max-Age=31536000; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return `${COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`;
}
