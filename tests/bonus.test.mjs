import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
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

test('PUT /api/state rejects/strips chosenBonus, preventing unauthorized early unlock', async () => {
  // Aluna nova tenta falsificar a liberação enviando chosenBonus via PUT /api/state
  const spoofRes = await request('/state', {
    method: 'PUT',
    cookie: newMemberCookie,
    body: {
      profile: { name: 'Aluna Nova', goal: 'Emagrecer' },
      chosenBonus: { id: 'cintura-vacuo', title: 'Hacked Before 7 Days' }
    }
  });
  assert.equal(spoofRes.status, 200);

  // Confere que no banco e no GET /api/state o chosenBonus NÃO foi gravado
  const stateRes = await request('/state', { cookie: newMemberCookie });
  assert.equal(stateRes.body.chosenBonus, undefined);

  // Confere que na tabela user_bonuses não há registro
  const userBonusRow = await db.get('SELECT * FROM user_bonuses WHERE user_id=?', newMemberId);
  assert.equal(userBonusRow, null);
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

test('POST /api/bonus/choose allows selection for member after 7 days and records in user_bonuses atomically', async () => {
  const res = await request('/bonus/choose', {
    method: 'POST',
    cookie: oldMemberCookie,
    body: { bonusId: 'cintura-vacuo' }
  });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.chosenBonus.id, 'cintura-vacuo');
  assert.match(res.body.chosenBonus.title, /Protocolo Cintura Fina/i);

  // Confere gravação na tabela atômica user_bonuses
  const dbBonus = await db.get('SELECT * FROM user_bonuses WHERE user_id=?', oldMemberId);
  assert.ok(dbBonus);
  assert.equal(dbBonus.bonus_id, 'cintura-vacuo');
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

test('POST /api/bonus/choose handles concurrent duplicate requests atomically', async () => {
  const concurrentMemberId = randomUUID();
  const concurrentToken = randomUUID();
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
  await db.run('INSERT INTO users(id, name, email, password, role, created_at) VALUES(?,?,?,?,?,?)', concurrentMemberId, 'Aluna Concorrente', 'concorrente@bonus.test', 'hash', 'member', tenDaysAgo);
  await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', createHash('sha256').update(concurrentToken).digest('hex'), concurrentMemberId, Date.now() + 3600000);
  const concurrentCookie = 'lara_session=' + concurrentToken;

  // Dispara 2 requisições no exato mesmo instante com bônus diferentes
  const [res1, res2] = await Promise.all([
    request('/bonus/choose', { method: 'POST', cookie: concurrentCookie, body: { bonusId: 'gluteos-3d' } }),
    request('/bonus/choose', { method: 'POST', cookie: concurrentCookie, body: { bonusId: 'queima-acelerada' } })
  ]);

  // Exatamente uma teve sucesso (200) e a outra foi bloqueada atomicamente (400)
  const statuses = [res1.status, res2.status].sort();
  assert.deepEqual(statuses, [200, 400]);

  // Apenas 1 registro existe no banco de dados para esse usuário
  const dbRows = await db.all('SELECT * FROM user_bonuses WHERE user_id=?', concurrentMemberId);
  assert.equal(dbRows.length, 1);
});

test('PUT /api/state preserves server chosenBonus preventing client-side overwrite tampering', async () => {
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

test('GET /api/bonus/content/:id requires authentication and checks user selection', async () => {
  // 1. Sem autenticação -> 401
  const unauthRes = await request('/bonus/content/cintura-vacuo');
  assert.equal(unauthRes.status, 401);

  // 2. Aluna que não escolheu esse bônus -> 403
  const forbiddenRes = await request('/bonus/content/cintura-vacuo', { cookie: newMemberCookie });
  assert.equal(forbiddenRes.status, 403);
  assert.match(forbiddenRes.body.error, /você não tem acesso/i);

  // 3. Aluna que escolheu cintura-vacuo tenta acessar gluteos-3d -> 403
  const wrongBonusRes = await request('/bonus/content/gluteos-3d', { cookie: oldMemberCookie });
  assert.equal(wrongBonusRes.status, 403);

  // 4. Aluna que escolheu cintura-vacuo acessa cintura-vacuo -> 200 com conteúdo e módulos completos
  const allowedRes = await request('/bonus/content/cintura-vacuo', { cookie: oldMemberCookie });
  assert.equal(allowedRes.status, 200);
  assert.equal(allowedRes.body.ok, true);
  assert.equal(allowedRes.body.bonus.id, 'cintura-vacuo');
  assert.ok(Array.isArray(allowedRes.body.bonus.modules));
  assert.equal(allowedRes.body.bonus.modules.length, 4);
  assert.ok(allowedRes.body.bonus.modules[0].video.includes('.mp4'));
  assert.ok(allowedRes.body.bonus.modules[0].steps.length > 0);

  // 5. Administrador acessa qualquer bônus -> 200
  const adminRes = await request('/bonus/content/anti-flacidez', { cookie: adminCookie });
  assert.equal(adminRes.status, 200);
  assert.equal(adminRes.body.bonus.id, 'anti-flacidez');
});

test('Public bonus-data.js does not leak video files, steps or keyPoints', async () => {
  const publicDataPath = path.resolve('public/bonus-data.js');
  const code = await readFile(publicDataPath, 'utf8');

  // Não pode expor caminhos de vídeos de aulas protegidas
  assert.equal(code.includes('.mp4'), false, 'public/bonus-data.js must not contain video URLs');
  // Não pode expor o array com os passos de execução confidenciais
  assert.equal(code.includes('steps:'), false, 'public/bonus-data.js must not contain confidential steps');
  // Não pode expor pontos de atenção internos
  assert.equal(code.includes('keyPoints:'), false, 'public/bonus-data.js must not contain confidential keyPoints');
});

test('Poster for fim-de-semana uses existing asset without 404', async () => {
  const publicDataPath = path.resolve('public/bonus-data.js');
  const code = await readFile(publicDataPath, 'utf8');

  // Não pode referenciar receita-poster-1.jpg que não existe
  assert.equal(code.includes('receita-poster-1.jpg'), false);
  // Deve apontar para imagem válida existente
  assert.ok(code.includes('/assets/rotina.png') || code.includes('treino-poster'));
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

test('Legacy bonus choices stored only in member_state are automatically migrated and granted access', async () => {
  const legacyUserId = randomUUID();
  const legacyToken = randomUUID();
  const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
  await db.run('INSERT INTO users(id, name, email, password, role, created_at) VALUES(?,?,?,?,?,?)', legacyUserId, 'Aluna Legada', 'legada@bonus.test', 'hash', 'member', tenDaysAgo);
  await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', createHash('sha256').update(legacyToken).digest('hex'), legacyUserId, Date.now() + 3600000);
  const legacyCookie = 'lara_session=' + legacyToken;

  // Simula estado da versão anterior onde a escolha ficou apenas em member_state e user_bonuses está vazia
  const legacyState = {
    profile: { name: 'Aluna Legada' },
    chosenBonus: {
      id: 'fim-de-semana',
      title: 'Manual Fim de Semana Sem Culpa: Comer Fora sem Engordar',
      chosen_at: tenDaysAgo
    }
  };
  await db.run('INSERT INTO member_state(user_id, body) VALUES(?,?)', legacyUserId, JSON.stringify(legacyState));

  // Confere que user_bonuses ainda não possui essa aluna
  const beforeMigration = await db.get('SELECT * FROM user_bonuses WHERE user_id=?', legacyUserId);
  assert.equal(beforeMigration, null);

  // 1. Aluna faz requisição para obter o conteúdo do seu bônus
  const contentRes = await request('/bonus/content/fim-de-semana', { cookie: legacyCookie });
  assert.equal(contentRes.status, 200);
  assert.equal(contentRes.body.ok, true);
  assert.equal(contentRes.body.bonus.id, 'fim-de-semana');

  // 2. Confere que a tabela user_bonuses foi automaticamente populada (auto-migração)
  const afterMigration = await db.get('SELECT * FROM user_bonuses WHERE user_id=?', legacyUserId);
  assert.ok(afterMigration);
  assert.equal(afterMigration.bonus_id, 'fim-de-semana');

  // 3. Confere que GET /api/me agora retorna o bônus escolhido
  const meRes = await request('/me', { cookie: legacyCookie });
  assert.equal(meRes.status, 200);
  assert.ok(meRes.body.user);
  assert.equal(meRes.body.user.chosenBonus?.id, 'fim-de-semana');
});

test('public/app.js clears bonus cache and active tab upon logout/session switch', async () => {
  const appJsCode = await readFile(path.resolve('public/app.js'), 'utf8');

  // Deve possuir função de limpeza de cache de bônus
  assert.ok(appJsCode.includes('clearBonusSessionState'), 'app.js must declare clearBonusSessionState');
  // Deve isolar cache por usuário (cacheKey com user.id)
  assert.ok(appJsCode.includes('cacheKey ='), 'bonusContentView must key cache by user');
  // Deve chamar clearBonusSessionState no logout
  assert.ok(appJsCode.includes('clearBonusSessionState();'), 'must call clearBonusSessionState');
});
