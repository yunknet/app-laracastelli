import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

  const repoRoot = fileURLToPath(new URL('..', import.meta.url));
  server = spawn(process.execPath, ['server/index.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: '5199', APP_ORIGIN: origin },
    stdio: 'pipe'
  });

  let serverLogs = '';
  server.stdout?.on('data', d => { serverLogs += d.toString(); });
  server.stderr?.on('data', d => { serverLogs += d.toString(); });

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
  if (!ready) {
    console.error('SERVER LOGS ON FAIL:\n', serverLogs);
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
  assert.equal(data.temporaryPassword, 'metodolara');

  // Aluna deve conseguir logar usando o e-mail da compra e a senha metodolara
  const loginRes = await request('/login', {
    method: 'POST',
    body: { email: 'maria.eduarda@exemplo.com', password: 'metodolara' }
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
    body: { email: 'maria.eduarda@exemplo.com', password: 'metodolara' }
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

test('webhook ignores pending payments without creating active accounts', async () => {
  const pendingPayload = {
    Event: 'Payment_Pending',
    Buyer: { Name: 'Aluna Pendente', Email: 'pendente@test.com' }
  };
  const res = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(pendingPayload)
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'pending');

  // Login MUST FAIL because pending payment does not create an active account
  const loginRes = await request('/login', {
    method: 'POST',
    body: { email: 'pendente@test.com', password: 'metodolara' }
  });
  assert.equal(loginRes.status, 401);
});

test('webhook idempotency prevents duplicated activation from same transaction', async () => {
  const txPayload = {
    Event: 'Purchase_Order_Confirmed',
    Transaction: { Id: 'tx-999-unique' },
    Buyer: { Name: 'Aluna Unica', Email: 'unica@test.com' }
  };
  const firstRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txPayload)
  });
  assert.equal(firstRes.status, 201);

  // Envio duplicado idêntico
  const secondRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(txPayload)
  });
  assert.equal(secondRes.status, 200);
  const secondData = await secondRes.json();
  assert.match(secondData.message, /já processado/i);
});

test('admin can toggle user suspension with active true/false', async () => {
  const alice = await db.get('SELECT id, active FROM users WHERE email=?', 'alice@test.local');
  assert.ok(alice);
  assert.equal(alice.active, 1);

  // Admin suspende Alice (active: false)
  const suspendRes = await request('/admin/users/' + alice.id, {
    method: 'PUT',
    cookie: adminCookie,
    body: { active: false }
  });
  assert.equal(suspendRes.status, 200);

  const suspendedAlice = await db.get('SELECT active FROM users WHERE id=?', alice.id);
  assert.equal(suspendedAlice.active, 0);

  // Alice suspensa não consegue logar
  const aliceLogin = await request('/login', {
    method: 'POST',
    body: { email: 'alice@test.local', password: 'Test-password-123!' }
  });
  assert.equal(aliceLogin.status, 401);

  // Admin reativa Alice (active: true)
  const reactivateRes = await request('/admin/users/' + alice.id, {
    method: 'PUT',
    cookie: adminCookie,
    body: { active: true }
  });
  assert.equal(reactivateRes.status, 200);

  const activeAlice = await db.get('SELECT active FROM users WHERE id=?', alice.id);
  assert.equal(activeAlice.active, 1);
});

test('suggestedSchedule differentiates Emagrecer and Massa Magra', async () => {
  const { suggestedSchedule } = await import('../public/data.js');
  const emagrecerSchedule = suggestedSchedule(4, 'Emagrecer');
  const massaSchedule = suggestedSchedule(4, 'Massa Magra');

  assert.notDeepEqual(emagrecerSchedule, massaSchedule);
  assert.equal(emagrecerSchedule.length, 7);
  assert.equal(massaSchedule.length, 7);
});

