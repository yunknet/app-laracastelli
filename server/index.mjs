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
import { registerTrainingProgram, isProgramWorkoutId } from './training-program.mjs';
import { BONUS_FULL_CONTENT } from './bonus-content.mjs';

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
      'style-src': ["'self'", "'unsafe-inline'"],
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
function generateDefaultPassword() {
  return process.env.DEFAULT_PASSWORD || 'metodolara';
}

// Webhook automático Lastlink, Hotmart, Kiwify, Eduzz, Stripe, etc.
const webhookHandler = async (req, res) => {
  try {
    const authHeader = req.get('x-webhook-token')
      || req.get('x-lastlink-token')
      || req.get('x-token')
      || req.get('authorization')?.replace(/^Bearer\s+/i, '')
      || req.query.token
      || req.body?.Token
      || req.body?.token
      || req.body?.WebhookToken;

    const expectedSecret = process.env.WEBHOOK_SECRET || process.env.LASTLINK_TOKEN;
    if (expectedSecret && (!authHeader || authHeader !== expectedSecret)) {
      return res.status(401).json({ error: 'Token de webhook não fornecido ou inválido.' });
    }

    const body = req.body || {};
    const event = body.Event || body.event || body.type || 'purchase';

    // Verificação de Produto (se LASTLINK_PRODUCT_ID estiver configurado no ambiente)
    // Se o segredo/ID do produto estiver configurado, o payload DEVE conter o produto correspondente
    const expectedProductId = process.env.LASTLINK_PRODUCT_ID || process.env.PRODUCT_ID;
    if (expectedProductId) {
      const productId = body.Product?.Id || body.Product?.id || body.product?.id || body.productId || body.product_id || body.Data?.Product?.Id || body.data?.product?.id;
      if (!productId || String(productId).trim() !== String(expectedProductId).trim()) {
        console.log(`[Webhook] Evento rejeitado: identificação do produto ausente ou não correspondente (${productId || 'não informado'} !== ${expectedProductId})`);
        return res.status(400).json({ error: 'Produto ausente ou não correspondente ao aplicativo.', productId: productId || null });
      }
    }

    // Extração flexível de e-mail e nome (suporta Lastlink, Hotmart, Kiwify, Stripe, etc.)
    const email = (
      body.Buyer?.Email ||
      body.Buyer?.email ||
      body.buyer?.Email ||
      body.buyer?.email ||
      body.Member?.Email ||
      body.Member?.email ||
      body.member?.Email ||
      body.member?.email ||
      body.Data?.Buyer?.Email ||
      body.Data?.Buyer?.email ||
      body.data?.buyer?.email ||
      body.data?.buyer?.Email ||
      body.Data?.Member?.Email ||
      body.data?.member?.email ||
      body.Customer?.Email ||
      body.customer?.email ||
      body.data?.customer?.email ||
      body.email ||
      body.Email ||
      body.client?.email ||
      ''
    ).toLowerCase().trim();

    const name = (
      body.Buyer?.Name ||
      body.Buyer?.name ||
      body.buyer?.Name ||
      body.buyer?.name ||
      body.Member?.Name ||
      body.Member?.name ||
      body.member?.Name ||
      body.member?.name ||
      body.Data?.Buyer?.Name ||
      body.Data?.Buyer?.name ||
      body.data?.buyer?.name ||
      body.customer?.name ||
      body.Customer?.Name ||
      body.name ||
      body.Name ||
      (email ? email.split('@')[0] : 'Aluna')
    ).trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      // Se for apenas teste/ping da plataforma (ex: botão "Testar" na Lastlink)
      if (/test|ping/i.test(event) || body.test || !Object.keys(body).length) {
        return res.json({ ok: true, message: 'Teste de conectividade do webhook recebido com sucesso.' });
      }
      return res.status(400).json({ error: 'E-mail não encontrado ou inválido no payload.' });
    }

    // Identificador da transação para controle de idempotência e ordenação
    const transactionId = String(
      body.Transaction?.Id ||
      body.Transaction?.id ||
      body.transaction?.id ||
      body.transactionId ||
      body.transaction_id ||
      body.orderId ||
      body.order_id ||
      body.Data?.Transaction?.Id ||
      body.Data?.Order?.Id ||
      body.id ||
      ''
    ).trim();

    // Normalização estrita do nome do evento
    const cleanEvent = String(event || '').trim().toLowerCase().replace(/[\s-]+/g, '_');

    // Sempre grava o evento recebido no histórico de auditoria (com UUID próprio para evitar conflito de chave primária)
    try {
      await db.run(
        'INSERT INTO webhook_events(id, transaction_id, event, email, payload) VALUES(?,?,?,?,?)',
        randomUUID(),
        transactionId || null,
        event,
        email,
        JSON.stringify(body)
      );
    } catch (evtErr) {
      console.warn('[Webhook] Aviso ao registrar histórico do evento:', evtErr.message);
    }

    // Consulta estado atual da transação/pedido (se houver transactionId)
    let currentOrder = null;
    if (transactionId) {
      currentOrder = await db.get('SELECT * FROM orders WHERE id=?', transactionId);
    }

    // Tratamento de cancelamento / reembolso / estorno / fim de acesso
    const isRevoke = /refund|chargeback|cancel|expir|reembols|estorn|fim.*libera|remo.*acesso|ended|revok/i.test(cleanEvent);
    if (isRevoke) {
      if (transactionId) {
        if (currentOrder) {
          await db.run("UPDATE orders SET status='refunded', updated_at=CURRENT_TIMESTAMP WHERE id=?", transactionId);
        } else {
          await db.run("INSERT INTO orders(id, user_id, email, status) VALUES(?, NULL, ?, 'refunded')", transactionId, email);
        }
      }
      const existing = await db.get('SELECT id FROM users WHERE email=?', email);
      if (existing) {
        // Verifica se a aluna possui OUTRO pedido aprovado e ativo
        const otherApproved = transactionId
          ? await db.get("SELECT id FROM orders WHERE email=? AND id != ? AND status='approved'", email, transactionId)
          : null;
        if (!otherApproved) {
          await db.run('UPDATE users SET active=0 WHERE id=?', existing.id);
          await db.run('DELETE FROM sessions WHERE user_id=?', existing.id);
          console.log(`[Webhook Lastlink] Acesso revogado/reembolsado: ${email} (evento: ${event}, transação: ${transactionId})`);
        }
      }
      return res.json({ ok: true, message: 'Acesso revogado com sucesso.', email, event, transactionId });
    }

    // Eventos de recusa / pagamento não aprovado (NÃO devem liberar acesso sob nenhuma hipótese)
    const isDisapproved = /not[_-]?approved|unapproved|failed|denied|reprovad|recusad|nao[_-]?aprovad|negad/i.test(cleanEvent);
    if (isDisapproved) {
      console.log(`[Webhook] Pagamento não aprovado / recusado para ${email} (evento: ${event}).`);
      if (transactionId && !currentOrder) {
        await db.run("INSERT INTO orders(id, user_id, email, status) VALUES(?, NULL, ?, 'disapproved')", transactionId, email);
      }
      return res.json({ ok: true, status: 'disapproved', message: 'Pagamento não aprovado ou recusado pela operadora.', event });
    }

    // Eventos de pagamento pendente (NÃO devem liberar acesso prematuro)
    const isPending = /pending|aguardando|waiting|abandon|boleto|pix_created|fatura.*criada|tentativa/i.test(cleanEvent);
    if (isPending) {
      console.log(`[Webhook] Pagamento pendente registrado para ${email} (evento: ${event}). Acesso não liberado.`);
      if (transactionId && !currentOrder) {
        await db.run("INSERT INTO orders(id, user_id, email, status) VALUES(?, NULL, ?, 'pending')", transactionId, email);
      }
      return res.json({ ok: true, status: 'pending', message: 'Pagamento pendente. O acesso será liberado após a confirmação da transação.', transactionId });
    }

    // Validação estrita de eventos aprovados (whitelist exata, sem match parcial perigoso)
    const EXACT_APPROVED_EVENTS = new Set([
      'purchase_order_confirmed',
      'order_approved',
      'payment_approved',
      'compra_completa',
      'recurrent_payment',
      'pagamento_de_renovacao_efetuado',
      'pagamento_efetuado',
      'product_access_started',
      'inicio_liberacao_de_acesso',
      'checkout.session.completed',
      'invoice.paid',
      'payment_intent.succeeded',
      'purchase',
      'paid',
      'approved'
    ]);
    const isApproved = EXACT_APPROVED_EVENTS.has(cleanEvent) ||
      EXACT_APPROVED_EVENTS.has(String(event).trim().toLowerCase()) ||
      /^(purchase_order_confirmed|order_approved|payment_approved|compra_completa|recurrent_payment|product_access_started|inicio_liberacao_de_acesso)$/i.test(cleanEvent);

    if (!isApproved) {
      console.log(`[Webhook] Evento não qualificado para liberação de acesso: ${event} (${email})`);
      return res.json({ ok: true, status: 'unhandled', message: 'Evento recebido, mas não elegível para liberação automática de acesso.', event });
    }

    // CONTROLE DE TRANSAÇÕES FORA DE ORDEM E IDEMPOTÊNCIA
    if (transactionId && currentOrder) {
      // Se a transação já foi reembolsada ou cancelada, um reenvio de aprovação antiga DEVE ser ignorado!
      if (currentOrder.status === 'refunded' || currentOrder.status === 'canceled') {
        console.log(`[Webhook] Reativação bloqueada: a transação ${transactionId} já se encontra reembolsada/cancelada.`);
        return res.json({ ok: true, status: 'ignored_refunded', message: 'Aprovação ignorada: transação cancelada ou reembolsada anteriormente.', transactionId });
      }
      // Se já foi aprovada anteriormente, retorna idempotência sem reprocessamento
      if (currentOrder.status === 'approved') {
        return res.json({ ok: true, status: 'already_approved', message: 'Transação já aprovada anteriormente (já processado).', transactionId });
      }
    }

    // Aprovação de compra / ativação de aluna
    // Senha padrão unificada: metodolara
    const defaultPassword = generateDefaultPassword();
    const passwordToUse = body.password || defaultPassword;
    const existing = await db.get('SELECT id, email, active FROM users WHERE email=?', email);

    if (existing) {
      if (!existing.active) {
        await db.run('UPDATE users SET active=1 WHERE id=?', existing.id);
        console.log(`[Webhook] Aluna reativada com sucesso: ${email}`);
      }
      if (transactionId) {
        try {
          if (currentOrder) {
            await db.run("UPDATE orders SET status='approved', user_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", existing.id, transactionId);
          } else {
            await db.run("INSERT INTO orders(id, user_id, email, status) VALUES(?,?,?,'approved')", transactionId, existing.id, email);
          }
        } catch {}
      }
      return res.json({ ok: true, message: 'Usuária já existente. Acesso mantido ativo.', userId: existing.id, transactionId });
    }

    const userId = randomUUID();
    const hash = await passwordHash(passwordToUse);

    try {
      await db.run(
        'INSERT INTO users(id, name, email, password, role, active) VALUES(?,?,?,?,?,1) ON CONFLICT (email) DO UPDATE SET active=1',
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

      if (transactionId) {
        if (currentOrder) {
          await db.run("UPDATE orders SET status='approved', user_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", userId, transactionId);
        } else {
          await db.run("INSERT INTO orders(id, user_id, email, status) VALUES(?,?,?,'approved')", transactionId, userId, email);
        }
      }
    } catch (insertErr) {
      const fallback = await db.get('SELECT id FROM users WHERE email=?', email);
      if (fallback) {
        await db.run('UPDATE users SET active=1 WHERE id=?', fallback.id);
        return res.json({ ok: true, message: 'Usuária já existente. Acesso mantido ativo.', userId: fallback.id, transactionId });
      }
      throw insertErr;
    }

    console.log(`[Webhook] Nova aluna cadastrada com sucesso: ${email} (${name}) com senha padrão`);
    res.status(201).json({
      ok: true,
      message: 'Aluna criada com sucesso.',
      userId,
      email,
      temporaryPassword: passwordToUse,
      transactionId
    });
  } catch (err) {
    console.error('[Webhook Error]:', err);
    res.status(500).json({ error: 'Erro ao processar liberação de acesso.' });
  }
};

