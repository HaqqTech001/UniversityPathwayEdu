import {Router} from 'express';
const router=Router();
const topics=/\b(jamb|utme|waec|neco|nabteb|post[ -]?utme|admission|scholarship|education|university|polytechnic|college|school|student|examination|academic|curriculum|ministry of education|tertiary)\b/i;
const blocked=/\b(entertainment|celebrity|football|premier league|betting|gossip)\b/i;
let cache={until:0,items:[]};
router.get('/education',async(req,res,next)=>{
 if(!process.env.NEWSDATA_API_KEY&&!process.env.CURRENTS_API_KEY)return res.json({articles:[],configured:false,notice:'Educational news provider not configured.'});
 if(cache.until>Date.now())return res.json({articles:cache.items,configured:true});
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
 try{
  const useNewsData=Boolean(process.env.NEWSDATA_API_KEY);
  const endpoint=useNewsData?new URL('https://newsdata.io/api/1/latest'):new URL('https://api.currentsapi.services/v2/latest-news');
  if(useNewsData){endpoint.searchParams.set('apikey',process.env.NEWSDATA_API_KEY);endpoint.searchParams.set('country','ng');endpoint.searchParams.set('category','education');endpoint.searchParams.set('language','en');endpoint.searchParams.set('size','10');}
  else{endpoint.searchParams.set('language','en');endpoint.searchParams.set('category','education');endpoint.searchParams.set('page_size','40');}
  const response=await fetch(endpoint,{headers:useNewsData?{}:{Authorization:'Bearer '+process.env.CURRENTS_API_KEY},signal:controller.signal});
  if(!response.ok)throw Error('News provider returned '+response.status);
  const body=await response.json();
  const seen=new Set();
  const articles=(Array.isArray(useNewsData?body.results:body.news)?(useNewsData?body.results:body.news):[]).filter(article=>{
   const headline=String(article.title||''),description=String(article.description||'');
   return topics.test(headline+' '+description)&&!blocked.test(headline)&&/^https:\/\//i.test(String((useNewsData?article.link:article.url)||''));
  }).map(article=>{
   const url=new URL(useNewsData?article.link:article.url);
   if(!['https:'].includes(url.protocol)||url.username||url.password)return null;
   return {title:String(article.title||'').slice(0,240),summary:String(article.description||'').slice(0,450),url:url.href,source:String((useNewsData?article.source_name:article.author)||url.hostname).slice(0,100),publishedAt:(useNewsData?article.pubDate:article.published)||null};
  }).filter(Boolean).filter(item=>{if(seen.has(item.url))return false;seen.add(item.url);return true;}).slice(0,18);
  cache={until:Date.now()+60*60*1000,items:articles};
  res.json({articles,configured:true});
 }catch(e){console.error('Education news unavailable',e.message);res.status(503).json({articles:[],error:'Education news is temporarily unavailable.'});}
 finally{clearTimeout(timer);}
});
export default router;
