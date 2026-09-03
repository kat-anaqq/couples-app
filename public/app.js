import {
  calculatePricePlan,
  compatibleUnits,
  normalizedPrice,
  offerDetails,
  offerPlan,
} from './price-engine.js';

// All application data stays on this device; no third-party requests or dependencies.
const ICONS = {
  heart:
    '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  home: '<path d="m3 10 9-7 9 7v10H3Z"/><path d="M9 20v-7h6v7"/>',
  bag: '<path d="M5 7h14l1 14H4Z"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>',
  chart: '<path d="M4 3v17h17M8 15V9m5 6V5m5 10v-4"/>',
  checklist:
    '<rect x="5" y="4" width="15" height="17" rx="2"/><path d="M9 4V2m7 2V2m-8 8 2 2 4-4m-6 9h8"/>',
  film: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 3v18m10-18v18M3 8h4m-4 8h4m10-8h4m-4 8h4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h16m-5-5 5 5-5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  edit: '<path d="m15 4 5 5M3 21l5-1L21 7a2 2 0 0 0-5-5L3 16Z"/>',
  trash: '<path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7"/>',
  settings:
    '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.09a2 2 0 0 1 1 1.74v.5a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2Z"/><circle cx="12" cy="12" r="3"/>',
  spark:
    '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
  leaf: '<path d="M20 3C9 2 2 8 5 15s15 3 15-12ZM5 21l10-12"/>',
  store:
    '<path d="M3 9h18L19 3H5ZM4 10v11h16V10M9 21v-7h6v7M8 3 7 9m9-6 1 6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  upload: '<path d="M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  shuffle:
    '<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 3-2 4-4m4-6c1-2 2-4 4-4h3m-4-4 4 4-4 4"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  link: '<path d="m10 13 4-4m-5 7-2 2a4 4 0 0 1-6-6l4-4a4 4 0 0 1 6 0m2 3a4 4 0 0 0 6 0l4-4a4 4 0 0 0-6-6l-2 2" transform="translate(1 2) scale(.9)"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  dock: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18M7 18h.01M12 18h.01M17 18h.01"/>',
};
const icon = (name) =>
  `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ICONS.heart}</svg>`;
const esc = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : Date.now().toString(36) + Math.random().toString(36).slice(2);
const money = (n) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
const localDate = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const dateLabel = (value) =>
  !value
    ? 'Без срока'
    : new Date(value + 'T12:00:00').toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
      });
