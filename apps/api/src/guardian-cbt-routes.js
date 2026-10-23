import {Router} from 'express';
import {supabaseAdmin as db} from './db.js';
import {queueEmail} from './notification-worker.js';
const router=Router();
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.post('/:id/notify-guardians',wrap(async(req,res)=>{
 if(!req.staff?.permissions?.includes('cbt.manage'))return res.status(403).json({error:'CBT management permission required.'});
 const mode=req.body?.mode;
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id)||!['schedule','performance'].includes(mode))return res.status(400).json({error:'Invalid examination or notification type.'});
 const exam=await db.from('upec_assessments').select('id,title,opens_at,status').eq('id',req.params.id).maybeSingle();
 if(exam.error)throw exam.error;
 if(!exam.data||exam.data.status!=='published')return res.status(404).json({error:'Published examination not found.'});
 if(mode==='schedule'&&!exam.data.opens_at)return res.status(409).json({error:'Set the examination opening time before notifying recipients.'});
 const eligibility=await db.from('upec_assessment_eligibility').select('student_account_id').eq('assessment_id',req.params.id).limit(500);
 if(eligibility.error)throw eligibility.error;
 const ids=[...new Set((eligibility.data||[]).map(row=>row.student_account_id))];
 if(!ids.length)return res.json({queued:0,skipped:0});
 if(ids.length===500)return res.status(409).json({error:'Recipient list may be incomplete. Refine the examination audience before sending.'});
 const guardians=await db.from('upec_guardian_contacts').select('student_account_id,guardian_name,email').in('student_account_id',ids).not('verified_at','is',null);
 if(guardians.error)throw guardians.error;
 const students=await db.from('local_accounts').select('id,full_name').in('id',ids);
 if(students.error)throw students.error;
 const names=new Map((students.data||[]).map(row=>[row.id,row.full_name]));
 const attempts=mode==='performance'?await db.from('upec_assessment_attempts').select('student_account_id,score,total_questions,submitted_at').eq('assessment_id',req.params.id).not('submitted_at','is',null).order('submitted_at',{ascending:false}).limit(1000):{data:[],error:null};
 if(attempts.error)throw attempts.error;
 const scores=new Map();
 for(const attempt of attempts.data||[])if(!scores.has(attempt.student_account_id))scores.set(attempt.student_account_id,attempt);
 let queued=0,skipped=0,studentsNotified=0;
 for(const studentId of ids){
  const attempt=scores.get(studentId);
  if(mode==='performance'&&(!attempt||attempt.score==null||!Number.isFinite(Number(attempt.score))||!Number.isFinite(Number(attempt.total_questions))||Number(attempt.total_questions)<=0))continue;
  const title=mode==='performance'?'Your CBT assessment result is available':'CBT assessment schedule update';
  const body=mode==='performance'?'Your recorded score for '+exam.data.title+' is '+attempt.score+' out of '+attempt.total_questions+'.':'Your assessment '+exam.data.title+' is scheduled to open '+(exam.data.opens_at||'at a time to be confirmed by the academic office')+'.';
  const saved=await db.from('upec_cbt_student_notifications').upsert({student_account_id:studentId,assessment_id:exam.data.id,notification_key:'cbt:'+exam.data.id+':'+mode+':'+(attempt?.submitted_at||'schedule'),title,body},{onConflict:'student_account_id,notification_key',ignoreDuplicates:true});
  if(saved.error)throw saved.error;
  studentsNotified++;
 }
 for(const guardian of guardians.data||[]){
  const result=scores.get(guardian.student_account_id);
  if(!guardian.email||(mode==='performance'&&(!result||result.score==null||!Number.isFinite(Number(result.score))||!Number.isFinite(Number(result.total_questions))||Number(result.total_questions)<=0))){skipped++;continue;}
  const name=names.get(guardian.student_account_id)||'your ward';
  const detail=mode==='performance'?'Recorded score: '+result.score+' out of '+result.total_questions+'.':'Scheduled opening: '+(exam.data.opens_at||'Contact the academic office for details')+'.';
  await queueEmail({key:'guardian-cbt:'+req.params.id+':'+mode+':'+guardian.student_account_id+':'+(result?.submitted_at||'schedule'),to:guardian.email,subject:'Your Ward’s '+(mode==='performance'?'Assessment Performance':'Examination Schedule')+' — University Pathway Educational Consult',text:'Dear '+(guardian.guardian_name||'Parent/Guardian')+',\n\nWe are writing regarding '+name+' and '+exam.data.title+'.\n'+detail+'\n\nFor enquiries, contact our academic office.\n\nUniversity Pathway Educational Consult'});
  queued++;
 }
 res.json({queued,skipped,studentsNotified});
}));
export default router;
