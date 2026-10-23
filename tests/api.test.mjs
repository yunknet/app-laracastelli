import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';

let temp;
if (!process.env.DATABASE_URL) {
  temp = await mkdtemp(path.join(os.tmpdir(), 'lara-test-'));
  process.env.DB_PATH = path.join(temp, 'test.sqlite');
}

const { db, initDb, passwordHash } = await import('../server/db.mjs');
let server, adminCookie, aliceCookie, bobCookie;
const origin = 'http://localhost:5199';

async function request(url, { method = 'GET', body, cookie, withOrigin = true } = {}) {
  const r = await fetch(origin + '/api' + url, {
    method,
    headers: {
      ...(withOrigin ? { Origin: origin } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json;
  try { json = await r.clone().json(); } catch {}
  return { status: r.status, body: json, cookie: r.headers.get('set-cookie'), headers: r.headers };
}

before(async () => {
  await initDb();
  for (const [name, email, role] of [['Admin', 'admin@test.local', 'admin'], ['Alice', 'alice@test.local', 'member'], ['Bob', 'bob@test.local', 'member']]) {
    await db.run('INSERT INTO users(id,name,email,password,role) VALUES(?,?,?,?,?)', randomUUID(), name, email, await passwordHash('Test-password-123!'), role);
  }

  server = spawn(process.execPath, ['server/index.mjs'], {
    env: { ...process.env, PORT: '5199', APP_ORIGIN: origin },
    stdio: 'pipe'
  });

  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      if ((await request('/health')).status === 200) {
        ready = true;
        break;
      }
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
  assert.ok(ready, 'server ready');

  for (const email of ['admin', 'alice', 'bob']) {
    const r = await request('/login', { method: 'POST', body: { email: email + '@test.local', password: 'Test-password-123!' } });
    assert.equal(r.status, 200);
    const c = r.cookie.split(';')[0];
    if (email === 'admin') adminCookie = c;
    else if (email === 'alice') aliceCookie = c;
    else bobCookie = c;
  }
});

after(async () => {
  if (server) {
    server.kill();
    await new Promise(r => server.once('exit', r));
  }
  await db.close();
  if (temp) {
    await rm(temp, { recursive: true, force: true });
  }
});

test('authentication, cookies and origin protection', async () => {
  assert.equal((await request('/state')).status, 401);
  assert.equal((await request('/admin/users', { cookie: aliceCookie })).status, 403);
  assert.equal((await request('/state', { method: 'PUT', body: {}, cookie: aliceCookie, withOrigin: false })).status, 403);
  const r = await request('/login', { method: 'POST', body: { email: 'admin@test.local', password: 'wrong' } });
  assert.equal(r.status, 401);
  const login = await request('/login', { method: 'POST', body: { email: 'alice@test.local', password: 'Test-password-123!' } });
  assert.match(login.cookie, /HttpOnly/);
  assert.match(login.cookie, /SameSite=Lax/);
});

test('individual records persist and stay isolated', async () => {
  const r = await request('/state', { method: 'PUT', cookie: aliceCookie, body: { profile: { name: 'Alice' }, water: { '2026-10-22': 500 }, applications: [] } });
  assert.equal(r.status, 200);
  assert.equal((await request('/state', { cookie: aliceCookie })).body.water['2026-10-22'], 500);
  assert.deepEqual((await request('/state', { cookie: bobCookie })).body, {});
  assert.equal((await request('/state', { method: 'PUT', cookie: aliceCookie, body: { role: 'admin' } })).status, 400);
  assert.equal((await request('/state', { method: 'PUT', cookie: aliceCookie, body: { checkins: 'bad' } })).status, 400);
});

test('draft content is private and publishing requires review', async () => {
  const body = { kind: 'workout', title: 'Test workout', exercises: [{ name: 'Example', detail: 'Reviewed detail' }], published: false };
  assert.equal((await request('/admin/content/test-workout', { method: 'PUT', body, cookie: adminCookie })).status, 200);
  assert.equal((await request('/content', { cookie: aliceCookie })).body.length, 0);
  assert.equal((await request('/admin/content/test-workout', { method: 'PUT', body: { ...body, published: true }, cookie: adminCookie })).status, 400);
  assert.equal((await request('/admin/content/test-workout', { method: 'PUT', body: { ...body, published: true, reviewer: 'Test reviewer' }, cookie: adminCookie })).status, 200);
  assert.equal((await request('/content', { cookie: aliceCookie })).body[0].title, 'Test workout');
});

test('community supports comments, likes and ownership', async () => {
  const post = await request('/posts', { method: 'POST', cookie: aliceCookie, body: { body: 'Minha conquista de teste' } });
  assert.equal(post.status, 201);
  const id = post.body.id;
  assert.equal((await request('/posts/' + id, { method: 'DELETE', cookie: bobCookie })).status, 403);
  await request('/posts/' + id + '/like', { method: 'POST', cookie: bobCookie, body: {} });
  await request('/posts/' + id + '/comments', { method: 'POST', cookie: bobCookie, body: { body: 'Parabéns!' } });
  const list = (await request('/posts', { cookie: aliceCookie })).body;
  assert.equal(list[0].likes, 1);
  assert.equal(list[0].comments[0].body, 'Parabéns!');
  assert.equal((await request('/posts/' + id, { method: 'DELETE', cookie: aliceCookie })).status, 200);
});

test('support messages stay private and accept admin replies', async () => {
  await request('/tickets', { method: 'POST', cookie: aliceCookie, body: { body: 'Dúvida privada' } });
  assert.equal((await request('/tickets', { cookie: bobCookie })).body.length, 0);
  const t = (await request('/tickets', { cookie: adminCookie })).body[0];
  assert.equal((await request('/tickets/' + t.id, { method: 'PUT', cookie: bobCookie, body: { reply: 'Bad' } })).status, 403);
  await request('/tickets/' + t.id, { method: 'PUT', cookie: adminCookie, body: { reply: 'Resposta da equipe' } });
  assert.equal((await request('/tickets', { cookie: aliceCookie })).body[0].reply, 'Resposta da equipe');
});

test('photos are authenticated, private and validate file types', async () => {
  const data = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=';
  const p = await request('/photos', { method: 'POST', cookie: aliceCookie, body: { date: '2026-10-22', data } });
  assert.equal(p.status, 201);
  assert.equal((await request('/photos/' + p.body.id)).status, 401);
  assert.equal((await request('/photos/' + p.body.id, { cookie: bobCookie })).status, 404);
  assert.equal((await request('/photos/' + p.body.id, { cookie: aliceCookie })).status, 200);
  assert.equal((await request('/photos', { method: 'POST', cookie: aliceCookie, body: { date: '2026-10-22', data: 'data:image/png;base64,aGVsbG8=' } })).status, 400);
});

test('video uploads require admin and playback requires membership', async () => {
  const body = Buffer.from([0, 0, 0, 20, ...Buffer.from('ftypisom'), 0, 0, 0, 0]);
  let r = await fetch(origin + '/api/admin/media', { method: 'POST', headers: { Origin: origin, Cookie: aliceCookie, 'Content-Type': 'video/mp4' }, body });
  assert.equal(r.status, 403);
  r = await fetch(origin + '/api/admin/media', { method: 'POST', headers: { Origin: origin, Cookie: adminCookie, 'Content-Type': 'video/mp4' }, body });
  assert.equal(r.status, 201);
  const result = await r.json();
  assert.equal((await fetch(origin + result.url)).status, 401);
  r = await fetch(origin + result.url, { headers: { Cookie: aliceCookie, Range: 'bytes=0-7' } });
  assert.equal(r.status, 206);
  assert.equal((await r.arrayBuffer()).byteLength, 8);
});

test('suspension invalidates sessions and logout revokes tokens', async () => {
  const users = (await request('/admin/users', { cookie: adminCookie })).body;
  const bob = users.find(u => u.name === 'Bob');
  await request('/admin/users/' + bob.id, { method: 'PUT', cookie: adminCookie, body: { active: false } });
  assert.equal((await request('/state', { cookie: bobCookie })).status, 401);
  await request('/logout', { method: 'POST', cookie: aliceCookie, body: {} });
  assert.equal((await request('/state', { cookie: aliceCookie })).status, 401);
});

test('member can update their own password and login with it', async () => {
  // Login as bob again after reactivating
  const users = (await request('/admin/users', { cookie: adminCookie })).body;
  const bob = users.find(u => u.name === 'Bob');
  await request('/admin/users/' + bob.id, { method: 'PUT', cookie: adminCookie, body: { active: true } });

  const loginBefore = await request('/login', { method: 'POST', body: { email: 'bob@test.local', password: 'Test-password-123!' } });
  assert.equal(loginBefore.status, 200);
  const cookie = loginBefore.cookie.split(';')[0];

  // Try updating with short password
  const shortRes = await request('/me/password', { method: 'PUT', cookie, body: { newPassword: '123' } });
  assert.equal(shortRes.status, 400);

  // Update password successfully
  const updateRes = await request('/me/password', { method: 'PUT', cookie, body: { newPassword: 'NovaSenhaForte2026!' } });
  assert.equal(updateRes.status, 200);

  // Old password should fail
  const oldLogin = await request('/login', { method: 'POST', body: { email: 'bob@test.local', password: 'Test-password-123!' } });
  assert.equal(oldLogin.status, 401);

  // New password should succeed
  const newLogin = await request('/login', { method: 'POST', body: { email: 'bob@test.local', password: 'NovaSenhaForte2026!' } });
  assert.equal(newLogin.status, 200);
});

test('webhook generates firstName123456 password and provisions access', async () => {
  // Simula webhook da Lastlink com payload de compra aprovada
  const payload = {
    Event: 'Payment_Approved',
    Data: {
      Buyer: {
        Name: 'Maria Eduarda Silveira',
        Email: 'maria.eduarda@exemplo.com'
      }
    }
  };

  const hookRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  assert.equal(hookRes.status, 201);
  const data = await hookRes.json();
  assert.equal(data.temporaryPassword, 'maria123456');

  // Aluna deve conseguir logar usando o e-mail da compra e a senha maria123456
  const loginRes = await request('/login', {
    method: 'POST',
    body: { email: 'maria.eduarda@exemplo.com', password: 'maria123456' }
  });
  assert.equal(loginRes.status, 200);

  // Simula webhook de reembolso/cancelamento
  const refundPayload = {
    Event: 'Payment_Refund',
    Data: {
      Buyer: {
        Email: 'maria.eduarda@exemplo.com'
      }
    }
  };
  const refundRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(refundPayload)
  });
  assert.equal(refundRes.status, 200);

  // Após reembolso, login deve ser recusado
  const afterRefundLogin = await request('/login', {
    method: 'POST',
    body: { email: 'maria.eduarda@exemplo.com', password: 'maria123456' }
  });
  assert.equal(afterRefundLogin.status, 401);

  // Testa payload real de Product_Access_Started da Lastlink
  const accessStartRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Product_Access_Started',
      Product: { Id: '123', Name: 'Método Lara Castelli' },
      Member: { Id: 'm1', Email: 'aluna.teste@lastlink.com' },
      AccessType: 'Paid'
    })
  });
  assert.equal(accessStartRes.status, 201);

  // Testa payload real de Product_Access_Ended da Lastlink (revogação)
  const accessEndRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Product_Access_Ended',
      Product: { Id: '123', Name: 'Método Lara Castelli' },
      Member: { Id: 'm1', Email: 'aluna.teste@lastlink.com' },
      AccessType: 'subscription'
    })
  });
  assert.equal(accessEndRes.status, 200);

  // Testa rajada concorrente de Purchase_Order_Confirmed (idêntica ao botão Testar da Lastlink)
  const burstPayload = {
    Event: 'Purchase_Order_Confirmed',
    Buyer: { Name: 'Moises Pereira', Email: 'moises.burst@test.com' }
  };
  const burstResults = await Promise.all([
    fetch(origin + '/api/webhook/lastlink', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(burstPayload) }),
    fetch(origin + '/api/webhook/lastlink', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(burstPayload) }),
    fetch(origin + '/api/webhook/lastlink', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(burstPayload) })
  ]);
  const statuses = burstResults.map(r => r.status);
  // Todas as 3 devem ter status 200 ou 201 (nenhuma pode dar 500)
  assert.ok(statuses.every(s => s === 200 || s === 201), `Rajada falhou com status: ${statuses.join(',')}`);
});
