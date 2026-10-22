import {Router} from 'express';
import {requireRole} from './security.js';

const router=Router();
router.use(requireRole('student'));
const upstream='https://dev.aloc.com.ng/api/v1';
const subjects=new Set(['english','use-of-english','mathematics','physics','chemistry','biology','government','economics','literature-in-english','commerce','accounting','geography','history','crs','irs','agricultural-science']);
const timeoutMs=8000;
const YEAR_MAX=2030; // API accepts through 2030; actual availability is subject/year-specific.
const request=async(path)=>{
 const key=process.env.ALOC_API_KEY;
 if(!key)return {unconfigured:true};
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(upstream+path,{headers:{'X-API-Key':key,'Accept':'application/json'},signal:controller.signal});
  if(!response.ok){const error=new Error('Past-question provider unavailable');error.status=response.status===429?429:response.status===401||response.status===403?503:502;throw error;}
  return await response.json();
 }finally{clearTimeout(timer);}
};
router.get('/utme/subjects',async(req,res)=>{
 try{
  const result=await request('/subjects');
  if(result.unconfigured)return res.status(503).json({error:'ALOC provider API key is not configured.'});
  res.json({provider:'ALOC Station',subjects:Array.isArray(result.data)?result.data:[],source:'provider-catalogue'});
 }catch(error){res.status(error.name==='AbortError'?504:502).json({error:'Could not load provider subject catalogue.'});}
});
router.get('/utme/subjects/:subject/years',async(req,res)=>{
 const subject=String(req.params.subject||'').toLowerCase();
 if(!subjects.has(subject))return res.status(400).json({error:'Unsupported subject.'});
 try{
  const result=await request('/subjects/'+encodeURIComponent(subject)+'/years');
  if(result.unconfigured)return res.status(503).json({error:'ALOC provider API key is not configured.'});
  res.json({provider:'ALOC Station',subject,years:result.data||[]});
 }catch(error){res.status(error.name==='AbortError'?504:502).json({error:'Could not load available examination years.'});}
});
router.get('/utme/format',(_req,res)=>res.json({exam:'UTME',subjectsPerExam:4,compulsorySubject:'Use of English',englishQuestions:60,otherSubjectQuestions:40,totalQuestions:180,durationMinutes:120,options:['A','B','C','D'],scoringMaximum:400,source:'UTME simulation configuration; verify against latest JAMB guidance',simulation:true}));
router.get('/utme/provider-status',(_req,res)=>res.json({provider:'ALOC Station',configured:Boolean(process.env.ALOC_API_KEY),source:'third-party',officialJambApi:false,solutionsEnabled:false}));
router.get('/utme/questions',async(req,res,next)=>{
 const subject=String(req.query.subject||'').toLowerCase();
 const year=Number(req.query.year);
 const cursor=typeof req.query.cursor==='string'?req.query.cursor:'';
 const limit=req.query.limit===undefined?10:Number(req.query.limit);
 if(!Number.isInteger(limit)||limit<1||limit>50)return res.status(400).json({error:'Question page size must be between 1 and 50.'});
 if(cursor.length>512)return res.status(400).json({error:'Invalid pagination cursor.'});
 if(!subjects.has(subject)||!Number.isInteger(year)||year<1990||year>YEAR_MAX)return res.status(400).json({error:'Choose a valid subject and examination year.'});
 try{
  const result=await request('/questions?subject='+encodeURIComponent(subject)+'&examType=jamb&year='+year+'&limit='+limit+(cursor?'&cursor='+encodeURIComponent(cursor):''));
  if(result.unconfigured)return res.status(503).json({error:'Past-question provider has not been configured.'});
  res.json({provider:'ALOC Station',mode:'practice',source:'third-party',officialJambApi:false,questions:Array.isArray(result.data)?result.data:[],pagination:result.pagination||null,requestedYear:year});
 }catch(error){res.status(error.name==='AbortError'?504:502).json({error:'The past-question service could not be reached. Please try again.'});}
});
export default router;
