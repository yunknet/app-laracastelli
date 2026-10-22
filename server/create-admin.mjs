import { db, initDb, passwordHash } from './db.mjs';
import { randomUUID } from 'node:crypto';

await initDb();

let name = 'Administrador';
let email = '';
let password = '';

if (process.argv[2] && process.argv[3]) {
  email = process.argv[2];
  password = process.argv[3];
  name = process.argv[4] || 'Administrador';
} else {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  if (input.trim()) {
    try {
      const parsed = JSON.parse(input);
      email = parsed.email || '';
      password = parsed.password || '';
      name = parsed.name || 'Administrador';
    } catch {}
  }
}

email = email.toLowerCase().trim();

if (!/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 6) {
  throw new Error('Informe e-mail válido e senha de pelo menos 6 caracteres.');
}

const existing = await db.get('SELECT id FROM users WHERE email=?', email);
const hash = await passwordHash(password);

if (existing) {
  await db.run('UPDATE users SET name=?, password=?, role=?, active=1 WHERE id=?', name, hash, 'admin', existing.id);
  console.log(`[Admin] Usuário existente atualizado com sucesso para administrador: ${email}`);
} else {
  await db.run(
    'INSERT INTO users(id, name, email, password, role, active) VALUES(?,?,?,?,?,1)',
    randomUUID(),
    name,
    email,
    hash,
    'admin'
  );
  console.log(`[Admin] Administrador criado com sucesso: ${email}`);
}

await db.close();
