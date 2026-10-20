import {Router} from 'express';
import {supabaseAdmin as db} from './db.js';

const router=Router();
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const uuid=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
const code=v=>typeof v==='string'&&/^[A-Z0-9_-]{2,32}$/.test(v);
const name=v=>typeof v==='string'&&v.trim().length>=2&&v.trim().length<=160;
const grant=(...roles)=>(req,res,next)=>roles.includes(req.staff.role)?next():res.status(403).json({error:'Academic permission denied.'});

router.get('/catalogue',grant('super_admin','admin','teacher','cbt_manager','admissions_officer'),wrap(async(req,res)=>{
 const [programmes,subjects]=await Promise.all([
  db.from('upec_academic_programmes').select('id,code,name,description,active').order('name').limit(200),
  db.from('upec_academic_subjects').select('id,programme_id,code,name,active').order('name').limit(1000)
 ]);
 if(programmes.error)throw programmes.error;
 if(subjects.error)throw subjects.error;
 res.json({programmes:programmes.data||[],subjects:subjects.data||[]});
}));
router.post('/programmes',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {code:programmeCode,name:programmeName}=req.body||{};
 if(!code(programmeCode)||!name(programmeName)||programmeName.trim().length<3)return res.status(400).json({error:'Invalid programme code or name.'});
 const {data,error}=await db.from('upec_academic_programmes').insert({code:programmeCode,name:programmeName.trim()}).select('id,code,name,active').single();
 if(error?.code==='23505')return res.status(409).json({error:'Programme code already exists.'});
 if(error)throw error;
 res.status(201).json({programme:data});
}));
router.post('/subjects',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {programmeId,code:subjectCode,name:subjectName}=req.body||{};
 if(!uuid(programmeId)||!code(subjectCode)||!name(subjectName))return res.status(400).json({error:'Invalid subject details.'});
 const {data,error}=await db.from('upec_academic_subjects').insert({programme_id:programmeId,code:subjectCode,name:subjectName.trim()}).select('id,programme_id,code,name,active').single();
 if(error?.code==='23505')return res.status(409).json({error:'Subject code already exists for the programme.'});
 if(error?.code==='23503')return res.status(404).json({error:'Programme not found.'});
 if(error)throw error;
 res.status(201).json({subject:data});
}));
const questionRoles=['super_admin','admin','teacher','cbt_manager'];
router.get('/questions',grant(...questionRoles),wrap(async(req,res)=>{
 const subjectId=req.query.subjectId;
 if(subjectId&&!uuid(subjectId))return res.status(400).json({error:'Invalid subject ID.'});
 let query=db.from('upec_teacher_questions').select('id,subject_id,author_account_id,prompt,options,correct_option,explanation,status,created_at').order('created_at',{ascending:false}).limit(100);
 if(subjectId)query=query.eq('subject_id',subjectId);
 if(req.staff.role==='teacher')query=query.eq('author_account_id',req.actor.sub);
 const {data,error}=await query;
 if(error)throw error;
 res.json({questions:data||[]});
}));
router.post('/questions',grant(...questionRoles),wrap(async(req,res)=>{
 const {subjectId,prompt,options,correctOption,explanation=''}=req.body||{};
 if(!uuid(subjectId)||typeof prompt!=='string'||prompt.trim().length<10||prompt.length>5000||
 !options||typeof options!=='object'||Array.isArray(options)||!['A','B','C','D'].every(k=>typeof options[k]==='string'&&options[k].trim().length>0&&options[k].length<=1000)||
 !['A','B','C','D'].includes(correctOption)||typeof explanation!=='string'||explanation.length>5000 )return res.status(400).json({error:'Check the question, options, answer and subject.'});
 const {data,error}=await db.from('upec_teacher_questions').insert({subject_id:subjectId,author_account_id:req.actor.sub,prompt:prompt.trim(),options,correct_option:correctOption,explanation:explanation.trim(),status:'draft'}).select('id,subject_id,prompt,status').single();
 if(error?.code==='23503')return res.status(404).json({error:'Subject not found.'});
 if(error)throw error;
 res.status(201).json({question:data});
}));
router.patch('/questions/:id/status',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 const id=req.params.id,status=req.body?.status;
 if(!uuid(id)||!['draft','published'].includes(status))return res.status(400).json({error:'Invalid question or status.'});
 const {data,error}=await db.from('upec_teacher_questions').update({status,updated_at:new Date().toISOString()}).eq('id',id).select('id,status,prompt').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Question not found.'});
 res.json({question:data});
}));
export default router;
