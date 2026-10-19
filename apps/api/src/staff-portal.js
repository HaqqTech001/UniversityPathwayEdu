import {Router} from 'express';
import crypto from 'node:crypto';
import {supabaseAdmin as db} from './db.js';
import {requireRole,signToken} from './security.js';

const router=Router();
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
router.get('/me',(req,res)=>res.json({role:req.staff.role,permissions:req.staff.permissions}));
const permit=permission=>(req,res,next)=>req.staff.permissions.includes(permission)?next():res.status(403).json({error:'Insufficient staff permissions.'});
router.get('/applications',permit('applications.read'),wrap(async(req,res)=>{
 const {data,error}=await db.from('local_student_applications').select('id,reference_number,programme,academic_session,status,submitted_at').order('submitted_at',{ascending:false}).limit(100);
 if(error)throw error;
 res.json({applications:data||[]});
}));
router.patch('/applications/:id/status',permit('applications.review'),wrap(async(req,res)=>{
 const allowed=['under_review','approved','action_required','rejected'];
 const status=req.body?.status,note=String(req.body?.note||'').trim();
 if(!allowed.includes(status)||! /^[0-9a-f-]{36}$/i.test(req.params.id)||note.length>2000)return res.status(400).json({error:'Invalid review request.'});
 if(['action_required','rejected'].includes(status)&&note.length<5)return res.status(400).json({error:'A review reason is required.'});
 const {data:previous,error:readError}=await db.from('local_student_applications').select('id,status').eq('id',req.params.id).maybeSingle();
 if(readError)throw readError;
 if(!previous)return res.status(404).json({error:'Application not found.'});
 if(previous.status===status)return res.status(409).json({error:'Application already has this status.'});
 const transitions={submitted:['under_review'],under_review:['approved','action_required','rejected'],action_required:['under_review'],rejected:[],approved:[]};
 if(!(transitions[previous.status]||[]).includes(status))return res.status(409).json({error:'Invalid application status transition.'});
 const {data,error}=await db.from('local_student_applications').update({status}).eq('id',req.params.id).eq('status',previous.status).select('id,reference_number,status').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Application status changed. Refresh and try again.'});
 const {error:auditError}=await db.from('local_application_reviews').insert({application_id:data.id,reviewer_account_id:req.actor.sub,previous_status:previous.status,new_status:status,note:note||null});
 if(auditError){console.error('Admissions audit write failed',auditError);return res.status(503).json({error:'Status updated but review history could not be recorded. Contact the administrator before continuing.'});}
 res.json({application:data});
}));
export default router;
