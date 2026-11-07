import crypto from 'node:crypto';
import express, {Router} from 'express';
import {inflateRawSync} from 'node:zlib';
import {supabaseAdmin as db} from './db.js';

const router=Router();
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const uuid=v=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
const code=v=>typeof v==='string'&&/^[A-Z0-9_-]{2,32}$/.test(v);
const isIjmbProgramme=p=>/IJMB/i.test((p?.name||'')+' '+(p?.code||''));
const name=v=>typeof v==='string'&&v.trim().length>=2&&v.trim().length<=160;
const validDescription=v=>typeof v==='string'&&v.trim().length>=5&&v.length<=2000;
const grant=(...roles)=>(req,res,next)=>roles.includes(req.staff.role)?next():res.status(403).json({error:'Academic permission denied.'});
const auditQuestion=async({questionId,req,action,beforeData=null,afterData=null})=>{
 const {error}=await db.from('upec_question_audit_log').insert({
  question_id:questionId,
  actor_account_id:uuid(req.actor?.sub)?req.actor.sub:null,
  actor_role:req.staff?.role||'',
  action,
  before_data:beforeData,
  after_data:afterData
 });
 if(error){console.error('Question audit write failed:',error.message);return false;}
 return true;
};

router.get('/catalogue',grant('super_admin','admin','teacher','cbt_manager','admissions_officer'),wrap(async(req,res)=>{
 const [programmes,subjects]=await Promise.all([
  db.from('upec_academic_programmes').select('id,code,name,description,active').order('name').limit(200),
  db.from('upec_academic_subjects').select('id,programme_id,code,name,description,active').order('name').limit(1000)
 ]);
 if(programmes.error)throw programmes.error;
 if(subjects.error)throw subjects.error;
 res.json({programmes:programmes.data||[],subjects:subjects.data||[]});
}));
router.post('/programmes',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {name:programmeName,description,active=true}=req.body||{};
 if(!name(programmeName)||programmeName.trim().length<3||!validDescription(description)||typeof active!=='boolean')return res.status(400).json({error:'Invalid programme name or description.'});
 const {data,error}=await db.from('upec_academic_programmes').insert({name:programmeName.trim(),description:description.trim(),active}).select('id,code,name,active').single();
 if(error)throw error;
 res.status(201).json({programme:data});
}));
router.post('/subjects',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {programmeId,code:subjectCode,name:subjectName,description,active=true}=req.body||{};
 if(!uuid(programmeId)||!name(subjectName)||!validDescription(description)||typeof active!=='boolean')return res.status(400).json({error:'Invalid subject details.'});
 const {data:programme,error:programmeError}=await db.from('upec_academic_programmes').select('name,code').eq('id',programmeId).maybeSingle();
 if(programmeError)throw programmeError;
 if(!programme)return res.status(404).json({error:'Programme not found.'});
 const isIjmb=isIjmbProgramme(programme);
 if(isIjmb&&!code(subjectCode))return res.status(400).json({error:'IJMB subjects require a valid course code.'});
 const normalizedCode=isIjmb?subjectCode:null;
 const {data,error}=await db.from('upec_academic_subjects').insert({programme_id:programmeId,code:normalizedCode,name:subjectName.trim(),description:description.trim(),active}).select('id,programme_id,code,name,active').single();
 if(error?.code==='23505')return res.status(409).json({error:'Subject code already exists for the programme.'});
 if(error?.code==='23503')return res.status(404).json({error:'Programme not found.'});
 if(error)throw error;
 res.status(201).json({subject:data});
}));

for(const [resource,table] of Object.entries({programmes:'upec_academic_programmes',subjects:'upec_academic_subjects'})){
 router.patch('/'+resource+'/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
  if(!uuid(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
  const input=req.body||{},changes={};
  if(Object.hasOwn(input,'name')){if(!name(input.name))return res.status(400).json({error:'Invalid name.'});changes.name=input.name.trim();}
  if(resource==='subjects'&&Object.hasOwn(input,'code')){if(input.code!==null&&!code(input.code))return res.status(400).json({error:'Invalid course code.'});changes.code=input.code;}
  if(Object.hasOwn(input,'description')){if(!validDescription(input.description))return res.status(400).json({error:'Description must contain 5–2000 characters.'});changes.description=input.description.trim();}
  if(Object.hasOwn(input,'active')){if(typeof input.active!=='boolean')return res.status(400).json({error:'Invalid active status.'});changes.active=input.active;}
  if(resource==='subjects'&&Object.hasOwn(input,'programmeId')){if(!uuid(input.programmeId))return res.status(400).json({error:'Invalid programme.'});changes.programme_id=input.programmeId;}
  if(resource==='subjects'&&(Object.hasOwn(input,'programmeId')||Object.hasOwn(input,'code'))){
   const {data:currentSubject,error:currentError}=await db.from('upec_academic_subjects').select('programme_id,code').eq('id',req.params.id).maybeSingle();
   if(currentError)throw currentError;
   if(!currentSubject)return res.status(404).json({error:'Subject not found.'});
   const programmeId=changes.programme_id||currentSubject.programme_id;
   const {data:programme,error:programmeError}=await db.from('upec_academic_programmes').select('name,code').eq('id',programmeId).maybeSingle();
   if(programmeError)throw programmeError;
   if(!programme)return res.status(404).json({error:'Programme not found.'});
   if(isIjmbProgramme(programme)&&!code(changes.code??currentSubject.code))return res.status(400).json({error:'IJMB subjects require a valid course code.'});
   if(!isIjmbProgramme(programme))changes.code=null;
  }
  if(!Object.keys(changes).length)return res.status(400).json({error:'No changes provided.'});
  const {data,error}=await db.from(table).update(changes).eq('id',req.params.id).select('*').maybeSingle();
  if(error?.code==='23505')return res.status(409).json({error:'Record code already exists.'});
  if(error?.code==='23503')return res.status(409).json({error:'Referenced programme does not exist.'});
  if(error)throw error;
  if(!data)return res.status(404).json({error:'Record not found.'});
  res.json({record:data});
 }));
 router.delete('/'+resource+'/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
  if(!uuid(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
  const {data,error}=await db.from(table).delete().eq('id',req.params.id).select('id').maybeSingle();
  if(error?.code==='23503')return res.status(409).json({error:'Record is referenced by other academic data.'});
  if(error)throw error;
  if(!data)return res.status(404).json({error:'Record not found.'});
  res.json({deleted:true});
 }));
}