test('webhook enforces authentication when secret is configured', async () => {
  const repoRoot = fileURLToPath(new URL('..', import.meta.url));
  const authServer = spawn(process.execPath, ['server/index.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: '5198', APP_ORIGIN: 'http://localhost:5198', WEBHOOK_SECRET: 'super-secret-token' },
    stdio: 'ignore'
  });

  for (let i = 0; i < 40; i++) {
    try {
      const h = await fetch('http://localhost:5198/api/health');
      if (h.status === 200) break;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }

  try {
    // 1. Sem token fornecido -> DEVE retornar 401
    const noTokenRes = await fetch('http://localhost:5198/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Event: 'Purchase_Order_Confirmed', Buyer: { Email: 'hacker@test.com' } })
    });
    assert.equal(noTokenRes.status, 401);

    // 2. Token incorreto -> DEVE retornar 401
    const wrongTokenRes = await fetch('http://localhost:5198/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-token': 'wrong-token' },
      body: JSON.stringify({ Event: 'Purchase_Order_Confirmed', Buyer: { Email: 'hacker@test.com' } })
    });
    assert.equal(wrongTokenRes.status, 401);

    // 3. Token correto -> DEVE autenticar e criar (201)
    const validRes = await fetch('http://localhost:5198/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-webhook-token': 'super-secret-token' },
      body: JSON.stringify({ Event: 'Purchase_Order_Confirmed', Buyer: { Name: 'Aluna Autenticada', Email: 'autenticada@test.com' } })
    });
    assert.equal(validRes.status, 201);
  } finally {
    authServer.kill();
    await new Promise(r => authServer.once('exit', r));
  }
});

test('suggestedSchedule dynamically adapts workout IDs by month', async () => {
  const { suggestedSchedule } = await import('../public/data.js');
  const month1 = suggestedSchedule(4, 'Emagrecer', 1);
  const month2 = suggestedSchedule(4, 'Emagrecer', 2);
  const month3 = suggestedSchedule(4, 'Emagrecer', 3);

  // Mês 1 deve conter w1, w2, w3, w4
  const m1Ids = month1.map(d => d.workoutId).filter(Boolean);
  assert.ok(m1Ids.includes('w1'), 'Mês 1 deve incluir w1');
  assert.ok(!m1Ids.includes('w2_1'), 'Mês 1 não deve incluir w2_1');

  // Mês 2 deve conter w2_1, w2_2, w2_3, w2_4
  const m2Ids = month2.map(d => d.workoutId).filter(Boolean);
  assert.ok(m2Ids.includes('w2_1'), 'Mês 2 deve incluir w2_1');
  assert.ok(!m2Ids.includes('w1'), 'Mês 2 não deve incluir w1');

  // Mês 3 deve conter w3_1, w3_2, w3_3, w3_4
  const m3Ids = month3.map(d => d.workoutId).filter(Boolean);
  assert.ok(m3Ids.includes('w3_1'), 'Mês 3 deve incluir w3_1');
  assert.ok(!m3Ids.includes('w1'), 'Mês 3 não deve incluir w1');
});

