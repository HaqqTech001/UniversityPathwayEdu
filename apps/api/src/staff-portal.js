import {studentLessonFeeChangeEmail,lessonFeeChangeEmail} from './fee-email-templates.js';
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
 const {data,error}=await db.from('local_student_applications').select('id,account_id,reference_number,programme,academic_session,status,submitted_at').order('submitted_at',{ascending:false}).limit(100);
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
    const previousRates=await db.from('upec_programme_fee_rates').select('monthly_amount_ngn').eq('programme_code',data.programme_code).lt('effective_month',data.effective_month).order('effective_month',{ascending:false}).limit(1);
    if(previousRates.error)throw previousRates.error;
    const letter=studentLessonFeeChangeEmail({name:account.full_name,studentName:account.full_name||'Student',programme:data.programme_code,oldAmount:previousRates.data?.[0]?.monthly_amount_ngn??null,newAmount:data.monthly_amount_ngn,effectiveMonth:data.effective_month});
    await queueEmail({key:'lesson-rate-student:'+data.id+':'+account.id,to:account.email,...letter});
    queued++;
    const guardian=await db.from('upec_guardian_contacts').select('guardian_name,email,verified_at').eq('student_account_id',account.id).maybeSingle();
    if(guardian.error)throw guardian.error;
    if(guardian.data?.verified_at&&guardian.data.email){
     const parentLetter=lessonFeeChangeEmail({guardianName:guardian.data.guardian_name,studentName:account.full_name||'Student',programme:data.programme_code,oldAmount:previousRates.data?.[0]?.monthly_amount_ngn??null,newAmount:data.monthly_amount_ngn,effectiveMonth:data.effective_month});
     await queueEmail({key:'lesson-rate-guardian:'+data.id+':'+account.id,to:guardian.data.email,...parentLetter});
     queued++;
    }
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
router.post('/finance/invoices',permit('finance.manage'),wrap(async(req,res)=>{
 const {studentId,programmeCode,billingMonth,dueOn}=req.body||{};
 if(!/^[0-9a-f-]{36}$/i.test(studentId||'')||typeof programmeCode!=='string'||!/^[0-9]{4}-(0[1-9]|1[0-2])-01$/.test(billingMonth||'')||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dueOn||''))return res.status(400).json({error:'Valid student, programme, billing month and due date required.'});
 const enrolled=await db.from('local_student_applications').select('id').eq('account_id',studentId).eq('programme',programmeCode).eq('status','approved').limit(1);
 if(enrolled.error)throw enrolled.error;
 if(!enrolled.data?.length)return res.status(409).json({error:'Student is not approved for this programme.'});
 const rate=await db.from('upec_programme_fee_rates').select('monthly_amount_ngn').eq('programme_code',programmeCode).lte('effective_month',billingMonth).order('effective_month',{ascending:false}).limit(1);
 if(rate.error)throw rate.error;
 if(!rate.data?.length)return res.status(409).json({error:'No approved monthly fee rate for this programme and month.'});
 const result=await db.from('upec_student_monthly_fees').insert({student_account_id:studentId,programme_code:programmeCode,billing_month:billingMonth,due_on:dueOn,amount_due_ngn:rate.data[0].monthly_amount_ngn}).select('id,programme_code,billing_month,due_on,amount_due_ngn,status').single();
 if(result.error?.code==='23505')return res.status(409).json({error:'Monthly invoice already exists for this student and programme.'});
 if(result.error)throw result.error;
 res.status(201).json({invoice:result.data});
}));
router.post('/finance/invoices/:id/payments',permit('finance.manage'),wrap(async(req,res)=>{
 const {amountNgn,reference}=req.body||{};
 if(typeof amountNgn!=='number'||!Number.isFinite(amountNgn)||amountNgn<=0||!Number.isInteger(Math.round(amountNgn*100))||typeof reference!=='string'||reference.trim().length<5||reference.length>120)return res.status(400).json({error:'Verified payment amount and reference required.'});
 const {data,error}=await db.rpc('upec_record_fee_payment',{p_invoice:req.params.id,p_amount:amountNgn,p_reference:reference.trim(),p_staff:req.actor.sub});
 if(error)throw error;
 res.json({invoice:data});
}));
router.get('/finance/payment-ledger',permit('finance.manage'),wrap(async(req,res)=>{
 const limit=100;
 const [monthly,registration]=await Promise.all([
  db.from('upec_fee_payments').select('id,invoice_id,amount_ngn,reference,recorded_at,recorded_by').order('recorded_at',{ascending:false}).limit(limit),
  db.from('upec_registration_payments').select('id,invoice_id,amount_ngn,reference,recorded_at,recorded_by').order('recorded_at',{ascending:false}).limit(limit)
 ]);
 if(monthly.error)throw monthly.error;if(registration.error)throw registration.error;
 const monthlyIds=[...new Set((monthly.data||[]).map(p=>p.invoice_id))],registrationIds=[...new Set((registration.data||[]).map(p=>p.invoice_id))];
 const [monthlyInvoices,registrationInvoices]=await Promise.all([
  monthlyIds.length?db.from('upec_student_monthly_fees').select('id,student_account_id,programme_code,billing_month').in('id',monthlyIds):Promise.resolve({data:[],error:null}),
  registrationIds.length?db.from('upec_registration_invoices').select('id,student_account_id,programme_code,academic_session').in('id',registrationIds):Promise.resolve({data:[],error:null})
 ]);
 if(monthlyInvoices.error)throw monthlyInvoices.error;if(registrationInvoices.error)throw registrationInvoices.error;
 const m=new Map((monthlyInvoices.data||[]).map(x=>[x.id,x])),g=new Map((registrationInvoices.data||[]).map(x=>[x.id,x]));
 const entries=[
  ...(monthly.data||[]).map(x=>({...x,type:'monthly',invoice:m.get(x.invoice_id)||null})),
  ...(registration.data||[]).map(x=>({...x,type:'registration',invoice:g.get(x.invoice_id)||null}))
 ].sort((a,b)=>Date.parse(b.recorded_at)-Date.parse(a.recorded_at)).slice(0,limit);
 res.json({entries,limit,hasMore:(monthly.data||[]).length===limit||(registration.data||[]).length===limit});
}));
router.get('/finance/application-search',permit('finance.manage'),wrap(async(req,res)=>{
 const q=String(req.query.q||'').trim();
 if(q.length<3||q.length>100)return res.status(400).json({error:'Enter 3–100 characters of the application reference.'});
 const escaped=q.replace(/[\\%_]/g,c=>'\\'+c);
 const {data,error}=await db.from('local_student_applications').select('id,reference_number,programme,academic_session,status,account_id').ilike('reference_number','%'+escaped+'%').order('created_at',{ascending:false}).limit(30);
 if(error)throw error;
 res.json({applications:(data||[]).map(({id,reference_number,programme,academic_session,status,account_id})=>({id,reference_number,programme,academic_session,status,account_id}))});
}));
router.get('/finance/registration-invoices',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_registration_invoices').select('id,student_account_id,programme_code,academic_session,fee_amount_ngn,amount_paid_ngn,status,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({invoices:data||[]});
}));
router.post('/finance/registration-invoices',permit('finance.manage'),wrap(async(req,res)=>{
 const {applicationId}=req.body||{};
 if(typeof applicationId!=='string'||!/^[0-9a-f-]{36}$/i.test(applicationId))return res.status(400).json({error:'Select a valid programme application.'});
 const {data:application,error:applicationError}=await db.from('local_student_applications').select('account_id,programme,academic_session,status,submitted_at').eq('id',applicationId).maybeSingle();
 if(applicationError)throw applicationError;if(!application)return res.status(404).json({error:'Application not found.'});
 if(!application.submitted_at)return res.status(409).json({error:'Application must be submitted before registration billing.'});
 const date=(application.submitted_at||new Date().toISOString()).slice(0,10);
 const {data:rates,error:ratesError}=await db.from('upec_registration_fee_rates').select('amount_ngn').eq('programme_code',application.programme).lte('effective_month',date.slice(0,7)+'-01').order('effective_month',{ascending:false}).limit(1);
 if(ratesError)throw ratesError;if(!rates?.length)return res.status(409).json({error:'No programme registration fee rate was effective at application submission.'});
 const {data,error}=await db.from('upec_registration_invoices').insert({student_account_id:application.account_id,programme_code:application.programme,academic_session:application.academic_session,fee_amount_ngn:rates[0].amount_ngn,issued_by:req.actor.sub}).select('id,status,fee_amount_ngn').single();
 if(error?.code==='23505')return res.status(409).json({error:'Registration invoice already exists for this student, programme and session.'});
 if(error)throw error;res.status(201).json({invoice:data});
}));
router.post('/finance/registration-invoices/:id/payments',permit('finance.manage'),wrap(async(req,res)=>{
 const {amountNgn,reference}=req.body||{};
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id)||typeof amountNgn!=='number'||!Number.isFinite(amountNgn)||amountNgn<=0||typeof reference!=='string'||reference.trim().length<5||reference.length>120)return res.status(400).json({error:'Valid verified payment details required.'});
 const {data,error}=await db.rpc('upec_record_registration_payment',{p_invoice:req.params.id,p_amount:amountNgn,p_reference:reference.trim(),p_staff:req.actor.sub});
 if(error?.code==='23505')return res.status(409).json({error:'Payment reference has already been recorded.'});
 if(error)throw error;res.json({invoice:data});
}));
router.get('/finance/summary',permit('finance.manage'),wrap(async(req,res)=>{
 const month=typeof req.query.month==='string'?req.query.month:'';
 if(month&&!/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month))return res.status(400).json({error:'Month must be YYYY-MM.'});
 let query=db.from('upec_student_monthly_fees').select('id,programme_code,amount_due_ngn,amount_paid_ngn,status,billing_month').order('id',{ascending:true});
 if(month)query=query.eq('billing_month',month+'-01');
 const programmes=new Map();
 let billed=0,paid=0,invoiceCount=0,unpaid=0,partial=0,settled=0,waived=0;
 // Cursor by offset to avoid silently truncating totals at default PostgREST page limits.
 for(let start=0;start<100000;start+=500){
  const {data,error}=await query.range(start,start+499);
  if(error)throw error;
  for(const row of data||[]){
   const amount=Number(row.amount_due_ngn),received=Number(row.amount_paid_ngn);
   if(!Number.isFinite(amount)||!Number.isFinite(received))throw Error('Invalid stored fee amount');
   billed+=amount;paid+=received;invoiceCount++;
   if(row.status==='unpaid')unpaid++;if(row.status==='partial')partial++;if(row.status==='paid')settled++;if(row.status==='waived')waived++;
   const code=row.programme_code||'Other',item=programmes.get(code)||{programmeCode:code,invoices:0,billedNgn:0,paidNgn:0};
   item.invoices++;item.billedNgn+=amount;item.paidNgn+=received;programmes.set(code,item);
  }
  if((data||[]).length<500)break;
  if(start+500>=100000)return res.status(422).json({error:'Report exceeds supported invoice count; narrow the month.'});
 }
 const report={invoiceCount,billedNgn:Math.round(billed*100)/100,paidNgn:Math.round(paid*100)/100,outstandingNgn:Math.round(Math.max(0,billed-paid)*100)/100,unpaid,partial,settled,waived,programmes:[...programmes.values()].sort((a,b)=>a.programmeCode.localeCompare(b.programmeCode))};
 // Registration invoices have an independent ledger and must not be mixed with monthly lessons.
 let registrationQuery=db.from('upec_registration_invoices').select('id,programme_code,fee_amount_ngn,amount_paid_ngn,status,created_at').order('id',{ascending:true});
 if(month)registrationQuery=registrationQuery.gte('created_at',month+'-01T00:00:00Z').lt('created_at',new Date(Date.UTC(Number(month.slice(0,4)),Number(month.slice(5,7)),1)).toISOString());
 const registration={invoiceCount:0,billedNgn:0,paidNgn:0,outstandingNgn:0,programmes:[]};
 const byProgramme=new Map();
 for(let start=0;start<100000;start+=500){
  const {data,error}=await registrationQuery.range(start,start+499);
  if(error)throw error;
  for(const row of data||[]){
   const amount=Number(row.fee_amount_ngn),received=Number(row.amount_paid_ngn);
   if(!Number.isFinite(amount)||!Number.isFinite(received))throw Error('Invalid stored registration fee amount');
   registration.invoiceCount++;registration.billedNgn+=amount;registration.paidNgn+=received;
   const code=row.programme_code||'Other',item=byProgramme.get(code)||{programmeCode:code,invoices:0,billedNgn:0,paidNgn:0};
   item.invoices++;item.billedNgn+=amount;item.paidNgn+=received;byProgramme.set(code,item);
  }
  if((data||[]).length<500)break;
  if(start+500>=100000)return res.status(422).json({error:'Report exceeds supported registration invoice count; narrow the period.'});
 }
 registration.billedNgn=Math.round(registration.billedNgn*100)/100;
 registration.paidNgn=Math.round(registration.paidNgn*100)/100;
 registration.outstandingNgn=Math.round(Math.max(0,registration.billedNgn-registration.paidNgn)*100)/100;
 registration.programmes=[...byProgramme.values()].sort((a,b)=>a.programmeCode.localeCompare(b.programmeCode));
 res.json({month:month||null,report,registration});
}));
router.get('/finance/invoices',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_student_monthly_fees').select('id,student_account_id,programme_code,billing_month,due_on,amount_due_ngn,amount_paid_ngn,status').order('billing_month',{ascending:false}).limit(100);
 if(error)throw error;res.json({invoices:data||[]});
}));
router.get('/services/catalogue',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_service_catalogue').select('code,name,description,active,allow_online,allow_physical').order('name');
 if(error)throw error;res.json({services:data||[]});
}));
router.patch('/services/catalogue/:code',permit('applications.review'),wrap(async(req,res)=>{
 const code=req.params.code,{name,description,active,allowOnline,allowPhysical}=req.body||{};
 if(!['extramural_lessons','educational_consultation'].includes(code)||typeof name!=='string'||name.trim().length<3||name.length>120||typeof description!=='string'||description.length>1000||typeof active!=='boolean'||typeof allowOnline!=='boolean'||typeof allowPhysical!=='boolean')return res.status(400).json({error:'Provide a valid service catalogue configuration.'});
 const {data,error}=await db.from('upec_service_catalogue').update({name:name.trim(),description:description.trim(),active,allow_online:allowOnline,allow_physical:allowPhysical,updated_at:new Date().toISOString()}).eq('code',code).select('code,name,description,active,allow_online,allow_physical').single();
 if(error)throw error;res.json({service:data});
}));
router.get('/services/requests',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_service_requests').select('id,student_account_id,service_code,delivery_mode,requested_subject,preferred_schedule,status,staff_notes,scheduled_at,scheduled_end_at,session_location,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({requests:data||[]});
}));
router.patch('/services/requests/:id',permit('applications.review'),wrap(async(req,res)=>{
 const {status,notes}=req.body||{};
 if(!['reviewing','confirmed','completed','declined'].includes(status)||typeof notes!=='string'||notes.length>1000)return res.status(400).json({error:'Invalid service review.'});
 const {data,error}=await db.from('upec_service_requests').update({status,staff_notes:notes.trim(),updated_at:new Date().toISOString()}).eq('id',req.params.id).select('id,status,staff_notes').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Request not found.'});res.json({request:data});
}));
router.get('/services/fees',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_service_fee_rates').select('service_code,delivery_mode,amount_ngn,effective_from').order('effective_from',{ascending:false}).limit(100);
 if(error)throw error;res.json({rates:data||[]});
}));
router.post('/services/fees',permit('finance.manage'),wrap(async(req,res)=>{
 const {serviceCode,deliveryMode,amountNgn,effectiveFrom}=req.body||{};
 if(!['extramural_lessons','educational_consultation'].includes(serviceCode)||!['online','physical'].includes(deliveryMode)||typeof amountNgn!=='number'||!Number.isFinite(amountNgn)||amountNgn<0||!Number.isInteger(amountNgn*100)||typeof effectiveFrom!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(effectiveFrom))return res.status(400).json({error:'Valid service, delivery method, fee and effective date required.'});
 const {data,error}=await db.from('upec_service_fee_rates').insert({service_code:serviceCode,delivery_mode:deliveryMode,amount_ngn:amountNgn,effective_from:effectiveFrom,created_by:req.actor.sub}).select('*').single();
 if(error?.code==='23505')return res.status(409).json({error:'A fee already exists for that service and effective date.'});
 if(error)throw error;res.status(201).json({rate:data});
}));
router.patch('/services/requests/:id/schedule',permit('applications.review'),wrap(async(req,res)=>{
 const {startAt,endAt,location,staffAccountId}=req.body||{};
 const start=new Date(startAt),end=new Date(endAt);
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id)||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||start.getTime()<=Date.now()||start.getTime()>=end.getTime()||typeof location!=='string'||location.trim().length<3||location.length>500||(staffAccountId!==null&&staffAccountId!==undefined&&!/^[0-9a-f-]{36}$/i.test(staffAccountId)))return res.status(400).json({error:'Valid appointment start, end and meeting details required.'});
 const {data,error}=await db.from('upec_service_requests').update({scheduled_at:start.toISOString(),scheduled_end_at:end.toISOString(),session_location:location.trim(),assigned_staff_id:staffAccountId||null,status:'confirmed',updated_at:new Date().toISOString()}).eq('id',req.params.id).in('status',['pending','reviewing','confirmed']).select('id,status,scheduled_at,scheduled_end_at,session_location').maybeSingle();
 if(error)throw error;if(!data)return res.status(409).json({error:'Request unavailable for scheduling.'});res.json({request:data});
}));
router.get('/hostel/requests',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_hostel_requests').select('id,application_id,student_account_id,status,staff_note,accommodation_detail,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({requests:data||[]});
}));
router.patch('/hostel/requests/:id',permit('applications.review'),wrap(async(req,res)=>{
 const {status,note,accommodationDetail}=req.body||{};
 if(!['reviewing','waitlisted','offered','declined'].includes(status)||typeof note!=='string'||note.length>1000||typeof accommodationDetail!=='string'||accommodationDetail.length>500)return res.status(400).json({error:'Invalid accommodation review.'});
 const {data,error}=await db.from('upec_hostel_requests').update({status,staff_note:note.trim(),accommodation_detail:accommodationDetail.trim(),reviewed_by:req.actor.sub,reviewed_at:new Date().toISOString()}).eq('id',req.params.id).select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Hostel request not found.'});res.json({request:data});
}));
router.get('/hostel/beds',permit('applications.read'),wrap(async(req,res)=>{
 const [beds,allocations]=await Promise.all([
  db.from('upec_hostel_beds').select('id,hostel_name,room_code,bed_code,active').order('hostel_name').limit(300),
  db.from('upec_hostel_allocations').select('id,bed_id,request_id,student_account_id,assigned_at').is('released_at',null).limit(300)
 ]);
 if(beds.error)throw beds.error;if(allocations.error)throw allocations.error;
 res.json({beds:beds.data||[],allocations:allocations.data||[]});
}));
router.post('/hostel/beds',permit('applications.review'),wrap(async(req,res)=>{
 const {hostelName,roomCode,bedCode}=req.body||{};
 if([hostelName,roomCode,bedCode].some(x=>typeof x!=='string'||!x.trim()||x.length>120))return res.status(400).json({error:'Hostel, room and bed identifiers are required.'});
 const {data,error}=await db.from('upec_hostel_beds').insert({hostel_name:hostelName.trim(),room_code:roomCode.trim(),bed_code:bedCode.trim()}).select('id').single();
 if(error?.code==='23505')return res.status(409).json({error:'Bed already exists.'});if(error)throw error;res.status(201).json({bed:data});
}));
router.post('/hostel/allocate',permit('applications.review'),wrap(async(req,res)=>{
 const {requestId,bedId}=req.body||{};
 if(![requestId,bedId].every(x=>typeof x==='string'&&/^[0-9a-f-]{36}$/i.test(x)))return res.status(400).json({error:'Valid request and bed required.'});
 const [request,bed]=await Promise.all([db.from('upec_hostel_requests').select('id,status').eq('id',requestId).maybeSingle(),db.from('upec_hostel_beds').select('id,active').eq('id',bedId).maybeSingle()]);
 if(request.error)throw request.error;if(bed.error)throw bed.error;
 if(!request.data||!['offered','reviewing'].includes(request.data.status)||!bed.data?.active)return res.status(409).json({error:'Request must be reviewed and bed must be active.'});
 const {data,error}=await db.rpc('upec_allocate_hostel_bed',{p_request:requestId,p_bed:bedId,p_staff:req.actor.sub});
 if(error?.code==='23505')return res.status(409).json({error:'Bed, request, or student already has an active allocation.'});
 if(error)throw error;res.status(201).json({allocationId:data});
}));
router.post('/hostel/allocations/:id/release',permit('applications.review'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid allocation ID'});
 const {data,error}=await db.rpc('upec_release_hostel_bed',{p_allocation:req.params.id});
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Active allocation not found'});
 res.json({released:true});
}));
router.get('/applications/:id/documents',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_application_documents').select('id,document_type,original_filename,review_status,review_note,created_at').eq('application_id',req.params.id).order('created_at',{ascending:false});
 if(error)throw error;res.json({documents:data||[]});
}));
router.get('/documents/:id/view',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_application_documents').select('storage_path').eq('id',req.params.id).maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Document not found.'});
 const url=await db.storage.from('upec-application-documents').createSignedUrl(data.storage_path,120);
 if(url.error)throw url.error;res.json({url:url.data.signedUrl});
}));
router.patch('/documents/:id/review',permit('applications.review'),wrap(async(req,res)=>{
 const {status,note}=req.body||{};
 if(!['verified','rejected'].includes(status)||typeof note!=='string'||note.length>1000||(status==='rejected'&&note.trim().length<5))return res.status(400).json({error:'Valid review decision and rejection reason required.'});
 const {data,error}=await db.from('upec_application_documents').update({review_status:status,review_note:note.trim(),reviewed_by:req.actor.sub,reviewed_at:new Date().toISOString()}).eq('id',req.params.id).select('id,review_status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Document not found.'});res.json({document:data});
}));
const supportAccess=(req,res,next)=>['super_admin','admin','admissions_officer','teacher','content_editor'].includes(req.staff.role)?next():res.status(403).json({error:'Support inbox access denied.'});
router.get('/support/conversations',supportAccess,wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_support_messages').select('student_account_id,body,created_at,author_role').order('created_at',{ascending:false}).limit(500);
 if(error)throw error;
 const seen=new Set();res.json({conversations:(data||[]).filter(m=>{if(seen.has(m.student_account_id))return false;seen.add(m.student_account_id);return true;}).slice(0,100)});
}));
router.get('/support/conversations/:studentId',supportAccess,wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.studentId))return res.status(400).json({error:'Invalid student ID.'});
 const {data,error}=await db.from('upec_support_messages').select('id,author_role,body,created_at').eq('student_account_id',req.params.studentId).order('created_at',{ascending:true}).limit(200);
 if(error)throw error;res.json({messages:data||[]});
}));
router.post('/support/conversations/:studentId',supportAccess,wrap(async(req,res)=>{
 const body=req.body?.body;if(!/^[0-9a-f-]{36}$/i.test(req.params.studentId)||typeof body!=='string'||body.trim().length<1||body.length>3000)return res.status(400).json({error:'Invalid message.'});
 const {data,error}=await db.from('upec_support_messages').insert({student_account_id:req.params.studentId,author_account_id:req.actor.sub,author_role:'staff',body:body.trim()}).select('id,author_role,body,created_at').single();
 if(error)throw error;res.status(201).json({message:data});
}));

