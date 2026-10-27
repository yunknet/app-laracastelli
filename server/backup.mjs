import { db, isPg, dbPath, initDb } from './db.mjs';
import { unlinkSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

await initDb();

if (isPg) {
  try {
    const backupDir = path.resolve('backups');
    mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const target = path.join(backupDir, `backup-pg-${timestamp}.json`);

    const tables = ['users', 'sessions', 'member_state', 'content', 'posts', 'likes', 'comments', 'tickets', 'orders', 'webhook_events'];
    const data = {};
    for (const table of tables) {
      try {
        data[table] = await db.all(`SELECT * FROM ${table}`);
      } catch {
        data[table] = [];
      }
    }
    // Photos metadata (excluding heavy binary data for quick json, or encode)
    try {
      const photos = await db.all('SELECT id, user_id, date, mime, encode(data, \'base64\') AS data_base64 FROM photos');
      data.photos = photos;
    } catch {
      data.photos = [];
    }

    writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`Snapshot PostgreSQL exportado com sucesso: ${target}`);
  } catch (err) {
    console.warn(`[Backup Warning] Não foi possível exportar snapshot JSON do PostgreSQL (${err.message}). O backup nativo pg_dump permanece preservado.`);
  } finally {
    await db.close();
  }
} else {
  try {
    const target = path.join(path.dirname(dbPath), 'backup.sqlite');
    if (existsSync(target)) unlinkSync(target);
    await db.run(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
    console.log('Snapshot consistente SQLite criado.');
  } catch (err) {
    console.warn(`[Backup Warning] Falha ao criar snapshot SQLite (${err.message})`);
  } finally {
    await db.close();
  }
}
