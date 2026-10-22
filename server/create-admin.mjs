import { db, initDb, passwordHash } from './db.mjs';
import { randomUUID } from 'node:crypto';

// Read secrets from stdin or environment, never command arguments.
let input = '';
for await (const chunk of process.stdin) input += chunk;
const { name = 'Administrador', email, password } = JSON.parse(input);
if (!/^\S+@\S+\.\S+$/.test(email || '') || typeof password !== 'string' || password.length < 12) {
  throw new Error('Informe email válido e senha de pelo menos 12 caracteres via JSON em stdin.');
}

await initDb();
await db.run(
  'INSERT INTO users(id,name,email,password,role) VALUES(?,?,?,?,?)',
  randomUUID(),
  name,
  email.toLowerCase().trim(),
  await passwordHash(password),
  'admin'
);
console.log('Administrador criado.');
await db.close();