router.get('/attendance/students',grant('super_admin','admin','teacher'),wrap(async(req,res)=>{
 const {data:applications,error}=await db.from('local_student_applications').select('account_id,programme,status').eq('status','approved').limit(500);
 if(error)throw error;
 const ids=[...new Set((applications||[]).map(a=>a.account_id).filter(uuid))];
 if(!ids.length)return res.json({students:[]});
 const {data:accounts,error:accountError}=await db.from('local_accounts').select('id,full_name').in('id',ids);
 if(accountError)throw accountError;
 const {data:photos,error:photoError}=await db.from('upec_student_photos')
  .select('student_account_id,storage_path').in('student_account_id',ids);
 if(photoError)throw photoError;
 const photoMap=new Map((photos||[]).map(photo=>[photo.student_account_id,photo.storage_path]));
 const students=await Promise.all((accounts||[]).map(async account=>{
  const storagePath=photoMap.get(account.id);
  const signed=storagePath
   ?await db.storage.from('upec-student-photos').createSignedUrl(storagePath,600)
   :null;
  return {
   id:account.id,
   name:account.full_name||'Student',
   programme:(applications||[]).find(a=>a.account_id===account.id)?.programme||'',
   photoUrl:signed&&!signed.error?signed.data.signedUrl:null
  };
 }));
 res.json({students});
}));

