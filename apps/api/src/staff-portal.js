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
 super_admin:['applications.read','applications.review','staff.manage','content.manage','cbt.manage'],
 admin:['applications.read','applications.review','content.manage'],
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
 res.json({application:data[0]});
}));
export default router;
