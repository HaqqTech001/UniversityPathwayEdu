import {Router} from 'express';
import {requireRole} from './security.js';

const router=Router();
router.use(requireRole('student'));
const upstream='https://dev.aloc.com.ng/api/v1';
const subjects=new Set(['english','use-of-english','mathematics','physics','chemistry','biology','government','economics','literature-in-english','commerce','accounting','geography','history','crs','irs','agricultural-science']);
const timeoutMs=8000;
const request=async(path)=>{
 const key=process.env.ALOC_API_KEY;
 if(!key)return {unconfigured:true};
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try{
  const response=await fetch(upstream+path,{headers:{'X-API-Key':key,'Accept':'application/json'},signal:controller.signal});
  if(!response.ok){const error=new Error('Past-question provider unavailable');error.status=502;throw error;}
  return await response.json();
 }finally{clearTimeout(timer);}
};
router.get('/utme/format',(_req,res)=>res.json({exam:'UTME',subjectsPerExam:4,compulsorySubject:'Use of English',englishQuestions:60,otherSubjectQuestions:40,totalQuestions:180,durationMinutes:120,options:['A','B','C','D'],scoringMaximum:400,source:'JAMB examination manual 2024',simulation:true}));
router.get('/utme/provider-status',(_req,res)=>res.json({provider:'ALOC Station',configured:Boolean(process.env.ALOC_API_KEY),source:'third-party',officialJambApi:false,solutionsEnabled:false}));
router.get('/utme/questions',async(req,res,next)=>{
 const subject=String(req.query.subject||'').toLowerCase();
 const year=Number(req.query.year);
 if(!subjects.has(subject)||!Number.isInteger(year)||year<1990||year>2030)return res.status(400).json({error:'Choose a valid subject and examination year.'});
 try{
  const result=await request('/questions?subject='+encodeURIComponent(subject)+'&examType=jamb&year='+year+'&limit=10');
  if(result.unconfigured)return res.status(503).json({error:'Past-question provider has not been configured.'});
  res.json({provider:'ALOC Station',mode:'practice',source:'third-party',officialJambApi:false,questions:result.data||[],pagination:result.pagination||null});
 }catch(error){next(error);}
});
export default router;
