import { db, isPg, dbPath, initDb } from './db.mjs';
import { unlinkSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

await initDb();

if (isPg) {
  const backupDir = path.resolve('backups');
  mkdirSync(backupDir, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const target = path.join(backupDir, `backup-pg-${timestamp}.json`);

  const tables = ['users', 'sessions', 'member_state', 'content', 'posts', 'likes', 'comments', 'tickets'];
  const data = {};
  for (const table of tables) {
    data[table] = await db.all(`SELECT * FROM ${table}`);
  }
  // Photos metadata (excluding heavy binary data for quick json, or encode)
  const photos = await db.all('SELECT id, user_id, date, mime, encode(data, \'base64\') AS data_base64 FROM photos');
  data.photos = photos;

  writeFileSync(target, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Snapshot PostgreSQL exportado com sucesso: ${target}`);
  await db.close();
} else {
  const target = path.join(path.dirname(dbPath), 'backup.sqlite');
  if (existsSync(target)) unlinkSync(target);
  await db.run(`VACUUM INTO '${target.replace(/'/g, "''")}'`);
  console.log('Snapshot consistente SQLite criado.');
  await db.close();
}
