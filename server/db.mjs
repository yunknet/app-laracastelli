import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import pg from 'pg';

const scrypt = promisify(scryptCallback);

export const dbUrl = process.env.DATABASE_URL || '';
export const dbPath = process.env.DB_PATH || path.resolve('data/lara.sqlite');
export const mediaRoot = process.env.MEDIA_ROOT || path.resolve(process.env.DB_PATH ? path.dirname(process.env.DB_PATH) : 'data', 'media');

let pool = null;
let sqliteDb = null;
export const isPg = Boolean(dbUrl);

if (isPg) {
  pool = new pg.Pool({
    connectionString: dbUrl,
    max: Number(process.env.PG_MAX_POOL || 20),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
  });
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });
} else {
  if (process.env.NODE_ENV === 'production' && !process.env.DB_PATH) {
    console.warn('\n⚠️ [ALERTA DE PRODUÇÃO] DATABASE_URL não foi definida. A aplicação está usando SQLite local. Para persistência com PostgreSQL, forneça a variável DATABASE_URL.\n');
  }
  const { DatabaseSync } = await import('node:sqlite');
  mkdirSync(path.dirname(dbPath), { recursive: true });
  sqliteDb = new DatabaseSync(dbPath);
}

function toPgSql(sql) {
  let idx = 1;
  return sql.replace(/\?/g, () => `$${idx++}`);
}

function normalizeArgs(params) {
  if (params.length === 1 && Array.isArray(params[0])) {
    return params[0];
  }
  return params;
}

export const db = {
  isPg,
  async query(sql, ...params) {
    const args = normalizeArgs(params);
    if (isPg) {
      return pool.query(toPgSql(sql), args);
    }
    const stmt = sqliteDb.prepare(sql);
    if (/^\s*(SELECT|PRAGMA)/i.test(sql)) {
      return { rows: stmt.all(...args) };
    }
    const info = stmt.run(...args);
    return { rowCount: info.changes ?? 0, rows: [] };
  },

  async get(sql, ...params) {
    const args = normalizeArgs(params);
    if (isPg) {
      const res = await pool.query(toPgSql(sql), args);
      return res.rows[0] || null;
    }
    const stmt = sqliteDb.prepare(sql);
    return stmt.get(...args) || null;
  },

  async all(sql, ...params) {
    const args = normalizeArgs(params);
    if (isPg) {
      const res = await pool.query(toPgSql(sql), args);
      return res.rows;
    }
    const stmt = sqliteDb.prepare(sql);
    return stmt.all(...args);
  },

  async run(sql, ...params) {
    const args = normalizeArgs(params);
    if (isPg) {
      const res = await pool.query(toPgSql(sql), args);
      return { changes: res.rowCount ?? 0 };
    }
    const stmt = sqliteDb.prepare(sql);
    const info = stmt.run(...args);
    return { changes: info.changes ?? 0 };
  },

  async exec(sql) {
    if (isPg) {
      await pool.query(sql);
      return;
    }
    sqliteDb.exec(sql);
  },

  prepare(sql) {
    return {
      get: (...params) => this.get(sql, ...params),
      all: (...params) => this.all(sql, ...params),
      run: (...params) => this.run(sql, ...params)
    };
  },

  async close() {
    if (isPg && pool) {
      await pool.end();
    } else if (sqliteDb) {
      sqliteDb.close();
    }
  }
};

export async function initDb() {
  if (isPg) {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        active INTEGER NOT NULL DEFAULT 1,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS sessions (
        token TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        expires BIGINT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS member_state (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL DEFAULT '{}'
      );
      CREATE TABLE IF NOT EXISTS user_bonuses (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        bonus_id TEXT NOT NULL,
        title TEXT NOT NULL,
        chosen_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS content (
        id TEXT PRIMARY KEY,
        kind TEXT NOT NULL,
        body TEXT NOT NULL,
        published INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS likes (
        post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        PRIMARY KEY (post_id, user_id)
      );
      CREATE TABLE IF NOT EXISTS comments (
        id TEXT PRIMARY KEY,
        post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS tickets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        body TEXT NOT NULL,
        reply TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS photos (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        mime TEXT NOT NULL,
        data BYTEA NOT NULL
      );
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        email TEXT NOT NULL,
        status TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
      CREATE TABLE IF NOT EXISTS webhook_events (
        id TEXT PRIMARY KEY,
        transaction_id TEXT,
        event TEXT NOT NULL,
        email TEXT NOT NULL,
        payload TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS webhook_events_tx ON webhook_events(transaction_id);
      CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
    `);
  } else {
    sqliteDb.exec(`
      PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password TEXT NOT NULL,role TEXT NOT NULL DEFAULT 'member',active INTEGER NOT NULL DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS member_state(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL DEFAULT '{}');
      CREATE TABLE IF NOT EXISTS user_bonuses(user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,bonus_id TEXT NOT NULL,title TEXT NOT NULL,chosen_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS content(id TEXT PRIMARY KEY,kind TEXT NOT NULL,body TEXT NOT NULL,published INTEGER NOT NULL DEFAULT 0,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS posts(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS likes(post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,PRIMARY KEY(post_id,user_id));
      CREATE TABLE IF NOT EXISTS comments(id TEXT PRIMARY KEY,post_id TEXT REFERENCES posts(id) ON DELETE CASCADE,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS tickets(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,body TEXT NOT NULL,reply TEXT NOT NULL DEFAULT '',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS photos(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE CASCADE,date TEXT NOT NULL,mime TEXT NOT NULL,data BLOB NOT NULL);
      CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,user_id TEXT REFERENCES users(id) ON DELETE SET NULL,email TEXT NOT NULL,status TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP,updated_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE INDEX IF NOT EXISTS orders_email ON orders(email);
      CREATE TABLE IF NOT EXISTS webhook_events(id TEXT PRIMARY KEY,transaction_id TEXT,event TEXT NOT NULL,email TEXT NOT NULL,payload TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
      CREATE INDEX IF NOT EXISTS webhook_events_tx ON webhook_events(transaction_id);
      CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires);
    `);
  }
}

export async function passwordHash(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${(await scrypt(password, salt, 64)).toString('hex')}`;
}

export async function passwordMatches(password, hash) {
  const [salt, key] = hash.split(':');
  const actual = await scrypt(password, salt, 64);
  const expected = Buffer.from(key, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
