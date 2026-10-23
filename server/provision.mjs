import { db, initDb, passwordHash } from './db.mjs';
import { randomUUID } from 'node:crypto';

await initDb();

const email = (process.argv[2] || '').toLowerCase().trim();
const password = process.argv[3] || 'metodolara';
const role = process.argv[4] || 'admin'; // 'admin' ou 'member'
const name = process.argv[5] || (role === 'admin' ? 'Administrador MIVA' : 'Aluna Lara Castelli');

if (!/^\S+@\S+\.\S+$/.test(email)) {
  console.error('Uso: node server/provision.mjs <email> [senha] [role:admin|member] [nome]');
  process.exit(1);
}

const existing = await db.get('SELECT id FROM users WHERE email=?', email);
const hash = await passwordHash(password);

if (existing) {
  await db.run('UPDATE users SET name=?, password=?, role=?, active=1 WHERE id=?', name, hash, role, existing.id);
  console.log(`[Provision] Usuário existente atualizado: ${email} (role: ${role}, senha: ${password})`);
} else {
  const userId = randomUUID();
  await db.run(
    'INSERT INTO users(id, name, email, password, role, active) VALUES(?,?,?,?,?,1)',
    userId,
    name,
    email,
    hash,
    role
  );
  await db.run(
    'INSERT INTO member_state(user_id, body) VALUES(?,?) ON CONFLICT(user_id) DO NOTHING',
    userId,
    JSON.stringify({ profile: { name, goal: 'Emagrecer', frequency: 4, level: 'Iniciante' } })
  );
  console.log(`[Provision] Novo usuário criado com sucesso: ${email} (role: ${role}, senha: ${password})`);
}

await db.close();