test('webhook state machine blocks reactivation of refunded transaction', async () => {
  const txId = 'tx-refund-replay-test';
  const email = 'replay.victim@test.com';

  // 1. Pagamento Pendente
  const pendingRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Payment_Pending',
      Transaction: { Id: txId },
      Buyer: { Name: 'Replay Victim', Email: email }
    })
  });
  assert.equal(pendingRes.status, 200);
  let user = await db.get('SELECT * FROM users WHERE email=?', email);
  assert.ok(!user, 'Pending payment must not create user');

  // 2. Pagamento Aprovado -> Cria conta e pedido approved
  const approvedRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Purchase_Order_Confirmed',
      Transaction: { Id: txId },
      Buyer: { Name: 'Replay Victim', Email: email }
    })
  });
  assert.equal(approvedRes.status, 201);
  user = await db.get('SELECT * FROM users WHERE email=?', email);
  assert.ok(user, 'User should be created on approval');
  assert.equal(user.active, 1);
  let order = await db.get('SELECT * FROM orders WHERE id=?', txId);
  assert.equal(order.status, 'approved');

  // 3. Reembolso -> Suspende conta e marca pedido como refunded
  const refundRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Order_Refunded',
      Transaction: { Id: txId },
      Buyer: { Email: email }
    })
  });
  assert.equal(refundRes.status, 200);
  user = await db.get('SELECT * FROM users WHERE email=?', email);
  assert.equal(user.active, 0, 'User should be suspended after refund');
  order = await db.get('SELECT * FROM orders WHERE id=?', txId);
  assert.equal(order.status, 'refunded');

  // 4. Reenvio da aprovação antiga (ataque de replay) -> DEVE ser ignorado
  const replayRes = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Purchase_Order_Confirmed',
      Transaction: { Id: txId },
      Buyer: { Name: 'Replay Victim', Email: email }
    })
  });
  assert.equal(replayRes.status, 200);
  const replayData = await replayRes.json();
  assert.equal(replayData.status, 'ignored_refunded');

  // Conta DEVE permanecer suspensa (active: 0)
  user = await db.get('SELECT * FROM users WHERE email=?', email);
  assert.equal(user.active, 0, 'User MUST remain suspended after replayed approval');
  order = await db.get('SELECT * FROM orders WHERE id=?', txId);
  assert.equal(order.status, 'refunded');

  // O histórico de webhook_events deve conter todos os eventos (sem colisão de chave primária)
  const events = await db.all('SELECT event FROM webhook_events WHERE email=? ORDER BY created_at ASC', email);
  assert.ok(events.length >= 4, 'All 4 webhook events must be recorded in webhook_events');
});

test('webhook strictly rejects Payment_Not_Approved without granting access', async () => {
  const email = 'notapproved@test.com';
  const res = await fetch(origin + '/api/webhook/lastlink', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      Event: 'Payment_Not_Approved',
      Transaction: { Id: 'tx-disapproved-1' },
      Buyer: { Name: 'Not Approved', Email: email }
    })
  });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.status, 'disapproved');

  const user = await db.get('SELECT * FROM users WHERE email=?', email);
  assert.ok(!user, 'User must not be created for Payment_Not_Approved');
});

test('webhook requires and validates LASTLINK_PRODUCT_ID when configured', async () => {
  const repoRoot = fileURLToPath(new URL('..', import.meta.url));
  const productServer = spawn(process.execPath, ['server/index.mjs'], {
    cwd: repoRoot,
    env: { ...process.env, PORT: '5197', APP_ORIGIN: 'http://localhost:5197', LASTLINK_PRODUCT_ID: 'prod_lara_123' },
    stdio: 'ignore'
  });

  for (let i = 0; i < 40; i++) {
    try {
      const h = await fetch('http://localhost:5197/api/health');
      if (h.status === 200) break;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }

  try {
    // 1. Payload sem produto informado -> 400
    const noProductRes = await fetch('http://localhost:5197/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Event: 'Purchase_Order_Confirmed', Buyer: { Email: 'prodtest1@test.com' } })
    });
    assert.equal(noProductRes.status, 400);

    // 2. Payload com produto divergente -> 400
    const wrongProductRes = await fetch('http://localhost:5197/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Event: 'Purchase_Order_Confirmed',
        Product: { Id: 'prod_outro_curso' },
        Buyer: { Email: 'prodtest2@test.com' }
      })
    });
    assert.equal(wrongProductRes.status, 400);

    // 3. Payload com produto correspondente -> 201
    const matchingRes = await fetch('http://localhost:5197/api/webhook/lastlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Event: 'Purchase_Order_Confirmed',
        Product: { Id: 'prod_lara_123' },
        Buyer: { Name: 'Aluna Produto Certo', Email: 'prodcerto@test.com' }
      })
    });
    assert.equal(matchingRes.status, 201);
  } finally {
    productServer.kill();
    await new Promise(r => productServer.once('exit', r));
  }
});
