import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { randomUUID, createHash } from 'node:crypto';

const tmp = await mkdtemp(path.join(os.tmpdir(), 'lara-bonus-test-'));
process.env.DATABASE_URL = '';
process.env.DB_PATH = path.join(tmp, 'test.sqlite');

const { db, initDb } = await import('../server/db.mjs');
let serverProcess;
const port = 5310;
const origin = `http://localhost:${port}`;
let adminCookie, newMemberCookie, oldMemberCookie;
let newMemberId, oldMemberId;

async function request(url, { method = 'GET', body, cookie } = {}) {
  const r = await fetch(origin + '/api' + url, {
    method,
    headers: {
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  let json;
  try { json = await r.json(); } catch {}
  return { status: r.status, body: json };
}

before(async () => {
  await initDb();

  // 1. Admin
  const adminId = randomUUID(), adminToken = randomUUID();
  await db.run('INSERT INTO users(id, name, email, password, role) VALUES(?,?,?,?,?)', adminId, 'Admin', 'admin@bonus.test', 'hash', 'admin');
  await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', createHash('sha256').update(adminToken).digest('hex'), adminId, Date.now() + 3600000);
  adminCookie = 'lara_session=' + adminToken;

  // 2. New Member (criada hoje -> < 7 dias)
  newMemberId = randomUUID();
  const newToken = randomUUID();
  await db.run('INSERT INTO users(id, name, email, password, role, created_at) VALUES(?,?,?,?,?,?)', newMemberId, 'Aluna Nova', 'nova@bonus.test', 'hash', 'member', new Date().toISOString());
  await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', createHash('sha256').update(newToken).digest('hex'), newMemberId, Date.now() + 3600000);
  newMemberCookie = 'lara_session=' + newToken;

  // 3. Old Member (criada há 10 dias -> >= 7 dias)
  oldMemberId = randomUUID();
  const oldToken = randomUUID();
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
  await db.run('INSERT INTO users(id, name, email, password, role, created_at) VALUES(?,?,?,?,?,?)', oldMemberId, 'Aluna Veterana', 'veterana@bonus.test', 'hash', 'member', tenDaysAgo);
  await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', createHash('sha256').update(oldToken).digest('hex'), oldMemberId, Date.now() + 3600000);
  oldMemberCookie = 'lara_session=' + oldToken;

  // Inicia servidor de teste
  serverProcess = spawn(process.execPath, ['server/index.mjs'], {
    cwd: new URL('..', import.meta.url),
    env: { ...process.env, NODE_ENV: 'test', PORT: String(port), APP_ORIGIN: origin },
    stdio: 'ignore'
  });

  for (let i = 0; i < 100; i++) {
    try {
      if ((await request('/health')).status === 200) break;
    } catch {}
    await new Promise(r => setTimeout(r, 100));
  }
});

after(async () => {
  if (serverProcess && serverProcess.exitCode === null) {
    const stopped = new Promise(r => serverProcess.once('exit', r));
    serverProcess.kill();
    await stopped;
  }
  await db.close();
  await rm(path.resolve(tmp), { recursive: true, force: true });
});

test('POST /api/bonus/choose requires authentication', async () => {
  const res = await request('/bonus/choose', { method: 'POST', body: { bonusId: 'cintura-vacuo' } });
  assert.equal(res.status, 401);
});

test('POST /api/bonus/choose rejects selection before 7 days for new member', async () => {
  const res = await request('/bonus/choose', {
    method: 'POST',
    cookie: newMemberCookie,
    body: { bonusId: 'cintura-vacuo' }
  });
  assert.equal(res.status, 403);
  assert.match(res.body.error, /liberado para escolha em/i);
  assert.ok(res.body.daysRemaining >= 1);
});

test('POST /api/bonus/choose validates bonusId strictly', async () => {
  const res = await request('/bonus/choose', {
    method: 'POST',
    cookie: oldMemberCookie,
    body: { bonusId: 'bonus-inexistente-hack' }
  });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /bônus inválido/i);
});

test('POST /api/bonus/choose allows selection for member after 7 days', async () => {
  const res = await request('/bonus/choose', {
    method: 'POST',
    cookie: oldMemberCookie,
    body: { bonusId: 'cintura-vacuo' }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.chosenBonus.id, 'cintura-vacuo');
  assert.match(res.body.chosenBonus.title, /Protocolo Cintura Fina/i);

  // Verifica persistência no member_state
  const stateRes = await request('/state', { cookie: oldMemberCookie });
  assert.equal(stateRes.body.chosenBonus.id, 'cintura-vacuo');
});

test('POST /api/bonus/choose blocks second bonus selection (single-choice rule)', async () => {
  const secondTry = await request('/bonus/choose', {
    method: 'POST',
    cookie: oldMemberCookie,
    body: { bonusId: 'anti-flacidez' }
  });
  assert.equal(secondTry.status, 400);
  assert.match(secondTry.body.error, /já escolheu o seu bônus de 7 dias/i);
  assert.equal(secondTry.body.chosenBonus.id, 'cintura-vacuo');
});

test('PUT /api/state preserves chosenBonus preventing client-side overwrite tampering', async () => {
  // Aluna tenta sobrescrever chosenBonus enviando outro id via PUT /api/state
  const tamperRes = await request('/state', {
    method: 'PUT',
    cookie: oldMemberCookie,
    body: {
      chosenBonus: { id: 'gluteos-3d', title: 'Hacked' }
    }
  });
  assert.equal(tamperRes.status, 200);

  // Verifica que o original cintura-vacuo permaneceu intacto
  const stateRes = await request('/state', { cookie: oldMemberCookie });
  assert.equal(stateRes.body.chosenBonus.id, 'cintura-vacuo');
});

test('Admin can see chosen bonus in GET /api/admin/users', async () => {
  const res = await request('/admin/users', { cookie: adminCookie });
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));

  const veterana = res.body.find(u => u.id === oldMemberId);
  assert.ok(veterana);
  assert.ok(veterana.chosenBonus);
  assert.equal(veterana.chosenBonus.id, 'cintura-vacuo');

  const nova = res.body.find(u => u.id === newMemberId);
  assert.ok(nova);
  assert.equal(nova.chosenBonus, null);
});
