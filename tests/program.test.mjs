import {test} from 'node:test';
import assert from 'node:assert/strict';
import {programWorkouts,preferences,programSchedule,programPosition,nextSession,exercisesFor,catalogueWithOverrides} from '../public/program-model.js';
import {programView,validateProgramSettings} from '../public/program-view.js';
import {demoContent,suggestedSchedule} from '../public/data.js';
const programme=programWorkouts();
test('all 24 calendar combinations resolve to 48 distinct workouts with instructions',()=>{
  assert.equal(programme.length,48);assert.equal(new Set(programme.map(w=>w.id)).size,48);
  for(const frequency of [2,3,4,5])for(const local of ['Casa','Academia'])for(const month of [1,2,3]){
    const days=programSchedule(frequency,local,month);assert.equal(days.filter(d=>d.workoutId).length,frequency);
    for(const d of days.filter(d=>d.workoutId)){const w=programme.find(w=>w.id===d.workoutId);assert.ok(w);assert.equal(w.local,local);assert.equal(w.month,month);assert.ok(w.instructions);assert.ok(w.exercises.every(e=>e.howTo.length>=3));}
  }
});
test('calendar boundaries advance at midnight and finish without perpetual deload',()=>{
  assert.equal(programPosition('2026-01-05',new Date(2026,0,12,0,0)).week,2);
  assert.equal(programPosition('2026-01-05',new Date(2026,1,2,9,0)).month,2);
  assert.equal(programPosition('2026-01-05',new Date(2026,0,26)).deload,true);
  assert.equal(programPosition('2026-01-05',new Date(2026,2,29,23,59)).status,'active');
  const finished=programPosition('2026-01-05',new Date(2026,2,30));assert.equal(finished.status,'completed');assert.equal(finished.deload,false);
  for(const value of ['', 'invalid','2026-02-31'])assert.equal(programPosition(value).status,'unconfigured');
  assert.equal(programPosition('2027-01-05',new Date(2026,0,5)).status,'not-started');
});
test('deload visibly reduces per-level sets, rounds up and leaves base prescriptions intact',()=>{
  const w=programme.find(w=>w.id==='ac-fb-a-m1'),snapshot=structuredClone(w);
  for(const level of ['Iniciante','Intermediário','Avançado']){
    const usual=exercisesFor(w,level),light=exercisesFor(w,level,true);
    usual.forEach((e,i)=>{assert.equal(light[i].effectiveSets,Math.ceil(e.effectiveSets/2));assert.match(light[i].prescription,new RegExp('^'+light[i].effectiveSets+' séries'));});
  }
  assert.deepEqual(w,snapshot);
});
test('programme preferences never overwrite the legacy six-day plan or old records',()=>{
  const profile={name:'Aluna',frequency:6,goal:'Massa Magra',level:'Avançado'},original=structuredClone(profile);
  assert.equal(preferences(profile).frequency,5);assert.equal(preferences(profile).level,'Avançado');assert.deepEqual(profile,original);
  profile.trainingProgram=validateProgramSettings({local:'Casa',level:'Iniciante',frequency:'2',startDate:'2026-01-05'});
  assert.equal(profile.frequency,6);assert.equal(profile.level,'Avançado');assert.equal(preferences(profile).frequency,2);
  assert.throws(()=>validateProgramSettings({local:'Casa',frequency:'6',level:'Iniciante',startDate:'2026-01-05'}));
});
test('browsing phase three does not change the active next session',()=>{
  const state={profile:{frequency:6,trainingProgram:{local:'Casa',frequency:3,level:'Iniciante',startDate:'2026-01-05'}},completed:[],exerciseChecks:{}};
  const now=new Date(2026,0,5,9),before=nextSession(state.profile,programme,[],now);
  const html=programView({state,config:{enabled:true,preview:true},catalogue:programme,loaded:true,hash:'#programa?month=3',now});
  assert.match(html,/Consulta de outra fase/);assert.match(html,/ca-fb-a-m1/);assert.match(html,/ca-fb-a-m3/);
  assert.deepEqual(nextSession(state.profile,programme,[],now),before);
  assert.equal(nextSession(state.profile,programme,[{id:'ca-fb-a-m1',date:'2026-01-05'}],now).date,'2026-01-07');
  assert.equal(nextSession(state.profile,programme,[],new Date(2027,0,5)),null);
});
test('published overrides preserve metadata, drafts hide built-ins, legacy data remains identical',()=>{
  const snapshot=structuredClone(demoContent),base=programme[0];
  const catalogue=catalogueWithOverrides([{id:base.id,published:1,body:JSON.stringify({title:'Título revisado',local:undefined,reviewer:'Revisora de teste'})}],'Equipe de teste');
  const w=catalogue.find(w=>w.id===base.id);assert.equal(w.title,'Título revisado');assert.equal(w.local,base.local);assert.equal(w.programKey,base.programKey);assert.equal(w.instructions,base.instructions);
  assert.equal(catalogueWithOverrides([{id:base.id,published:0,body:'{}'}]).some(w=>w.id===base.id),false);
  assert.equal(catalogueWithOverrides([{id:base.id,published:1,body:'not-json'}]).some(w=>w.id===base.id),false);
  assert.deepEqual(demoContent,snapshot);assert.ok(suggestedSchedule(6,'Emagrecer',3).some(d=>d.workoutId==='w3_1'));
});
test('how-to controls are separate from exercise checkboxes and user content is escaped',()=>{
  const state={profile:{trainingProgram:{local:'Academia',frequency:3,level:'Iniciante',startDate:'2026-01-05'}},completed:[{id:'w1',date:'2026-01-04'}],exerciseChecks:{}};
  const w={...programme[0],title:'<img src=x onerror=alert(1)>'},hash='#programa?workout='+w.id;
  const html=programView({state,config:{enabled:true},catalogue:[w],loaded:true,hash,now:new Date(2026,0,26)});
  assert.match(html,/séries abaixo já foram reduzidas/);assert.match(html,/&lt;img/);assert.doesNotMatch(html,/<img src=x/);assert.match(html,/<\/label>\s*<details>/);assert.match(html,/Vídeo da aula em preparação/);
  assert.equal(state.completed.length,1);
});
