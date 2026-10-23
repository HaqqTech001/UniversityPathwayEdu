import {queueMonthlyPaymentReminders} from './payment-reminders.js';
import educationNews from './education-news.js';
import {queueExamReminders,processEmailOutbox} from './notification-worker.js';
import publicBlog from './public-blog.js';
import 'dotenv/config';
import express from 'express';
import localAuth from './local-auth.js';
import studentPortal from './student-portal.js';
import staffPortal from './staff-portal.js';
import {supabaseAdmin} from './db.js';
import {signToken} from './security.js';
import {getMailer} from './mail.js';
const requiredSecrets=['JWT_SECRET','OTP_SECRET','AUTH_PASSWORD_PEPPER'];
const invalidSecrets=requiredSecrets.filter(key=>!process.env[key]||process.env[key].trim().length<32||process.env[key].startsWith('replace_with_'));
if(invalidSecrets.length){console.error('UPEC startup blocked: configure '+invalidSecrets.join(', ')+' in apps/api/.env (each requires a distinct random value of at least 32 characters).');process.exit(1);}
try{getMailer();if(!process.env.MAIL_FROM||process.env.MAIL_FROM.includes('youraddress'))throw Error('MAIL_FROM is not configured');}catch(error){console.error('UPEC startup blocked: '+error.message);process.exit(1);}

const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{const allowed=(process.env.WEB_ORIGINS||'http://localhost:5173,http://localhost:3000').split(',').map(s=>s.trim());const origin=req.headers.origin;if(origin&&allowed.includes(origin)){res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');res.set('Access-Control-Allow-Headers','Content-Type, Authorization');res.set('Access-Control-Allow-Methods','GET,POST,PUT,PATCH,OPTIONS');}if(req.method==='OPTIONS')return res.sendStatus(origin&&allowed.includes(origin)?204:403);next();});
app.use('/api/blog',publicBlog);
app.use('/api/news',educationNews);
app.use('/api/auth',localAuth);
app.use('/api/student',studentPortal);
app.use('/api/staff',staffPortal);
app.post('/api/internal/notifications/process',async(req,res)=>{
 const expected=process.env.NOTIFICATION_WORKER_SECRET;
 const token=req.headers.authorization;
 if(!expected||expected.length<32||token!=='Bearer '+expected)return res.status(403).json({error:'Forbidden'});
 try{
  let reminders={queued:0,skipped:false};
  try{reminders=await queueExamReminders();}
  catch(error){console.error('Exam reminder queue unavailable:',error);reminders={queued:0,skipped:true};}
  let paymentReminders={queued:0,skipped:0};
  try{paymentReminders=await queueMonthlyPaymentReminders();}
  catch(error){console.error('Payment reminder queue unavailable:',error);paymentReminders={queued:0,skipped:true};}
  const delivery=await processEmailOutbox();
  res.json({reminders,paymentReminders,delivery});
 }catch(error){console.error('Notification worker failed',error);res.status(503).json({error:'Notification worker unavailable'});}
});
app.get('/health',(_req,res)=>res.json({status:'ok',service:'upec-api'}));
if(process.env.ENABLE_DEV_TOKENS==='true' && process.env.NODE_ENV!=='production'){
  app.post('/api/dev/token',(req,res)=>{
    const {sub,role}=req.body||{};
    if(typeof sub!=='string'||!/^[-\w]{1,100}$/.test(sub)||!['admin','candidate'].includes(role))return res.status(400).json({error:'Invalid test identity'});
    res.json({token:signToken({sub,role})});
  });
}
app.get('/api/backend/status',async(_req,res)=>{ const {error}=await supabaseAdmin .from('local_accounts').select('id',{head:true,count:'exact'});res.status(error?503:200).json({database:error?'not_ready':'connected',service:'supabase',detail:error?.message}); });
app.use((err,req,res,next)=>{
 console.error(err);
 const raw=String(err?.message||'')+' '+String(err?.details||'')+' '+String(err?.cause?.message||'');
 const networkFailure=/fetch failed|ConnectTimeoutError|UND_ERR_CONNECT_TIMEOUT|ECONNRESET|ETIMEDOUT|ENOTFOUND|EAI_AGAIN/i.test(raw);
 if(networkFailure)return res.status(503).json({error:'The database connection is temporarily unavailable. Your changes were not confirmed as saved. Please check the connection and retry.',code:'DATABASE_CONNECTION_UNAVAILABLE',retryable:true});
 const status=err?.status>=400&&err.status<500?err.status:500;
 res.status(status).json({error:status===500?'Internal server error':err.message});
});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log('UPEC API listening on '+port));