const THEME_KEY = 'vdvoem.theme';
const MOBILE_NAV_KEY = 'vdvoem.mobile-nav';
let mobileNavMode = (() => {
  try {
    return localStorage.getItem(MOBILE_NAV_KEY) === 'bottom'
      ? 'bottom'
      : 'sidebar';
  } catch {
    return 'sidebar';
  }
})();
function applyTheme(theme, persist = true) {
  const value = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.dataset.theme = value;
  if (persist)
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {}
  document.querySelectorAll('[data-theme-option]').forEach((button) => {
    const selected = button.dataset.themeOption === value;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  document.querySelector('meta[name="theme-color"]').content =
    value === 'dark' ? '#181a18' : '#f8f7f4';
}
function applyMobileNavMode(mode, persist = true) {
  mobileNavMode = mode === 'bottom' ? 'bottom' : 'sidebar';
  document.documentElement.dataset.mobileNav = mobileNavMode;
  if (persist)
    try {
      localStorage.setItem(MOBILE_NAV_KEY, mobileNavMode);
    } catch {}
  closeMenu();
  renderNav();
  document.querySelectorAll('[data-mobile-nav-option]').forEach((button) => {
    const selected = button.dataset.mobileNavOption === mobileNavMode;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
const STORE_KEY = 'vdvoem.app.v1';
const DATA_UNITS = ['шт.', 'г', 'кг', 'мл', 'л', 'уп.'],
  DATA_UNIT_KIND = {
    'шт.': 'count',
    'уп.': 'pack',
    г: 'weight',
    кг: 'weight',
    мл: 'volume',
    л: 'volume',
  };
const CLOUD_MODE =
  !['localhost', '127.0.0.1'].includes(location.hostname) &&
  location.protocol === 'https:';
let cloudRevision = 0,
  cloudSaveTimer,
  cloudRetryTimer,
  cloudRetryDelay = 2000,
  cloudReady = false,
  cloudSyncing = false,
  cloudChangeSeq = 0;
const emptyState = () => ({
  version: 1,
  names: ['Я', 'Ты'],
  wishes: [],
  shopping: [],
  tasks: [],
  movies: [],
  stores: [],
  products: [],
});
const sampleState = () => ({
  version: 1,
  names: ['Я', 'Ты'],
  wishes: [
    {
      id: 'demo-w1',
      sample: true,
      title: 'Выходные у озера',
      category: 'Впечатления',
      owner: 'both',
      budget: 18000,
      note: 'Домик, тишина и никуда не спешить',
      link: '',
      done: false,
    },
    {
      id: 'demo-w2',
      sample: true,
      title: 'Кофемашина домой',
      category: 'Для дома',
      owner: 'both',
      budget: 32000,
      note: 'Чтобы каждое утро было чуть уютнее',
      link: '',
      done: false,
    },
    {
      id: 'demo-w3',
      sample: true,
      title: 'Плёночный фотоаппарат',
      category: 'Вещи',
      owner: 'me',
      budget: 12000,
      note: 'Собирать наши маленькие моменты',
      link: '',
      done: false,
    },
  ],
  shopping: [
    {
      id: 'demo-b1',
      sample: true,
      title: 'Авокадо',
      qty: 1,
      unit: 'шт.',
      price: 99,
      store: '',
      category: 'Продукты',
      done: false,
    },
    {
      id: 'demo-b2',
      sample: true,
      title: 'Овсяное молоко',
      qty: 1,
      unit: 'л',
      price: 159,
      store: '',
      category: 'Продукты',
      done: false,
    },
    {
      id: 'demo-b3',
      sample: true,
      title: 'Свечи для дома',
      qty: 1,
      unit: 'уп.',
      price: 350,
      store: '',
      category: 'Для дома',
      done: false,
    },
  ],
  tasks: [
    {
      id: 'demo-t1',
      sample: true,
      title: 'Выбрать домик на выходные',
      owner: 'both',
      due: '',
      priority: 'Обычный',
      note: 'Найти место рядом с водой',
      done: false,
    },
    {
      id: 'demo-t2',
      sample: true,
      title: 'Полить наши растения',
      owner: 'me',
      due: '',
      priority: 'Обычный',
      note: '',
      done: false,
    },
    {
      id: 'demo-t3',
      sample: true,
      title: 'Забрать посылку',
      owner: 'partner',
      due: '',
      priority: 'Высокий',
      note: '',
      done: false,
    },
    {
      id: 'demo-t4',
      sample: true,
      title: 'Разобрать фотографии из отпуска',
      owner: 'both',
      due: '',
      priority: 'Низкий',
      note: '',
      done: true,
    },
  ],
  movies: [
    {
      id: 'demo-m1',
      sample: true,
      title: 'Королевство полной луны',
      contentType: 'film',
      genre: 'Приключения',
      done: false,
      watchedDate: '',
      ratingMe: '',
      ratingPartner: '',
    },
    {
      id: 'demo-m2',
      sample: true,
      title: 'Тайная жизнь Уолтера Митти',
      contentType: 'film',
      genre: 'Приключения',
      done: false,
      watchedDate: '',
      ratingMe: '',
      ratingPartner: '',
    },
    {
      id: 'demo-m3',
      sample: true,
      title: 'Душа',
      contentType: 'film',
      genre: 'Анимация',
      done: true,
      watchedDate: '',
      ratingMe: 9,
      ratingPartner: 8,
    },
    {
      id: 'demo-m4',
      sample: true,
      title: 'Тед Лассо',
      contentType: 'series',
      genre: 'Комедия',
      done: false,
      watchedDate: '',
      ratingMe: '',
      ratingPartner: '',
      season: 1,
      episode: 3,
      episodeTotal: 10,
    },
  ],
  stores: [
    { id: 'demo-s1', name: 'Пятёрочка', sample: true },
    { id: 'demo-s2', name: 'Магнит', sample: true },
    { id: 'demo-s3', name: 'Лента', sample: true },
  ],
  products: [
    {
      id: 'demo-p1',
      sample: true,
      title: 'Молоко',
      qty: 2,
      unit: 'л',
      prices: {
        'demo-s1': { price: 89.9, size: 1, unit: 'л' },
        'demo-s2': { price: 49.9, size: 500, unit: 'мл' },
        'demo-s3': { price: 99.9, size: 1, unit: 'л' },
      },
    },
    {
      id: 'demo-p2',
      sample: true,
      title: 'Яйца',
      qty: 10,
      unit: 'шт.',
      prices: {
        'demo-s1': { price: 119.9, size: 10, unit: 'шт.' },
        'demo-s2': { price: 99.9, size: 10, unit: 'шт.' },
        'demo-s3': { price: 109.9, size: 10, unit: 'шт.' },
      },
    },
    {
      id: 'demo-p3',
      sample: true,
      title: 'Бананы',
      qty: 1.5,
      unit: 'кг',
      prices: {
        'demo-s1': { price: 139.9, size: 1, unit: 'кг' },
        'demo-s2': { price: 149.9, size: 1, unit: 'кг' },
        'demo-s3': { price: 119.9, size: 1, unit: 'кг' },
      },
    },
    {
      id: 'demo-p4',
      sample: true,
      title: 'Макароны',
      qty: 900,
      unit: 'г',
      prices: {
        'demo-s1': { price: 89.9, size: 450, unit: 'г' },
        'demo-s2': { price: 79.9, size: 450, unit: 'г' },
        'demo-s3': { price: 94.9, size: 450, unit: 'г' },
      },
    },
  ],
});
let state = emptyState(),
  storageProblem = '',
  preserveCorrupt = false;
try {
  if (CLOUD_MODE) state = emptyState();
  else {
    const raw = localStorage.getItem(STORE_KEY);
    state = raw ? validateState(JSON.parse(raw)) : sampleState();
  }
} catch (e) {
  console.error('State validation failed', e);
  storageProblem =
    'Не удалось прочитать сохранение. Вы можете импортировать резервную копию в настройках. Новые данные пока не сохраняются автоматически.';
  preserveCorrupt = true;
}
const initialPage = location.hash.slice(1);
let current = [
  'home',
  'wishes',
  'shopping',
  'tasks',
  'movies',
  'settings',
].includes(initialPage)
  ? initialPage
  : initialPage === 'prices'
    ? 'shopping'
    : 'home';
let filter = 'all',
  query = '',
  toastTimer,
  movieTypeFilter = 'all',
  movieGenreFilter = 'all',
  shoppingMode = initialPage === 'prices' ? 'compare' : 'list';
const PAGE_SIZE = 30;
const visibleLimits = {
  wishes: PAGE_SIZE,
  shopping: PAGE_SIZE,
  tasks: PAGE_SIZE,
  movies: PAGE_SIZE,
  products: PAGE_SIZE,
};
let searchRenderTimer, priceUiTimer;
function resetVisibleLimit(kind = current) {
  if (Object.hasOwn(visibleLimits, kind)) visibleLimits[kind] = PAGE_SIZE;
}
function visibleItems(kind, items) {
  return items.slice(0, visibleLimits[kind] || PAGE_SIZE);
}
function loadMore(kind, total, shown) {
  if (shown >= total) return '';
  return `<div class="load-more"><span>Показано ${shown} из ${total}</span><button class="btn secondary" data-action="load-more" data-kind="${kind}">Показать ещё</button></div>`;
}
if (initialPage === 'prices') history.replaceState(null, '', '#shopping');
const pageInfo = {
  home: ['Главная', 'home'],
  wishes: ['Хотелки', 'heart'],
  shopping: ['Покупки', 'bag'],
  tasks: ['Дела', 'checklist'],
  movies: ['Смотрим вместе', 'film'],
  settings: ['Настройки', 'settings'],
};
const ownerLabel = (owner) =>
  owner === 'me'
    ? state.names[0]
    : owner === 'partner'
      ? state.names[1]
      : 'Вместе';
const firstCharacter = (value) => Array.from(String(value || '?'))[0] || '?';
const hasExamples = () =>
  ['wishes', 'shopping', 'tasks', 'movies', 'stores', 'products'].some((k) =>
    state[k].some((x) => x.sample),
  );
function save() {
  if (CLOUD_MODE) {
    if (!cloudReady) return;
    cloudChangeSeq++;
    document.getElementById('save-status').textContent = 'Синхронизация…';
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(pushCloudState, 350);
    return;
  }
  try {
    if (preserveCorrupt) throw Error('Сохранение защищено');
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    storageProblem = '';
    document.getElementById('save-status').textContent = 'Сохранено в браузере';
  } catch {
    storageProblem =
      'Автосохранение недоступно. Не закрывайте страницу: скачайте резервную копию в настройках.';
    document.getElementById('save-status').textContent = 'Не сохранено';
  }
  showStorageWarning();
}
async function fetchCloudState() {
  const response = await fetch('/api/state', {
    headers: { accept: 'application/json' },
    cache: 'no-store',
  });
  if (response.status === 401) {
    openCloudLogin();
    return false;
  }
  if (!response.ok) throw Error('Сервер временно недоступен');
  const data = await response.json();
  state = validateState(data.state);
  cloudRevision = data.revision;
  cloudReady = true;
  const migration = ensureProductShoppingLinks();
  document.getElementById('save-status').textContent = 'Синхронизировано';
  render();
  if (migration.changed) save();
  if (migration.added) notify(`Добавили в покупки: ${migration.added}`);
  return true;
}
function openCloudLogin() {
  cloudReady = false;
  openModal(
    'Наш код пары',
    `<p class="modal-description">Введите общий код доступа. Он нужен только на новом устройстве.</p><form id="auth-form"><div class="form-grid" style="margin-top:17px"><label class="field full"><span>Код пары</span><input name="code" type="password" required maxlength="100" autocomplete="current-password" autofocus></label></div><div class="form-actions"><button class="btn primary" type="submit">Войти</button></div></form>`,
  );
  document.getElementById('save-status').textContent = 'Нужен код пары';
}
async function pushCloudState() {
  if (cloudSyncing || !cloudReady) return;
  cloudSyncing = true;
  const savingSeq = cloudChangeSeq,
    savingState = structuredClone(state);
  try {
    const response = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ state: savingState, revision: cloudRevision }),
    });
    const data = await response.json();
    if (response.status === 409) {
      state = validateState(data.state);
      cloudRevision = data.revision;
      const migration = ensureProductShoppingLinks();
      render();
      if (migration.changed) save();
      notify(
        'На другом устройстве появились новые изменения. Мы загрузили их — повторите свою последнюю правку.',
      );
      return;
    }
    if (response.status === 401) {
      openCloudLogin();
      return;
    }
    if (!response.ok) throw Error(data.error || 'Не удалось сохранить');
    clearTimeout(cloudRetryTimer);
    cloudRetryDelay = 2000;
    const hadEmbeddedPhoto = savingState.wishes.some(
      (w) => typeof w.photo === 'string' && w.photo.startsWith('data:'),
    );
    cloudRevision = data.revision;
    if (savingSeq === cloudChangeSeq) {
      state = validateState(data.state);
      document.getElementById('save-status').textContent = 'Синхронизировано';
      if (hadEmbeddedPhoto) render();
    }
  } catch {
    document.getElementById('save-status').textContent = 'Нет связи';
    notify(
      'Не удалось синхронизировать. Изменения останутся на экране — попробуем снова.',
    );
    clearTimeout(cloudRetryTimer);
    cloudRetryTimer = setTimeout(() => {
      if (cloudReady) void pushCloudState();
    }, cloudRetryDelay);
    cloudRetryDelay = Math.min(cloudRetryDelay * 2, 30000);
  } finally {
    cloudSyncing = false;
    if (cloudReady && cloudChangeSeq > savingSeq) {
      clearTimeout(cloudSaveTimer);
      cloudSaveTimer = setTimeout(pushCloudState, 0);
    }
  }
}
async function pollCloudState() {
  if (
    !CLOUD_MODE ||
    !cloudReady ||
    cloudSyncing ||
    document.hidden ||
    document.getElementById('modal').open ||
    document.activeElement?.matches('input,textarea,select')
  )
    return;
  try {
    const response = await fetch('/api/state', {
      cache: 'no-store',
      headers: { 'if-none-match': `W/"state-${cloudRevision}"` },
    });
    if (response.status === 304) return;
    if (!response.ok) return;
    const data = await response.json();
    if (data.revision > cloudRevision) {
      state = validateState(data.state);
      cloudRevision = data.revision;
      const migration = ensureProductShoppingLinks();
      render();
      if (migration.changed) save();
      notify(
        migration.added
          ? `Получены изменения. Добавили в покупки: ${migration.added}`
          : 'Получены изменения с другого устройства',
      );
    }
  } catch {}
}
async function startCloudSync() {
  try {
    const ready = await fetchCloudState();
    if (ready) cloudRetryDelay = 2000;
  } catch {
    document.getElementById('save-status').textContent = 'Нет связи';
    clearTimeout(cloudRetryTimer);
    cloudRetryTimer = setTimeout(startCloudSync, cloudRetryDelay);
    cloudRetryDelay = Math.min(cloudRetryDelay * 2, 30000);
  }
}
async function submitCloudLogin(form) {
  if (!form.reportValidity()) return;
  const button = form.querySelector('button');
  button.disabled = true;
  try {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ code: new FormData(form).get('code') }),
    });
    const data = await response.json();
    if (!response.ok) throw Error(data.error || 'Не удалось войти');
    closeModal();
    await fetchCloudState();
    notify('Теперь всё синхронизируется между вашими устройствами');
  } catch (e) {
    notify(e.message);
    button.disabled = false;
  }
}
async function logoutCloud() {
  await fetch('/api/auth', { method: 'DELETE' });
  location.reload();
}
function showStorageWarning() {
  const node = document.getElementById('storage-warning');
  node.textContent = storageProblem;
  node.classList.toggle('hidden', !storageProblem);
}
function notify(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 3200);
}
function illustration(category) {
  let body = '';
  if (category === 'Впечатления') {
    body =
      '<ellipse cx="100" cy="113" rx="75" ry="13" fill="#bbc6b0" opacity=".5"/><path d="M21 103 65 45l45 58" fill="#bbc5ab"/><path d="m96 103 38-46 38 46" fill="#cbd4bc"/><path d="m39 63 43-26 43 26v50H39Z" fill="#d7a27e"/><path d="m29 67 53-35 53 35" fill="none" stroke="#816b55" stroke-width="6" stroke-linecap="round"/><path d="M76 112V80h21v32" fill="#8e7e60"/><rect x="48" y="72" width="19" height="20" rx="2" fill="#f4e7bf"/><path d="M145 106V69m-13 18 13-20 13 20m-24-8 11-19 11 19" stroke="#78846a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/><circle cx="148" cy="30" r="14" fill="#e4c592"/>';
  } else if (category === 'Для дома') {
    body =
      '<ellipse cx="100" cy="118" rx="63" ry="9" fill="#c6a48b" opacity=".2"/><rect x="48" y="27" width="83" height="89" rx="7" fill="#b88366"/><path d="M52 44h75v61H52Z" fill="#e6c7a9"/><rect x="67" y="49" width="45" height="12" rx="2" fill="#7d6453"/><path d="M82 60v11m15-11v11" stroke="#7d6453" stroke-width="5"/><path d="M74 79h31v16c0 17-31 17-31 0Z" fill="#fff7e9"/><path d="M105 82h6c12 0 10 14-6 14" stroke="#fff7e9" stroke-width="5" fill="none"/><rect x="43" y="110" width="93" height="7" rx="3" fill="#8d6e54"/><circle cx="118" cy="36" r="3" fill="#f3dfb8"/><path d="M150 109c-8-17 10-21 4-37m0 20c10-9 13-3 13-3" stroke="#949a70" fill="none" stroke-width="3"/><path d="M140 109h22l-3 11h-16Z" fill="#bfa285"/>';
  } else {
    body =
      '<ellipse cx="100" cy="116" rx="64" ry="10" fill="#a5a0bd" opacity=".2"/><path d="M49 54h23l8-13h34l9 13h29v58H49Z" fill="#9c95af"/><rect x="43" y="60" width="112" height="48" rx="7" fill="#beb6c9"/><circle cx="99" cy="82" r="29" fill="#77758a"/><circle cx="99" cy="82" r="21" fill="#a5a9b1"/><circle cx="99" cy="82" r="14" fill="#626f79"/><circle cx="94" cy="76" r="5" fill="#c7d2d5"/><rect x="128" y="66" width="16" height="8" rx="2" fill="#e7decb"/><path d="m150 43 4-9m6 15 10-4" stroke="#b4a187" stroke-width="3" stroke-linecap="round"/>';
  }
  return `<svg class="illustration" viewBox="0 0 200 140" fill="none" aria-hidden="true">${body}</svg>`;
}
function heroArt() {
  return `<svg class="hero-art" viewBox="0 0 370 245" fill="none" aria-hidden="true"><ellipse cx="210" cy="224" rx="143" ry="15" fill="#dcc9b5" opacity=".5"/><path d="M296 211V125m0 54c-34-4-41-30-34-45 30 3 40 21 34 45Zm0-29c29-3 40-29 32-43-26 5-34 19-32 43Z" fill="#9ca28a"/><path d="m275 201 43-2-9 32h-25Z" fill="#c3997f"/><rect x="91" y="90" width="165" height="131" rx="7" fill="#b89172" transform="rotate(-8 91 90)"/><rect x="85" y="82" width="165" height="131" rx="7" fill="#fcf7eb" transform="rotate(-8 85 82)"/><path d="m104 104 139-19" stroke="#e5d8bf" stroke-width="2"/><path d="m120 68 3 23m31-28 3 23m31-28 3 23m31-28 3 23" stroke="#8c8068" stroke-width="5" stroke-linecap="round"/><path d="m116 129 7 5 10-15m-13 35 7 5 10-15m-13 35 7 5 10-15" stroke="#acb292" stroke-width="3" stroke-linecap="round"/><path d="m147 126 68-9m-64 33 51-7m-48 31 62-9" stroke="#dfd3bf" stroke-width="3" stroke-linecap="round"/><path d="M225 41c-15-23-39-8-26 12l22 24 28-19c20-15 1-37-17-23Z" fill="#ce896d"/><path d="M233 127c-9-12-22-4-16 8l12 14 16-10c12-8 1-21-8-14Z" fill="#d8a087"/><ellipse cx="93" cy="216" rx="41" ry="12" fill="#c1a086"/><path d="M58 163h61v29c0 36-61 36-61 0Z" fill="#e1b28c"/><path d="M120 169h10c21 0 19 28-10 28" stroke="#d4a27b" stroke-width="9"/><ellipse cx="88" cy="163" rx="30" ry="8" fill="#f0d7b6"/><ellipse cx="88" cy="164" rx="23" ry="5" fill="#967c5f"/><path d="M81 147c-13-14 12-21 1-33m16 34c-12-11 8-18 1-27" stroke="#fff9ed" stroke-width="3" stroke-linecap="round"/><path d="m274 58 3-9 3 9 9 3-9 3-3 9-3-9-9-3Z" fill="#e0bd83"/><path d="m53 85 2-6 2 6 6 2-6 2-2 6-2-6-6-2Z" fill="#bdad89"/></svg>`;
}
function empty(title, description, kind) {
  return `<div class="empty">${icon(pageInfo[current]?.[1] || 'heart')}<h3>${esc(title)}</h3><p>${esc(description)}</p>${kind ? `<button class="btn soft" data-action="add" data-kind="${kind}">${icon('plus')}Добавить</button>` : ''}</div>`;
}
function heading(title, subtitle, kind, label) {
  return `<div class="page-heading between"><div><h1>${title}</h1><p>${subtitle}</p></div>${kind ? `<button class="btn primary" data-action="add" data-kind="${kind}">${icon('plus')}${label}</button>` : ''}</div>`;
}
function filterBar(options, searchPlaceholder) {
  return `<div class="toolbar"><div class="filters">${options.map(([key, label]) => `<button class="filter ${filter === key ? 'active' : ''}" data-action="filter" data-value="${key}" aria-pressed="${filter === key}">${label}</button>`).join('')}</div><label class="search">${icon('search')}<input id="search" aria-label="${searchPlaceholder}" placeholder="${searchPlaceholder}" value="${esc(query)}"></label></div>`;
}
const matches = (item) =>
  !query ||
  [item.title, item.note, item.store, item.category, item.genre]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .includes(query.toLowerCase());
