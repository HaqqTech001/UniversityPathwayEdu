import {Router} from 'express';
const router=Router();
const topics=/\b(jamb|utme|waec|neco|nabteb|post[ -]?utme|admission|scholarship|education|university|polytechnic|college|school|student|examination|academic|curriculum|ministry of education|tertiary)\b/i;
const blocked=/\b(entertainment|celebrity|football|premier league|betting|gossip)\b/i;
let cache={until:0,items:[]};
router.get('/education',async(req,res,next)=>{
 if(!process.env.CURRENTS_API_KEY)return res.json({articles:[],configured:false,notice:'Educational news provider not configured.'});
 if(cache.until>Date.now())return res.json({articles:cache.items,configured:true});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await fetch('https://api.currentsapi.services/v2/latest-news?language=en&category=education&page_size=40',{headers:{Authorization:'Bearer '+process.env.CURRENTS_API_KEY},signal:controller.signal});
  if(!response.ok)throw Error('News provider returned '+response.status);
  const body=await response.json();
  const seen=new Set();
  const articles=(Array.isArray(body.news)?body.news:[]).filter(article=>{
   const headline=String(article.title||''),description=String(article.description||'');
   return topics.test(headline+' '+description)&&!blocked.test(headline)&&/^https:\/\//i.test(String(article.url||''));
  }).map(article=>{
   const url=new URL(article.url);
   if(!['https:'].includes(url.protocol)||url.username||url.password)return null;
   return {title:String(article.title||'').slice(0,240),summary:String(article.description||'').slice(0,450),url:url.href,source:String(article.author||url.hostname).slice(0,100),publishedAt:article.published||null};
  }).filter(Boolean).filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true;}).slice(0,18);
  cache={until:Date.now()+15*60*1000,items:articles};
  res.json({articles,configured:true});
 }catch(e){console.error('Education news unavailable',e.message);res.status(503).json({articles:[],error:'Education news is temporarily unavailable.'});}
 finally{clearTimeout(timer);}
});
export default router;
