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
router.get('/finance/invoices',permit('finance.manage'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_student_monthly_fees').select('id,student_account_id,programme_code,billing_month,due_on,amount_due_ngn,amount_paid_ngn,status').order('billing_month',{ascending:false}).limit(100);
 if(error)throw error;res.json({invoices:data||[]});
}));
router.get('/services/requests',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_service_requests').select('id,student_account_id,service_code,delivery_mode,requested_subject,preferred_schedule,status,staff_notes,created_at').order('created_at',{ascending:false}).limit(100);
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
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id)||!Number.isFinite(start.getTime())||!Number.isFinite(end.getTime())||start.getTime()>=end.getTime()||typeof location!=='string'||location.trim().length<3||location.length>500||(staffAccountId!==null&&staffAccountId!==undefined&&!/^[0-9a-f-]{36}$/i.test(staffAccountId)))return res.status(400).json({error:'Valid appointment start, end and meeting details required.'});
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
router.patch('/exam-registrations/:id/verify',permit('applications.review'),wrap(async(req,res)=>{
 if(!/^[0-9a-f-]{36}$/i.test(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
 const {data,error}=await db.from('upec_exam_registrations').update({status:'verified',verified_by:req.actor.sub,verified_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',req.params.id).eq('status','pending_verification').select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Pending record not found.'});res.json({registration:data});
}));
export default router;