app.post('/api/webhook/checkout', express.json(), webhookHandler);
app.post('/api/webhook/lastlink', express.json(), webhookHandler);
app.post('/webhook/lastlink', express.json(), webhookHandler);
app.post('/webhook/lastlink/:secret', express.json(), webhookHandler);

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
        'SELECT u.id, u.name, u.email, u.role, u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.token=? AND s.expires>? AND u.active=1',
        digest(token),
        Date.now()
      );
      if (req.user) {
        const bonusRow = await db.get('SELECT bonus_id, title, chosen_at FROM user_bonuses WHERE user_id=?', req.user.id);
        req.user.chosenBonus = bonusRow ? { id: bonusRow.bonus_id, title: bonusRow.title, chosen_at: bonusRow.chosen_at } : null;
      }
    }
    next();
  } catch (err) {
    next(err);
  }
});

const auth = (req, res, next) => req.user ? next() : res.status(401).json({ error: 'Entre para continuar.' });
const admin = (req, res, next) => req.user?.role === 'admin' ? next() : res.status(403).json({ error: 'Acesso restrito à administração.' });
registerTrainingProgram(app, { db, auth });
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

app.put('/api/me/password', auth, async (req, res, next) => {
  try {
    const newPassword = text(req.body.newPassword, 200);
    if (!newPassword || newPassword.length < 6) {
      return fail(res, 'A nova senha deve ter no mínimo 6 caracteres.');
    }
    const currentPassword = text(req.body.currentPassword, 200);
    if (currentPassword) {
      const user = await db.get('SELECT password FROM users WHERE id=?', req.user.id);
      if (!user || !await passwordMatches(currentPassword, user.password)) {
        return res.status(401).json({ error: 'Senha atual incorreta.' });
      }
    }
    const hash = await passwordHash(newPassword);
    await db.run('UPDATE users SET password=? WHERE id=?', hash, req.user.id);
    res.json({ ok: true, message: 'Senha atualizada com sucesso!' });
  } catch (err) {
    next(err);
  }
});

