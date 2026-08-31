import { configuredHash, hashCode, sessionCookie, clearSessionCookie } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json() as { code?: unknown };
    if (typeof body.code !== 'string' || body.code.length > 100) return Response.json({ error: 'Введите код пары' }, { status: 400 });
    const candidate = await hashCode(body.code);
    if (candidate !== configuredHash()) return Response.json({ error: 'Неверный код пары' }, { status: 401 });
    return Response.json({ ok: true }, { headers: { 'set-cookie': sessionCookie(candidate), 'cache-control': 'no-store' } });
  } catch {
    return Response.json({ error: 'Не удалось войти' }, { status: 500 });
  }
}

export async function DELETE() {
  return Response.json({ ok: true }, { headers: { 'set-cookie': clearSessionCookie(), 'cache-control': 'no-store' } });
}