function itemActions(kind, id) {
  return `<div class="row-actions"><button class="icon-btn" data-action="edit" data-kind="${kind}" data-id="${esc(id)}" aria-label="Редактировать">${icon('edit')}</button><button class="icon-btn" data-action="delete" data-kind="${kind}" data-id="${esc(id)}" aria-label="Удалить">${icon('trash')}</button></div>`;
}
function checkButton(kind, item) {
  return `<button class="check" data-action="toggle" data-kind="${kind}" data-id="${esc(item.id)}" aria-label="${item.done ? 'Вернуть в список' : 'Отметить выполненным'}: ${esc(item.title)}" aria-pressed="${!!item.done}">${item.done ? icon('check') : ''}</button>`;
}
const motionAllowed = () =>
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let viewAnimationTimer, modalCloseTimer;
function animateView() {
  if (!motionAllowed()) return;
  const content = document.getElementById('content');
  content.classList.remove('view-enter');
  void content.offsetWidth;
  content.classList.add('view-enter');
  clearTimeout(viewAnimationTimer);
  viewAnimationTimer = setTimeout(
    () => content.classList.remove('view-enter'),
    380,
  );
}
function entryNodes(kind, id) {
  return [
    ...document.querySelectorAll(
      `[data-entry-kind="${kind}"][data-entry-id="${id}"]`,
    ),
  ];
}
function animateEntry(kind, id, className) {
  if (!motionAllowed()) return;
  const nodes = entryNodes(kind, id);
  requestAnimationFrame(() =>
    nodes.forEach((node) => node.classList.add(className)),
  );
  setTimeout(
    () => nodes.forEach((node) => node.classList.remove(className)),
    260,
  );
}
function render(animate = false) {
  document.title = `${pageInfo[current][0]} · Вдвоём`;
  document.getElementById('breadcrumb').textContent = pageInfo[current][0];
  renderNav();
  document.getElementById('avatars').innerHTML = state.names
    .map(
      (n) =>
        `<span class="avatar" title="${esc(n)}">${esc(firstCharacter(n))}</span>`,
    )
    .join('');
  document.getElementById('content').innerHTML =
    {
      home: renderHome,
      wishes: renderWishes,
      shopping: renderShopping,
      tasks: renderTasks,
      movies: renderMovies,
      settings: renderSettings,
    }[current]() +
    `${current !== 'settings' && hasExamples() ? '<div class="demo-banner"><span>Для вдохновения добавили примеры. Названия и цены — демонстрационные.</span><button data-action="clear-examples">Удалить примеры</button></div>' : ''}<div class="bottom-note">${icon('heart')}Маленькие планы. Большое «мы».</div>`;
  showStorageWarning();
  if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
  if (animate) animateView();
}
function renderNav() {
  document.getElementById('nav').innerHTML = Object.entries(pageInfo)
    .filter(([key]) => key !== 'settings')
    .map(
      ([key, [title, i]]) =>
        `<button data-action="nav" data-page="${key}" class="${current === key ? 'active' : ''}" ${current === key ? 'aria-current="page"' : ''}>${icon(i)}${title}${['wishes', 'shopping', 'tasks', 'movies'].includes(key) ? `<span class="count">${state[key].filter((x) => !x.done).length}</span>` : ''}</button>`,
    )
    .join('');
  const settingsButton = document.getElementById('settings-button');
  settingsButton.classList.toggle('active', current === 'settings');
  settingsButton.setAttribute(
    'aria-current',
    current === 'settings' ? 'page' : 'false',
  );
  document.getElementById('mobile-bottom-nav').innerHTML = Object.entries(
    pageInfo,
  )
    .map(
      ([key, [title, i]]) =>
        `<button data-action="nav" data-page="${key}" aria-label="${esc(title)}" title="${esc(title)}" class="${current === key ? 'active' : ''}" ${current === key ? 'aria-current="page"' : ''}>${icon(i)}</button>`,
    )
    .join('');
}
function renderHome() {
  const pending = state.tasks.filter((x) => !x.done);
  return (
    heading(
      'Хорошо, когда мы вместе',
      'Все наши маленькие планы — в одном месте.',
    ) +
    `<section class="hero"><div class="hero-copy"><span class="eyebrow">Место, где начинается «мы»</span><h2>Мечтать. Планировать.<br>Просто быть <em>вдвоём.</em></h2><p>От списка продуктов до больших желаний.<br>Освободим время для самого важного — друг друга.</p><span class="hero-pill">${icon('heart')}Наше маленькое пространство</span></div>${heroArt()}</section><div class="stats">${[
      ['wishes', 'heart', 'Общих желаний'],
      ['shopping', 'bag', 'Нужно купить'],
      ['tasks', 'checklist', 'В планах'],
      ['movies', 'film', 'Хотим посмотреть'],
    ]
      .map(
        ([key, i, label]) =>
          `<button class="stat" data-action="nav" data-page="${key}"><span class="stat-icon">${icon(i)}</span><div><div class="stat-number">${state[key].filter((x) => !x.done).length}</div><div class="stat-label">${label}</div></div></button>`,
      )
      .join(
        '',
      )}</div><div class="home-columns"><section class="panel"><div class="panel-head"><h2>Ближайшие планы</h2><button class="text-button" data-action="nav" data-page="tasks">Все дела ${icon('arrow')}</button></div><div class="panel-body">${
      pending.length
        ? pending
            .slice()
            .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999'))
            .slice(0, 3)
            .map(
              (t) =>
                `<div class="home-check" data-entry-kind="tasks" data-entry-id="${esc(t.id)}">${checkButton('tasks', t)}<div class="grow"><div class="item-title">${esc(t.title)}</div><div class="subline">${esc(ownerLabel(t.owner))}${t.due ? ' · ' + dateLabel(t.due) : ''}</div></div><span class="tag ${t.priority === 'Высокий' ? 'peach' : 'green'} dot">${t.priority === 'Высокий' ? 'Важно' : 'В планах'}</span></div>`,
            )
            .join('')
        : empty(
            'Всё успели',
            'Можно просто побыть вместе. Или придумать новый план.',
          )
    }<button class="text-button" style="margin-top:10px" data-action="add" data-kind="tasks">${icon('plus')}Добавить маленький план</button></div></section><section class="panel"><div class="panel-head"><h2>На что мы заглядываемся</h2><button class="text-button" data-action="nav" data-page="wishes">Все хотелки ${icon('arrow')}</button></div><div class="panel-body"><div class="mini-wishes">${
      state.wishes
        .filter((x) => !x.done)
        .slice(0, 2)
        .map(
          (w) =>
            `<article class="mini-wish" data-entry-kind="wishes" data-entry-id="${esc(w.id)}"><div class="mini-art">${illustration(w.category)}</div><h3>${esc(w.title)}</h3><p>${w.budget !== '' ? money(w.budget) : 'Бесценно'}</p><span class="tag">${esc(ownerLabel(w.owner))}</span></article>`,
        )
        .join('') ||
      empty(
        'Начнём мечтать?',
        'Запишите то, что однажды хотите осуществить.',
        'wishes',
      )
    }</div></div></section></div>`
  );
}
function renderWishes() {
  const items = state.wishes
    .filter(matches)
    .filter(
      (x) =>
        filter === 'all' ||
        (filter === 'done'
          ? x.done
          : filter === 'pending'
            ? !x.done
            : x.owner === filter),
    );
  const displayed = visibleItems('wishes', items);
  return (
    heading(
      'Наши хотелки',
      'Мечты побольше и маленькие «хочу». Всё, что радует нас.',
      'wishes',
      'Добавить желание',
    ) +
    filterBar(
      [
        ['all', 'Все желания'],
        ['me', esc(state.names[0])],
        ['partner', esc(state.names[1])],
        ['both', 'Общие'],
        ['done', 'Исполнено'],
      ],
      'Найти желание',
    ) +
    `<div class="card-grid">${displayed.map((w) => `<article class="wish-card ${w.done ? 'done' : ''}" data-entry-kind="wishes" data-entry-id="${esc(w.id)}"><div class="wish-art" style="background:${w.category === 'Впечатления' ? '#edf0e7' : w.category === 'Для дома' ? '#f4e9dd' : '#eeebf3'}"><span class="tag">${esc(w.category)}</span>${w.photo ? `<img class="wish-photo" src="${esc(w.photo)}" alt="Фото желания: ${esc(w.title)}">` : illustration(w.category)}<div class="wish-actions">${itemActions('wishes', w.id)}</div></div><div class="wish-card-body"><h3 class="item-title">${esc(w.title)}</h3><p>${esc(w.note) || 'Маленький повод порадовать друг друга.'}</p>${w.link ? `<a class="text-button" href="${esc(w.link)}" target="_blank" rel="noopener noreferrer">${icon('link')}Посмотреть</a>` : ''}<div class="wish-footer"><div><div class="wish-price">${w.budget !== '' ? money(w.budget) : 'Бесценно'}</div><div class="wish-owner">${esc(ownerLabel(w.owner))}</div></div><button class="complete-wish" data-action="toggle" data-kind="wishes" data-id="${esc(w.id)}">${icon(w.done ? 'check' : 'heart')}${w.done ? 'Исполнилось' : 'Исполнить'}</button></div></div></article>`).join('') || empty(query ? 'Ничего не нашлось' : 'Пока без желаний', query ? 'Попробуйте другое название или фильтр.' : 'Путешествие, подарок или завтрак в любимом месте?', 'wishes')}</div>${loadMore('wishes', items.length, displayed.length)}`
  );
}
function renderShoppingList() {
  const pending = state.shopping.filter((x) => !x.done),
    priced = pending.filter((x) => x.price !== '');
  const total =
    priced.reduce((sum, x) => sum + Math.round(x.price * 100), 0) / 100;
  const items = state.shopping
    .filter(matches)
    .filter((x) => filter === 'all' || (filter === 'done' ? x.done : !x.done));
  const displayed = visibleItems('shopping', items);
  const groups = new Map();
  for (const item of displayed) {
    const raw = item.store.trim(),
      known = state.stores.find(
        (store) => store.name.trim().toLowerCase() === raw.toLowerCase(),
      ),
      name = known?.name || raw || 'Без магазина';
    if (!groups.has(name)) groups.set(name, []);
    groups.get(name).push(item);
  }
  const knownOrder = state.stores
      .map((x) => x.name)
      .filter((name) => groups.has(name)),
    otherOrder = [...groups.keys()]
      .filter((name) => name !== 'Без магазина' && !knownOrder.includes(name))
      .sort((a, b) => a.localeCompare(b, 'ru')),
    order = [
      ...knownOrder,
      ...otherOrder,
      ...(groups.has('Без магазина') ? ['Без магазина'] : []),
    ];
  const renderRow = (x) =>
    `<div class="list-row ${x.done ? 'done' : ''}" data-entry-kind="shopping" data-entry-id="${esc(x.id)}">${checkButton('shopping', x)}<div class="grow"><div class="item-title">${esc(x.title)}</div><div class="subline">${esc(x.category)}</div></div><span class="row-price">${x.price !== '' ? money(x.price) : '—'}</span>${itemActions('shopping', x.id)}</div>`;
  return (
    `<div class="summary-strip">${icon('bag')}<span>Осталось купить: <strong>${pending.length}</strong></span><span>По указанным ценам: <strong>${money(total)}</strong></span>${pending.length !== priced.length ? `<span>Без цены: ${pending.length - priced.length}</span>` : ''}<button class="text-button" style="margin-left:auto" data-action="shopping-mode" data-value="compare">Сравнить магазины ${icon('arrow')}</button></div>` +
    filterBar(
      [
        ['all', 'Все покупки'],
        ['pending', 'Нужно купить'],
        ['done', 'Куплено'],
      ],
      'Найти покупку',
    ) +
    (order.length
      ? `<div class="shopping-groups">${order.map((name) => `<section class="shopping-store-group"><div class="shopping-store-heading"><span class="store-icon">${icon(name === 'Без магазина' ? 'bag' : 'store')}</span><div><h2>${esc(name)}</h2><span>${groups.get(name).length} ${groups.get(name).length === 1 ? 'покупка' : 'покупок'}</span></div></div><div class="list-table">${groups.get(name).map(renderRow).join('')}</div></section>`).join('')}</div>`
      : empty(
          'Список пока пуст',
          query
            ? 'Попробуйте изменить поиск.'
            : 'Добавьте покупки вручную или перенесите их из сравнения цен.',
          'shopping',
        )) +
    loadMore('shopping', items.length, displayed.length)
  );
}
function renderShopping() {
  const compare = shoppingMode === 'compare';
  return (
    heading(
      'Покупки',
      compare
        ? 'Сравниваем фасовки и выбираем самый выгодный магазин.'
        : 'Список всего, что нужно купить.',
      compare ? '' : 'shopping',
      'Добавить покупку',
    ) +
    `<div class="shopping-mode-tabs" role="tablist" aria-label="Разделы покупок"><button role="tab" aria-selected="${!compare}" class="${!compare ? 'active' : ''}" data-action="shopping-mode" data-value="list">${icon('bag')}Список покупок</button><button role="tab" aria-selected="${compare}" class="${compare ? 'active' : ''}" data-action="shopping-mode" data-value="compare">${icon('chart')}Где дешевле</button></div>${compare ? renderPrices() : renderShoppingList()}`
  );
}
function renderTasks() {
  const items = state.tasks
    .filter(matches)
    .filter(
      (x) =>
        filter === 'all' ||
        (filter === 'pending' && !x.done) ||
        (filter === 'done' && x.done) ||
        filter === x.owner,
    );
  const ordered = [
    ...items
      .filter((x) => !x.done)
      .sort((a, b) => (a.due || '9999').localeCompare(b.due || '9999')),
    ...items.filter((x) => x.done),
  ];
  const displayed = visibleItems('tasks', ordered);
  const renderRows = (rows) =>
    rows
      .map(
        (t) =>
          `<div class="list-row ${t.done ? 'done' : ''}" data-entry-kind="tasks" data-entry-id="${esc(t.id)}">${checkButton('tasks', t)}<div class="grow"><div class="item-title">${esc(t.title)}</div>${t.note ? `<div class="subline">${esc(t.note)}</div>` : ''}</div><span class="tag ${t.priority === 'Высокий' ? 'peach' : t.priority === 'Низкий' ? 'green' : 'purple'}">${esc(t.priority)}</span><span class="date-label ${!t.done && t.due && t.due < localDate() ? 'overdue' : ''}">${dateLabel(t.due)}</span><span class="owner-circle" title="${esc(ownerLabel(t.owner))}">${t.owner === 'both' ? icon('heart') : esc(firstCharacter(ownerLabel(t.owner)))}</span>${itemActions('tasks', t.id)}</div>`,
      )
      .join('');
  return (
    heading(
      'Наши дела',
      'Делить заботы. Поддерживать друг друга. Успевать главное.',
      'tasks',
      'Добавить дело',
    ) +
    filterBar(
      [
        ['all', 'Все дела'],
        ['pending', 'В планах'],
        ['me', esc(state.names[0])],
        ['partner', esc(state.names[1])],
        ['done', 'Готово'],
      ],
      'Найти дело',
    ) +
    (items.length
      ? `${displayed.some((x) => !x.done) ? `<p class="task-group-heading">В планах · ${items.filter((x) => !x.done).length}</p><div class="list-table">${renderRows(displayed.filter((x) => !x.done))}</div>` : ''}${displayed.some((x) => x.done) ? `<p class="task-group-heading">Уже сделано · ${items.filter((x) => x.done).length}</p><div class="list-table">${renderRows(displayed.filter((x) => x.done))}</div>` : ''}`
      : empty(
          'Можно выдохнуть',
          query
            ? 'По этому запросу дел не найдено.'
            : 'Здесь будут общие планы и личные задачи.',
          'tasks',
        )) +
    loadMore('tasks', items.length, displayed.length)
  );
}
const moviePalettes = [
  ['#52635e', '#dfb878', '#ffffff20'],
  ['#846960', '#dfbbae', '#fff2ea22'],
  ['#65617d', '#c3b2cf', '#f7edff24'],
  ['#486478', '#d6a86c', '#e7f4ff20'],
  ['#6d744f', '#e3c67d', '#f8ffe620'],
  ['#765a70', '#d9a9bc', '#fff0f822'],
];
function moviePalette(item) {
  let hash = 0;
  for (const char of `${item.genre}|${item.title}`)
    hash = (hash * 31 + char.codePointAt(0)) >>> 0;
  return moviePalettes[hash % moviePalettes.length];
}
function movieCover(item, label = 'СМОТРИМ ВМЕСТЕ') {
  const [bg, sun, ring] = moviePalette(item);
  return `<div class="movie-art" style="--movie-bg:${bg};--movie-sun:${sun};--movie-ring:${ring}"><span class="movie-mark">ВДВОЁМ · ${label}</span><span class="movie-poster-title">${esc(item.title)}</span></div>`;
}
function renderMovieRatings(m) {
  if (!m.done) return '';
  const rows = [
    [state.names[0], m.ratingMe],
    [state.names[1], m.ratingPartner],
  ].filter(([, v]) => v !== '' && v !== undefined);
  if (!rows.length)
    return '<div class="movie-ratings"><span class="movie-rating">Оценок пока нет</span></div>';
  const avg = rows.reduce((sum, [, v]) => sum + Number(v), 0) / rows.length;
  return `<div class="movie-ratings">${rows.map(([name, v]) => `<span class="movie-rating">${icon('star')}${esc(name)}: ${v}/10</span>`).join('')}<span class="movie-rating movie-average">Средняя: ${avg.toFixed(1)}/10</span></div>`;
}
function renderSeriesProgress(m) {
  if (m.contentType !== 'series' || m.season === '') return '';
  const episode = m.episode === '' ? '' : Number(m.episode);
  const total = m.episodeTotal === '' ? '' : Number(m.episodeTotal);
  const percent =
    episode && total ? Math.min(100, Math.round((episode / total) * 100)) : 0;
  return `<div class="series-progress"><div class="between"><span>Сезон ${m.season}${episode ? ` · серия ${episode}${total ? ` из ${total}` : ''}` : ''}</span>${percent ? `<strong>${percent}%</strong>` : ''}</div>${percent ? `<div class="series-progress-track"><span style="width:${percent}%"></span></div>` : ''}</div>`;
}
function renderMovies() {
  const genres = [
    ...new Set(state.movies.map((x) => x.genre).filter(Boolean)),
  ].sort((a, b) => a.localeCompare(b, 'ru'));
  const items = state.movies
    .filter(matches)
    .filter(
      (x) =>
        (filter === 'all' ||
          (filter === 'done' && x.done) ||
          (filter === 'pending' && !x.done)) &&
        (movieTypeFilter === 'all' || x.contentType === movieTypeFilter) &&
        (movieGenreFilter === 'all' || x.genre === movieGenreFilter),
    );
  const displayed = visibleItems('movies', items);
  return (
    heading(
      'Смотрим вместе',
      'Фильмы и сериалы для наших вечеров.',
      'movies',
      'Добавить',
    ) +
    `<div class="summary-strip" style="background:#eeebf3;color:#9683a7">${icon('film')}<span>В планах: <strong style="color:#867099">${state.movies.filter((x) => !x.done).length}</strong></span><span>Посмотрели: <strong style="color:#867099">${state.movies.filter((x) => x.done).length}</strong></span><button class="text-button" style="margin-left:auto;color:#927aa5" data-action="random-movie">${icon('shuffle')}Выбрать за нас</button></div><div class="movie-toolbar"><div class="movie-filter-block"><button class="filter ${movieTypeFilter === 'all' ? 'active' : ''}" data-action="movie-type" data-value="all">Всё</button><button class="filter ${movieTypeFilter === 'film' ? 'active' : ''}" data-action="movie-type" data-value="film">Фильмы</button><button class="filter ${movieTypeFilter === 'series' ? 'active' : ''}" data-action="movie-type" data-value="series">Сериалы</button></div><div class="movie-filter-block"><button class="filter ${filter === 'all' ? 'active' : ''}" data-action="filter" data-value="all">Все</button><button class="filter ${filter === 'pending' ? 'active' : ''}" data-action="filter" data-value="pending">В планах</button><button class="filter ${filter === 'done' ? 'active' : ''}" data-action="filter" data-value="done">Просмотрено</button></div><label><span class="sr-only">Жанр</span><select class="genre-select" id="movie-genre" aria-label="Фильтр по жанру"><option value="all">Все жанры</option>${genres.map((g) => `<option value="${esc(g)}" ${movieGenreFilter === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}</select></label><label class="search">${icon('search')}<input id="search" aria-label="Найти фильм или сериал" placeholder="Найти название" value="${esc(query)}"></label></div><div class="card-grid">${displayed.map((m) => `<article class="movie-card" data-entry-kind="movies" data-entry-id="${esc(m.id)}">${movieCover(m)}<div class="movie-body"><div class="between"><h3>${esc(m.title)}</h3>${m.done ? '<span class="tag green">Просмотрено</span>' : ''}</div><p>${m.contentType === 'series' ? 'Сериал' : 'Фильм'} · ${esc(m.genre) || 'Жанр не указан'}</p>${renderSeriesProgress(m)}${renderMovieRatings(m)}<div class="movie-actions"><button class="text-button" data-action="toggle" data-kind="movies" data-id="${esc(m.id)}">${icon(m.done ? 'check' : 'film')}${m.done ? 'Вернуть в планы' : 'Посмотрели'}</button>${itemActions('movies', m.id)}</div></div></article>`).join('') || empty('Здесь пока пусто', query || movieGenreFilter !== 'all' ? 'Измените поиск или фильтры.' : 'Добавьте фильм или сериал, который хотите посмотреть вместе.', 'movies')}</div>${loadMore('movies', items.length, displayed.length)}`
  );
}
const calculatePlan = (data = state) => calculatePricePlan(data);
function syncProductToShopping(productId, create = false) {
  const product = state.products.find((x) => x.id === productId);
  if (!product) return false;
  let linked = state.shopping.find((x) => x.sourceProduct === productId);
  if (!linked) {
    if (!create) return false;
    linked = {
      id: uid(),
      title: product.title,
      qty: 1,
      unit: 'шт.',
      price: '',
      store: '',
      category: 'Продукты',
      done: false,
      sample: false,
      sourceProduct: productId,
    };
    state.shopping.push(linked);
  }
  if (create) product.shoppingSynced = true;
  linked.title = product.title;
  linked.category = 'Продукты';
  linked.sample = false;
  if (linked.done) return true;
  let planned = null,
    storeName = '';
  for (const group of calculatePlan().groups) {
    const item = group.items.find((x) => x.product.id === productId);
    if (item) {
      planned = item;
      storeName = group.store.name;
      break;
    }
  }
  linked.store = planned ? storeName : '';
  linked.price = planned ? planned.total : '';
  return true;
}
function ensureProductShoppingLinks() {
  let changed = false,
    added = 0;
  for (const product of state.products) {
    if (product.shoppingSynced === true) continue;
    const before = state.shopping.length;
    syncProductToShopping(product.id, true);
    changed = true;
    if (state.shopping.length > before) added++;
  }
  return { changed, added };
}
function checkoutLabel(product, planned) {
  if (!planned) return 'Введите цену упаковки';
  const packageWord =
    planned.packages === 1
      ? 'упаковка'
      : planned.packages < 5
        ? 'упаковки'
        : 'упаковок';
  const purchased = Number(planned.purchased.toFixed(3));
  return `${planned.packages} ${packageWord} · ${purchased} ${product.unit} · ${money(planned.total)}`;
}
function renderMobilePriceCards(products) {
  return `<div class="price-mobile"><div class="mobile-store-manager">${state.stores
    .map(
      (store) =>
        `<span class="mobile-store-chip"><span>${esc(store.name)}</span><button class="icon-btn" aria-label="Изменить магазин ${esc(store.name)}" data-action="edit" data-kind="stores" data-id="${esc(store.id)}">${icon('edit')}</button><button class="icon-btn" aria-label="Удалить магазин ${esc(store.name)}" data-action="delete" data-kind="stores" data-id="${esc(store.id)}">${icon('close')}</button></span>`,
    )
    .join('')}</div><div class="price-product-cards">${products
    .map(
      (product) =>
        `<article class="price-product-card" data-entry-kind="products" data-entry-id="${esc(product.id)}"><div class="price-product-head"><div><h3>${esc(product.title)}</h3><span>Нужно купить</span></div>${itemActions('products', product.id)}</div><label class="mobile-need"><span>Количество</span><span class="mobile-input-with-unit"><input type="number" inputmode="decimal" min="0.001" max="10000" step="0.001" value="${product.qty}" aria-label="Количество: ${esc(product.title)}" data-qty="${esc(product.id)}"><b>${esc(product.unit)}</b></span></label><div class="mobile-offers">${
          state.stores
            .map((store) => {
              const offer = offerDetails(product, product.prices[store.id]);
              const planned = offerPlan(product, product.prices[store.id]);
              return `<section class="mobile-offer" data-offer-card-product="${esc(product.id)}" data-offer-card-store="${esc(store.id)}"><h4>${esc(store.name)}</h4><div class="mobile-offer-grid"><label><span>Цена упаковки</span><input type="number" inputmode="decimal" min="0" max="100000000" step="0.01" placeholder="0 ₽" value="${offer?.price ?? ''}" aria-label="${esc(product.title)} — ${esc(store.name)}, цена упаковки" data-price-product="${esc(product.id)}" data-price-store="${esc(store.id)}"></label><label><span>Размер упаковки</span><span class="mobile-size-row"><input type="number" inputmode="decimal" min="0.001" max="100000" step="0.001" value="${offer?.size ?? 1}" data-offer-size="${esc(product.id)}" data-price-store="${esc(store.id)}" aria-label="Размер упаковки"><select data-offer-unit="${esc(product.id)}" data-price-store="${esc(store.id)}" aria-label="Единица упаковки">${compatibleUnits(
                product.unit,
              )
                .map(
                  (unit) =>
                    `<option ${unit === (offer?.unit || product.unit) ? 'selected' : ''}>${unit}</option>`,
                )
                .join(
                  '',
                )}</select></span></label></div><div class="mobile-offer-result"><span data-offer-rate-product="${esc(product.id)}" data-offer-rate-store="${esc(store.id)}">${planned ? `${money(planned.unitPrice)} / ${esc(product.unit)}` : ''}</span><strong data-offer-checkout-product="${esc(product.id)}" data-offer-checkout-store="${esc(store.id)}">${checkoutLabel(product, planned)}</strong></div></section>`;
            })
            .join('') ||
          '<p class="mobile-no-stores">Добавьте хотя бы один магазин.</p>'
        }</div></article>`,
    )
    .join('')}</div></div>`;
}
function renderPrices() {
  const products = visibleItems('products', state.products);
  return `<div class="price-intro">${icon('leaf')}<div><h3>Сравним честно — по весу, объёму или штукам</h3><p>Введите цену, размер и единицу каждой упаковки. Приложение посчитает, сколько целых упаковок нужно купить, и выберет минимальный реальный чек.</p></div></div><div class="toolbar"><h2>Продукты и цены</h2><div class="flex"><button class="btn secondary small" data-action="add" data-kind="stores">${icon('plus')}Магазин</button><button class="btn primary small" data-action="add" data-kind="products">${icon('plus')}Продукт</button></div></div>${
    state.products.length || state.stores.length
      ? `<section class="panel price-desktop-panel"><div class="price-table-wrap"><table class="price-table" style="width:max(100%,${335 + 185 * state.stores.length}px)"><colgroup><col style="width:220px"><col style="width:115px">${state.stores.map(() => '<col style="width:185px">').join('')}</colgroup><thead><tr><th>Продукт</th><th>Нужно</th>${state.stores.map((s) => `<th><div class="store-header"><span title="${esc(s.name)}">${esc(s.name)}</span><button class="icon-btn" aria-label="Изменить магазин ${esc(s.name)}" data-action="edit" data-kind="stores" data-id="${esc(s.id)}">${icon('edit')}</button><button class="icon-btn" aria-label="Удалить магазин ${esc(s.name)}" data-action="delete" data-kind="stores" data-id="${esc(s.id)}">${icon('close')}</button></div></th>`).join('')}</tr></thead><tbody>${products
          .map(
            (p) =>
              `<tr data-product-row="${esc(p.id)}" data-entry-kind="products" data-entry-id="${esc(p.id)}"><td><div class="product-cell"><span class="grow">${esc(p.title)}<span class="subline" style="display:block">Сравнение за 1 ${esc(p.unit)}</span></span>${itemActions('products', p.id)}</div></td><td><div class="flex" style="gap:6px"><input class="quantity-input" type="number" min="0.001" max="10000" step="0.001" value="${p.qty}" aria-label="Количество: ${esc(p.title)}" data-qty="${esc(p.id)}"><span class="tiny muted">${esc(p.unit)}</span></div></td>${state.stores
                .map((s) => {
                  const o = offerDetails(p, p.prices[s.id]);
                  return `<td><div class="offer-editor"><input class="price-input" type="number" inputmode="decimal" min="0" max="100000000" step="0.01" placeholder="Цена, ₽" value="${o?.price ?? ''}" aria-label="${esc(p.title)} — ${esc(s.name)}, цена упаковки" data-price-product="${esc(p.id)}" data-price-store="${esc(s.id)}"><div class="offer-size-row"><input class="offer-size-input" type="number" inputmode="decimal" min="0.001" max="100000" step="0.001" value="${o?.size ?? 1}" data-offer-size="${esc(p.id)}" data-price-store="${esc(s.id)}" aria-label="Размер упаковки"><select class="offer-unit" data-offer-unit="${esc(p.id)}" data-price-store="${esc(s.id)}" aria-label="Единица упаковки">${compatibleUnits(
                    p.unit,
                  )
                    .map(
                      (u) =>
                        `<option ${u === (o?.unit || p.unit) ? 'selected' : ''}>${u}</option>`,
                    )
                    .join(
                      '',
                    )}</select></div><div class="offer-unit-price" data-offer-rate-product="${esc(p.id)}" data-offer-rate-store="${esc(s.id)}"></div></div></td>`;
                })
                .join('')}</tr>`,
          )
          .join(
            '',
          )}</tbody></table></div><div class="table-legend"><span class="legend-dot"></span>Зелёным выделен магазин с минимальным чеком за целые упаковки. При равенстве учитываем цену за единицу.</div></section>${renderMobilePriceCards(products)}${loadMore('products', state.products.length, products.length)}`
      : empty(
          'Начнём с ваших магазинов',
          'Добавьте магазины и продукты, затем заполните известные цены.',
          'stores',
        )
  }<div id="price-results" class="price-results">${renderPriceResults()}</div>`;
}
function renderPriceResults() {
  const plan = calculatePlan();
  return `<div class="between"><div><h2>Ваш выгодный список</h2><p class="muted price-result-caption">Считаем целые упаковки и реальную сумму на кассе</p></div>${icon('spark')}</div>${plan.missing.length ? `<div class="missing-notice">Нет цен: ${plan.missing.map((x) => esc(x.title)).join(', ')}. Эти продукты пока не включены в итог.</div>` : ''}<div class="price-total"><div><span class="eyebrow" style="color:#909d80">${plan.missing.length ? 'Итого по известным ценам' : 'Минимальная стоимость корзины'}</span><div style="margin-top:5px"><strong>${money(plan.total)}</strong></div><p>${plan.groups.length ? 'Магазинов в списке: ' + plan.groups.length + '. ' : ''}В итог включено целое количество упаковок, достаточное для каждой покупки.</p></div><button class="btn primary" data-action="transfer" ${plan.groups.length ? '' : 'disabled'}>${icon('bag')}Перенести в покупки</button></div><div class="store-grid">${plan.groups.map((g) => `<section class="store-card"><div class="flex" style="margin-bottom:10px"><span class="store-icon">${icon('store')}</span><div class="grow"><h3>${esc(g.store.name)}</h3><span class="tiny muted">Позиций: ${esc(g.items.length)}</span></div><strong>${money(g.total)}</strong></div>${g.items.map(({ product: p, offer, unitPrice, total, packages, purchased }) => `<div class="store-product"><div>${esc(p.title)}<span>Нужно ${esc(p.qty)} ${esc(p.unit)} · купить ${esc(packages)} × ${esc(offer.size)} ${esc(offer.unit)}</span><span>Получится ${esc(Number(purchased.toFixed(3)))} ${esc(p.unit)} · ${money(unitPrice)} за 1 ${esc(p.unit)}</span></div><strong>${money(total)}</strong></div>`).join('')}</section>`).join('')}</div>`;
}
function updatePriceUI() {
  const plan = calculatePlan(),
    cheapest = new Map();
  for (const g of plan.groups)
    for (const item of g.items) cheapest.set(item.product.id, item.storeId);
  document
    .querySelectorAll('[data-price-product]')
    .forEach((input) =>
      input.classList.toggle(
        'best',
        cheapest.get(input.dataset.priceProduct) === input.dataset.priceStore,
      ),
    );
  document.querySelectorAll('[data-offer-rate-product]').forEach((node) => {
    const p = state.products.find(
        (x) => x.id === node.dataset.offerRateProduct,
      ),
      n = p && normalizedPrice(p, p.prices[node.dataset.offerRateStore]);
    node.textContent = n ? `${money(n.unitPrice)} / ${p.unit}` : '';
  });
  document.querySelectorAll('[data-offer-card-product]').forEach((node) => {
    node.classList.toggle(
      'best',
      cheapest.get(node.dataset.offerCardProduct) ===
        node.dataset.offerCardStore,
    );
  });
  document.querySelectorAll('[data-offer-checkout-product]').forEach((node) => {
    const product = state.products.find(
      (item) => item.id === node.dataset.offerCheckoutProduct,
    );
    node.textContent = product
      ? checkoutLabel(
          product,
          offerPlan(product, product.prices[node.dataset.offerCheckoutStore]),
        )
      : '';
  });
  const target = document.getElementById('price-results');
  if (target) target.innerHTML = renderPriceResults();
}
const field = (name, label, value = '', type = 'text', extra = '') =>
  `<label class="field ${type === 'textarea' ? 'full' : ''}"><span>${esc(label)}</span>${type === 'textarea' ? `<textarea name="${name}" maxlength="1500" ${extra}>${esc(value)}</textarea>` : `<input name="${name}" type="${type}" value="${esc(value)}" ${extra}>`}</label>`;
const select = (name, label, value, options, extra = '') =>
  `<label class="field"><span>${esc(label)}</span><select name="${name}" ${extra}>${options
    .map((option) => {
      const [key, title] = Array.isArray(option) ? option : [option, option];
      return `<option value="${esc(key)}" ${key === value ? 'selected' : ''}>${esc(title)}</option>`;
    })
    .join('')}</select></label>`;
const owners = () => [
  ['both', 'Вместе'],
  ['me', state.names[0]],
  ['partner', state.names[1]],
];
const units = ['шт.', 'г', 'кг', 'мл', 'л', 'уп.'];
function openModal(title, body) {
  clearTimeout(modalCloseTimer);
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = body;
  const modal = document.getElementById('modal');
  modal.classList.remove('closing');
  if (!modal.open) modal.showModal();
}
function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal.open) return;
  clearTimeout(modalCloseTimer);
  if (!motionAllowed()) {
    modal.close();
    modal.classList.remove('closing');
    return;
  }
  modal.classList.add('closing');
  modalCloseTimer = setTimeout(() => {
    if (modal.open) modal.close();
    modal.classList.remove('closing');
  }, 150);
}
function editItem(kind, id) {
  const x = id ? state[kind].find((x) => x.id === id) : {};
  if (!x) return;
  const names = {
    wishes: 'желание',
    shopping: 'покупку',
    tasks: 'дело',
    movies: 'фильм или сериал',
    products: 'продукт',
    stores: 'магазин',
  };
  let fields = '';
  if (kind === 'stores') {
    fields = field(
      'name',
      'Название магазина',
      x.name || '',
      'text',
      'required maxlength="80" autocomplete="off"',
    );
  } else {
    fields = field(
      'title',
      kind === 'movies' ? 'Название' : 'Название',
      x.title || '',
      'text',
      'required maxlength="160" autocomplete="off"',
    );
    if (kind === 'wishes') {
      fields +=
        select('category', 'Категория', x.category || 'Впечатления', [
          'Впечатления',
          'Для дома',
          'Вещи',
          'Другое',
        ]) +
        select('owner', 'Чьё желание?', x.owner || 'both', owners()) +
        field(
          'budget',
          'Бюджет, ₽ (необязательно)',
          x.budget ?? '',
          'number',
          'min="0" max="100000000" step="0.01"',
        ) +
        field(
          'link',
          'Ссылка (необязательно)',
          x.link || '',
          'url',
          'maxlength="2000" placeholder="https://…"',
        ) +
        field('note', 'Почему хочется', x.note || '', 'textarea') +
        `<label class="field full"><span>Фото (необязательно)</span><input name="photo" type="file" accept="image/jpeg,image/png,image/webp"></label>${x.photo ? `<div class="photo-preview" id="photo-preview"><img src="${esc(x.photo)}" alt="Текущее фото"><span class="grow">Текущее фото. Новое заменит его.</span><input type="hidden" name="removePhoto" value="no"><button type="button" class="btn secondary small" data-action="remove-wish-photo">Удалить фото</button></div>` : '<p class="form-note field full">Без фото останется нынешняя иллюстрация в стиле приложения.</p>'}`;
    }
    if (kind === 'shopping') {
      fields +=
        field(
          'price',
          'Цена, ₽ (необязательно)',
          x.price ?? '',
          'number',
          'min="0" max="100000000" step="0.01"',
        ) +
        field(
          'store',
          'Магазин (необязательно)',
          x.store || '',
          'text',
          'maxlength="80" list="shopping-stores"',
        ) +
        `<datalist id="shopping-stores">${state.stores.map((store) => `<option value="${esc(store.name)}"></option>`).join('')}</datalist>` +
        select('category', 'Категория', x.category || 'Продукты', [
          'Продукты',
          'Для дома',
          'Другое',
        ]);
    }
    if (kind === 'products') {
      fields +=
        field(
          'qty',
          'Сколько нужно',
          x.qty ?? 1,
          'number',
          'required min="0.001" max="10000" step="0.001"',
        ) + select('unit', 'Единица сравнения', x.unit || 'шт.', units);
    }
    if (kind === 'tasks') {
      fields +=
        select('owner', 'Кто займётся?', x.owner || 'both', owners()) +
        field(
          'due',
          'Срок (необязательно)',
          x.due || '',
          'date',
          'min="1900-01-01" max="9999-12-31"',
        ) +
        select('priority', 'Приоритет', x.priority || 'Обычный', [
          'Обычный',
          'Высокий',
          'Низкий',
        ]) +
        field('note', 'Детали', x.note || '', 'textarea');
    }
    if (kind === 'movies') {
      fields +=
        select(
          'contentType',
          'Тип',
          x.contentType || 'film',
          [
            ['film', 'Фильм'],
            ['series', 'Сериал'],
          ],
          'id="content-type-select"',
        ) +
        field(
          'genre',
          'Жанр',
          x.genre || '',
          'text',
          'required maxlength="80" placeholder="Например, комедия"',
        ) +
        select('done', 'Статус', x.done ? 'yes' : 'no', [
          ['no', 'В планах'],
          ['yes', 'Просмотрено'],
        ]) +
        `<div class="series-fields full ${x.contentType === 'series' ? '' : 'hidden'}" id="series-fields"><span class="form-section-title">Прогресс сериала</span><div class="series-fields-grid">${field('season', 'Сезон', x.season ?? '', 'number', 'min="1" max="999" step="1" placeholder="1"')}${field('episode', 'Текущая серия', x.episode ?? '', 'number', 'min="1" max="9999" step="1" placeholder="1"')}${field('episodeTotal', 'Серий в сезоне', x.episodeTotal ?? '', 'number', 'min="1" max="9999" step="1" placeholder="Необязательно"')}</div></div>` +
        field(
          'ratingMe',
          state.names[0] + ' · оценка 1–10',
          x.ratingMe ?? '',
          'number',
          'min="1" max="10" step="1" placeholder="Необязательно"',
        ) +
        field(
          'ratingPartner',
          state.names[1] + ' · оценка 1–10',
          x.ratingPartner ?? '',
          'number',
          'min="1" max="10" step="1" placeholder="Необязательно"',
        );
    }
  }
  openModal(
    (id ? 'Изменить ' : 'Добавить ') + names[kind],
    `<form id="item-form" data-kind="${kind}" data-id="${esc(id || '')}"><div class="form-grid">${fields}</div>${kind === 'products' ? '<p class="form-note">Укажите, сколько всего нужно. Цену и размер упаковки для каждого магазина вы введёте в таблице.</p>' : ''}<div class="form-actions"><button type="button" class="btn secondary" data-action="close-modal">Отмена</button><button type="submit" class="btn primary">${id ? 'Сохранить' : 'Добавить'}</button></div></form>`,
  );
}
async function compressWishPhoto(file) {
  if (!file || !file.size) return '';
  if (file.size > 10_000_000) throw Error('Фото больше 10 МБ');
  const bitmap = await createImageBitmap(file);
  const limit = 960,
    scale = Math.min(1, limit / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  let result = canvas.toDataURL('image/jpeg', 0.78);
  if (result.length > 650_000) result = canvas.toDataURL('image/jpeg', 0.56);
  if (result.length > 650_000)
    throw Error('Фото не удалось достаточно уменьшить');
  return result;
}
async function submitItem(form) {
  if (!form.reportValidity()) return;
  const raw = new FormData(form),
    photoFile = raw.get('photo'),
    removePhoto = raw.get('removePhoto') === 'yes';
  raw.delete('photo');
  raw.delete('removePhoto');
  const data = Object.fromEntries(raw);
  for (const key in data) data[key] = data[key].trim();
  const kind = form.dataset.kind,
    id = form.dataset.id;
  const old = id ? state[kind].find((x) => x.id === id) : {};
  const name = kind === 'stores' ? 'name' : 'title';
  if (!data[name]) {
    form.elements[name].setCustomValidity(
      'Введите название, а не только пробелы.',
    );
    form.elements[name].reportValidity();
    return;
  }
  if (
    kind === 'stores' &&
    state.stores.some(
      (s) => s.id !== id && s.name.toLowerCase() === data.name.toLowerCase(),
    )
  ) {
    form.elements.name.setCustomValidity('Такой магазин уже есть.');
    form.elements.name.reportValidity();
    return;
  }
  for (const key of [
    'budget',
    'qty',
    'price',
    'ratingMe',
    'ratingPartner',
    'season',
    'episode',
    'episodeTotal',
  ])
    if (key in data && data[key] !== '') data[key] = Number(data[key]);
  if (data.link && !safeUrl(data.link)) {
    form.elements.link.setCustomValidity(
      'Используйте ссылку http:// или https://',
    );
    form.elements.link.reportValidity();
    return;
  }
  const item = { ...old, ...data, id: id || uid(), sample: false };
  if (kind === 'wishes') {
    if (removePhoto) item.photo = '';
    if (photoFile?.size) {
      try {
        item.photo = await compressWishPhoto(photoFile);
      } catch (e) {
        notify(
          e.message === 'Фото больше 10 МБ'
            ? 'Выберите фото размером до 10 МБ.'
            : 'Не удалось обработать фото. Используйте JPG, PNG или WebP.',
        );
        return;
      }
    }
  }
  if (kind === 'products') item.prices = old.prices || {};
  if (kind === 'shopping') {
    item.qty = 1;
    item.unit = 'шт.';
    item.done = old.done || false;
  } else if (kind !== 'stores')
    item.done = kind === 'movies' ? data.done === 'yes' : old.done || false;
  if (kind === 'movies') {
    if (item.contentType !== 'series') {
      item.season = '';
      item.episode = '';
      item.episodeTotal = '';
    } else if (
      item.episode !== '' &&
      item.episodeTotal !== '' &&
      item.episode > item.episodeTotal
    ) {
      form.elements.episode.setCustomValidity(
        'Текущая серия не может быть больше числа серий в сезоне.',
      );
      form.elements.episode.reportValidity();
      return;
    }
    if (item.done && !item.watchedDate) item.watchedDate = localDate();
    if (!item.done) {
      item.watchedDate = '';
      item.ratingMe = '';
      item.ratingPartner = '';
    }
  }
  const idx = state[kind].findIndex((x) => x.id === id),
    created = !id;
  if (idx >= 0) state[kind][idx] = item;
  else state[kind].push(item);
  if (kind === 'products') syncProductToShopping(item.id, created);
  save();
  closeModal();
  render();
  if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
  if (created) animateEntry(kind, item.id, 'item-enter');
  notify(
    id
      ? 'Изменения сохранены'
      : kind === 'products'
        ? 'Добавлено в сравнение и список покупок'
        : 'Добавлено в наше пространство',
  );
}
function confirmAction(title, message, action, label = 'Удалить') {
  openModal(
    title,
    `<p class="modal-description">${esc(message)}</p><div class="form-actions"><button class="btn secondary" data-action="close-modal">Отмена</button><button class="btn ${label === 'Удалить' ? 'danger' : 'primary'}" id="confirm-action">${label}</button></div>`,
  );
  document.getElementById('confirm-action').onclick = () => {
    action();
    closeModal();
  };
}
function deleteItem(kind, id) {
  const item = state[kind].find((x) => x.id === id);
  if (!item) return;
  const remove = () => {
    state[kind] = state[kind].filter((x) => x.id !== id);
    if (kind === 'stores') for (const p of state.products) delete p.prices[id];
    save();
    render();
    if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
    notify('Запись удалена');
  };
  confirmAction(
    'Удалить ' + (kind === 'stores' ? 'магазин' : 'запись') + '?',
    `«${item.title || item.name}» будет удалён${kind === 'stores' ? ' вместе с его ценами. Остальные магазины останутся.' : '.'}`,
    () => {
      const nodes = entryNodes(kind, id);
      if (!motionAllowed() || !nodes.length) {
        remove();
        return;
      }
      nodes.forEach((node) => node.classList.add('item-leave'));
      setTimeout(remove, 180);
    },
  );
}
function toggleItem(kind, id) {
  const item = state[kind].find((x) => x.id === id);
  if (!item) return;
  item.done = !item.done;
  item.sample = false;
  if (kind === 'movies') {
    item.watchedDate = item.done ? localDate() : '';
    if (!item.done) {
      item.ratingMe = '';
      item.ratingPartner = '';
    }
  }
  save();
  render();
  animateEntry(kind, id, 'item-toggle');
  notify(
    kind === 'wishes' && item.done
      ? 'Ещё одно желание исполнилось ♡'
      : item.done
        ? 'Готово!'
        : 'Снова в планах',
  );
}
function transferPlan() {
  const plan = calculatePlan();
  let added = 0,
    updated = 0;
  for (const g of plan.groups)
    for (const item of g.items) {
      const p = item.product;
      p.shoppingSynced = true;
      const existing = state.shopping.find(
        (x) => x.sourceProduct === p.id && !x.done,
      );
      const values = {
        title: p.title,
        qty: 1,
        unit: 'шт.',
        price: item.total,
        store: g.store.name,
        category: 'Продукты',
        done: false,
        sample: false,
        sourceProduct: p.id,
      };
      if (existing) {
        Object.assign(existing, values);
        updated++;
      } else {
        state.shopping.push({ ...values, id: uid() });
        added++;
      }
    }
  save();
  renderNav();
  notify(
    `В покупках: добавлено ${added}${updated ? ', обновлено ' + updated : ''}. Откройте «Список покупок», чтобы увидеть распределение по магазинам.`,
  );
}
function settingChoice(action, value, selected, iconName, title, description) {
  const dataName = action === 'theme' ? 'theme-option' : 'mobile-nav-option';
  return `<button type="button" class="setting-choice ${selected ? 'active' : ''}" data-action="${action}" data-value="${value}" data-${dataName}="${value}" aria-pressed="${selected}"><span class="setting-choice-icon">${icon(iconName)}</span><span><strong>${title}</strong><small>${description}</small></span></button>`;
}
function renderSettings() {
  const theme =
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  return (
    heading('Настройки', 'Имена, внешний вид, навигация и резервная копия.') +
    `<div class="settings-page"><section class="settings-card"><div class="settings-card-head">${icon('heart')}<div><h2>Имена</h2><p>Так вы будете подписаны в общих списках.</p></div></div><form id="names-form"><div class="form-grid">${field('first', 'Как зовут тебя?', state.names[0], 'text', 'required maxlength="30"')}${field('second', 'Как зовут твою пару?', state.names[1], 'text', 'required maxlength="30"')}</div><div class="form-actions"><button class="btn primary" type="submit">Сохранить имена</button></div></form></section><section class="settings-card"><div class="settings-card-head">${icon('sun')}<div><h2>Оформление</h2><p>Тема применяется только на этом устройстве.</p></div></div><div class="setting-choices">${settingChoice('theme', 'light', theme === 'light', 'sun', 'Светлая', 'Спокойный светлый фон')}${settingChoice('theme', 'dark', theme === 'dark', 'moon', 'Тёмная', 'Мягкие тёмные оттенки')}</div></section><section class="settings-card settings-card-wide"><div class="settings-card-head">${icon('dock')}<div><h2>Навигация на телефоне</h2><p>Выберите удобный вариант отдельно на каждом устройстве.</p></div></div><div class="setting-choices navigation-choices">${settingChoice('mobile-nav', 'sidebar', mobileNavMode === 'sidebar', 'menu', 'Боковая панель', 'Открывается кнопкой или свайпом вправо в любом месте экрана')}${settingChoice('mobile-nav', 'bottom', mobileNavMode === 'bottom', 'dock', 'Нижняя панель', 'Только иконки внизу экрана')}</div></section><section class="settings-card settings-card-wide"><div class="settings-card-head">${icon('download')}<div><h2>${CLOUD_MODE ? 'Данные и синхронизация' : 'Данные остаются у вас'}</h2><p>${CLOUD_MODE ? 'Изменения появляются на втором телефоне в течение нескольких секунд.' : 'Всё хранится только в этом браузере.'}</p></div></div><p class="settings-copy">Резервная копия пригодится на случай случайного удаления или для переноса данных.</p><div class="flex settings-actions"><button class="btn secondary small" data-action="export">${icon('download')}Скачать копию</button><button class="btn secondary small" data-action="import">${icon('upload')}Загрузить копию</button></div><input type="file" id="backup-input" accept="application/json,.json" class="hidden">${CLOUD_MODE ? '<button class="text-button settings-logout" data-action="logout-cloud">Выйти на этом устройстве</button>' : ''}</section>${hasExamples() ? `<section class="settings-card settings-card-wide"><div class="settings-card-head">${icon('leaf')}<div><h2>Начать со своего</h2><p>Удалим только нетронутые демонстрационные записи.</p></div></div><button class="btn secondary small" data-action="clear-examples">Удалить примеры</button></section>` : ''}</div>`
  );
}
function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob),
    a = document.createElement('a');
  a.href = url;
  a.download = `vdvoem-${localDate()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Резервная копия готова к скачиванию');
}
function safeUrl(value) {
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
function validateState(input) {
  if (
    !input ||
    input.version !== 1 ||
    !Array.isArray(input.names) ||
    input.names.length !== 2
  )
    throw Error('Формат копии не поддерживается');
  const out = emptyState();
  const str = (v, max = 160) => {
    if (typeof v !== 'string' || v.length > max)
      throw Error('Некорректный текст');
    return v;
  };
  const num = (v, min = 0, max = 100000000, optional = false) => {
    if (optional && v === '') return '';
    if (typeof v !== 'number' || !Number.isFinite(v) || v < min || v > max)
      throw Error('Некорректное число');
    return v;
  };
  const choice = (v, options) => {
    if (!options.includes(v)) throw Error('Некорректное поле');
    return v;
  };
  const date = (v) => {
    str(v, 10);
    if (
      v &&
      (!/^\d{4}-\d{2}-\d{2}$/.test(v) ||
        new Date(v + 'T12:00:00Z').toISOString().slice(0, 10) !== v)
    )
      throw Error('Некорректная дата');
    return v;
  };
  out.names = input.names.map((n) => {
    const result = str(n, 30).trim();
    if (!result) throw Error('Не указаны имена');
    return result;
  });
  const ids = new Set();
  for (const kind of [
    'wishes',
    'shopping',
    'tasks',
    'movies',
    'stores',
    'products',
  ]) {
    if (!Array.isArray(input[kind]) || input[kind].length > 5000)
      throw Error('Некорректный список');
    out[kind] = input[kind].map((x) => {
      if (!x || typeof x !== 'object') throw Error('Некорректная запись');
      const id = str(x.id, 80);
      if (
        !/^[a-zA-Z0-9_-]+$/.test(id) ||
        ['__proto__', 'constructor', 'prototype'].includes(id) ||
        ids.has(id)
      )
        throw Error('Некорректный идентификатор');
      ids.add(id);
      const item = { id, sample: x.sample === true };
      if (kind === 'stores') {
        item.name = str(x.name, 80);
        if (!item.name.trim()) throw Error('Пустое название');
        return item;
      }
      item.title = str(x.title);
      if (!item.title.trim()) throw Error('Пустое название');
      if (kind !== 'products') {
        if (typeof x.done !== 'boolean') throw Error('Некорректный статус');
        item.done = x.done;
      }
      if (['wishes', 'tasks'].includes(kind))
        item.note = str(x.note ?? '', 1500);
      if (['wishes', 'tasks'].includes(kind))
        item.owner = choice(x.owner, ['both', 'me', 'partner']);
      if (kind === 'wishes') {
        item.category = choice(x.category, [
          'Впечатления',
          'Для дома',
          'Вещи',
          'Другое',
        ]);
        item.budget = num(x.budget, 0, 100000000, true);
        item.link = str(x.link, 2000);
        if (item.link && !safeUrl(item.link))
          throw Error('Недопустимая ссылка');
        item.photo = str(x.photo ?? '', 650_000);
        if (
          item.photo &&
          !(
            /^data:image\/(?:jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(
              item.photo,
            ) || /^\/api\/photo\/[a-zA-Z0-9_-]{1,80}$/.test(item.photo)
          )
        )
          throw Error('Недопустимое фото');
      }
      if (kind === 'shopping') {
        const legacyQty = x.qty === undefined ? 1 : num(x.qty, 0.001, 10000),
          legacyPrice = num(x.price, 0, 100000000, true);
        item.qty = 1;
        item.unit = 'шт.';
        item.price =
          legacyPrice === ''
            ? ''
            : Math.round(legacyPrice * legacyQty * 100) / 100;
        item.store = str(x.store ?? '', 80);
        item.category = choice(x.category, ['Продукты', 'Для дома', 'Другое']);
        if (x.sourceProduct) item.sourceProduct = str(x.sourceProduct, 80);
      }
      if (kind === 'products') {
        item.qty = num(x.qty, 0.001, 10000);
        item.unit = choice(x.unit, DATA_UNITS);
        item.shoppingSynced = x.shoppingSynced === true;
        if (
          !x.prices ||
          typeof x.prices !== 'object' ||
          Array.isArray(x.prices)
        )
          throw Error('Некорректные цены');
        item.prices = {};
        for (const store of input.stores)
          if (Object.hasOwn(x.prices, store.id)) {
            const raw = x.prices[store.id],
              offer =
                typeof raw === 'number'
                  ? { price: num(raw), size: 1, unit: item.unit }
                  : raw;
            if (!offer || typeof offer !== 'object' || Array.isArray(offer))
              throw Error('Некорректная цена');
            const normalized = {
              price: offer.price === '' ? '' : num(offer.price),
              size: num(offer.size, 0.001, 100000),
              unit: choice(offer.unit, DATA_UNITS),
            };
            if (DATA_UNIT_KIND[normalized.unit] !== DATA_UNIT_KIND[item.unit])
              throw Error('Несовместимая единица');
            item.prices[store.id] = normalized;
          }
      }
      if (kind === 'tasks') {
        item.due = date(x.due);
        item.priority = choice(x.priority, ['Обычный', 'Высокий', 'Низкий']);
      }
      if (kind === 'movies') {
        item.contentType = choice(x.contentType ?? 'film', ['film', 'series']);
        item.genre = str(x.genre ?? '', 80);
        item.watchedDate = date(x.watchedDate ?? '');
        item.ratingMe = num(x.ratingMe ?? '', 1, 10, true);
        item.ratingPartner = num(x.ratingPartner ?? '', 1, 10, true);
        item.season = num(x.season ?? '', 1, 999, true);
        item.episode = num(x.episode ?? '', 1, 9999, true);
        item.episodeTotal = num(x.episodeTotal ?? '', 1, 9999, true);
        if (item.contentType !== 'series') {
          item.season = '';
          item.episode = '';
          item.episodeTotal = '';
        }
        if (
          item.episode !== '' &&
          item.episodeTotal !== '' &&
          item.episode > item.episodeTotal
        )
          throw Error('Некорректный прогресс сериала');
        if (!item.done) {
          item.ratingMe = '';
          item.ratingPartner = '';
        }
      }
      return item;
    });
  }
  return out;
}
async function importData(file) {
  if (!file) return;
  if (file.size > 5000000) {
    notify('Файл слишком большой. Допускается до 5 МБ.');
    return;
  }
  try {
    const imported = validateState(JSON.parse(await file.text()));
    confirmAction(
      'Загрузить резервную копию?',
      'Текущие списки будут заменены данными из файла. Если они нужны, сначала отмените действие и скачайте текущую копию.',
      () => {
        state = imported;
        preserveCorrupt = false;
        const migration = ensureProductShoppingLinks();
        save();
        filter = 'all';
        query = '';
        render();
        if (current === 'shopping' && shoppingMode === 'compare')
          updatePriceUI();
        notify(
          migration.added
            ? `Копия загружена. Добавили в покупки: ${migration.added}`
            : 'Резервная копия загружена',
        );
      },
      'Заменить данные',
    );
  } catch {
    notify(
      'Не удалось загрузить: выберите корректную JSON-копию приложения «Вдвоём».',
    );
  }
}
function clearExamples() {
  confirmAction(
    'Удалить примеры?',
    'Удалим только демонстрационные записи, которые вы не изменяли. Ваши записи останутся.',
    () => {
      const referenced = new Set(
        state.products
          .filter((p) => !p.sample)
          .flatMap((p) => Object.keys(p.prices)),
      );
      for (const k of ['wishes', 'shopping', 'tasks', 'movies', 'products'])
        state[k] = state[k].filter((x) => !x.sample);
      state.stores = state.stores.filter(
        (s) => !s.sample || referenced.has(s.id),
      );
      for (const s of state.stores) s.sample = false;
      save();
      render();
      if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
      notify('Готово. Пространство для ваших планов.');
    },
  );
}
function navigate(page) {
  if (page === 'prices') {
    page = 'shopping';
    shoppingMode = 'compare';
  } else if (page === 'shopping') shoppingMode = 'list';
  if (!pageInfo[page]) return;
  current = page;
  filter = 'all';
  query = '';
  resetVisibleLimit(page);
  if (page !== 'movies') {
    movieTypeFilter = 'all';
    movieGenreFilter = 'all';
  }
  if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
  closeMenu();
  render(true);
  window.scrollTo(0, 0);
}
function setMenuOpen(open) {
  const allowed =
    open &&
    mobileNavMode === 'sidebar' &&
    window.matchMedia('(max-width: 650px)').matches;
  document.getElementById('sidebar').classList.toggle('open', allowed);
  document.getElementById('mobile-shade').classList.toggle('open', allowed);
  document
    .getElementById('menu-button')
    .setAttribute('aria-expanded', String(allowed));
}
function closeMenu() {
  setMenuOpen(false);
}
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const { action, kind, id } = button.dataset;
  switch (action) {
    case 'nav':
      navigate(button.dataset.page);
      break;
    case 'filter':
      filter = button.dataset.value;
      resetVisibleLimit();
      render();
      break;
    case 'movie-type':
      movieTypeFilter = button.dataset.value;
      resetVisibleLimit('movies');
      render();
      break;
    case 'shopping-mode':
      shoppingMode = button.dataset.value === 'compare' ? 'compare' : 'list';
      filter = 'all';
      query = '';
      resetVisibleLimit(shoppingMode === 'compare' ? 'products' : 'shopping');
      render(true);
      break;
    case 'load-more':
      visibleLimits[kind] = (visibleLimits[kind] || PAGE_SIZE) + PAGE_SIZE;
      render();
      break;
    case 'remove-wish-photo': {
      const preview = document.getElementById('photo-preview');
      preview.querySelector('[name=removePhoto]').value = 'yes';
      preview.querySelector('img').remove();
      preview.querySelector('.grow').textContent =
        'Фото будет удалено после сохранения.';
      button.remove();
      break;
    }
    case 'add':
      editItem(kind);
      break;
    case 'edit':
      editItem(kind, id);
      break;
    case 'delete':
      deleteItem(kind, id);
      break;
    case 'toggle':
      toggleItem(kind, id);
      break;
    case 'close-modal':
      closeModal();
      break;
    case 'settings':
      navigate('settings');
      break;
    case 'theme':
      applyTheme(button.dataset.value);
      render();
      notify(
        button.dataset.value === 'dark'
          ? 'Тёмная тема включена'
          : 'Светлая тема включена',
      );
      break;
    case 'mobile-nav':
      applyMobileNavMode(button.dataset.value);
      render();
      notify(
        button.dataset.value === 'bottom'
          ? 'Нижняя навигация включена'
          : 'Боковая навигация включена',
      );
      break;
    case 'clear-examples':
      clearExamples();
      break;
    case 'transfer':
      transferPlan();
      break;
    case 'export':
      exportData();
      break;
    case 'logout-cloud':
      void logoutCloud();
      break;
    case 'import':
      document.getElementById('backup-input').click();
      break;
    case 'random-movie': {
      const pending = state.movies.filter(
        (x) =>
          !x.done &&
          (movieTypeFilter === 'all' || x.contentType === movieTypeFilter) &&
          (movieGenreFilter === 'all' || x.genre === movieGenreFilter),
      );
      if (!pending.length) {
        notify('В выбранных фильтрах пока нечего смотреть.');
        break;
      }
      const film = pending[Math.floor(Math.random() * pending.length)];
      openModal(
        'Сегодня смотрим…',
        `${movieCover(film, 'ВЫБОР СЛУЧАЯ')}<p class="modal-description" style="margin-top:16px">${film.contentType === 'series' ? 'Сериал' : 'Фильм'} · ${esc(film.genre)}</p><div class="form-actions"><button class="btn secondary" data-action="random-movie">Ещё вариант</button><button class="btn primary" data-action="close-modal">Отличный план</button></div>`,
      );
      break;
    }
  }
});
document.addEventListener('submit', (event) => {
  event.preventDefault();
  if (event.target.id === 'auth-form') void submitCloudLogin(event.target);
  if (event.target.id === 'item-form') void submitItem(event.target);
  if (event.target.id === 'names-form') {
    const data = new FormData(event.target),
      names = [data.get('first').trim(), data.get('second').trim()];
    if (names.some((x) => !x)) {
      notify('Введите оба имени.');
      return;
    }
    state.names = names;
    save();
    render();
    if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
    notify('Теперь это точно наше пространство');
  }
});
function updateOfferInput(el) {
  const productId =
      el.dataset.priceProduct || el.dataset.offerSize || el.dataset.offerUnit,
    p = state.products.find((x) => x.id === productId);
  if (!p) return;
  const offer = offerDetails(p, p.prices[el.dataset.priceStore]) || {
    price: '',
    size: 1,
    unit: p.unit,
  };
  if (el.dataset.priceProduct)
    offer.price =
      el.value === '' ? '' : Math.round(Number(el.value) * 100) / 100;
  else if (el.dataset.offerSize) offer.size = Number(el.value);
  else offer.unit = el.value;
  p.prices[el.dataset.priceStore] = offer;
  for (const peer of document.querySelectorAll(
    '[data-price-product],[data-offer-size],[data-offer-unit]',
  )) {
    if (
      peer === el ||
      peer.dataset.priceStore !== el.dataset.priceStore ||
      (peer.dataset.priceProduct ||
        peer.dataset.offerSize ||
        peer.dataset.offerUnit) !== productId
    )
      continue;
    if (peer.dataset.priceProduct) peer.value = offer.price;
    else if (peer.dataset.offerSize) peer.value = offer.size;
    else peer.value = offer.unit;
  }
  p.sample = false;
  syncProductToShopping(p.id);
  save();
  schedulePriceUI();
}
function schedulePriceUI() {
  clearTimeout(priceUiTimer);
  priceUiTimer = setTimeout(updatePriceUI, 60);
}
document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.setCustomValidity) el.setCustomValidity('');
  if (el.id === 'search') {
    const position = el.selectionStart;
    query = el.value;
    resetVisibleLimit();
    clearTimeout(searchRenderTimer);
    searchRenderTimer = setTimeout(() => {
      render();
      const next = document.getElementById('search');
      next?.focus();
      next?.setSelectionRange(position, position);
    }, 160);
  }
  if (el.dataset.priceProduct || el.dataset.offerSize || el.dataset.qty) {
    if (!el.validity.valid || (el.dataset.qty && el.value === '')) return;
    const p = state.products.find(
      (x) =>
        x.id ===
        (el.dataset.priceProduct || el.dataset.offerSize || el.dataset.qty),
    );
    if (!p) return;
    if (el.dataset.qty) {
      p.qty = Number(el.value);
      document.querySelectorAll('[data-qty]').forEach((peer) => {
        if (peer !== el && peer.dataset.qty === p.id) peer.value = el.value;
      });
      p.sample = false;
      syncProductToShopping(p.id);
      save();
      schedulePriceUI();
    } else updateOfferInput(el);
  }
});
document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'content-type-select') {
    document
      .getElementById('series-fields')
      ?.classList.toggle('hidden', el.value !== 'series');
  }
  if (el.id === 'backup-input') void importData(el.files[0]);
  if (el.id === 'movie-genre') {
    movieGenreFilter = el.value;
    resetVisibleLimit('movies');
    render();
  }
  if (el.dataset.offerUnit) updateOfferInput(el);
  if (el.dataset.priceProduct || el.dataset.offerSize || el.dataset.qty) {
    if (!el.validity.valid || (el.dataset.qty && el.value === '')) {
      el.reportValidity();
      render();
      updatePriceUI();
      notify(
        'Введите корректное число: количество и размер больше нуля, цена не меньше нуля.',
      );
    }
  }
});
document.addEventListener(
  'touchmove',
  (event) => {
    if (event.touches.length > 1) event.preventDefault();
  },
  { passive: false },
);
for (const gestureEvent of ['gesturestart', 'gesturechange'])
  document.addEventListener(
    gestureEvent,
    (event) => event.preventDefault(),
    { passive: false },
  );
