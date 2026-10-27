import {buildProgramWorkouts, clampFrequency, phases, weeklyPlans, workoutId, programPosition} from './treinos.js';
export {phases, programPosition};
export const PROGRAM_VERSION='lara-12-weeks-v1';
export const programWorkouts=()=>buildProgramWorkouts();
export function preferences(profile={}) {
  const p=profile.trainingProgram||{};
  return {version:PROGRAM_VERSION,local:p.local==='Casa'?'Casa':'Academia',frequency:clampFrequency(p.frequency??profile.frequency??3),
    level:['Iniciante','Intermediário','Avançado'].includes(p.level)?p.level:['Iniciante','Intermediário','Avançado'].includes(profile.level)?profile.level:'Iniciante',
    startDate:typeof p.startDate==='string'?p.startDate:''};
}
const dayNames=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
export function programSchedule(frequency,local,month) {
  const plan=weeklyPlans[clampFrequency(frequency)],m=[1,2,3].includes(Number(month))?Number(month):1;
  return dayNames.map((day,index)=>{const slot=plan.find(([d])=>d===index);return {day,workoutId:slot?workoutId(local,slot[1],m):''};});
}
export function exercisesFor(workout,level,deload=false) {
  return (workout.exercises||[]).map(e=>{
    const raw=(level==='Iniciante'?e.beginner:level==='Intermediário'?e.intermediate:e.advanced)||e.detail||'';
    const base=Number(e.setsByLevel?.[level])||Number(raw.match(/^(\d+) séries/)?.[1])||e.sets||0;
    const sets=deload&&e.type!=='K'?Math.max(1,Math.ceil(base/2)):base;
    return {...e,prescription:deload&&e.type!=='K'?raw.replace(/^\d+ séries/,`${sets} séries`):raw,effectiveSets:sets};
  });
}
export function nextSession(profile,catalogue,completed=[],now=new Date()) {
  const pref=preferences(profile),position=programPosition(pref.startDate,now);
  if(['unconfigured','completed'].includes(position.status))return null;
  for(let i=0;i<14;i++) {
    const date=new Date(now.getFullYear(),now.getMonth(),now.getDate()+i,12),pos=programPosition(pref.startDate,date);
    if(pos.status!=='active')continue;
    const id=programSchedule(pref.frequency,pref.local,pos.month)[(date.getDay()+6)%7].workoutId;
    const dateKey=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
    if(!id||completed.some(c=>c.id===id&&c.date===dateKey))continue;
    const workout=catalogue.find(w=>w.id===id);if(workout)return {workout,date:dateKey,position:pos};
  }
  return null;
}
// Read published overrides without replacing the legacy catalogue. A draft override hides its built-in ID.
export function catalogueWithOverrides(rows=[],reviewer='') {
  const overrides=new Map(rows.map(r=>[r.id,r]));
  return programWorkouts().flatMap(base=>{
    const override=overrides.get(base.id);if(override&&!override.published)return [];
    let body={};if(override){try{body=typeof override.body==='string'?JSON.parse(override.body):override.body||{};}catch{return [];}}
    return [{...base,...body,id:base.id,kind:'workout',programKey:base.programKey,local:base.local,month:base.month,phase:base.phase,reviewer:body.reviewer||reviewer||'Conteúdo em preparação'}];
  });
}
