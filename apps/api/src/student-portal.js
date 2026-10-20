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
