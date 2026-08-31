import { env } from 'cloudflare:workers';

export type CoupleState = {
  version: 1;
  names: [string, string];
  wishes: Array<Record<string, unknown>>;
  shopping: Array<Record<string, unknown>>;
  tasks: Array<Record<string, unknown>>;
  movies: Array<Record<string, unknown>>;
  stores: Array<Record<string, unknown>>;
  products: Array<Record<string, unknown>>;
};

export const initialState = (): CoupleState => ({
  version: 1,
  names: ['Я', 'Ты'],
  wishes: [], shopping: [], tasks: [], movies: [], stores: [], products: [],
});

const collections = ['wishes', 'shopping', 'tasks', 'movies', 'stores', 'products'] as const;

export function validateIncomingState(value: unknown): CoupleState {
  if (!value || typeof value !== 'object') throw new Error('Некорректные данные');
  const state = value as Record<string, unknown>;
  if (state.version !== 1 || !Array.isArray(state.names) || state.names.length !== 2) throw new Error('Некорректная версия данных');
  if (state.names.some(name => typeof name !== 'string' || !name.trim() || name.length > 30)) throw new Error('Некорректные имена');
  for (const key of collections) {
    if (!Array.isArray(state[key]) || state[key].length > 5000) throw new Error(`Некорректный список: ${key}`);
  }
  if (JSON.stringify(state).length > 5_000_000) throw new Error('Слишком большой объём данных');
  return state as CoupleState;
}

export async function movePhotosToStorage(state: CoupleState): Promise<CoupleState> {
  const next = structuredClone(state);
  for (const wish of next.wishes) {
    const id = typeof wish.id === 'string' ? wish.id : '';
    const photo = typeof wish.photo === 'string' ? wish.photo : '';
    if (!photo.startsWith('data:image/')) continue;
    if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) throw new Error('Некорректный идентификатор фото');
    const match = photo.match(/^data:image\/(jpeg|png|webp);base64,([a-zA-Z0-9+/=]+)$/);
    if (!match) throw new Error('Некорректный формат фото');
    const binary = atob(match[2]);
    if (binary.length > 500_000) throw new Error('Фото слишком большое');
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    const contentType = match[1] === 'jpeg' ? 'image/jpeg' : `image/${match[1]}`;
    await env.FILES.put(`wishes/${id}`, bytes, { httpMetadata: { contentType, cacheControl: 'private, max-age=86400' } });
    wish.photo = `/api/photo/${id}`;
  }
  return next;
}
