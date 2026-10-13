import test from 'node:test';
import assert from 'node:assert/strict';
import { createHttpServer } from '../server/http';
test('Node production server serves built React app, health endpoint and protects file paths', async () => {
  const http = createHttpServer();
  await new Promise<void>((r) => http.listen(0, '127.0.0.1', r));
  const address = http.address();
  assert.ok(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  try {
    const health = await fetch(base + '/api/health');
    assert.equal(health.status, 200);
    assert.deepEqual(await health.json(), { ok: true, service: 'typing-race' });
    const page = await fetch(base + '/');
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.match(html, /Typing Race/);
    assert.match(html, /id="root"/);
    const asset = html.match(/src="([^"]+\.js)"/);
    assert.ok(asset);
    const js = await fetch(base + asset[1]);
    assert.equal(js.status, 200);
    assert.match(js.headers.get('content-type')!, /javascript/);
    const head = await fetch(base + '/', { method: 'HEAD' });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), '');
    assert.equal((await fetch(base + '/missing.js')).status, 404);
    assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 403);
    assert.equal((await fetch(base + '/', { method: 'POST' })).status, 405);
  } finally {
    await new Promise<void>((r) => http.close(() => r()));
  }
});