app.post('/api/login', rateLimit({ windowMs: 15 * 60_000, limit: 15 }), async (req, res, next) => {
  try {
    const email = text(req.body.email).toLowerCase(), password = text(req.body.password, 200);
    const user = await db.get('SELECT * FROM users WHERE email=? AND active=1', email);
    if (!user || !await passwordMatches(password, user.password)) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    await db.run('DELETE FROM sessions WHERE expires<?', Date.now());
    const token = randomBytes(32).toString('hex');
    await db.run('INSERT INTO sessions(token, user_id, expires) VALUES(?,?,?)', digest(token), user.id, Date.now() + 7 * 86400000);
    const bonusRow = await db.get('SELECT bonus_id, title, chosen_at FROM user_bonuses WHERE user_id=?', user.id);
    const chosenBonus = bonusRow ? { id: bonusRow.bonus_id, title: bonusRow.title, chosen_at: bonusRow.chosen_at } : null;
    res.cookie('lara_session', token, {
      httpOnly: true,
      secure: production,
      sameSite: 'lax',
      maxAge: 7 * 86400000,
      path: '/'
    }).json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at, chosenBonus } });
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
    res.json(rows.filter(r => !isProgramWorkoutId(r.id)).map(r => ({ ...JSON.parse(r.body), id: r.id, kind: r.kind })));
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
    
    // O bônus nunca pode ser definido, forjado ou sobrescrito pelo cliente via PUT /api/state
    delete data.chosenBonus;

    const allowed = ['profile', 'completed', 'water', 'checkins', 'favorites', 'shopping', 'read', 'schedule', 'exerciseChecks', 'videoPositions', 'meals', 'applications', 'symptoms', 'supplements'];
    if (Object.keys(data).some(k => !allowed.includes(k))) return fail(res, 'Campo não permitido.');
    const arrayFields = ['completed', 'checkins', 'favorites', 'shopping', 'read', 'meals', 'applications', 'symptoms', 'supplements'];
    if (arrayFields.some(k => data[k] !== undefined && !Array.isArray(data[k]))) return fail(res, 'Lista inválida.');
    if (['profile', 'water', 'schedule', 'exerciseChecks', 'videoPositions'].some(k => data[k] !== undefined && (!data[k] || Array.isArray(data[k]) || typeof data[k] !== 'object'))) return fail(res, 'Registro inválido.');
    
    // Preserva exclusivamente a escolha gravada no servidor na tabela atômica user_bonuses
    const bonusRow = await db.get('SELECT bonus_id, title, chosen_at FROM user_bonuses WHERE user_id=?', req.user.id);
    if (bonusRow) {
      data.chosenBonus = { id: bonusRow.bonus_id, title: bonusRow.title, chosen_at: bonusRow.chosen_at };
    }

    await db.run('INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET body=EXCLUDED.body', req.user.id, JSON.stringify(data));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Endpoint atômico e seguro para escolha única do bônus de 7 dias
