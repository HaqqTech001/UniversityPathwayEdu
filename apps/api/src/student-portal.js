import utmeRoutes from './utme-routes.js';
import {Router} from 'express';
import {supabaseAdmin as db} from './db.js';
import {requireRole} from './security.js';
const router=Router();
router.use(requireRole('student'));
router.use(async(req,res,next)=>{
 try {
  const {data,error}=await db.from('local_accounts').select('verified_at').eq('id',req.actor.sub).maybeSingle();
  if(error)throw error;
  if(!data?.verified_at)return res.status(403).json({error:'Please verify your email before accessing your student account.'});
  next();
 } catch(error){next(error);}
});
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
router.use('/practice',utmeRoutes);
// Published institutional assessments: never send answer keys or explanations.
router.get('/assessments',wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_assessments').select('id,subject_id,title,duration_minutes,status,created_at,opens_at,closes_at,restricted').eq('status','published').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;
 const now=Date.now();
 const {data:eligible,error:eligibleError}=await db.from('upec_assessment_eligibility').select('assessment_id').eq('student_account_id',req.actor.sub);
 if(eligibleError)throw eligibleError;
 const assigned=new Set((eligible||[]).map(row=>row.assessment_id));
 res.json({assessments:(data||[]).filter(a=>(!a.opens_at||Date.parse(a.opens_at)<=now)&&(!a.closes_at||Date.parse(a.closes_at)>now)&&(!a.restricted||assigned.has(a.id))).map(({restricted,...a})=>a)});
}));
const validUuid=value=>typeof value==='string'&&/^[0-9a-f-]{36}$/i.test(value);
router.post('/assessments/:id/start',wrap(async(req,res)=>{
 if(!validUuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {data:attemptId,error}=await db.rpc('upec_begin_assessment',{p_assessment:req.params.id,p_student:req.actor.sub});
 if(error?.code==='P0002')return res.status(404).json({error:'Assessment is unavailable.'});
 if(error?.code==='42501')return res.status(403).json({error:'You are not assigned to this assessment.'});
 if(error)throw error;
 res.json({attemptId});
}));
router.get('/assessments/attempts/:id',wrap(async(req,res)=>{
 if(!validUuid(req.params.id))return res.status(400).json({error:'Invalid attempt ID.'});
 const {data:attempt,error}=await db.from('upec_assessment_attempts').select('id,assessment_id,started_at,expires_at,submitted_at,score,total_questions,answers').eq('id',req.params.id).eq('student_account_id',req.actor.sub).maybeSingle();
 if(error)throw error;
 if(!attempt)return res.status(404).json({error:'Attempt not found.'});
 if(attempt.submitted_at)return res.json({attempt:{id:attempt.id,submittedAt:attempt.submitted_at,score:attempt.score,totalQuestions:attempt.total_questions}});
 const {data:links,error:linkError}=await db.from('upec_assessment_questions').select('question_id,position').eq('assessment_id',attempt.assessment_id).order('position').limit(100);
 if(linkError)throw linkError;
 const {data:questions,error:questionError}=await db.from('upec_teacher_questions').select('id,prompt,options').in('id',(links||[]).map(l=>l.question_id));
 if(questionError)throw questionError;
 const byId=new Map((questions||[]).map(q=>[q.id,q]));
 res.json({attempt:{id:attempt.id,startedAt:attempt.started_at,expiresAt:attempt.expires_at},questions:(links||[]).map(l=>byId.get(l.question_id)).filter(Boolean)});
}));
router.post('/assessments/attempts/:id/submit',wrap(async(req,res)=>{
 if(!validUuid(req.params.id))return res.status(400).json({error:'Invalid attempt ID.'});
 const answers=req.body?.answers;
 if(!answers||typeof answers!=='object'||Array.isArray(answers)||Object.keys(answers).length>100)return res.status(400).json({error:'Invalid answers.'});
 const {data,error}=await db.rpc('upec_submit_assessment',{p_attempt:req.params.id,p_student:req.actor.sub,p_answers:answers});
 if(error?.code==='P0002')return res.status(404).json({error:'Attempt not found.'});
 if(error?.code==='22023')return res.status(409).json({error:error.message});
 if(error)throw error;
 const result=data?.[0];
 res.json({result:{attemptId:result.attempt_id,score:result.correct_count,totalQuestions:result.question_count,submittedAt:result.submitted_time}});
}));
router.get('/assessment-results',wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_assessment_attempts').select('id,assessment_id,started_at,submitted_at,score,total_questions').eq('student_account_id',req.actor.sub).not('submitted_at','is',null).order('submitted_at',{ascending:false}).limit(100);
 if(error)throw error;
 res.json({results:data||[]});
}));
router.get('/learning/resources',wrap(async(req,res)=>{
 const subjectId=req.query.subjectId;
 if(subjectId&& !/^[0-9a-f-]{36}$/i.test(String(subjectId)))return res.status(400).json({error:'Invalid subject ID.'});
 let query=db.from('upec_learning_resources').select('id,subject_id,title,description,resource_url,resource_type,created_at').eq('status','published').order('created_at',{ascending:false}).limit(100);
 if(subjectId)query=query.eq('subject_id',subjectId);
 const {data,error}=await query;if(error)throw error;
 res.json({resources:data||[]});
}));
router.get('/dashboard',wrap(async(req,res)=>{
 const id=req.actor.sub;
 const [account,biodata,application]=await Promise.all([
  db.from('local_accounts').select('id,email,full_name,phone,verified_at').eq('id',id).maybeSingle(),
  db.from('local_student_biodata').select('details,completed_at').eq('account_id',id).maybeSingle(),
  db.from('local_student_applications').select('*').eq('account_id',id).order('created_at',{ascending:false}).limit(1).maybeSingle()
 ]);
 const err=account.error||biodata.error||application.error;
 if(err)throw err;
 if(!account.data?.verified_at)return res.status(401).json({error:'Unauthorized'});
 res.json({user:account.data,biodata:biodata.data,application:application.data});
}));
router.get('/applications/:id/history',wrap(async(req,res)=>{
 const id=req.params.id;
 if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'Invalid application ID.'});
 const {data:application,error:applicationError}=await db.from('local_student_applications').select('id,status,reference_number').eq('id',id).eq('account_id',req.actor.sub).maybeSingle();
 if(applicationError)throw applicationError;
 if(!application)return res.status(404).json({error:'Application not found.'});
 const {data,error}=await db.from('local_application_reviews').select('id,new_status,created_at,note').eq('application_id',id).order('created_at',{ascending:false}).limit(100);
 if(error)throw error;
 // Review notes are internal administrative records, not necessarily applicant-facing messages.
 // Expose only the status events until a separate public-feedback workflow is approved.
 res.json({application,reviews:(data||[]).map(({id,new_status,created_at})=>({id,new_status,created_at}))});
}));
router.put('/applications/:id/correction',wrap(async(req,res)=>{
 const id=req.params.id,formData=req.body?.formData;
 if(!/^[0-9a-f-]{36}$/i.test(id)||!formData||typeof formData!=='object'||Array.isArray(formData)||JSON.stringify(formData).length>20000)return res.status(400).json({error:'Invalid correction request.'});
 const {data,error}=await db.rpc('upec_resubmit_application',{p_application_id:id,p_student_id:req.actor.sub,p_form_data:formData});
 if(error){
  if(error.code==='P0002')return res.status(404).json({error:'Application not found.'});
  if(['23514','22023'].includes(error.code))return res.status(409).json({error:error.message});
  throw error;
 }
 if(!data?.length)return res.status(409).json({error:'Resubmission could not be completed.'});
 res.json({application:data[0]});
}));
router.put('/biodata',wrap(async(req,res)=>{
 const details=req.body?.details;
 if(!details||typeof details!=='object'||Array.isArray(details)||JSON.stringify(details).length>12000)return res.status(400).json({error:'Invalid biodata'});
 const completed=!!(details.surname&&details.firstName&&details.guardianName&&details.guardianPhone);
 const {data,error}=await db.from('local_student_biodata').upsert({account_id:req.actor.sub,details,completed_at:completed?new Date().toISOString():null,updated_at:new Date().toISOString()}).select('details,completed_at').single();
 if(error)throw error;
 res.json({biodata:data});
}));
router.post('/applications',wrap(async(req,res)=>{
 const {formData}=req.body||{};
 if(!formData||typeof formData!=='object'||Array.isArray(formData)||JSON.stringify(formData).length>20000)return res.status(400).json({error:'Invalid application'});
 const programme=String(formData.programmeCategory||'').trim(),academic_session=String(formData.preferredSession||'').trim();
 if(!programme||!academic_session)return res.status(400).json({error:'Programme and session are required'});
 const {data:profile,error:profileError}=await db.from('local_student_biodata').select('completed_at').eq('account_id',req.actor.sub).maybeSingle();
 if(profileError)throw profileError;
 if(!profile?.completed_at)return res.status(409).json({error:'Complete your student biodata before submitting an application.'});
 const {data:existing,error:existingError}=await db.from('local_student_applications').select('id,status').eq('account_id',req.actor.sub).eq('programme',programme).eq('academic_session',academic_session).limit(1);
 if(existingError)throw existingError;
 if(existing?.length)return res.status(409).json({error:'You have already submitted an application for this programme and session. Check your application status in the student portal.'});
 const subjects=[formData.utmeSubject2,formData.utmeSubject3,formData.utmeSubject4].filter(x=>typeof x==='string'&&x.trim());
 const {data,error}=await db.from('local_student_applications').insert({account_id:req.actor.sub,programme,academic_session,subjects,form_data:formData}).select('id,reference_number,status,submitted_at').single();
 if(error)throw error;
 res.status(201).json({application:data});
}));
export default router;
