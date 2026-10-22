import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdir, unlink, open } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { db, initDb, mediaRoot, passwordHash, passwordMatches } from './db.mjs';

const app = express(), production = process.env.NODE_ENV === 'production';
const origin = process.env.APP_ORIGIN || 'http://localhost:5190';
if (production && !origin.startsWith('https://')) throw new Error('APP_ORIGIN HTTPS obrigatório em produção.');
if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'media-src': ["'self'", 'https:'],
      'connect-src': ["'self'"],
      'frame-src': ["'none'"],
      'upgrade-insecure-requests': production ? [] : null
    }
  }
}));

app.use('/api/photos', express.json({ limit: '6mb' }));
app.use(express.json({ limit: '256kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 180, standardHeaders: 'draft-8', legacyHeaders: false }));
// Webhook de checkout automático (Hotmart, Kiwify, Eduzz, Stripe, Kirvano, etc.)
app.post('/api/webhook/checkout', express.json(), async (req, res) => {
  try {
    const authHeader = req.get('x-webhook-token') || req.query.token;
    const expectedSecret = process.env.WEBHOOK_SECRET || 'lara_secret_webhook_token';
    if (authHeader && authHeader !== expectedSecret) {
      return res.status(401).json({ error: 'Token de webhook inválido.' });
    }

    const body = req.body || {};
    const email = (
      body.email ||
      body.data?.buyer?.email ||
      body.buyer?.email ||
      body.customer?.email ||
      body.data?.customer?.email ||
      body.client?.email ||
      ''
    ).toLowerCase().trim();

    const name = (
      body.name ||
      body.data?.buyer?.name ||
      body.buyer?.name ||
      body.customer?.name ||
      body.data?.customer?.name ||
      body.client?.name ||
      'Aluna Lara Castelli'
    ).trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'E-mail do comprador não encontrado ou inválido no payload.' });
    }

    const existing = await db.get('SELECT id, email, active FROM users WHERE email=?', email);
    if (existing) {
      if (!existing.active) {
        await db.run('UPDATE users SET active=1 WHERE id=?', existing.id);
      }
      return res.json({ ok: true, message: 'Usuária já existente. Acesso mantido ativo.', userId: existing.id });
    }

    const tempPassword = 'Lara@' + randomBytes(4).toString('hex') + '!';
    const userId = randomUUID();
    const hash = await passwordHash(tempPassword);

    await db.run(
      'INSERT INTO users(id, name, email, password, role, active) VALUES(?,?,?,?,?,1)',
      userId,
      name,
      email,
      hash,
      'member'
    );

    await db.run(
      'INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING',
      userId,
      JSON.stringify({ profile: { name, goal: 'Emagrecer', frequency: 4, level: 'Iniciante' } })
    );

    console.log(`[Webhook Checkout] Nova aluna cadastrada com sucesso: ${email} (${name})`);
    res.status(201).json({
      ok: true,
      message: 'Aluna criada com sucesso.',
      userId,
      email,
      temporaryPassword: tempPassword
    });
  } catch (err) {
    console.error('[Webhook Checkout Error]:', err);
    res.status(500).json({ error: 'Erro ao processar liberação de acesso.' });
  }
});

app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && req.get('origin') !== origin) {
    return res.status(403).json({ error: 'Origem não autorizada.' });
  }
  next();
});

const digest = v => createHash('sha256').update(v).digest('hex');

