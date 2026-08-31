import assert from 'node:assert/strict';

const base = process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8790';
const code = process.env.PAIR_CODE;
const hash = process.env.PAIR_HASH;
assert.ok(code && hash, 'PAIR_CODE and PAIR_HASH are required');

const request = (path, init = {}) => fetch(`${base}${path}`, init);

let response = await request('/api/state');
assert.equal(response.status, 401, 'state endpoint must reject visitors without the pair code');

response = await request('/api/auth', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code: 'wrong-code' }),
});
assert.equal(response.status, 401, 'wrong pair code must be rejected');

response = await request('/api/auth', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ code }),
});
assert.equal(response.status, 200, 'pair code must authorize');
assert.match(response.headers.get('set-cookie') || '', /HttpOnly/);

const headers = { cookie: `vdvoem_session=${hash}` };
response = await request('/api/state', { headers });
assert.equal(response.status, 200);
const snapshot = await response.json();
assert.equal(snapshot.state.version, 1);

response = await request('/api/state', {
  method: 'PUT',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({ state: snapshot.state, revision: snapshot.revision }),
});
assert.equal(response.status, 200, 'shared state must save');

response = await request('/api/state', {
  method: 'PUT',
  headers: { ...headers, 'content-type': 'application/json' },
  body: JSON.stringify({ state: snapshot.state, revision: snapshot.revision }),
});
assert.equal(response.status, 409, 'stale writes must be rejected');

for (const path of ['/app.html', '/manifest.webmanifest', '/sw.js']) {
  response = await request(path);
  assert.equal(response.status, 200, `${path} must be served`);
}

console.log('Smoke test passed: auth, shared state, conflict protection, and PWA files.');
