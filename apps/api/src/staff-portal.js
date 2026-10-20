import {queueEmail} from './notification-worker.js';
import academicRoutes from './academic-routes.js';
import {Router} from 'express';
import crypto from 'node:crypto';
import {supabaseAdmin as db} from './db.js';
import {requireRole,signToken} from './security.js';

const router=Router();
// TODO: add distributed rate limiting and account lockout before production rollout.
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const normalize=value=>String(value||'').trim().toLowerCase();
const hashPassword=password=>new Promise((resolve,reject)=>crypto.scrypt(password,process.env.AUTH_PASSWORD_PEPPER,64,(err,key)=>err?reject(err):resolve(key.toString('hex'))));
const sameHash=(left,right)=>{const a=Buffer.from(left||'','hex'),b=Buffer.from(right||'','hex');return a.length===b.length&&a.length===64&&crypto.timingSafeEqual(a,b);};
const rolePermissions={
 super_admin:['applications.read','applications.review','staff.manage','content.manage','cbt.manage','finance.manage','students.manage'],
 admin:['applications.read','applications.review','content.manage','finance.manage','students.manage'],
 admissions_officer:['applications.read','applications.review'],
 teacher:[],cbt_manager:['cbt.manage'],content_editor:['content.manage']
};
const permissionsFor=member=>member.role==='super_admin'?rolePermissions.super_admin:[...new Set([...(rolePermissions[member.role]||[]),...(member.permissions||[])])];
const memberFor=async id=>{
 const {data,error}=await db.from('local_staff_members').select('account_id,role,permissions,active').eq('account_id',id).maybeSingle();
 if(error)throw error;
 return data?.active?data:null;
};
router.post('/auth/login',wrap(async(req,res)=>{
 const email=normalize(req.body?.email),password=req.body?.password;
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||typeof password!=='string'||password.length>128)return res.status(400).json({error:'Enter valid staff credentials.'});
 const {data:account,error}=await db.from('local_accounts').select('id,email,password_hash,verified_at').eq('email',email).maybeSingle();
 if(error)throw error;
 const candidate=await hashPassword(password);
 if(!account||!sameHash(account.password_hash,candidate)||!account.verified_at)return res.status(401).json({error:'Invalid staff credentials.'});
 const member=await memberFor(account.id);
 if(!member)return res.status(403).json({error:'Staff access is not enabled for this account.'});
 res.json({token:signToken({sub:account.id,role:'staff'},1800)});
}));
router.use(requireRole('staff'));
router.use(wrap(async(req,res,next)=>{
 const member=await memberFor(req.actor.sub);
 if(!member)return res.status(403).json({error:'Staff access denied.'});
 req.staff={...member,permissions:permissionsFor(member)};
 next();
}));
router.use('/academic',academicRoutes);
router.get('/me',(req,res)=>res.json({role:req.staff.role,permissions:req.staff.permissions}));
const permit=permission=>(req,res,next)=>req.staff.permissions.includes(permission)?next():res.status(403).json({error:'Insufficient staff permissions.'});
router.get('/members',permit('staff.manage'),wrap(async(req,res)=>{const {data,error}=await db.from('local_staff_members').select('account_id,role,permissions,active').limit(100);if(error)throw error;res.json({members:data||[]});}));
// Accurate dashboard counts are calculated across the full database, not the
// first 100 application records returned to the admissions review table.
router.get('/applications/metrics',permit('applications.read'),wrap(async(req,res)=>{
 const statuses=['submitted','under_review','approved','action_required','rejected'];
 const queries=[db.from('local_student_applications').select('id',{count:'exact',head:true}),
  ...statuses.map(status=>db.from('local_student_applications').select('id',{count:'exact',head:true}).eq('status',status))];
 const results=await Promise.all(queries);
 const failure=results.find(result=>result.error);
 if(failure)throw failure.error;
 const counts=Object.fromEntries(statuses.map((status,index)=>[status,results[index+1].count??0]));
 res.json({total:results[0].count??0,...counts});
}));
router.get('/applications',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('local_student_applications').select('id,reference_number,programme,academic_session,status,submitted_at').order('submitted_at',{ascending:false}).limit(100);
 if(error)throw error;
 res.json({applications:data||[]});
}));
router.get('/applications/:id',permit('applications.read'),wrap(async(req,res)=>{
 const id=req.params.id;
 if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'Invalid application ID.'});
 const [application,reviews,resubmissions]=await Promise.all([
  db.from('local_student_applications').select('id,reference_number,programme,academic_session,status,submitted_at,form_data,subjects').eq('id',id).maybeSingle(),
  db.from('local_application_reviews').select('id,previous_status,new_status,note,created_at').eq('application_id',id).order('created_at',{ascending:false}).limit(100),
  db.from('local_application_resubmissions').select('id,submitted_at').eq('application_id',id).order('submitted_at',{ascending:false}).limit(100)
 ]);
 if(application.error)throw application.error;
 if(!application.data)return res.status(404).json({error:'Application not found.'});
 if(reviews.error)throw reviews.error;
 if(resubmissions.error)throw resubmissions.error;
 res.json({application:application.data,reviews:reviews.data||[],resubmissions:resubmissions.data||[]});
}));
router.patch('/applications/:id/status',permit('applications.review'),wrap(async(req,res)=>{
 const allowed=['under_review','approved','action_required','rejected'];
 const status=req.body?.status,note=String(req.body?.note||'').trim();
 if(!allowed.includes(status)||! /^[0-9a-f-]{36}$/i.test(req.params.id)||note.length>2000)return res.status(400).json({error:'Invalid review request.'});
 if(['action_required','rejected'].includes(status)&&note.length<5)return res.status(400).json({error:'A review reason is required.'});
 const {data,error}=await db.rpc('upec_review_application',{p_application_id:req.params.id,p_reviewer_id:req.actor.sub,p_status:status,p_note:note||null});
 if(error){
  if(error.code==='42501')return res.status(403).json({error:'Review permission denied.'});
  if(/not found/i.test(error.message))return res.status(404).json({error:'Application not found.'});
  if(/invalid status|reason required/i.test(error.message))return res.status(409).json({error:error.message});
  throw error;
 }
 if(!data?.length)return res.status(409).json({error:'Review could not be completed.'});
 // Email is best-effort; a mail transport failure must not undo a committed review.
 try{
  const application=await db.from('local_student_applications').select('account_id,reference_number').eq('id',req.params.id).maybeSingle();
  if(application.error)throw application.error;
  if(application.data){
   const account=await db.from('local_accounts').select('email').eq('id',application.data.account_id).maybeSingle();
   if(account.error)throw account.error;
   if(account.data?.email){
    const plainStatus=status.replaceAll('_',' ');
    const reviewEvent=await db.from('local_application_reviews').select('id').eq('application_id',req.params.id).eq('new_status',status).eq('reviewer_account_id',req.actor.sub).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(reviewEvent.error)throw reviewEvent.error;
    if(!reviewEvent.data?.id)throw Error('Could not resolve review event for email notification');
    await queueEmail({key:'review:'+reviewEvent.data.id,to:account.data.email,subject:'UPEC application update — '+plainStatus,text:'Your University Pathway Educational Consult application ('+application.data.reference_number+') is now '+plainStatus+'. Sign in to your student portal to review the latest status and any required next steps.'});
   }
  }
 }catch(mailError){console.error('Application status notification email failed:',mailError);}
 res.json({application:data[0]});
}));
router.get('/students/:id/edit-permissions',permit('students.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_student_edit_grants').select('biodata_edit_allowed,programme_change_allowed,updated_at').eq('student_account_id',req.params.id).maybeSingle();
 if(error)throw error;res.json({permissions:data||{biodata_edit_allowed:false,programme_change_allowed:false}});
}));
router.put('/students/:id/edit-permissions',permit('students.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid student ID'});
 const {biodataEditAllowed,programmeChangeAllowed}=req.body||{};
 if(typeof biodataEditAllowed!=='boolean'||typeof programmeChangeAllowed!=='boolean')return res.status(400).json({error:'Boolean permissions required'});
 const {data,error}=await db.from('upec_student_edit_grants').upsert({student_account_id:req.params.id,biodata_edit_allowed:biodataEditAllowed,programme_change_allowed:programmeChangeAllowed,updated_by:req.actor.sub,updated_at:new Date().toISOString()}).select('biodata_edit_allowed,programme_change_allowed').single();
 if(error)throw error;res.json({permissions:data});
}));
router.get('/finance/programme-rates',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_programme_fee_rates').select('id,programme_code,monthly_amount_ngn,effective_month,created_at').order('effective_month',{ascending:false}).limit(200);
 if(error)throw error;res.json({rates:data||[]});
}));
router.post('/finance/programme-rates',permit('finance.manage'),wrap(async(req,res)=>{
 const {programmeCode,monthlyAmountNgn,effectiveMonth}=req.body||{};
 if(typeof programmeCode!=='string'||programmeCode.trim().length<2||programmeCode.length>100||
 typeof monthlyAmountNgn!=='number'||!Number.isFinite(monthlyAmountNgn)||monthlyAmountNgn<0||
 !/^\d{4}-(0[1-9]|1[0-2])-01$/.test(effectiveMonth||''))return res.status(400).json({error:'Enter a programme, valid monthly fee and effective month.'});
 const {data,error}=await db.from('upec_programme_fee_rates').insert({programme_code:programmeCode.trim(),monthly_amount_ngn:monthlyAmountNgn,effective_month:effectiveMonth,created_by:req.actor.sub}).select('id,programme_code,monthly_amount_ngn,effective_month').single();
 if(error?.code==='23505')return res.status(409).json({error:'A fee rate for this programme and effective month already exists.'});
 if(error)throw error;
 // Notify verified student email accounts for approved programme enrolments.
 let queued=0,notificationError=null;
 try{
  const enrolled=await db.from('local_student_applications').select('account_id').eq('programme',data.programme_code).eq('status','approved').limit(500);
  if(enrolled.error)throw enrolled.error;
  const accountIds=[...new Set((enrolled.data||[]).map(x=>x.account_id))];
  if(accountIds.length){
   const accounts=await db.from('local_accounts').select('id,email,full_name,verified_at').in('id',accountIds);
   if(accounts.error)throw accounts.error;
   for(const account of accounts.data||[]){
    if(!account.email||!account.verified_at)continue;
    const body='Dear '+(account.full_name||'Student')+',\\n\\nUPEC wishes to notify you that the monthly lesson fee for '+data.programme_code+' is now ₦'+Number(data.monthly_amount_ngn).toLocaleString('en-NG')+' effective from '+data.effective_month+'. Previous bills are not automatically changed. Please review your student portal or contact UPEC Accounts for clarification.\\n\\nUniversity Pathway Educational Consult';
    await queueEmail({key:'lesson-rate-student:'+data.id+':'+account.id,to:account.email,subject:'UPEC Monthly Lesson Fee Update — '+data.programme_code,text:body});
    queued++;
   }
  }
 }catch(notifyError){notificationError='Some student email notices could not be queued.';console.error('Student fee notice queue failed:',notifyError);}
 res.status(201).json({rate:data,studentEmailsQueued:queued,notificationWarning:notificationError});
}));
router.get('/finance/registration-rates',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_registration_fee_rates').select('id,programme_code,amount_ngn,effective_month,created_at').order('effective_month',{ascending:false}).limit(200);
 if(error)throw error;res.json({rates:data||[]});
}));
router.post('/finance/registration-rates',permit('finance.manage'),wrap(async(req,res)=>{
 const {programmeCode,amountNgn,effectiveMonth}=req.body||{};
 if(typeof programmeCode!=='string'||programmeCode.trim().length<2||programmeCode.length>100||
 typeof amountNgn!=='number'||!Number.isFinite(amountNgn)||amountNgn<0||
 !/^\d{4}-(0[1-9]|1[0-2])-01$/.test(effectiveMonth||''))return res.status(400).json({error:'Valid programme, amount and effective month required.'});
 const {data,error}=await db.from('upec_registration_fee_rates').insert({programme_code:programmeCode.trim(),amount_ngn:amountNgn,effective_month:effectiveMonth,created_by:req.actor.sub}).select('id,programme_code,amount_ngn,effective_month').single();
 if(error?.code==='23505')return res.status(409).json({error:'Registration rate already exists for this programme and month.'});
 if(error)throw error;res.status(201).json({rate:data});
}));
export default router;