app.use('/api', async (req, res, next) => {
  try {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('lara_session='))?.slice(13);
    if (token) {
      req.user = await db.get(
        'SELECT u.id, u.name, u.email, u.role FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1',
        digest(token),
        Date.now()
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

const auth = (req, res, next) => req.user ? next() : res.status(401).json({ error: 'Entre para continuar.' });
const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Acesso restrito à administração.' });
const text = (v, max = 500) => typeof v === 'string' ? v.trim().slice(0, max) : '';
const fail = (res, message) => res.status(400).json({ error: message });

app.post('/api/admin/media', auth, admin, async (req, res) => {
  if (req.get('content-type') !== 'video/mp4') return fail(res, 'Envie um arquivo MP4.');
  if (Number(req.get('content-length')) > 500 * 1024 * 1024) return res.status(413).json({ error: 'Limite de 500 MB por vídeo.' });
  await mkdir(mediaRoot, { recursive: true });
  const id = randomUUID() + '.mp4', target = path.join(mediaRoot, id);
  let size = 0;
  try {
    await pipeline(
      req,
      new Transform({
        transform(chunk, encoding, callback) {
          size += chunk.length;
          callback(size > 500 * 1024 * 1024 ? new Error('Limite de 500 MB') : null, chunk);
        }
      }),
      createWriteStream(target, { flags: 'wx' })
    );
    const file = await open(target, 'r'), header = Buffer.alloc(12);
    try { await file.read(header, 0, 12, 0); } finally { await file.close(); }
    if (header.toString('ascii', 4, 8) !== 'ftyp') throw new Error('Arquivo MP4 inválido');
    res.status(201).json({ url: '/api/media/' + id });
  } catch (e) {
    await unlink(target).catch(() => {});
    if (!res.headersSent) res.status(400).json({ error: e.message });
  }
});

app.get('/api/media/:id', auth, (req, res) => {
  if (!/^[a-f0-9-]{36}\.mp4$/.test(req.params.id)) return res.sendStatus(404);
  res.sendFile(path.resolve(mediaRoot, req.params.id), err => {
    if (err && !res.headersSent) res.sendStatus(404);
  });
});

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.get('/api/me', (req, res) => res.json({ user: req.user || null }));

app.post('/api/login', rateLimit({ windowMs: 15 * 60_000, limit: 15 }), async (req, res, next) => {
  try {
    const email = text(req.body.email).toLowerCase(), password = text(req.body.password, 200);
    const user = await db.get('SELECT * FROM users WHERE email=? AND active=1', email);
    if (!user || !await passwordMatches(password, user.password)) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    await db.run('DELETE FROM sessions WHERE expires<?', Date.now());
    const token = randomBytes(32).toString('hex');
    await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', digest(token), user.id, Date.now() + 7 * 86400000);
    res.cookie('lara_session', token, {
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      maxAge: 7 * 86400000,
      path: '/'
    }).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    next(err);
  }
});

app.post('/api/logout', auth, async (req, res, next) => {
  try {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('lara_session='))?.slice(13);
    if (token) await db.run('DELETE FROM sessions WHERE token=?', digest(token));
    res.clearCookie('lara_session', { path: '/' }).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/content', auth, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT id, kind, body FROM content WHERE published=1');
    res.json(rows.map(r => ({ ...JSON.parse(r.body), id: r.id, kind: r.kind })));
  } catch (err) {
    next(err);
  }
});

app.get('/api/state', auth, async (req, res, next) => {
  try {
    const row = await db.get('SELECT body FROM member_state WHERE user_id=?', req.user.id);
    res.json(JSON.parse(row?.body || '{}'));
  } catch (err) {
    next(err);
  }
});

app.put('/api/state', auth, async (req, res, next) => {
  try {
    const data = req.body;
    if (!data || Array.isArray(data) || typeof data !== 'object') return fail(res, 'Dados inválidos.');
    const allowed = ['profile', 'completed', 'water', 'checkins', 'favorites', 'shopping', 'read', 'schedule', 'exerciseChecks', 'videoPositions', 'meals', 'applications', 'symptoms', 'supplements'];
    if (Object.keys(data).some(k => !allowed.includes(k))) return fail(res, 'Campo não permitido.');
    const arrayFields = ['completed', 'checkins', 'favorites', 'shopping', 'read', 'meals', 'applications', 'symptoms', 'supplements'];
    if (arrayFields.some(k => data[k] !== undefined && !Array.isArray(data[k]))) return fail(res, 'Lista inválida.');
    if (['profile', 'water', 'schedule', 'exerciseChecks', 'videoPositions'].some(k => data[k] !== undefined && (!data[k] || Array.isArray(data[k]) || typeof data[k] !== 'object'))) return fail(res, 'Registro inválido.');
    await db.run('INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET body=EXCLUDED.body', req.user.id, JSON.stringify(data));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/photos', auth, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT id, date FROM photos WHERE user_id=? ORDER BY date', req.user.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.get('/api/photos/:id', auth, async (req, res, next) => {
  try {
    const p = await db.get('SELECT mime, data FROM photos WHERE id=? AND user_id=?', req.params.id, req.user.id);
    if (!p) return res.sendStatus(404);
    res.type(p.mime).send(Buffer.from(p.data));
  } catch (err) {
    next(err);
  }
});

app.post('/api/photos', auth, async (req, res, next) => {
  try {
    const match = typeof req.body.data === 'string' && req.body.data.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
    if (!match || !/^\d{4}-\d{2}-\d{2}$/.test(req.body.date || '')) return fail(res, 'Imagem ou data inválida.');
    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 4 * 1024 * 1024) return fail(res, 'Foto maior que 4 MB.');
    const signature = match[1] === 'image/jpeg' ? buffer[0] === 255 && buffer[1] === 216 : match[1] === 'image/png' ? buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) : buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP';
    if (!signature) return fail(res, 'Formato de imagem inválido.');
    const countRow = await db.get('SELECT COUNT(*) AS total FROM photos WHERE user_id=?', req.user.id);
    if (Number(countRow?.total || 0) >= 100) return fail(res, 'Limite de 100 fotos por conta. Exporte ou remova uma foto antes de adicionar outra.');
    const id = randomUUID();
    await db.run('INSERT INTO photos(id, user_id, date, mime, data) VALUES(?,?,?,?,?)', id, req.user.id, req.body.date, match[1], buffer);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/photos/:id', auth, async (req, res, next) => {
  try {
    await db.run('DELETE FROM photos WHERE id=? AND user_id=?', req.params.id, req.user.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/posts', auth, async (req, res, next) => {
  try {
    const posts = await db.all('SELECT p.*, u.name, (SELECT COUNT(*) FROM likes WHERE post_id=p.id) AS likes FROM posts p JOIN users u ON u.id=p.user_id ORDER BY p.created_at DESC LIMIT 100');
    const enriched = await Promise.all(posts.map(async p => {
      const likedRow = await db.get('SELECT 1 FROM likes WHERE post_id=? AND user_id=?', p.id, req.user.id);
      const comments = await db.all('SELECT c.*, u.name FROM comments c JOIN users u ON u.id=c.user_id WHERE post_id=? ORDER BY c.created_at LIMIT 100', p.id);
      return {
        ...p,
        likes: Number(p.likes) || 0,
        liked: Boolean(likedRow),
        comments
      };
    }));
    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

app.post('/api/posts', auth, async (req, res, next) => {
  try {
    const body = text(req.body.body, 2000);
    if (!body) return fail(res, 'Escreva uma mensagem.');
    const id = randomUUID();
    await db.run('INSERT INTO posts(id, user_id, body) VALUES(?,?,?)', id, req.user.id, body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
});

app.post('/api/posts/:id/like', auth, async (req, res, next) => {
  try {
    if (!await db.get('SELECT 1 FROM posts WHERE id=?', req.params.id)) return res.sendStatus(404);
    const q = [req.params.id, req.user.id];
    if (await db.get('SELECT 1 FROM likes WHERE post_id=? AND user_id=?', ...q)) {
      await db.run('DELETE FROM likes WHERE post_id=? AND user_id=?', ...q);
    } else {
      await db.run('INSERT INTO likes(post_id, user_id) VALUES(?,?)', ...q);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.post('/api/posts/:id/comments', auth, async (req, res, next) => {
  try {
    const body = text(req.body.body, 1000);
    if (!body) return fail(res, 'Escreva um comentário.');
    if (!await db.get('SELECT 1 FROM posts WHERE id=?', req.params.id)) return res.sendStatus(404);
    await db.run('INSERT INTO comments(id, post_id, user_id, body) VALUES(?,?,?,?)', randomUUID(), req.params.id, req.user.id, body);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/posts/:id', auth, async (req, res, next) => {
  try {
    const p = await db.get('SELECT * FROM posts WHERE id=?', req.params.id);
    if (!p) return res.sendStatus(404);
    if (p.user_id !== req.user.id && req.user.role !== 'admin') return res.sendStatus(403);
    await db.run('DELETE FROM posts WHERE id=?', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/tickets', auth, async (req, res, next) => {
  try {
    const rows = req.user.role === 'admin'
      ? await db.all('SELECT t.*, u.name FROM tickets t JOIN users u ON u.id=t.user_id ORDER BY t.created_at DESC')
      : await db.all('SELECT * FROM tickets WHERE user_id=? ORDER BY created_at DESC', req.user.id);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

app.post('/api/tickets', auth, async (req, res, next) => {
  try {
    const body = text(req.body.body, 3000);
    if (!body) return fail(res, 'Escreva sua dúvida.');
    await db.run('INSERT INTO tickets(id, user_id, body) VALUES(?,?,?)', randomUUID(), req.user.id, body);
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.put('/api/tickets/:id', auth, admin, async (req, res, next) => {
  try {
    const reply = text(req.body.reply, 3000);
    if (!reply) return fail(res, 'Escreva a resposta.');
    const result = await db.run('UPDATE tickets SET reply=? WHERE id=?', reply, req.params.id);
    if (!result.changes) return res.sendStatus(404);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/users', auth, admin, async (req, res, next) => {
  try {
    res.json(await db.all('SELECT id, name, email, role, active FROM users ORDER BY created_at DESC'));
  } catch (err) {
    next(err);
  }
});

app.post('/api/admin/users', auth, admin, async (req, res, next) => {
  try {
    const name = text(req.body.name, 100), email = text(req.body.email).toLowerCase(), password = text(req.body.password, 200);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 12) return fail(res, 'Informe nome, e-mail válido e senha com 12 caracteres ou mais.');
    if (await db.get('SELECT 1 FROM users WHERE email=?', email)) return res.status(409).json({ error: 'E-mail já cadastrado.' });
    await db.run('INSERT INTO users(id, name, email, password, role) VALUES(?,?,?,?)', randomUUID(), name, email, await passwordHash(password));
    res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.put('/api/admin/users/:id', auth, admin, async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) return fail(res, 'Não altere seu próprio acesso aqui.');
    const user = await db.get('SELECT id FROM users WHERE id=?', req.params.id);
    if (!user) return res.sendStatus(404);
    if (typeof req.body.active === 'boolean') await db.run('UPDATE users SET active=? WHERE id=?', +req.body.active, req.params.id);
    if (req.body.password) {
      if (typeof req.body.password !== 'string' || req.body.password.length < 12 || req.body.password.length > 200) return fail(res, 'Senha deve ter entre 12 e 200 caracteres.');
      await db.run('UPDATE users SET password=? WHERE id=?', await passwordHash(req.body.password), req.params.id);
    }
    await db.run('DELETE FROM sessions WHERE user_id=?', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.get('/api/admin/content', auth, admin, async (req, res, next) => {
  try {
    const rows = await db.all('SELECT * FROM content ORDER BY updated_at DESC');
    res.json(rows.map(r => ({ ...JSON.parse(r.body), id: r.id, kind: r.kind, published: Boolean(r.published) })));
  } catch (err) {
    next(err);
  }
});

app.put('/api/admin/content/:id', auth, admin, async (req, res, next) => {
  try {
    const { kind, title, description, video, reviewer, exercises, ingredients, steps, published, category, month, minutes, level } = req.body;
    if (!['workout', 'recipe', 'guide', 'announcement'].includes(kind) || !text(title)) return fail(res, 'Tipo e título obrigatórios.');
    if (video && !(typeof video === 'string' && (video.startsWith('/assets/') || video.startsWith('/api/media/') || /^https:\/\//.test(video)))) return fail(res, 'Use vídeo HTTPS, upload protegido ou arquivo em /assets/.');
    if (published && ['workout', 'recipe', 'guide'].includes(kind) && !text(reviewer)) return fail(res, 'Identifique o responsável pela revisão antes de publicar.');
    if (exercises && (!Array.isArray(exercises) || exercises.length > 50 || exercises.some(e => !e || typeof e.name !== 'string' || typeof e.detail !== 'string'))) return fail(res, 'Exercícios inválidos.');
    if ([ingredients, steps].some(v => v !== undefined && (!Array.isArray(v) || v.some(x => typeof x !== 'string')))) return fail(res, 'Ingredientes ou etapas inválidos.');
    const body = {
      title: text(title, 150),
      description: text(description, 12000),
      video: text(video, 2000),
      reviewer: text(reviewer, 200),
      exercises: exercises || [],
      ingredients: ingredients || [],
      steps: steps || [],
      category: text(category, 60),
      month: Math.min(12, Math.max(1, Number(month) || 1)),
      minutes: Math.max(0, Math.min(180, Number(minutes) || 0)),
      level: text(level, 50)
    };
    await db.run(
      'INSERT INTO content(id, kind, body, published, updated_at) VALUES(?,?,?,?,CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET kind=EXCLUDED.kind, body=EXCLUDED.body, published=EXCLUDED.published, updated_at=CURRENT_TIMESTAMP',
      req.params.id,
      kind,
      JSON.stringify(body),
      published ? 1 : 0
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

app.delete('/api/admin/content/:id', auth, admin, async (req, res, next) => {
  try {
    await db.run('DELETE FROM content WHERE id=?', req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

if (!production) {
  app.get(['/qa', '/qa.js', '/qa.css'], (req, res) => {
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'");
    res.sendFile(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../tests/' + (req.path === '/qa' ? 'qa.html' : req.path.slice(1))));
  });
}

app.use(express.static(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public'), { maxAge: 0 }));
app.use((err, req, res, next) => {
  console.error('Request error:', err);
  res.status(err.status || 500).json({ error: err.status === 413 ? 'Conteúdo muito grande.' : 'Não foi possível concluir. Tente novamente.' });
});

await initDb();

const port = Number(process.env.PORT || 5190), host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => console.log(`Local: http://${host === '127.0.0.1' ? 'localhost' : host}:${port}`));
