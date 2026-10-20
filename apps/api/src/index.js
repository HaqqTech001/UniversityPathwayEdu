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
app.use('/api/auth',localAuth);
app.use('/api/student',studentPortal);
app.use('/api/staff',staffPortal);
app.get('/health',(_req,res)=>res.json({status:'ok',service:'upec-api'}));
if(process.env.ENABLE_DEV_TOKENS==='true' && process.env.NODE_ENV!=='production'){
  app.post('/api/dev/token',(req,res)=>{
    const {sub,role}=req.body||{};
    if(typeof sub!=='string'||!/^[-\w]{1,100}$/.test(sub)||!['admin','candidate'].includes(role))return res.status(400).json({error:'Invalid test identity'});
    res.json({token:signToken({sub,role})});
  });
}
app.get('/api/backend/status',async(_req,res)=>{ const {error}=await supabaseAdmin .from('local_accounts').select('id',{head:true,count:'exact'});res.status(error?503:200).json({database:error?'not_ready':'connected',service:'supabase',detail:error?.message}); });
app.use((err,req,res,next)=>{console.error(err);res.status(err.status>=400&&err.status<500?err.status:500).json({error:err.status>=400&&err.status<500?err.message:'Internal server error'});});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log('UPEC API listening on '+port));