app.post('/api/bonus/choose', auth, async (req, res, next) => {
  try {
    const bonusId = text(req.body?.bonusId, 50);
    const validBonuses = {
      'cintura-vacuo': 'Protocolo Cintura Fina & Vácuo Abdominal (LPF)',
      'anti-flacidez': 'Manual SOS Anti-Flacidez: Resgate de Firmeza Muscular',
      'gluteos-3d': 'Acelerador de Glúteos 3D: Bumbum Firme em 10 Minutos',
      'fim-de-semana': 'Manual Fim de Semana Sem Culpa: Comer Fora sem Engordar',
      'queima-acelerada': 'Desafio Queima Acelerada: Destrave Metabólico de 7 Dias'
    };
    if (!bonusId || !validBonuses[bonusId]) {
      return fail(res, 'Bônus inválido ou não encontrado.');
    }

    // Regra: Escolha única e permanente (consulta atômica da tabela user_bonuses)
    const existingBonus = await db.get('SELECT bonus_id, title, chosen_at FROM user_bonuses WHERE user_id=?', req.user.id);
    if (existingBonus) {
      return res.status(400).json({
        error: `Você já escolheu o seu bônus de 7 dias (${existingBonus.title}). A escolha é única e definitiva.`,
        chosenBonus: { id: existingBonus.bonus_id, title: existingBonus.title, chosen_at: existingBonus.chosen_at }
      });
    }

    // Regra de carência: 7 dias desde o cadastro/compra
    const userRow = await db.get('SELECT created_at FROM users WHERE id=?', req.user.id);
    const createdAt = userRow?.created_at ? new Date(userRow.created_at).getTime() : Date.now();
    const daysPassed = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);

    if (daysPassed < 7 && req.user.role !== 'admin') {
      const daysRemaining = Math.max(1, Math.ceil(7 - daysPassed));
      return res.status(403).json({
        error: `Seu bônus especial estará liberado para escolha em ${daysRemaining} dia(s).`,
        daysRemaining
      });
    }

    const chosenBonus = {
      id: bonusId,
      title: validBonuses[bonusId],
      chosen_at: new Date().toISOString()
    };

    // Gravação atômica: chave primária user_id impede duplicatas concorrentes em PostgreSQL e SQLite
    try {
      await db.run(
        'INSERT INTO user_bonuses(user_id, bonus_id, title, chosen_at) VALUES(?, ?, ?, ?)',
        req.user.id,
        bonusId,
        chosenBonus.title,
        chosenBonus.chosen_at
      );
    } catch (insertErr) {
      const raceBonus = await db.get('SELECT bonus_id, title, chosen_at FROM user_bonuses WHERE user_id=?', req.user.id);
      return res.status(400).json({
        error: `Você já escolheu o seu bônus de 7 dias (${raceBonus?.title || 'Bônus'}). A escolha é única e definitiva.`,
        chosenBonus: raceBonus ? { id: raceBonus.bonus_id, title: raceBonus.title, chosen_at: raceBonus.chosen_at } : null
      });
    }

    // Sincroniza em member_state para compatibilidade com interfaces legadas
    try {
      const row = await db.get('SELECT body FROM member_state WHERE user_id=?', req.user.id);
      const state = JSON.parse(row?.body || '{}');
      state.chosenBonus = chosenBonus;
      await db.run(
        'INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO UPDATE SET body=EXCLUDED.body',
        req.user.id,
        JSON.stringify(state)
      );
    } catch {}

    console.log(`[Bônus 7 Dias] Aluna ${req.user.email} escolheu: ${chosenBonus.title}`);
    res.json({ ok: true, chosenBonus });
  } catch (err) {
    next(err);
  }
});