router.get('/timetable-plans',grant('super_admin','admin','teacher'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_academic_timetable_plans').select('*').order('created_at',{ascending:false}).limit(200);
 if(error)throw error;res.json({plans:data||[]});
}));
router.post('/timetable-plans',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {programme_id,learning_mode,title,description}=req.body||{};
 if(!uuid(programme_id)||!['physical','online'].includes(learning_mode)||!name(title)||!validDescription(description))return res.status(400).json({error:'Programme, mode, title and description are required.'});
 const {data,error}=await db.from('upec_academic_timetable_plans').insert({programme_id,learning_mode,title:title.trim(),description:description.trim()}).select('*').single();
 if(error?.code==='23505')return res.status(409).json({error:'A timetable already exists for this programme and mode.'});
 if(error)throw error;res.status(201).json({plan:data});
}));
router.patch('/timetable-plans/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid timetable ID.'});
 const {title,description}=req.body||{};
 if(!name(title)||!validDescription(description))return res.status(400).json({error:'Valid title and description required.'});
 const {data,error}=await db.from('upec_academic_timetable_plans').update({title:title.trim(),description:description.trim()}).eq('id',req.params.id).select('*').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Timetable not found.'});res.json({plan:data});
}));
router.delete('/timetable-plans/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid timetable ID.'});
 const {data,error}=await db.from('upec_academic_timetable_plans').delete().eq('id',req.params.id).select('id').maybeSingle();
 if(error)throw error;if(!data)return res.status(404).json({error:'Timetable not found.'});res.json({deleted:true});
}));
const academicEntities={
 classes:{table:'upec_academic_classes',fields:['programme_id','name','description','stream','academic_session','active'],required:['programme_id','name','description','academic_session']},
 timetable:{table:'upec_academic_timetable',fields:['class_id','plan_id','subject_id','weekday','starts_at','ends_at','room','learning_mode','period'],required:['subject_id','weekday','starts_at','ends_at']},
 attendance:{table:'upec_academic_attendance',fields:['class_id','programme_id','learning_mode','student_id','attendance_date','status','notes'],required:['programme_id','learning_mode','student_id','attendance_date','status']},
 assignments:{table:'upec_academic_assignments',fields:['class_id','programme_id','learning_mode','subject_id','title','instructions','due_at','status'],required:['programme_id','learning_mode','subject_id','title','due_at']}
};
const academicFieldValid=(key,value)=>{
 if(['programme_id','class_id','subject_id','student_id'].includes(key))return uuid(value);
 if(key==='plan_id')return uuid(value);
 if(key==='description')return validDescription(value);
 if(key==='learning_mode')return ['physical','online'].includes(value);
 if(key==='period')return Number.isInteger(value)&&value>=1&&value<=6;
 if(key==='weekday')return Number.isInteger(value)&&value>=1&&value<=7;
 if(key==='active')return typeof value==='boolean';
 if(key==='status')return typeof value==='string'&&['present','absent','late','excused','draft','published','closed'].includes(value);
 if(['starts_at','ends_at'].includes(key))return typeof value==='string'&&/^([01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d)?$/.test(value);
 if(key==='attendance_date')return typeof value==='string'&&/^\\d{4}-\\d{2}-\\d{2}$/.test(value);
 if(key==='due_at')return typeof value==='string'&&!Number.isNaN(Date.parse(value));
 return typeof value==='string'&&value.trim().length>0&&value.length<= (key==='instructions'?5000:key==='notes'?500:160);
};
for(const [resource,config] of Object.entries(academicEntities)){
 router.get('/'+resource,grant('super_admin','admin','teacher','cbt_manager'),wrap(async(req,res)=>{
  const {data,error}=await db.from(config.table).select('*').order('created_at',{ascending:false}).limit(500);
  if(error)throw error;res.json({records:data||[]});
 }));
 router.post('/'+resource,grant('super_admin','admin'),wrap(async(req,res)=>{
  const input=req.body||{},row={};
  for(const field of config.required)if(!academicFieldValid(field,input[field]))return res.status(400).json({error:'Invalid '+field+'.'});
  for(const field of config.fields)if(Object.hasOwn(input,field)){if(!academicFieldValid(field,input[field]))return res.status(400).json({error:'Invalid '+field+'.'});row[field]=input[field];}
  if(resource==='timetable'&&!row.plan_id&&!row.class_id)return res.status(400).json({error:'Select a timetable plan.'});
  if(resource==='timetable'&&row.starts_at>=row.ends_at)return res.status(400).json({error:'End time must be after start time.'});
  const {data,error}=await db.from(config.table).insert(row).select('*').single();
  if(error?.code==='23505')return res.status(409).json({error:'A matching record already exists.'});
  if(error?.code==='23503')return res.status(400).json({error:'Referenced academic record does not exist.'});
  if(error)throw error;res.status(201).json({record:data});
 }));
 router.patch('/'+resource+'/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
  if(!uuid(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
  const input=req.body||{},row={};
  for(const field of config.fields)if(Object.hasOwn(input,field)){if(!academicFieldValid(field,input[field]))return res.status(400).json({error:'Invalid '+field+'.'});row[field]=input[field];}
  if(!Object.keys(row).length)return res.status(400).json({error:'No editable fields supplied.'});
  const {data,error}=await db.from(config.table).update(row).eq('id',req.params.id).select('*').maybeSingle();
  if(error?.code==='23505')return res.status(409).json({error:'A matching record already exists.'});
  if(error?.code==='23503')return res.status(400).json({error:'Referenced academic record does not exist.'});
  if(error)throw error;if(!data)return res.status(404).json({error:'Record not found.'});res.json({record:data});
 }));
 router.delete('/'+resource+'/:id',grant('super_admin','admin'),wrap(async(req,res)=>{
  if(!uuid(req.params.id))return res.status(400).json({error:'Invalid record ID.'});
  const {data,error}=await db.from(config.table).delete().eq('id',req.params.id).select('id').maybeSingle();
  if(error?.code==='23503')return res.status(409).json({error:'Record is referenced by other academic records.'});
  if(error)throw error;if(!data)return res.status(404).json({error:'Record not found.'});res.json({deleted:true});
 }));
}
const extractDocxPlainText=buffer=>{
 const end=Math.max(0,buffer.length-65557);
 let eocd=-1;
 for(let i=buffer.length-22;i>=end;i--)if(buffer.readUInt32LE(i)===0x06054b50){eocd=i;break;}
 if(eocd<0)throw new Error('Invalid DOCX archive.');
 const count=buffer.readUInt16LE(eocd+10),centralOffset=buffer.readUInt32LE(eocd+16);
 let offset=centralOffset,xml='',images=[],skippedImages=0,totalImageBytes=0;
 for(let i=0;i<count;i++){
  if(offset+46>buffer.length||buffer.readUInt32LE(offset)!==0x02014b50)throw new Error('Invalid DOCX directory.');
  const method=buffer.readUInt16LE(offset+10),compressedSize=buffer.readUInt32LE(offset+20),uncompressedSize=buffer.readUInt32LE(offset+24);
  const nameLength=buffer.readUInt16LE(offset+28),extraLength=buffer.readUInt16LE(offset+30),commentLength=buffer.readUInt16LE(offset+32);
  const localOffset=buffer.readUInt32LE(offset+42);
  const fileName=buffer.toString('utf8',offset+46,offset+46+nameLength);
  if(fileName==='word/document.xml'||/^word\/media\/[^/]+\.(png|jpe?g|webp)$/i.test(fileName)){
   if(localOffset+30>buffer.length||buffer.readUInt32LE(localOffset)!==0x04034b50)throw new Error('Invalid DOCX archive entry.');
   const localName=buffer.readUInt16LE(localOffset+26),localExtra=buffer.readUInt16LE(localOffset+28);
   const dataStart=localOffset+30+localName+localExtra;
   if(dataStart+compressedSize>buffer.length)throw new Error('Incomplete DOCX archive entry.');
   const compressed=buffer.subarray(dataStart,dataStart+compressedSize);
   const data=method===0?compressed:method===8?inflateRawSync(compressed,{maxOutputLength:Math.min(Math.max(uncompressedSize,1),3*1024*1024)}):null;
   if(!data)throw new Error('This DOCX compression format is not supported.');
   if(fileName==='word/document.xml')xml=data.toString('utf8');
   else{
    const ext=fileName.split('.').pop().toLowerCase();
    const mimeType=ext==='png'?'image/png':ext==='webp'?'image/webp':'image/jpeg';
    if(data.length!==uncompressedSize||data.length>3*1024*1024||images.length>=8||totalImageBytes+data.length>6*1024*1024)skippedImages++;
    else{images.push({mimeType,data:data.toString('base64')});totalImageBytes+=data.length;}
   }
  }
  offset+=46+nameLength+extraLength+commentLength;
 }
 if(!xml)throw new Error('The DOCX document body could not be read.');
 const paragraphs=[...xml.matchAll(/<w:p(?:\s[^>]*)?>([\s\S]*?)<\/w:p>/g)].map(match=>
  [...match[1].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(t=>t[1])
   .join('').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;/g,"'").trim()
 ).filter(Boolean);
 return {text:paragraphs.join('\n'),hasDrawing:/<w:drawing\b|<w:pict\b/.test(xml),images,skippedImages};
};
const questionRoles=['super_admin','admin','teacher','cbt_manager'];
router.get('/questions',grant(...questionRoles),wrap(async(req,res)=>{
 const subjectId=req.query.subjectId;
 const status=req.query.status;
 const search=typeof req.query.search==='string'?req.query.search.trim().slice(0,120):'';
 const limit=Math.min(200,Math.max(1,Number.parseInt(req.query.limit,10)||100));
 const offset=Math.max(0,Number.parseInt(req.query.offset,10)||0);
 if(subjectId&&!uuid(subjectId))return res.status(400).json({error:'Invalid subject ID.'});
 if(status&&!['draft','published'].includes(status))return res.status(400).json({error:'Invalid question status.'});
 let query=db.from('upec_teacher_questions').select('id,subject_id,author_account_id,prompt,options,correct_option,explanation,question_type,topic,subtopic,difficulty,exam_type,exam_year,solution_steps,source_name,source_reference,source_license,status,created_at',{count:'exact'}).order('created_at',{ascending:false}).range(offset,offset+limit-1);
 if(subjectId)query=query.eq('subject_id',subjectId);
 if(status)query=query.eq('status',status);
 if(search)query=query.ilike('prompt','%'+search.replace(/[%_]/g,'')+'%');
 if(req.staff.role==='teacher')query=query.eq('author_account_id',req.actor.sub);
 const {data,error,count}=await query;
 if(error)throw error;
 res.json({questions:data||[],total:count||0,limit,offset});
}));
router.patch('/questions/:id',grant(...questionRoles),wrap(async(req,res)=>{ const {data:before,error:beforeError}=await db.from('upec_teacher_questions').select('*').eq('id',id).maybeSingle();
 if(beforeError)throw beforeError;
 if(!before||(req.staff.role==='teacher'&&before.author_account_id!==req.actor.sub))return res.status(404).json({error:'Question not found or you cannot edit it.'});

 const id=req.params.id;
 const {subjectId,prompt,options,correctOption,explanation=''}=req.body||{};
 if(!uuid(id)||!uuid(subjectId)||typeof prompt!=='string'||prompt.trim().length<10||prompt.length>5000||
 !options||typeof options!=='object'||Array.isArray(options)||!['A','B','C','D'].every(k=>typeof options[k]==='string'&&options[k].trim().length>0&&options[k].length<=1000)||
 !['A','B','C','D'].includes(correctOption)||typeof explanation!=='string'||explanation.length>5000)
  return res.status(400).json({error:'Check the question, options, answer and subject.'});
 const metadataFields={questionType:'question_type',topic:'topic',subtopic:'subtopic',difficulty:'difficulty',examType:'exam_type',examYear:'exam_year',solutionSteps:'solution_steps',sourceName:'source_name',sourceReference:'source_reference',sourceLicense:'source_license'};
 const limits={topic:160,subtopic:160,examType:40,solutionSteps:12000,sourceName:160,sourceReference:500,sourceLicense:160};
 for(const input of Object.keys(metadataFields)){
  if(!Object.prototype.hasOwnProperty.call(req.body||{},input))continue;
  const value=req.body[input];
  if(input==='examYear'){
   if(value!==null&&value!==''&&(!Number.isInteger(Number(value))||Number(value)<1950||Number(value)>2100))return res.status(400).json({error:'Exam year must be between 1950 and 2100.'});
  }else if(input==='difficulty'&&!['easy','medium','hard'].includes(value))return res.status(400).json({error:'Difficulty must be easy, medium or hard.'});
  else if(input==='questionType'&&value!=='single_choice')return res.status(400).json({error:'Only single-answer MCQs are currently supported.'});
  else if(input!=='examYear'&&(typeof value!=='string'||value.length>(limits[input]||160)))return res.status(400).json({error:'Invalid '+input+' value or field length.'});
 }
 const updates={subject_id:subjectId,prompt:prompt.trim(),options,correct_option:correctOption,explanation:explanation.trim(),updated_at:new Date().toISOString()};
 for(const [input,column] of Object.entries(metadataFields))if(Object.prototype.hasOwnProperty.call(req.body||{},input))updates[column]=input==='examYear'?(req.body[input]?Number(req.body[input]):null):req.body[input];
 let query=db.from('upec_teacher_questions').update(updates).eq('id',id);
 if(req.staff.role==='teacher')query=query.eq('author_account_id',req.actor.sub);
 const {data,error}=await query.select('id,subject_id,prompt,options,correct_option,explanation,question_type,topic,subtopic,difficulty,exam_type,exam_year,solution_steps,source_name,source_reference,source_license,status,updated_at').maybeSingle();
 if(error?.code==='23503')return res.status(404).json({error:'Subject not found.'});
 if(error)throw error;
 if(!data)return res.status(404).json({error:'Question not found or you cannot edit it.'});
 const auditRecorded=await auditQuestion({questionId:id,req,action:'updated',beforeData:before,afterData:data});
 res.json({question:data,auditRecorded});
}));
router.post('/questions',grant(...questionRoles),wrap(async(req,res)=>{
 const {subjectId,prompt,options,correctOption,explanation=''}=req.body||{};
 if(!uuid(subjectId)||typeof prompt!=='string'||prompt.trim().length<10||prompt.length>5000||
 !options||typeof options!=='object'||Array.isArray(options)||!['A','B','C','D'].every(k=>typeof options[k]==='string'&&options[k].trim().length>0&&options[k].length<=1000)||
 !['A','B','C','D'].includes(correctOption)||typeof explanation!=='string'||explanation.length>5000 )return res.status(400).json({error:'Check the question, options, answer and subject.'});
 const {data,error}=await db.from('upec_teacher_questions').insert({subject_id:subjectId,author_account_id:req.actor.sub,prompt:prompt.trim(),options,correct_option:correctOption,explanation:explanation.trim(),question_type:req.body.questionType||'single_choice',topic:req.body.topic||'',subtopic:req.body.subtopic||'',difficulty:req.body.difficulty||'medium',exam_type:req.body.examType||'',exam_year:req.body.examYear||null,solution_steps:req.body.solutionSteps||'',source_name:req.body.sourceName||'',source_reference:req.body.sourceReference||'',source_license:req.body.sourceLicense||'',status:'draft'}).select('id,subject_id,prompt,status').single();
 if(error?.code==='23503')return res.status(404).json({error:'Subject not found.'});
 if(error)throw error;
 const auditRecorded=await auditQuestion({questionId:data.id,req,action:'created',afterData:data});
 res.status(201).json({question:data,auditRecorded});
}));
router.post('/questions/bulk',grant(...questionRoles),wrap(async(req,res)=>{
 const rows=req.body?.questions;
 if(!Array.isArray(rows)||!rows.length||rows.length>500)return res.status(400).json({error:'Provide between 1 and 500 question records.'});
 const accepted=[],rejected=[],seen=new Set();
 const normalize=value=>String(value||'').normalize('NFKC').replace(/\\s+/g,' ').trim().toLocaleLowerCase();
 rows.forEach((row,index)=>{
  const options=row?.options;
  const valid=uuid(row?.subjectId)&&typeof row?.prompt==='string'&&row.prompt.trim().length>=10&&row.prompt.length<=5000&&
   options&&typeof options==='object'&&!Array.isArray(options)&&['A','B','C','D'].every(k=>typeof options[k]==='string'&&options[k].trim().length>0&&options[k].length<=1000)&&
   ['A','B','C','D'].includes(row?.correctOption)&&
   (row?.questionType||'single_choice')==='single_choice'&&
   ['easy','medium','hard'].includes(row?.difficulty||'medium')&&
   (row?.examYear==null||row.examYear===''||(Number.isInteger(Number(row.examYear))&&Number(row.examYear)>=1950&&Number(row.examYear)<=2100));
  if(!valid){rejected.push({row:index+1,reason:'Invalid subject, prompt, options, answer, type, difficulty or year.'});return;}
  const key=row.subjectId+'::'+normalize(row.prompt);
  if(seen.has(key)){rejected.push({row:index+1,reason:'Duplicate question in this import batch.'});return;}
  seen.add(key);
  accepted.push({rowNumber:index+1,record:{subject_id:row.subjectId,author_account_id:req.actor.sub,prompt:row.prompt.trim(),options:Object.fromEntries(['A','B','C','D'].map(k=>[k,row.options[k].trim()])),correct_option:row.correctOption,explanation:String(row.explanation||'').slice(0,5000),question_type:'single_choice',topic:String(row.topic||'').slice(0,160),subtopic:String(row.subtopic||'').slice(0,160),difficulty:row.difficulty||'medium',exam_type:String(row.examType||'').slice(0,40),exam_year:row.examYear?Number(row.examYear):null,solution_steps:String(row.solutionSteps||'').slice(0,12000),source_name:String(row.sourceName||'').slice(0,160),source_reference:String(row.sourceReference||'').slice(0,500),source_license:String(row.sourceLicense||'').slice(0,160),status:'draft'}});
 });
 if(!accepted.length)return res.status(400).json({error:'No valid questions to import.',rejected});
 const subjects=[...new Set(accepted.map(x=>x.record.subject_id))];
 const prompts=[...new Set(accepted.map(x=>x.record.prompt))];
 const {data:existing,error:lookupError}=await db.from('upec_teacher_questions').select('subject_id,prompt').in('subject_id',subjects).in('prompt',prompts);
 if(lookupError)throw lookupError;
 const existingKeys=new Set((existing||[]).map(q=>q.subject_id+'::'+normalize(q.prompt)));
 const fresh=[];
 for(const item of accepted){
  const key=item.record.subject_id+'::'+normalize(item.record.prompt);
  if(existingKeys.has(key)){rejected.push({row:item.rowNumber,reason:'This question already exists in the selected subject.'});continue;}
  existingKeys.add(key);
  fresh.push(item.record);
 }
 if(!fresh.length)return res.status(200).json({imported:0,rejected});
 const {data,error}=await db.from('upec_teacher_questions').insert(fresh).select('id,subject_id,prompt,topic,exam_type,exam_year,source_name,source_reference,status');
 if(error?.code==='23503')return res.status(400).json({error:'One or more subject IDs are invalid.',rejected});
 if(error)throw error;
 const auditRows=(data||[]).map(question=>({question_id:question.id,actor_account_id:uuid(req.actor?.sub)?req.actor.sub:null,actor_role:req.staff?.role||'',action:'imported',after_data:question}));
 const {error:auditError}=auditRows.length?await db.from('upec_question_audit_log').insert(auditRows):{error:null};
 if(auditError)console.error('Bulk question audit write failed:',auditError.message);
 res.status(201).json({imported:data?.length||0,rejected,auditRecorded:!auditError});
}));
router.post('/questions/extract-pdf',grant(...questionRoles),express.raw({type:['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'],limit:'12mb'}),wrap(async(req,res)=>{
 const subjectId=String(req.query.subjectId||'');
 const examType=String(req.query.examType||'').slice(0,40);
 const examYear=Number(req.query.examYear);
 if(!uuid(subjectId))return res.status(400).json({error:'Choose a valid destination subject.'});
 const mime=String(req.headers['content-type']||'').split(';')[0].trim().toLowerCase();
 const isPdf=mime==='application/pdf'&&Buffer.isBuffer(req.body)&&req.body.subarray(0,5).toString()==='%PDF-';
 const isDocx=mime==='application/vnd.openxmlformats-officedocument.wordprocessingml.document'&&Buffer.isBuffer(req.body)&&req.body.subarray(0,2).toString()==='PK';
 if(!isPdf&&!isDocx)return res.status(400).json({error:'Upload a valid PDF or DOCX document.'});
 if(req.body.length>12*1024*1024)return res.status(413).json({error:'Document must be 12 MB or smaller.'});
 let docxText='',docxHasDrawing=false,docxImages=[],docxSkippedImages=0;
 if(isDocx){
  try{const extracted=extractDocxPlainText(req.body);docxText=extracted.text;docxHasDrawing=extracted.hasDrawing;docxImages=extracted.images;docxSkippedImages=extracted.skippedImages;}
  catch(error){return res.status(400).json({error:error.message||'Could not read this DOCX document.'});}
  if(docxText.length<40)return res.status(400).json({error:'No readable question text was found in this DOCX file.'});
  if(docxText.length>180000)return res.status(413).json({error:'DOCX text is too long. Split it into smaller documents.'});
 }
 const key=process.env.GEMINI_API_KEY||process.env.GOOGLE_API_KEY;
 if(!key)return res.status(503).json({error:'Document extraction is not configured. Add GEMINI_API_KEY to the API service.'});
 const schema={type:'OBJECT',properties:{questions:{type:'ARRAY',items:{type:'OBJECT',properties:{
  prompt:{type:'STRING'},optionA:{type:'STRING'},optionB:{type:'STRING'},optionC:{type:'STRING'},optionD:{type:'STRING'},
  correctOption:{type:'STRING',enum:['A','B','C','D','UNKNOWN']},explanation:{type:'STRING'},solutionSteps:{type:'STRING'},
  topic:{type:'STRING'},subtopic:{type:'STRING'},diagramDescription:{type:'STRING'},difficulty:{type:'STRING',enum:['easy','medium','hard']},
  examType:{type:'STRING'},examYear:{type:'STRING'},reviewNotes:{type:'STRING'}
 },required:['prompt','optionA','optionB','optionC','optionD','correctOption','explanation','solutionSteps','topic','subtopic','diagramDescription','difficulty','examType','examYear','reviewNotes']}}},required:['questions']};
 const prompt='Extract every objective multiple-choice question from this examination document. Preserve mathematical notation, units, symbols, tables and wording. For every question that depends on a figure, chart or diagram, describe its visible content and labels in diagramDescription so the question remains understandable; do not invent visual details. Extract the four options exactly. Identify the correct option only when the document provides an answer key or the answer is unambiguous from a fully worked solution; otherwise use UNKNOWN and explain the uncertainty in reviewNotes. Do not invent missing options, answers, years or explanations. If an answer key appears elsewhere in the document, match it carefully by question number. Provide a concise explanation and worked solution steps only when supported by the source or directly solvable; label any calculated solution in reviewNotes. Ignore headers, page numbers and instructions that are not questions. Split compound question numbers into separate records. For unreadable or incomplete questions, include them only if the prompt and all four options are recoverable and describe the issue in reviewNotes. Exam type hint: '+(examType||'not supplied')+'. Exam year hint: '+(Number.isInteger(examYear)&&examYear>=1950&&examYear<=2100?examYear:'not supplied')+'. Return an empty questions array if no valid objective questions are present.';
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),90000);
 let response;
 try{
  response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key='+encodeURIComponent(key),{
   method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json'},
   body:JSON.stringify({contents:[{parts:isPdf?[{text:prompt},{inlineData:{mimeType:'application/pdf',data:req.body.toString('base64')}}]:[{text:prompt+'\n\nExtracted DOCX document text:\n'+docxText+(docxHasDrawing?'\n\nThe DOCX contains embedded drawings. Supported embedded images are attached after this text; flag any question whose figure is still unclear.':'')+(docxSkippedImages?'\n\nWARNING: '+docxSkippedImages+' embedded image(s) could not be attached because of format or size limits. Flag questions that may depend on them.':'')},...docxImages.map(image=>({inlineData:{mimeType:image.mimeType,data:image.data}}))]}],generationConfig:{responseMimeType:'application/json',responseSchema:schema,temperature:0.1}})
  });
 }catch(error){clearTimeout(timer);return res.status(502).json({error:error.name==='AbortError'?'Document extraction timed out. Try a smaller document.':'Could not reach the document extraction service.'});}
 clearTimeout(timer);
 const payload=await response.json().catch(()=>({}));
 if(!response.ok){console.error('Gemini document extraction failed:',response.status,payload?.error?.message||'');return res.status(502).json({error:'Document extraction service could not process this document.'});}
 const raw=(payload.candidates?.[0]?.content?.parts||[]).map(part=>part.text||'').join('');
 let parsed;
 try{parsed=JSON.parse(raw);}catch{return res.status(502).json({error:'The extraction service returned an unreadable response. Please retry the document.'});}
 const questions=Array.isArray(parsed.questions)?parsed.questions.slice(0,300).map((q,index)=>({
  rowNumber:index+1,prompt:String(q.prompt||'').slice(0,5000),
  options:{A:String(q.optionA||'').slice(0,1000),B:String(q.optionB||'').slice(0,1000),C:String(q.optionC||'').slice(0,1000),D:String(q.optionD||'').slice(0,1000)},
  correctOption:['A','B','C','D'].includes(q.correctOption)?q.correctOption:'',
  explanation:String(q.explanation||'').slice(0,5000),solutionSteps:String(q.solutionSteps||'').slice(0,12000),
  topic:String(q.topic||'').slice(0,160),subtopic:String(q.subtopic||'').slice(0,160),diagramDescription:String(q.diagramDescription||'').slice(0,2000),
  difficulty:['easy','medium','hard'].includes(q.difficulty)?q.difficulty:'medium',
  examType:String(q.examType||examType).slice(0,40),examYear:Number(q.examYear||examYear)||null,
  reviewNotes:String(q.reviewNotes||'').slice(0,1000),subjectId
 })).filter(q=>q.prompt.length>=10&&Object.values(q.options).every(v=>v.trim().length>0)):[];
 if(isDocx&&docxHasDrawing&&docxSkippedImages)for(const question of questions)question.reviewNotes=[question.reviewNotes,'Some embedded DOCX images were not sent for visual inspection; verify diagrams in the original document.'].filter(Boolean).join(' ');
 const warnings=[];
 if(isDocx&&docxImages.length)warnings.push(docxImages.length+' embedded image(s) were supplied for visual extraction.');
 if(isDocx&&docxSkippedImages)warnings.push(docxSkippedImages+' embedded image(s) were skipped because they exceeded supported format or size limits. Check the original document before importing.');
 if(isDocx&&docxHasDrawing&&!docxImages.length&&!docxSkippedImages)warnings.push('The DOCX contains drawing content but no supported embedded image was available. Check any diagram-dependent question against the original.');
 const truncated=Array.isArray(parsed.questions)&&parsed.questions.length>300;
 if(truncated)warnings.push('Only the first 300 extracted questions are shown. Split the source document to process the remaining questions.');
 res.json({questions,extracted:questions.length,requiresReview:true,source:isPdf?'PDF':'DOCX',warnings,truncated});
}));
router.get('/provider-questions',grant(...questionRoles),wrap(async(req,res)=>{
 const provider=String(req.query.provider||'auto').toLowerCase();
 const subject=String(req.query.subject||'').toLowerCase();
 const exam=String(req.query.exam||'utme').toLowerCase();
 const year=Number(req.query.year);
 const limit=Math.min(30,Math.max(1,Number.parseInt(req.query.limit,10)||20));
 const examMap={utme:{aloc:'jamb',sdash:'utme'},jamb:{aloc:'jamb',sdash:'utme'},waec:{aloc:'waec',sdash:'wassce'},wassce:{aloc:'waec',sdash:'wassce'},neco:{aloc:'neco',sdash:'neco'},'post-utme':{aloc:'post_utme',sdash:'post-utme'}};
 if(!['auto','aloc','sdashapi'].includes(provider)||!examMap[exam]||!/^[a-z0-9-]{2,50}$/.test(subject)||!Number.isInteger(year)||year<1990||year>2030)return res.status(400).json({error:'Choose a valid provider, examination, subject and year.'});
 const providers=provider==='auto'?['aloc','sdashapi']:[provider];
 const failures=[];
 for(const source of providers){
  const key=source==='aloc'?process.env.ALOC_API_KEY:process.env.SDASH_API_TOKEN;
  if(!key)continue;
  const base=source==='aloc'?'https://dev.aloc.com.ng/api/v1':'https://sdashapi.com/api/v1';
  const aliases={'use-of-english':'english','literature-in-english':'englishlit','agricultural-science':'agriculture','crs':'crk','irs':'irk'};
  const path=source==='aloc'
   ?'/questions?subject='+encodeURIComponent(subject)+'&examType='+encodeURIComponent(examMap[exam].aloc)+'&year='+year+'&limit='+Math.min(15,limit)
   :'/q?subject='+encodeURIComponent(aliases[subject]||subject)+'&type='+encodeURIComponent(examMap[exam].sdash)+'&year='+year+'&limit='+Math.min(30,limit);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),10000);
  try{
   const headers=source==='aloc'?{'X-API-Key':key}:{AccessToken:key};
   const response=await fetch(base+path,{headers:{Accept:'application/json',...headers},signal:controller.signal});
   if(!response.ok){failures.push(source+': HTTP '+response.status);continue;}
   const payload=await response.json();
   const raw=Array.isArray(payload.data)?payload.data:[];
   const questions=raw.map((q,index)=>{
    const optionSource=q.option||q.options||q.choices||{};
    const entries=Array.isArray(optionSource)?optionSource.map((v,i)=>[String.fromCharCode(97+i),v]):Object.entries(optionSource);
    const options=Object.fromEntries(entries.map(([k,v])=>[String(k).toUpperCase().replace(/^OPTION[_\s-]*/i,'').replace(/[()]/g,''),typeof v==='object'?(v.text||v.value||''):String(v)]));
    const answer=String(q.answer||q.correctAnswer||q.correct_answer||q.correct_option||'').toLowerCase().replace(/[()]/g,'').replace(/^OPTION[_\s-]*/i,'');
    return {providerId:String(q.id??q.question_id??index),prompt:String(q.question||q.prompt||q.text||''),options,correctOption:answer.toUpperCase(),explanation:String(q.solution||q.explanation||q.answer_explanation||''),solutionSteps:String(q.solution_steps||q.worked_solution||q.solution||''),imageUrl:q.image||q.imageUrl||null,examType:exam.toUpperCase(),examYear:Number(q.examyear||q.year||year),sourceProvider:source==='aloc'?'ALOC Station':'SdashAPI'};
   }).filter(q=>q.prompt&&['A','B','C','D'].every(k=>q.options[k])&&['A','B','C','D'].includes(q.correctOption));
   return res.json({provider:source,questions,totalReceived:raw.length,importable:questions.length,skipped:raw.length-questions.length,note:'Provider results are preview-only until imported. Imported records are saved as drafts.'});
  }catch(error){failures.push(source+': '+(error.name==='AbortError'?'timeout':'request failed'));}
  finally{clearTimeout(timer);}
 }
 if(providers.every(p=>!(p==='aloc'?process.env.ALOC_API_KEY:process.env.SDASH_API_TOKEN)))return res.status(503).json({error:'No question provider is configured. Set ALOC_API_KEY or SDASH_API_TOKEN on the API service.'});
 res.status(502).json({error:'No provider returned usable questions.',details:failures});
}));
router.patch('/questions/:id/status',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 const id=req.params.id,status=req.body?.status;
 if(!uuid(id)||!['draft','published'].includes(status))return res.status(400).json({error:'Invalid question or status.'});
 const {data:current,error:lookupError}=await db.from('upec_teacher_questions').select('id,subject_id,author_account_id,prompt,options,correct_option,topic,explanation,solution_steps,status').eq('id',id).maybeSingle();
 if(lookupError)throw lookupError;
 if(!current)return res.status(404).json({error:'Question not found.'});
 if(req.staff.role==='teacher'&&current.author_account_id!==req.actor.sub)return res.status(404).json({error:'Question not found or you cannot review it.'});
 if(status==='published'){
  const options=current.options||{};
  const issues=[];
  if(typeof current.prompt!=='string'||current.prompt.trim().length<10)issues.push('question prompt');
  if(!['A','B','C','D'].every(key=>typeof options[key]==='string'&&options[key].trim()))issues.push('all four answer options');
  if(!['A','B','C','D'].includes(current.correct_option))issues.push('confirmed correct answer');
  if(typeof current.topic!=='string'||!current.topic.trim())issues.push('topic');
  if(!(typeof current.explanation==='string'&&current.explanation.trim())&&!(typeof current.solution_steps==='string'&&current.solution_steps.trim()))issues.push('explanation or worked solution');
  if(issues.length)return res.status(409).json({error:'Question is not ready to publish. Complete: '+issues.join(', ')+'.'});
 }
 let update=db.from('upec_teacher_questions').update({status,updated_at:new Date().toISOString()}).eq('id',id).eq('status',current.status);
 if(req.staff.role==='teacher')update=update.eq('author_account_id',req.actor.sub);
 const {data,error}=await update.select('id,status,prompt,subject_id,topic,explanation,solution_steps,source_name,source_reference,source_license,updated_at').maybeSingle();
 if(error)throw error;
 if(!data)return res.status(409).json({error:'Question changed during review. Refresh and try again.'});
 const auditRecorded=await auditQuestion({questionId:id,req,action:status==='published'?'published':'unpublished',beforeData:{status:current.status},afterData:data});
 res.json({question:data,auditRecorded});
}));
router.get('/questions/:id/history',grant(...questionRoles),wrap(async(req,res)=>{
 const id=req.params.id;
 if(!uuid(id))return res.status(400).json({error:'Invalid question ID.'});
 let questionQuery=db.from('upec_teacher_questions').select('id,author_account_id').eq('id',id);
 if(req.staff.role==='teacher')questionQuery=questionQuery.eq('author_account_id',req.actor.sub);
 const {data:question,error:questionError}=await questionQuery.maybeSingle();
 if(questionError)throw questionError;
 if(!question)return res.status(404).json({error:'Question not found.'});
 const {data,error}=await db.from('upec_question_audit_log')
  .select('id,question_id,actor_account_id,actor_role,action,before_data,after_data,created_at')
  .eq('question_id',id).order('created_at',{ascending:false}).limit(100);
 if(error)throw error;
 const actorIds=[...new Set((data||[]).map(row=>row.actor_account_id).filter(Boolean))];
 let actorNames={};
 if(actorIds.length){
  const {data:accounts,error:accountError}=await db.from('local_accounts').select('id,full_name').in('id',actorIds);
  if(accountError)console.error('Question audit actor lookup failed:',accountError.message);
  else actorNames=Object.fromEntries((accounts||[]).map(account=>[account.id,account.full_name]));
 }
 res.json({history:(data||[]).map(row=>({...row,actor_name:row.actor_account_id?(actorNames[row.actor_account_id]||'Staff account'): 'System / unavailable'}))});
}));
router.get('/assessments',grant(...questionRoles),wrap(async(req,res)=>{
 let query=db.from('upec_assessments').select('id,subject_id,title,duration_minutes,status,created_by,created_at,opens_at,closes_at,correction_release_mode,corrections_release_at,corrections_released_at').order('created_at',{ascending:false}).limit(100);
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
router.patch('/assessments/:id/correction-policy',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {mode,releaseAt}=req.body||{};
 if(!['after_close','scheduled','manual'].includes(mode))return res.status(400).json({error:'Choose a valid correction release mode.'});
 const releaseTime=mode==='scheduled'&&typeof releaseAt==='string'&&Number.isFinite(Date.parse(releaseAt))?new Date(releaseAt).toISOString():null;
 if(mode==='scheduled'&&!releaseTime)return res.status(400).json({error:'A valid correction release date and time are required.'});
 const {data:exam,error:lookupError}=await db.from('upec_assessments').select('id,status').eq('id',req.params.id).maybeSingle();
 if(lookupError)throw lookupError;if(!exam)return res.status(404).json({error:'Assessment not found.'});
 if(exam.status!=='draft')return res.status(409).json({error:'Set the correction release policy before publishing the examination.'});
 const {data,error}=await db.from('upec_assessments').update({correction_release_mode:mode,corrections_release_at:releaseTime,corrections_released_at:null,corrections_released_by:null}).eq('id',exam.id).eq('status','draft').select('id,correction_release_mode,corrections_release_at').maybeSingle();
 if(error)throw error;if(!data)return res.status(409).json({error:'Assessment changed. Refresh and try again.'});
 res.json({policy:data});
}));
router.post('/assessments/:id/corrections/release',grant('super_admin','admin','cbt_manager'),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {data:exam,error}=await db.from('upec_assessments').select('id,status,closes_at,correction_release_mode').eq('id',req.params.id).maybeSingle();
 if(error)throw error;if(!exam)return res.status(404).json({error:'Assessment not found.'});
 if(exam.correction_release_mode!=='manual')return res.status(409).json({error:'This examination is not configured for manual correction release.'});
 if(!(exam.status==='closed'||(exam.closes_at&&Date.parse(exam.closes_at)<=Date.now())))return res.status(409).json({error:'Close the examination before releasing corrections.'});
 const {data:active,error:activeError}=await db.from('upec_assessment_attempts').select('id').eq('assessment_id',exam.id).is('submitted_at',null).gt('expires_at',new Date().toISOString()).limit(1);
 if(activeError)throw activeError;if(active?.length)return res.status(409).json({error:'Candidates are still completing this examination. Corrections remain locked.'});
 const releasedAt=new Date().toISOString();
 const {data:updated,error:updateError}=await db.from('upec_assessments').update({corrections_released_at:releasedAt,corrections_released_by:req.actor.sub}).eq('id',exam.id).eq('correction_release_mode','manual').select('id,corrections_released_at').maybeSingle();
 if(updateError)throw updateError;if(!updated)return res.status(409).json({error:'Correction release policy changed. Refresh and try again.'});
 res.json({released:true,releasedAt:updated.corrections_released_at});
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
 const studentIds=[...new Set((data||[]).map(r=>r.student_account_id))];
 let studentsMap={};
 if(studentIds.length>0){
  const {data:accounts}=await db.from('local_accounts').select('id,full_name').in('id',studentIds);
  (accounts||[]).forEach(acc=>{if(acc.full_name)studentsMap[acc.id]=acc.full_name;});
 }
 const formatted=(data||[]).map(r=>({
  ...r,
  student_name:studentsMap[r.student_account_id]||null
 }));
 res.json({title:exam.title,results:formatted});
}));
router.get('/assessments/:id/attempts',grant(...questionRoles),wrap(async(req,res)=>{
 if(!uuid(req.params.id))return res.status(400).json({error:'Invalid assessment ID.'});
 const {data:exam,error:e}=await db.from('upec_assessments').select('id,title,duration_minutes,status,created_by').eq('id',req.params.id).maybeSingle();
 if(e)throw e;
 if(!exam)return res.status(404).json({error:'Assessment not found.'});
 if(req.staff.role==='teacher'&&exam.created_by!==req.actor.sub)return res.status(403).json({error:'Monitoring is restricted to the assessment author.'});
 const {data:attempts,error}=await db.from('upec_assessment_attempts').select('id,student_account_id,started_at,expires_at,submitted_at,score,total_questions').eq('assessment_id',exam.id).order('started_at',{ascending:false}).limit(200);
 if(error)throw error;
 const studentIds=[...new Set((attempts||[]).map(a=>a.student_account_id))];
 let studentsMap={};
 if(studentIds.length>0){
  const {data:accounts}=await db.from('local_accounts').select('id,full_name').in('id',studentIds);
  (accounts||[]).forEach(acc=>{if(acc.full_name)studentsMap[acc.id]=acc.full_name;});
 }
 const formatted=(attempts||[]).map(a=>({
  ...a,
  student_name:studentsMap[a.student_account_id]||null
 }));
 res.json({assessment:exam,attempts:formatted});
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
 const {subjectId,title,description='',mimeType,fileSize}=req.body||{};
 if(!uuid(subjectId)||typeof title!=='string'||title.trim().length<5||title.length>180||typeof description!=='string'||description.length>3000||(!Number.isInteger(fileSize)||fileSize<1||fileSize>8388608)||!allowedUploadTypes.has(mimeType))return res.status(400).json({error:'Invalid resource or file type.'});
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
router.get('/subject-combinations',grant('super_admin','admin','teacher','cbt_manager','admissions_officer'),wrap(async(req,res)=>{
 const {data,error}=await db.from('upec_subject_combinations').select('id,programme_id,name,subject_codes,active').order('name').limit(500);
 if(error)throw error;res.json({combinations:data||[]});
}));
router.post('/subject-combinations',grant('super_admin','admin'),wrap(async(req,res)=>{
 const {programmeId,combinationName,subjectCodes}=req.body||{};
 if(!uuid(programmeId)||!name(combinationName)||!Array.isArray(subjectCodes)||subjectCodes.length<1||subjectCodes.length>8||subjectCodes.some(x=>!code(x))||new Set(subjectCodes).size!==subjectCodes.length)return res.status(400).json({error:'Valid programme, combination name and distinct subjects required.'});
 const {data:subjects,error:subjectError}=await db.from('upec_academic_subjects').select('code').eq('programme_id',programmeId).eq('active',true);
 if(subjectError)throw subjectError;const allowed=new Set((subjects||[]).map(x=>x.code));
 if(subjectCodes.some(x=>!allowed.has(x)))return res.status(400).json({error:'All subjects must be active within the chosen programme.'});
 const {data,error}=await db.from('upec_subject_combinations').insert({programme_id:programmeId,name:combinationName.trim(),subject_codes:subjectCodes}).select('id,name').single();
 if(error?.code==='23505')return res.status(409).json({error:'Combination name already exists for this programme.'});if(error)throw error;res.status(201).json({combination:data});
}));
export default router;
