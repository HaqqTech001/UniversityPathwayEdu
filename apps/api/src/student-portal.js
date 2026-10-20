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
 if(!attempt.submitted_at&&Date.now()>Date.parse(attempt.expires_at)+30000){
  const {error:expiryError}=await db.rpc('upec_finalize_expired_attempts',{p_student:req.actor.sub});
  if(expiryError)throw expiryError;
  return res.status(409).json({error:'Time expired. This attempt was finalized with unanswered questions.'});
 }
 if(attempt.submitted_at)return res.json({attempt:{id:attempt.id,submittedAt:attempt.submitted_at,score:attempt.score,totalQuestions:attempt.total_questions}});
 if(Date.now()>Date.parse(attempt.expires_at))return res.status(409).json({error:'This examination has expired. Answer review is unavailable after the deadline.',expiresAt:attempt.expires_at});
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
 const {error:expiryError}=await db.rpc('upec_finalize_expired_attempts',{p_student:req.actor.sub});
 if(expiryError)throw expiryError;
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

router.get('/learning/notices',wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_notices').select('id,title,body,audience,published_at').eq('status','published').order('published_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({notices:data||[]});
}));
router.get('/learning/resources/:id/open',wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid resource ID.'});
 const {data,error}=await db.from('upec_learning_resources').select('resource_url,storage_path').eq('id',req.params.id).eq('status','published').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Resource unavailable.'});
 if(data.storage_path){
  const signed=await db.storage.from('upec-learning').createSignedUrl(data.storage_path,120);
  if(signed.error)throw signed.error;
  return res.json({url:signed.data.signedUrl,expiresIn:120});
 }
 return res.json({url:data.resource_url});
}));
router.get('/notifications',wrap(async(req,res)=>{
 const [notices,applications,reads,exams,eligible]=await Promise.all([
  db.from('upec_notices').select('id,title,body,published_at').eq('status','published').order('published_at',{ascending:false}).limit(40),
  db.from('local_student_applications').select('id,reference_number').eq('account_id',req.actor.sub).limit(50),
  db.from('upec_notification_reads').select('notification_key').eq('account_id',req.actor.sub).limit(500),
  db.from('upec_assessments').select('id,title,opens_at,closes_at,restricted').eq('status','published').not('opens_at','is',null).order('opens_at',{ascending:true}).limit(100),
  db.from('upec_assessment_eligibility').select('assessment_id').eq('student_account_id',req.actor.sub).limit(100)
 ]);
 for(const x of [notices,applications,reads])if(x.error)throw x.error;
 // Optional academic tables are deployed separately from notifications.
 const noExamTables=Boolean(exams.error||eligible.error);
 if(noExamTables)console.warn('Exam reminders unavailable until academic migrations are deployed');
 const ids=(applications.data||[]).map(a=>a.id);
 const enrolments=await db.from('local_student_applications').select('programme').eq('account_id',req.actor.sub).eq('status','approved');
 if(enrolments.error)throw enrolments.error;
 const programmeCodes=[...new Set((enrolments.data||[]).map(a=>a.programme))];
 const feeRates=programmeCodes.length?await db.from('upec_programme_fee_rates').select('id,programme_code,monthly_amount_ngn,effective_month,created_at').in('programme_code',programmeCodes).order('created_at',{ascending:false}).limit(80):{data:[],error:null};
 if(feeRates.error)throw feeRates.error;
 const reviews=ids.length?await db.from('local_application_reviews').select('id,application_id,new_status,created_at').in('application_id',ids).order('created_at',{ascending:false}).limit(100):{data:[],error:null};
 if(reviews.error)throw reviews.error;
 const appById=new Map((applications.data||[]).map(a=>[a.id,a]));
 const assigned=new Set((eligible.data||[]).map(a=>a.assessment_id));
 const read=new Set((reads.data||[]).map(a=>a.notification_key));
 const now=Date.now();
 const feeEvents=(feeRates.data||[]).map(rate=>({key:'fee:'+rate.id,title:'Monthly lesson fee update — '+rate.programme_code,body:'New monthly rate: ₦'+Number(rate.monthly_amount_ngn).toLocaleString('en-NG')+'. Effective from '+rate.effective_month+'. Contact UPEC Accounts for details. Existing bills are unchanged.',createdAt:rate.created_at,type:'fees'}));
 const events=[
  ...feeEvents,
  ...(notices.data||[]).map(n=>({key:'notice:'+n.id,title:n.title,body:n.body,createdAt:n.published_at,type:'notice'})),
  ...(reviews.data||[]).map(v=>({key:'review:'+v.id,title:'Application status: '+v.new_status.replaceAll('_',' '),body:'Reference '+appById.get(v.application_id)?.reference_number+' has an update. View your application for details.',createdAt:v.created_at,type:'application'})),
  ...(noExamTables?[]:(exams.data||[])).filter(e=>(!e.restricted||assigned.has(e.id))&&Date.parse(e.opens_at)>=now&&Date.parse(e.opens_at)<=now+48*3600000).map(e=>({key:'exam:'+e.id+':'+Date.parse(e.opens_at),title:'Upcoming assessment: '+e.title,body:'Scheduled to open '+new Date(e.opens_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})+'. Check your CBT page for availability.',createdAt:e.opens_at,type:'examination'}))
 ];
 events.sort((a,b)=>Date.parse(b.createdAt||'')-Date.parse(a.createdAt||''));
 res.json({notifications:events.slice(0,100).map(e=>({...e,read:read.has(e.key)}))});
}));
router.post('/notifications/read',wrap(async(req,res)=>{
 const key=req.body?.key;
 if(typeof key!=='string'||key.length>140||! /^(notice:[0-9a-f-]{36}|review:[0-9a-f-]{36}|exam:[0-9a-f-]{36}:[0-9]{12,14}|fee:[0-9a-f-]{36})$/i.test(key))return res.status(400).json({error:'Invalid notification.'});
 // Authorize against the same private feed; never allow arbitrary read markers.
 const [type,id]=key.split(':');
 if(type==='notice'){
  const result=await db.from('upec_notices').select('id').eq('id',id).eq('status','published').maybeSingle();
  if(result.error)throw result.error;if(!result.data)return res.status(404).json({error:'Notification unavailable.'});
 }else if(type==='review'){
  const review=await db.from('local_application_reviews').select('application_id').eq('id',id).maybeSingle();
  if(review.error)throw review.error;
  if(!review.data)return res.status(404).json({error:'Notification unavailable.'});
  const app=await db.from('local_student_applications').select('id').eq('id',review.data.application_id).eq('account_id',req.actor.sub).maybeSingle();
  if(app.error)throw app.error;if(!app.data)return res.status(404).json({error:'Notification unavailable.'});
 }else if(type==='fee'){
  const rate=await db.from('upec_programme_fee_rates').select('programme_code').eq('id',id).maybeSingle();
  if(rate.error)throw rate.error;if(!rate.data)return res.status(404).json({error:'Notification unavailable.'});
  const enrolled=await db.from('local_student_applications').select('id').eq('account_id',req.actor.sub).eq('programme',rate.data.programme_code).eq('status','approved').limit(1);
  if(enrolled.error)throw enrolled.error;if(!enrolled.data?.length)return res.status(404).json({error:'Notification unavailable.'});
 }else{
  const exam=await db.from('upec_assessments').select('id,opens_at,restricted').eq('id',id).eq('status','published').maybeSingle();
  if(exam.error)throw exam.error;
  if(!exam.data?.opens_at||Date.parse(exam.data.opens_at)!==Number(key.split(':')[2]))return res.status(404).json({error:'Notification unavailable.'});
  if(exam.data.restricted){
   const eligible=await db.from('upec_assessment_eligibility').select('assessment_id').eq('assessment_id',id).eq('student_account_id',req.actor.sub).maybeSingle();
   if(eligible.error)throw eligible.error;if(!eligible.data)return res.status(404).json({error:'Notification unavailable.'});
  }
 }
 const {error}=await db.from('upec_notification_reads').upsert({account_id:req.actor.sub,notification_key:key});
 if(error)throw error;res.json({read:true});
}));
router.get('/dashboard',wrap(async(req,res)=>{
 const id=req.actor.sub;
 const [account,biodata,application,grant]=await Promise.all([
  db.from('local_accounts').select('id,email,full_name,phone,verified_at').eq('id',id).maybeSingle(),
  db.from('local_student_biodata').select('details,completed_at').eq('account_id',id).maybeSingle(),
  db.from('local_student_applications').select('*').eq('account_id',id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  db.from('upec_student_edit_grants').select('biodata_edit_allowed,programme_change_allowed').eq('student_account_id',id).maybeSingle()
 ]);
 const err=account.error||biodata.error||application.error||grant.error;
 if(err)throw err;
 if(!account.data?.verified_at)return res.status(401).json({error:'Unauthorized'});
 res.json({user:account.data,biodata:biodata.data,application:application.data,editPermissions:{biodata:!biodata.data?.completed_at||!!grant.data?.biodata_edit_allowed,programme:!!grant.data?.programme_change_allowed}});
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
 const previous=await db.from('local_student_biodata').select('completed_at').eq('account_id',req.actor.sub).maybeSingle();
 if(previous.error)throw previous.error;
 if(previous.data?.completed_at){const grant=await db.from('upec_student_edit_grants').select('biodata_edit_allowed').eq('student_account_id',req.actor.sub).maybeSingle();if(grant.error)throw grant.error;if(!grant.data?.biodata_edit_allowed)return res.status(403).json({error:'Admin permission required to edit completed biodata.'});}
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
router.get('/finance/monthly-fees',wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_student_monthly_fees').select('id,programme_code,billing_month,due_on,amount_due_ngn,amount_paid_ngn,status').eq('student_account_id',req.actor.sub).order('billing_month',{ascending:false}).limit(60);
 if(error)throw error;
 res.json({fees:data||[]});
}));
export default router;
