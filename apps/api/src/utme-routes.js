import {Router} from 'express';
import {requireRole} from './security.js';

const router=Router();
router.use(requireRole('student'));

const ALOC_BASE='https://dev.aloc.com.ng/api/v1';
const SDASH_BASE='https://sdashapi.com/api/v1';
const subjects=new Set(['english','use-of-english','mathematics','physics','chemistry','biology','government','economics','literature-in-english','commerce','accounting','geography','history','crs','irs','agricultural-science']);
const sdashSubjectAliases={'use-of-english':'english','literature-in-english':'englishlit','agricultural-science':'agriculture','crs':'crk','irs':'irk'};
const timeoutMs=10000;
const YEAR_MIN=1990;
const YEAR_MAX=2030;
const exams={utme:{aloc:'jamb',sdash:'utme'},jamb:{aloc:'jamb',sdash:'utme'},waec:{aloc:'waec',sdash:'wassce'},wassce:{aloc:'waec',sdash:'wassce'},neco:{aloc:'neco',sdash:'neco'},'post-utme':{aloc:'post_utme',sdash:'post-utme'}};

async function fetchJson(url,headers){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(url,{headers:{Accept:'application/json',...headers},signal:controller.signal});
  if(!response.ok){
   const error=new Error('Past-question provider request failed');
   error.status=response.status===429?429:response.status===401||response.status===403?503:502;
   throw error;
  }
  return await response.json();
 }finally{clearTimeout(timer);}
}
const requestAloc=async(path)=>{
 const key=process.env.ALOC_API_KEY;
 if(!key)return {unconfigured:true};
 return fetchJson(ALOC_BASE+path,{'X-API-Key':key});
};
const requestSdash=async(path)=>{
 const key=process.env.SDASH_API_TOKEN;
 if(!key)return {unconfigured:true};
 return fetchJson(SDASH_BASE+path,{AccessToken:key});
};
const providerStatus=()=>({
 aloc:{name:'ALOC Station',configured:Boolean(process.env.ALOC_API_KEY)},
 sdashapi:{name:'SdashAPI',configured:Boolean(process.env.SDASH_API_TOKEN)}
});
const asArray=value=>Array.isArray(value)?value:value&&typeof value==='object'?[value]:[];
const normalizeSdashQuestion=q=>({
 id:String(q.id),
 text:q.question||'',
 questionHtml:q.question||'',
 section:q.section||null,
 options:Object.fromEntries(Object.entries(q.option||{}).map(([key,value])=>[key.toLowerCase(),value])),
 correctAnswer:String(q.answer||'').toLowerCase(),
 explanation:q.solution||'',
 imageUrl:q.image||null,
 examType:q.examtype||'UTME',
 examYear:q.examyear||null,
 sourceProvider:'SdashAPI'
});
const normalizeAlocQuestion=q=>({...q,id:String(q.id),sourceProvider:'ALOC Station'});

async function fetchQuestions(provider,subject,year,limit,cursor,reqExam){
 if(provider==='aloc'){
  const exam=reqExam.aloc;
  const result=await requestAloc('/questions?subject='+encodeURIComponent(subject)+'&examType='+encodeURIComponent(exam)+'&year='+year+'&limit='+Math.min(15,limit)+(cursor?'&cursor='+encodeURIComponent(cursor):''));
  if(result.unconfigured)return result;
  return {provider:'ALOC Station',questions:asArray(result.data).map(normalizeAlocQuestion),pagination:result.pagination||null};
 }
 if(provider==='sdashapi'){
  if(cursor)return {unsupportedCursor:true};
  const sdashSubject=sdashSubjectAliases[subject]||subject;
  const result=await requestSdash('/q?subject='+encodeURIComponent(sdashSubject)+'&type='+encodeURIComponent(reqExam.sdash)+'&year='+year+'&limit='+Math.min(50,limit));
  if(result.unconfigured)return result;
  return {provider:'SdashAPI',questions:asArray(result.data).map(normalizeSdashQuestion),pagination:null};
 }
 return {unconfigured:true};
}