// External examination records are entered by authorized staff only after official registration.
router.get('/finance/monthly-receipts',permit('finance.manage'),wrap(async(req,res)=>{
 const status=String(req.query.status||'pending');
 if(!['pending','approved','rejected','all'].includes(status))return res.status(400).json({error:'Invalid receipt status.'});
 let query=db.from('upec_monthly_payment_evidence').select('id,student_account_id,monthly_fee_id,review_status,created_at,mime_type,file_size_bytes').order('created_at',{ascending:false}).limit(100);
 if(status!=='all')query=query.eq('review_status',status);
 const {data,error}=await query;
 if(error)throw error;
 res.json({receipts:data||[]});
}));
router.get('/finance/monthly-receipts/:id/preview',permit('finance.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid receipt ID.'});
 const {data,error}=await db.from('upec_monthly_payment_evidence').select('storage_path').eq('id',req.params.id).maybeSingle();
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Receipt not found.'});
 const {data:preview,error:previewError}=await db.storage.from('upec-application-payment').createSignedUrl(data.storage_path,60);
 if(previewError)throw previewError;
 res.json({previewUrl:preview.signedUrl,expiresInSeconds:60});
}));
router.patch('/finance/monthly-receipts/:id/review',permit('finance.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid receipt ID.'});
 const status=req.body?.status;
 if(!['approved','rejected'].includes(status))return res.status(400).json({error:'Status must be approved or rejected.'});
 const {data,error}=await db.from('upec_monthly_payment_evidence').update({review_status:status}).eq('id',req.params.id).eq('review_status','pending').select('id,review_status').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Receipt not found or already reviewed.'});
 res.json({receipt:data});
}));
router.get('/finance/application-receipts',permit('finance.manage'),wrap(async(req,res)=>{
 const status=String(req.query.status||'pending');
 if(!['pending','approved','rejected','all'].includes(status))return res.status(400).json({error:'Invalid receipt status.'});
 let query=db.from('upec_application_payment_evidence').select('id,student_account_id,application_id,review_status,created_at,mime_type,file_size_bytes').order('created_at',{ascending:false}).limit(100);
 if(status!=='all')query=query.eq('review_status',status);
 const {data,error}=await query;
 if(error)throw error;
 res.json({receipts:data||[]});
}));
router.get('/finance/application-receipts/:id/details',permit('finance.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid receipt ID.'});
 const {data,error}=await db.from('upec_application_payment_evidence').select('id,student_account_id,application_id,review_status,created_at,mime_type,file_size_bytes').eq('id',req.params.id).maybeSingle();
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Receipt not found.'});
 res.json({receipt:data});
}));
router.get('/finance/application-receipts/:id/preview',permit('finance.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid receipt ID.'});
 const {data,error}=await db.from('upec_application_payment_evidence').select('storage_path').eq('id',req.params.id).maybeSingle();
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Receipt not found.'});
 const {data:preview,error:previewError}=await db.storage.from('upec-application-payment').createSignedUrl(data.storage_path,60);
 if(previewError)throw previewError;
 res.json({previewUrl:preview.signedUrl,expiresInSeconds:60});
}));
router.patch('/finance/application-receipts/:id/review',permit('finance.manage'),wrap(async(req,res)=>{
 const id=req.params.id;
 const status=req.body?.status;
 if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'Invalid receipt ID.'});
 if(!['approved','rejected'].includes(status))return res.status(400).json({error:'Review status must be approved or rejected.'});
 const {data,error}=await db.from('upec_application_payment_evidence').update({review_status:status}).eq('id',id).eq('review_status','pending').select('id,review_status').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Receipt not found or already reviewed.'});
 res.json({receipt:data});
}));
router.get('/finance/bank-account',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_bank_accounts').select('id,bank_name,account_number,account_name,is_active,updated_at').order('updated_at',{ascending:false}).limit(20);
 if(error)throw error;res.json({accounts:data||[]});
}));
router.post('/finance/bank-account',permit('finance.manage'),wrap(async(req,res)=>{
 const {bankName,accountNumber,accountName}=req.body||{};
 if(typeof bankName!=='string'||bankName.trim().length<2||bankName.length>100||typeof accountNumber!=='string'||!/^[0-9]{10}$/.test(accountNumber)||typeof accountName!=='string'||accountName.trim().length<3||accountName.length>160)return res.status(400).json({error:'Enter a valid bank, 10-digit account number and account name.'});
 const {data,error}=await db.from('upec_bank_accounts').insert({bank_name:bankName.trim(),account_number:accountNumber,account_name:accountName.trim(),created_by:req.actor.sub,updated_by:req.actor.sub,is_active:false}).select('id').single();
 if(error)throw error;res.status(201).json({account:data});
}));
router.patch('/finance/bank-account/:id/activate',permit('finance.manage'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid account ID.'});
 const {data,error}=await db.rpc('upec_activate_bank_account',{p_account_id:req.params.id,p_actor_id:req.actor.sub});
 if(error?.code==='P0002')return res.status(404).json({error:'Bank account not found.'});
 if(error)throw error;res.json({account:{id:data,is_active:true}});
}));
router.get('/exam-registrations/student-search',permit('applications.review'),wrap(async(req,res)=>{
 const q=String(req.query.q||'').trim();
 if(q.length<3||q.length>100)return res.status(400).json({error:'Enter at least three characters from an application reference.'});
 const escaped=q.replace(/[\\%_]/g,c=>'\\'+c);
 const {data,error}=await db.from('local_student_applications').select('id,account_id,reference_number,programme,academic_session,status').ilike('reference_number','%'+escaped+'%').order('created_at',{ascending:false}).limit(30);
 if(error)throw error;res.json({applications:data||[]});
}));
router.get('/exam-registrations',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_exam_registrations').select('id,student_account_id,exam_body,exam_year,registration_number,examination_number,centre_name,exam_date,status,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({registrations:data||[]});
}));
router.post('/exam-registrations',permit('applications.review'),wrap(async(req,res)=>{
 const {studentAccountId,examBody,examYear,registrationNumber,examinationNumber,centreName,examDate}=req.body||{};
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentAccountId||'')||!['JAMB','WAEC','IJMB'].includes(examBody)||!Number.isInteger(examYear)||examYear<2020||examYear>2100||typeof registrationNumber!=='string'||registrationNumber.trim().length<4||registrationNumber.length>100)return res.status(400).json({error:'Invalid external examination registration details.'});
 if(examDate&& !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(examDate))return res.status(400).json({error:'Invalid exam date.'});
 const {data:account,error:accountError}=await db.from('local_accounts').select('id').eq('id',studentAccountId).maybeSingle();
 if(accountError)throw accountError;if(!account)return res.status(404).json({error:'Student account not found.'});
 const {data:linked,error:linkedError}=await db.from('local_student_applications').select('id').eq('account_id',studentAccountId).limit(1);
 if(linkedError)throw linkedError;if(!linked?.length)return res.status(400).json({error:'Select an account with an existing UPEC programme application.'});
 const {data,error}=await db.from('upec_exam_registrations').insert({student_account_id:studentAccountId,exam_body:examBody,exam_year:examYear,registration_number:registrationNumber.trim(),examination_number:String(examinationNumber||'').trim()||null,centre_name:String(centreName||'').trim()||null,exam_date:examDate||null,recorded_by:req.actor.sub}).select('id,status').single();
 if(error?.code==='23505')return res.status(409).json({error:'This exam registration number is already recorded for that examination and year.'});
 if(error)throw error;res.status(201).json({registration:data});
}));
router.get('/exam-registrations/:id/audit',permit('applications.read'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
 const {data:registration,error:lookupError}=await db.from('upec_exam_registrations').select('id').eq('id',req.params.id).maybeSingle();
 if(lookupError)throw lookupError;if(!registration)return res.status(404).json({error:'Examination registration not found.'});
 const {data,error}=await db.from('upec_exam_registration_audit').select('id,actor_id,action,created_at').eq('registration_id',req.params.id).order('created_at',{ascending:false}).limit(50);
 if(error)throw error;res.json({events:data||[]});
}));
router.patch('/exam-registrations/:id/verify',permit('applications.review'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
 const {data,error}=await db.from('upec_exam_registrations').update({status:'verified',verified_by:req.actor.sub,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',req.params.id).eq('status','pending_verification').select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Pending record not found.'});res.json({registration:data});
}));
export default router;
