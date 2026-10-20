import crypto from 'node:crypto';
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
router.get('/assessments',grant(...questionRoles),wrap(async(req,res)=>{
 let query=db.from('upec_assessments').select('id,subject_id,title,duration_minutes,status,created_by,created_at').order('created_at',{ascending:false}).limit(100);
 if(req.staff.role==='teacher')query=query.eq('created_by',req.actor.sub);
 const {data,error}=await query;if(error)throw error;res.json({assessments:data||[]});
}));
router.post('/assessments',grant(...questionRoles),wrap(async(req,res)=>{
 const {subjectId,title,durationMinutes,questionIds}=req.body||{};
 if(!uuid(subjectId)||typeof title!=='string'||title.trim().length<5||title.length>160||!Number.isInteger(durationMinutes)||durationMinutes<5||durationMinutes>240||!Array.isArray(questionIds)||questionIds.length<1||questionIds.length>100||!questionIds.every(uuid))return res.status(400).json({error:'Enter a valid assessment and select approved questions.'});
 const {data,error}=await db.rpc('upec_create_assessment',{p_author:req.actor.sub,p_subject:subjectId,p_title:title,p_duration:durationMinutes,p_questions:questionIds});
 if(error?.code==='23514'||error?.code==='22023')return res.status(409).json({error:error.message});
 if(error)throw error;res.status(201).json({assessmentId:data});
}));
// Publication is reserved for assessment managers. Re-check every linked
// question at publication time, as approval may change after draft creation.
router.patch('/assessments/:id/status',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 const id=req.params.id,status=req.body?.status;
 if(!uuid(id)||!['draft','published','closed'].includes(status))return res.status(400).json({error:'Invalid assessment status request.'});
 const {data:assessment,error:lookupError}=await db.from('upec_assessments').select('id,subject_id,status').eq('id',id).maybeSingle();
 if(lookupError)throw lookupError;
 if(!assessment)return res.status(404).json({error:'Assessment not found.'});
 if(status==='published'){
  const {data:links,error:linkError}=await db.from('upec_assessment_questions').select('question_id').eq('assessment_id',id).limit(101);
  if(linkError)throw linkError;
  if(!links?.length)return res.status(409).json({error:'An assessment requires approved questions before publication.'});
  const {data:approved,error:questionError}=await db.from('upec_teacher_questions').select('id').in('id',links.map(link=>link.question_id)).eq('subject_id',assessment.subject_id).eq('status','published');
  if(questionError)throw questionError;
  if((approved||[]).length!==links.length)return res.status(409).json({error:'Some questions are no longer approved or match another subject.'});
 }
 const {data,error}=await db.from('upec_assessments').update({status}).eq('id',id).eq('status',assessment.status).select('id,title,status').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Assessment changed. Refresh before updating.'});
 res.json({assessment:data});
}));
router.patch('/assessments/:id/schedule',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {opensAt,closesAt}=req.body||{};
 const parse=v=>v===null?null:typeof v==='string'&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():undefined;
 const start=parse(opensAt),end=parse(closesAt);
 if(start===undefined||end===undefined||(start&&end&&end<=start))return res.status(400).json({error:'Enter a valid opening and closing date.'});
 const {data,error}=await db.from('upec_assessments').update({opens_at:start,closes_at:end}).eq('id',req.params.id).eq('status','draft').select('id,opens_at,closes_at').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Only draft assessments can be scheduled.'});
 res.json({assessment:data});
}));
router.put('/assessments/:id/eligibility',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 const {restricted,studentIds}=req.body||{};
 if(!uuid(req.params.id)||typeof restricted!=='boolean'||!Array.isArray(studentIds)||studentIds.length>100||!studentIds.every(uuid))return res.status(400).json({error:'Invalid eligibility settings.'});
 const {data:exam,error:lookup}=await db.from('upec_assessments').select('id,status').eq('id',req.params.id).maybeSingle();
 if(lookup)throw lookup;
 if(!exam)return res.status(404).json({error:'Assessment not found.'});
 if(exam.status!=='draft')return res.status(409).json({error:'Configure eligibility before publishing.'});
 const {data,error}=await db.rpc('upec_set_assessment_eligibility',{p_assessment:exam.id,p_restricted:restricted,p_students:studentIds});
 if(error?.code==='22023')return res.status(409).json({error:error.message});
 if(error?.code==='P0002')return res.status(404).json({error:'Assessment not found.'});
 if(error)throw error;
 res.json({restricted,assigned:data});
}));
router.get('/assessments/:id/results',grant(...questionRoles),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {data:exam,error:e}=await db.from('upec_assessments').select('id,created_by,title').eq('id',req.params.id).maybeSingle();
 if(e)throw e;
 if(!exam)return res.status(404).json({error:'Assessment not found.'});
 if(req.staff.role==='teacher'&&exam.created_by!==req.actor.sub)return res.status(403).json({error:'Results are restricted to the assessment author.'});
 const {data,error}=await db.from('upec_assessment_attempts').select('student_account_id,score,total_questions,submitted_at').eq('assessment_id',exam.id).not('submitted_at','is',null).order('submitted_at',{ascending:false}).limit(200);
 if(error)throw error;
 res.json({title:exam.title,results:data||[]});
}));
// Limited, verified student directory for assessment assignment; no email or phone exposed.
router.get('/students/search',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 const q=String(req.query.q||'').trim();
 if(q.length<2||q.length>80)return res.status(400).json({error:'Enter at least two search characters.'});
 const safe=q.replace(/[%_\\,()]/g,'');
 if(safe.length<2)return res.status(400).json({error:'Enter a valid student name.'});
 const {data,error}=await db.from('local_accounts').select('id,full_name').not('verified_at','is',null).ilike('full_name','%'+safe+'%').order('full_name').limit(20);
 if(error)throw error;
 res.json({students:data||[]});
}));
router.get('/assessments/:id/eligibility',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const [exam,eligible]=await Promise.all([
 db.from('upec_assessments').select('id,restricted,status').eq('id',req.params.id).maybeSingle(),
 db.from('upec_assessment_eligibility').select('student_account_id').eq('assessment_id',req.params.id).limit(100)]);
 if(exam.error)throw exam.error;if(!exam.data)return res.status(404).json({error:'Assessment not found.'});
 if(eligible.error)throw eligible.error;
 res.json({restricted:exam.data.restricted,status:exam.data.status,studentIds:(eligible.data||[]).map(row=>row.student_account_id)});
}));
router.get('/resources',grant(...questionRoles),wrap(async(req,res)=>{
 let query=db.from('upec_learning_resources').select('id,subject_id,author_account_id,title,description,resource_url,storage_path,resource_type,status,created_at').order('created_at',{ascending:false}).limit(100);
 if(req.staff.role==='teacher')query=query.eq('author_account_id',req.actor.sub);
 const {data,error}=await query;if(error)throw error;res.json({resources:data||[]});
}));
router.post('/resources',grant(...questionRoles),wrap(async(req,res)=>{
 const {subjectId,title,description='',resourceUrl,resourceType}=req.body||{};
 let url;
 try{url=new URL(resourceUrl);}catch{return res.status(400).json({error:'A valid HTTPS resource link is required.'});}
 if(!uuid(subjectId)||typeof title!=='string'||title.trim().length<5||title.length>180||typeof description!=='string'||description.length>3000||!['document','video','website','exercise'].includes(resourceType)||url.protocol!=='https:'||url.username||url.password||url.href.length>2048)return res.status(400).json({error:'Invalid learning resource.'});
 const {data,error}=await db.from('upec_learning_resources').insert({subject_id:subjectId,author_account_id:req.actor.sub,title:title.trim(),description:description.trim(),resource_url:url.href,resource_type:resourceType,status:'draft'}).select('id,title,status').single();
 if(error?.code==='23503')return res.status(404).json({error:'Subject unavailable.'});
 if(error)throw error;res.status(201).json({resource:data});
}));
router.patch('/resources/:id/status',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 if(!uuid(req.params.id)||!['draft','published'].includes(req.body?.status))return res.status(400).json({error:'Invalid publication request.'});
 const {data:resource,error:lookupError}=await db.from('upec_learning_resources').select('id,storage_path,status').eq('id',req.params.id).maybeSingle();
 if(lookupError)throw lookupError;
 if(!resource)return res.status(404).json({error:'Resource not found.'});
 if(req.body.status==='published'&&resource.storage_path){
  const slash=resource.storage_path.lastIndexOf('/');
  const folder=resource.storage_path.slice(0,slash),filename=resource.storage_path.slice(slash+1);
  const {data:files,error:storageError}=await db.storage.from('upec-learning').list(folder,{search:filename,limit:100});
  if(storageError)throw storageError;
  if(!files?.some(file=>file.name===filename&&file.metadata&&Number(file.metadata.size)>0))return res.status(409).json({error:'Upload is incomplete. Complete the file transfer before publishing.'});
 }
 const {data,error}=await db.from('upec_learning_resources').update({status:req.body.status}).eq('id',req.params.id).eq('status',resource.status).select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Resource not found.'});
 res.json({resource:data});
}));
router.get('/notices',grant('super_admin','admin','content_editor'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_notices').select('id,title,body,audience,status,published_at,created_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({notices:data||[]});
}));
router.post('/notices',grant('super_admin','admin','content_editor'),wrap(async(req,res)=>{
 const {title,body,audience='students'}=req.body||{};
 if(typeof title!=='string'||title.trim().length<5||title.length>180||typeof body!=='string'||body.trim().length<10||body.length>6000||!['students','everyone'].includes(audience))return res.status(400).json({error:'Invalid notice details.'});
 const {data,error}=await db.from('upec_notices').insert({title:title.trim(),body:body.trim(),audience,created_by:req.actor.sub,status:'draft'}).select('id,title,status').single();
 if(error)throw error;res.status(201).json({notice:data});
}));
router.patch('/notices/:id/status',grant('super_admin','admin'),wrap(async(req,res)=>{
 if(!uuid(req.params.id)||!['draft','published'].includes(req.body?.status))return res.status(400).json({error:'Invalid notice status.'});
 const status=req.body.status;
 const {data,error}=await db.from('upec_notices').update({status,published_at:status==='published'?new Date().toISOString():null}).eq('id',req.params.id).select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Notice not found.'});res.json({notice:data});
}));
router.get('/blog/posts',grant('super_admin','admin','content_editor'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_blog_posts').select('id,slug,title,category,excerpt,sections,minutes,status,published_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;res.json({posts:data||[]});
}));
router.post('/blog/posts',grant('super_admin','admin','content_editor'),wrap(async(req,res)=>{
 const {slug,title,category,excerpt,sections,minutes}=req.body||{};
 if(typeof slug!=='string'||slug.length>120||! /^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)||typeof title!=='string'||title.trim().length<5||title.length>180||!['Study Strategies','Exam Preparation','Admissions Guidance'].includes(category)||typeof excerpt!=='string'||excerpt.trim().length<20||excerpt.length>400||!Array.isArray(sections)||sections.length<1||sections.length>20||!sections.every(s=>typeof s?.heading==='string'&&s.heading.length<=180&&typeof s?.body==='string'&&s.body.trim().length>=20&&s.body.length<=10000)||!Number.isInteger(minutes)||minutes<1||minutes>60)return res.status(400).json({error:'Check the article content and metadata.'});
 const {data,error}=await db.from('upec_blog_posts').insert({slug,title:title.trim(),category,excerpt:excerpt.trim(),sections,minutes,created_by:req.actor.sub,status:'draft'}).select('id,slug,title,status').single();
 if(error?.code==='23505')return res.status(409).json({error:'Article slug already exists.'});
 if(error)throw error;res.status(201).json({post:data});
}));
router.patch('/blog/posts/:id/status',grant('super_admin','admin'),wrap(async(req,res)=>{
 if(!uuid(req.params.id)||!['draft','published'].includes(req.body?.status))return res.status(400).json({error:'Invalid article status.'});
 const status=req.body.status;
 const {data,error}=await db.from('upec_blog_posts').update({status,published_at:status==='published'?new Date().toISOString():null}).eq('id',req.params.id).select('id,status').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Article not found.'});res.json({post:data});
}));
const allowedUploadTypes=new Set(['application/pdf','image/png','image/jpeg','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.presentationml.presentation']);
router.post('/resources/upload-init',grant(...questionRoles),wrap(async(req,res)=>{
 const {subjectId,title,description='',mimeType}=req.body||{};
 if(!uuid(subjectId)||typeof title!=='string'||title.trim().length<5||title.length>180||typeof description!=='string'||description.length>3000||!allowedUploadTypes.has(mimeType))return res.status(400).json({error:'Invalid resource or file type.'});
 const ext=({'application/pdf':'pdf','image/png':'png','image/jpeg':'jpg','application/vnd.openxmlformats-officedocument.wordprocessingml.document':'docx','application/vnd.openxmlformats-officedocument.presentationml.presentation':'pptx'})[mimeType];
 const path=req.actor.sub+'/'+crypto.randomUUID()+'.'+ext;
 const {data,error}=await db.from('upec_learning_resources').insert({subject_id:subjectId,author_account_id:req.actor.sub,title:title.trim(),description:description.trim(),resource_type:'document',storage_path:path,status:'draft'}).select('id').single();
 if(error)throw error;
 const signed=await db.storage.from('upec-learning').createSignedUploadUrl(path);
 if(signed.error){await db.from('upec_learning_resources').delete().eq('id',data.id);throw signed.error;}
 res.status(201).json({resourceId:data.id,uploadUrl:signed.data.signedUrl,maxBytes:8388608});
}));
router.post('/resources/:id/upload-verify',grant(...questionRoles),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid resource ID.'});
 let query=db.from('upec_learning_resources').select('id,storage_path,status,author_account_id').eq('id',req.params.id);
 if(req.staff.role==='teacher')query=query.eq('author_account_id',req.actor.sub);
 const {data:resource,error}=await query.maybeSingle();
 if(error)throw error;
 if(!resource?.storage_path)return res.status(404).json({error:'Upload record not found.'});
 const path=resource.storage_path,slash=path.lastIndexOf('/');
 const {data:files,error:storageError}=await db.storage.from('upec-learning').list(path.slice(0,slash),{search:path.slice(slash+1),limit:100});
 if(storageError)throw storageError;
 const file=(files||[]).find(f=>f.name===path.slice(slash+1));
 if(!file?.metadata||!(Number(file.metadata.size)>0))return res.status(409).json({error:'File upload is incomplete.'});
 res.json({complete:true,resourceId:resource.id,size:Number(file.metadata.size)});
}));
export default router;
