import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import path from 'node:path';import os from 'node:os';
import {spawn} from 'node:child_process';
import {randomUUID,createHash} from 'node:crypto';
// Always disposable SQLite for this integration test; never consume a deployment DATABASE_URL.
const tmp=await mkdtemp(path.join(os.tmpdir(),'lara-program-test-'));
process.env.DATABASE_URL='';process.env.DB_PATH=path.join(tmp,'test.sqlite');
const {db,initDb}=await import('../server/db.mjs');
const servers=[];let adminCookie,memberCookie;
async function request(port,url,cookie){const r=await fetch(`http://localhost:${port}/api${url}`,{headers:cookie?{Cookie:cookie}:{}});return {status:r.status,body:await r.json()};}
async function server(port,enabled,reviewer=''){
  const child=spawn(process.execPath,['server/index.mjs'],{cwd:new URL('..',import.meta.url),env:{...process.env,NODE_ENV:'test',PORT:String(port),APP_ORIGIN:`http://localhost:${port}`,LARA_TRAINING_PROGRAM_ENABLED:enabled,LARA_TRAINING_PROGRAM_REVIEWER:reviewer},stdio:'ignore'});servers.push(child);
  for(let i=0;i<100;i++){try{if((await request(port,'/health')).status===200)return}catch{}await new Promise(r=>setTimeout(r,100));}throw Error('Test server not ready');
}
before(async()=>{await initDb();for(const role of ['admin','member']){const id=randomUUID(),token=randomUUID();await db.run('INSERT INTO users(id,name,email,password,role) VALUES(?,?,?,?,?)',id,role,role+'@programme.test','test-only-hash',role);await db.run('INSERT INTO sessions(token,user_id,expires) VALUES(?,?,?)',createHash('sha256').update(token).digest('hex'),id,Date.now()+3600000);if(role==='admin')adminCookie='lara_session='+token;else memberCookie='lara_session='+token;}await server(5294,'0');await server(5295,'1');await server(5296,'1','Responsável de teste');});
after(async()=>{for(const child of servers){if(child.exitCode!==null)continue;const stopped=new Promise(r=>child.once('exit',r));child.kill();await stopped;}await db.close();const resolved=path.resolve(tmp);assert.equal(path.dirname(resolved),path.resolve(os.tmpdir()));assert.ok(path.basename(resolved).startsWith('lara-program-test-'));await rm(resolved,{recursive:true,force:true});});
test('default off and authentication preserve legacy rollout',async()=>{
  assert.equal((await request(5294,'/training-program/config')).status,401);
  assert.equal((await request(5294,'/training-program/config',adminCookie)).body.enabled,false);
  assert.equal((await request(5294,'/training-program/catalogue',adminCookie)).status,404);
  assert.deepEqual((await request(5294,'/content',memberCookie)).body,[]);
});
test('without reviewer only administrators can preview',async()=>{
  const admin=await request(5295,'/training-program/config',adminCookie);assert.equal(admin.body.enabled,true);assert.equal(admin.body.preview,true);
  assert.equal((await request(5295,'/training-program/config',memberCookie)).body.enabled,false);
  assert.equal((await request(5295,'/training-program/catalogue',memberCookie)).status,404);
  const content=await request(5295,'/training-program/catalogue',adminCookie);assert.equal(content.body.workouts.length,48);assert.ok(content.body.workouts.every(w=>w.reviewer==='Conteúdo em preparação'));
});
test('reviewed activation returns 48 workouts without writing state or changing the legacy catalogue',async()=>{
  const current=await request(5296,'/state',memberCookie);
  const response=await request(5296,'/training-program/catalogue',memberCookie);assert.equal(response.status,200);assert.equal(response.body.workouts.length,48);assert.equal(response.body.config.preview,false);assert.ok(response.body.workouts.every(w=>w.reviewer==='Responsável de teste'));
  assert.deepEqual((await request(5296,'/state',memberCookie)).body,current.body);
  assert.deepEqual((await request(5296,'/content',memberCookie)).body,[]);
});
test('draft hides programme workout and published override does not leak into legacy content',async()=>{
  const id='ac-fb-a-m1';await db.run('INSERT INTO content(id,kind,body,published) VALUES(?,?,?,?)',id,'workout',JSON.stringify({title:'Ficha revista',reviewer:'Revisora'}),0);
  let result=await request(5296,'/training-program/catalogue',memberCookie);assert.equal(result.body.workouts.some(w=>w.id===id),false);
  await db.run('UPDATE content SET published=1 WHERE id=?',id);
  result=await request(5296,'/training-program/catalogue',memberCookie);const w=result.body.workouts.find(w=>w.id===id);assert.equal(w.title,'Ficha revista');assert.equal(w.local,'Academia');assert.ok(w.instructions);
  assert.deepEqual((await request(5296,'/content',memberCookie)).body,[]);
});
