import {catalogueWithOverrides, PROGRAM_VERSION} from '../public/program-model.js';
import {programWorkouts} from '../public/program-model.js';
const ids=new Set(programWorkouts().map(w=>w.id));
export const isProgramWorkoutId=id=>ids.has(id);
export function programAccess(user,env=process.env) {
  const enabled=env.LARA_TRAINING_PROGRAM_ENABLED==='1';
  const reviewer=(env.LARA_TRAINING_PROGRAM_REVIEWER||'').trim();
  return {enabled:!!user&&enabled&&(user.role==='admin'||!!reviewer),preview:!reviewer,reviewer,version:PROGRAM_VERSION};
}
export function registerTrainingProgram(app,{db,auth}) {
  app.get('/api/training-program/config',auth,(req,res)=>res.json(programAccess(req.user)));
  app.get('/api/training-program/catalogue',auth,async(req,res,next)=>{
    const config=programAccess(req.user);if(!config.enabled)return res.status(404).json({error:'Programa não ativado para esta conta.'});
    try {const rows=await db.all("SELECT id,body,published FROM content WHERE kind='workout'");res.json({config,workouts:catalogueWithOverrides(rows,config.reviewer)});}catch(e){next(e);}
  });
}
