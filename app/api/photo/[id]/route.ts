import { env } from 'cloudflare:workers';
import { isAuthorized } from '@/lib/auth';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAuthorized(request)) return new Response('Unauthorized', { status: 401 });
  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) return new Response('Not found', { status: 404 });
  const object = await env.FILES.get(`wishes/${id}`);
  if (!object) return new Response('Not found', { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'private, max-age=86400');
  headers.set('x-content-type-options', 'nosniff');
  return new Response(object.body, { headers });
}