let sidebarGesture = null;
function mobileSidebarAvailable() {
  return (
    mobileNavMode === 'sidebar' &&
    window.matchMedia('(max-width: 650px)').matches &&
    !document.getElementById('modal').open
  );
}
function clearSidebarGesture(shouldOpen) {
  if (!sidebarGesture) return;
  const sidebar = document.getElementById('sidebar'),
    shade = document.getElementById('mobile-shade');
  if (sidebarGesture.dragging) {
    setMenuOpen(shouldOpen);
    requestAnimationFrame(() => {
      sidebar.classList.remove('dragging');
      shade.classList.remove('dragging');
      sidebar.style.removeProperty('--sidebar-drag-x');
      shade.style.removeProperty('--shade-drag-opacity');
    });
  }
  sidebarGesture = null;
}
document.addEventListener('pointerdown', (event) => {
  if (!mobileSidebarAvailable() || !event.isPrimary || event.button !== 0)
    return;
  sidebarGesture = {
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
    startedAt: performance.now(),
    initiallyOpen: document
      .getElementById('sidebar')
      .classList.contains('open'),
    dragging: false,
    progress: 0,
  };
});
document.addEventListener('pointermove', (event) => {
  if (!sidebarGesture || event.pointerId !== sidebarGesture.pointerId) return;
  const dx = event.clientX - sidebarGesture.x,
    dy = event.clientY - sidebarGesture.y;
  if (!sidebarGesture.dragging) {
    if (Math.abs(dy) > 14 && Math.abs(dy) > Math.abs(dx)) {
      sidebarGesture = null;
      return;
    }
    if (Math.abs(dx) < 10 || Math.abs(dx) <= Math.abs(dy) * 1.15) return;
    if (
      (!sidebarGesture.initiallyOpen && dx < 0) ||
      (sidebarGesture.initiallyOpen && dx > 0)
    ) {
      sidebarGesture = null;
      return;
    }
    sidebarGesture.dragging = true;
  }
  event.preventDefault();
  const sidebar = document.getElementById('sidebar'),
    shade = document.getElementById('mobile-shade'),
    width = sidebar.getBoundingClientRect().width || 236,
    translate = sidebarGesture.initiallyOpen
      ? Math.max(-width, Math.min(0, dx))
      : Math.max(-width, Math.min(0, -width + dx));
  sidebarGesture.progress = 1 + translate / width;
  sidebar.style.setProperty('--sidebar-drag-x', `${translate}px`);
  shade.style.setProperty(
    '--shade-drag-opacity',
    String(sidebarGesture.progress),
  );
  sidebar.classList.add('dragging');
  shade.classList.add('dragging');
});
document.addEventListener('pointerup', (event) => {
  if (!sidebarGesture) return;
  if (!sidebarGesture.dragging) {
    sidebarGesture = null;
    return;
  }
  const dx = event.clientX - sidebarGesture.x,
    elapsed = Math.max(1, performance.now() - sidebarGesture.startedAt),
    velocity = dx / elapsed,
    shouldOpen = sidebarGesture.initiallyOpen
      ? sidebarGesture.progress > 0.58 && velocity > -0.55
      : sidebarGesture.progress > 0.42 || velocity > 0.55;
  clearSidebarGesture(shouldOpen);
});
document.addEventListener('pointercancel', () => {
  if (sidebarGesture)
    clearSidebarGesture(
      sidebarGesture.initiallyOpen
        ? sidebarGesture.progress > 0.5
        : sidebarGesture.progress >= 0.5,
    );
});
document.getElementById('menu-button').onclick = () =>
  setMenuOpen(!document.getElementById('sidebar').classList.contains('open'));
document.getElementById('mobile-shade').onclick = closeMenu;
document.getElementById('modal').addEventListener('cancel', (event) => {
  event.preventDefault();
  closeModal();
});
window.addEventListener('hashchange', () => navigate(location.hash.slice(1)));
document.getElementById('brand-icon').innerHTML = icon('heart');
document.getElementById('menu-button').innerHTML = icon('menu');
document.getElementById('modal-close').innerHTML = icon('close');
document.getElementById('together-note').innerHTML =
  icon('leaf') +
  '<p>Счастье — в простых вещах.<br>Особенно когда они общие.</p>';
document.getElementById('settings-button').innerHTML =
  icon('settings') + 'Настройки';
applyTheme(document.documentElement.dataset.theme || 'light', false);
applyMobileNavMode(mobileNavMode, false);
if (!CLOUD_MODE) {
  const migration = ensureProductShoppingLinks();
  if (migration.changed) save();
}
render(true);
if (current === 'shopping' && shoppingMode === 'compare') updatePriceUI();
if (CLOUD_MODE) {
  void startCloudSync();
  setInterval(() => void pollCloudState(), 5000);
  if ('serviceWorker' in navigator)
    navigator.serviceWorker.register('/sw.js').catch(() => {});
}
