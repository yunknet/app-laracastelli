import {db} from './db.mjs';
import {unlinkSync,existsSync} from 'node:fs';
import path from 'node:path';
import {dbPath} from './db.mjs';
const target=path.join(path.dirname(dbPath),'backup.sqlite');
if(existsSync(target))unlinkSync(target);
db.prepare('VACUUM INTO ?').run(target);
console.log('Snapshot consistente criado.');