// Endpoint protegido para entregar o conteúdo completo e aulas do bônus
app.get('/api/bonus/content/:id', auth, async (req, res, next) => {
  try {
    const bonusId = text(req.params.id, 50);
    const bonus = BONUS_FULL_CONTENT[bonusId];
    if (!bonus) {
      return res.status(404).json({ error: 'Bônus não encontrado.' });
    }

    // Acesso permitido se for administradora OU se a aluna escolheu este bônus
    let allowed = req.user.role === 'admin';
    if (!allowed) {
      const chosen = await db.get('SELECT bonus_id FROM user_bonuses WHERE user_id=? AND bonus_id=?', req.user.id, bonusId);
      if (chosen) allowed = true;
    }

    if (!allowed) {
      return res.status(403).json({ error: 'Você não tem acesso a este conteúdo de bônus.' });
    }

    res.json({ ok: true, bonus });
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
    const rows = await db.all(`
      SELECT u.id, u.name, u.email, u.role, u.active, u.created_at,
             ub.bonus_id, ub.title AS bonus_title, ub.chosen_at,
             m.body AS state_body
      FROM users u
      LEFT JOIN user_bonuses ub ON ub.user_id = u.id
      LEFT JOIN member_state m ON m.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    const users = rows.map(u => {
      let chosenBonus = null;
      if (u.bonus_id) {
        chosenBonus = { id: u.bonus_id, title: u.bonus_title, chosen_at: u.chosen_at };
      } else {
        try {
          const parsed = JSON.parse(u.state_body || '{}');
          chosenBonus = parsed.chosenBonus || null;
        } catch {}
      }
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        active: u.active,
        created_at: u.created_at,
        chosenBonus
      };
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
});

app.post('/api/admin/users', auth, admin, async (req, res, next) => {
  try {
    const name = text(req.body.name, 100), email = text(req.body.email).toLowerCase(), password = text(req.body.password, 200);
    if (!name || !/^\S+@\S+\.\S+$/.test(email) || password.length < 6) return fail(res, 'Informe nome, e-mail válido e senha com 6 caracteres ou mais.');
    if (await db.get('SELECT 1 FROM users WHERE email=?', email)) return res.status(409).json({ error: 'E-mail já cadastrado.' });
    const newUserId = randomUUID();
    await db.run('INSERT INTO users(id, name, email, password, role) VALUES(?,?,?,?,\'member\')', newUserId, name, email, await passwordHash(password));
    await db.run('INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING', newUserId, JSON.stringify({ profile: { name, goal: 'Emagrecer', frequency: 4, level: 'Iniciante' } }));
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
      if (typeof req.body.password !== 'string' || req.body.password.length < 6 || req.body.password.length > 200) return fail(res, 'Senha deve ter entre 6 e 200 caracteres.');
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
  app.get(['/qa', '/qa.js', '/qa.css', '/qa-player.html', '/qa-player.js'], (req, res) => {
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
