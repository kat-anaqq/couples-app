import { env } from 'cloudflare:workers';
import { isAuthorized } from '@/lib/auth';
import {
  initialState,
  movePhotosToStorage,
  validateIncomingState,
} from '@/lib/state';

type StateRow = { payload: string; revision: number; updated_at: string };

async function ensureRow() {
  await env.DB.prepare(
    'INSERT OR IGNORE INTO couple_state (id, payload, revision) VALUES (?, ?, 0)',
  )
    .bind('main', JSON.stringify(initialState()))
    .run();
}

export async function GET(request: Request) {
  if (!isAuthorized(request))
    return Response.json({ error: 'Требуется код пары' }, { status: 401 });
  await ensureRow();
  const row = await env.DB.prepare(
    'SELECT payload, revision, updated_at FROM couple_state WHERE id = ?',
  )
    .bind('main')
    .first<StateRow>();
  if (!row)
    return Response.json(
      { state: initialState(), revision: 0 },
      { headers: { 'cache-control': 'no-store', etag: 'W/"state-0"' } },
    );
  const etag = `W/"state-${row.revision}"`;
  if (request.headers.get('if-none-match') === etag) {
    return new Response(null, {
      status: 304,
      headers: { 'cache-control': 'no-store', etag },
    });
  }
  let state;
  try {
    state = validateIncomingState(JSON.parse(row.payload));
  } catch {
    state = initialState();
  }
  return Response.json(
    { state, revision: row.revision, updatedAt: row.updated_at },
    { headers: { 'cache-control': 'no-store', etag } },
  );
}

export async function PUT(request: Request) {
  if (!isAuthorized(request))
    return Response.json({ error: 'Требуется код пары' }, { status: 401 });
  try {
    const body = (await request.json()) as {
      state?: unknown;
      revision?: unknown;
    };
    if (!Number.isInteger(body.revision) || (body.revision as number) < 0)
      return Response.json({ error: 'Некорректная версия' }, { status: 400 });
    const normalized = await movePhotosToStorage(
      validateIncomingState(body.state),
    );
    await ensureRow();
    const result = await env.DB.prepare(
      "UPDATE couple_state SET payload = ?, revision = revision + 1, updated_at = datetime('now') WHERE id = ? AND revision = ?",
    )
      .bind(JSON.stringify(normalized), 'main', body.revision)
      .run();
    if (!result.meta.changes) {
      const current = await env.DB.prepare(
        'SELECT payload, revision, updated_at FROM couple_state WHERE id = ?',
      )
        .bind('main')
        .first<StateRow>();
      return Response.json(
        {
          error: 'conflict',
          state: current ? JSON.parse(current.payload) : initialState(),
          revision: current?.revision ?? 0,
        },
        { status: 409 },
      );
    }
    const revision = (body.revision as number) + 1;
    return Response.json(
      { state: normalized, revision },
      {
        headers: { 'cache-control': 'no-store', etag: `W/"state-${revision}"` },
      },
    );
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Не удалось сохранить',
      },
      { status: 400 },
    );
  }
}