router.get('/utme/subjects',async(_req,res)=>{
 const status=providerStatus();
 try{
  if(status.aloc.configured){
   const result=await requestAloc('/subjects');
   return res.json({provider:'ALOC Station',subjects:Array.isArray(result.data)?result.data:[],source:'provider-catalogue'});
  }
  if(status.sdashapi.configured){
   const result=await requestSdash('/subjects');
   return res.json({provider:'SdashAPI',subjects:Array.isArray(result.data)?result.data:[],source:'provider-catalogue'});
  }
  return res.status(503).json({error:'Configure ALOC_API_KEY or SDASH_API_TOKEN to load the question catalogue.'});
 }catch(error){res.status(error.name==='AbortError'?504:error.status||502).json({error:'Could not load provider subject catalogue.'});}
});
router.get('/utme/subjects/:subject/years',async(req,res)=>{
 const subject=String(req.params.subject||'').toLowerCase();
 if(!subjects.has(subject))return res.status(400).json({error:'Unsupported subject.'});
 const status=providerStatus();
 try{
  if(status.aloc.configured){
   const result=await requestAloc('/subjects/'+encodeURIComponent(subject)+'/years');
   return res.json({provider:'ALOC Station',subject,years:result.data||[]});
  }
  if(status.sdashapi.configured){
   const result=await requestSdash('/years');
   return res.json({provider:'SdashAPI',subject,years:result.data||[]});
  }
  return res.status(503).json({error:'No past-question provider is configured.'});
 }catch(error){res.status(error.name==='AbortError'?504:error.status||502).json({error:'Could not load available examination years.'});}
});
router.get('/utme/format',(_req,res)=>res.json({exam:'UTME',subjectsPerExam:4,compulsorySubject:'Use of English',englishQuestions:60,otherSubjectQuestions:40,totalQuestions:180,durationMinutes:120,options:['A','B','C','D'],scoringMaximum:400,source:'UTME simulation configuration; verify against latest JAMB guidance',simulation:true}));
router.get('/utme/provider-status',(_req,res)=>{
 const providers=providerStatus();
 res.json({provider:providers.aloc.configured?'ALOC Station':providers.sdashapi.configured?'SdashAPI':null,configured:providers.aloc.configured||providers.sdashapi.configured,providers,source:'third-party',officialJambApi:false,answersAvailable:providers.aloc.configured||providers.sdashapi.configured,workedSolutionsAvailable:providers.sdashapi.configured});
});
router.get('/utme/questions',async(req,res)=>{
 const subject=String(req.query.subject||'').toLowerCase();
 const year=Number(req.query.year);
 const cursor=typeof req.query.cursor==='string'?req.query.cursor:'';
 const limit=req.query.limit===undefined?10:Number(req.query.limit);
 const requestedProvider=String(req.query.provider||'auto').toLowerCase();
 const examKey=String(req.query.exam||'utme').toLowerCase();
 const reqExam=exams[examKey];
 if(!Number.isInteger(limit)||limit<1||limit>50)return res.status(400).json({error:'Question page size must be between 1 and 50.'});
 if(cursor.length>512)return res.status(400).json({error:'Invalid pagination cursor.'});
 if(!subjects.has(subject)||!Number.isInteger(year)||year<YEAR_MIN||year>YEAR_MAX||!reqExam)return res.status(400).json({error:'Choose a valid examination, subject and year.'});
 if(!['auto','aloc','sdashapi'].includes(requestedProvider))return res.status(400).json({error:'Choose ALOC Station or SdashAPI.'});
 const status=providerStatus();
 const order=requestedProvider==='auto'
  ?(status.aloc.configured?['aloc','sdashapi']:['sdashapi','aloc'])
  :[requestedProvider];
 let lastError=null;
 for(const provider of order){
  if(!status[provider].configured)continue;
  try{
   const result=await fetchQuestions(provider,subject,year,limit,cursor,reqExam);
   if(result.unconfigured||result.unsupportedCursor)continue;
   if(!result.questions.length){lastError=new Error('No questions returned by '+result.provider);continue;}
   return res.json({provider:result.provider,mode:'practice',source:'third-party',officialJambApi:false,questions:result.questions,pagination:result.pagination,requestedYear:year,requestedExam:examKey,solutionsEnabled:provider==='sdashapi'});
  }catch(error){lastError=error;}
 }
 if(!status.aloc.configured&&!status.sdashapi.configured)return res.status(503).json({error:'Configure ALOC_API_KEY or SDASH_API_TOKEN in the API environment.'});
 const statusCode=lastError?.status||(lastError?.name==='AbortError'?504:502);
 res.status(statusCode).json({error:'The configured past-question providers could not return questions. Please try another year or provider.'});
});
export default router;
