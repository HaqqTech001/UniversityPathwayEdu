import 'dotenv/config';
import express from 'express';
import localAuth from './local-auth.js';
import studentPortal from './student-portal.js';
import {supabaseAdmin} from './db.js';
import {signToken} from './security.js';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use((req,res,next)=>{const allowed=(process.env.WEB_ORIGINS||'http://localhost:5173,http://localhost:3000').split(',').map(s=>s.trim());const origin=req.headers.origin;if(origin&&allowed.includes(origin)){res.set('Access-Control-Allow-Origin',origin);res.set('Vary','Origin');res.set('Access-Control-Allow-Headers','Content-Type, Authorization');res.set('Access-Control-Allow-Methods','GET,POST,PUT,OPTIONS');}if(req.method==='OPTIONS')return res.sendStatus(origin&&allowed.includes(origin)?204:403);next();});
app.use('/api/auth',localAuth);
app.use('/api/student',studentPortal);
app.get('/health',(_req,res)=>res.json({status:'ok',service:'upec-api'}));
if(process.env.ENABLE_DEV_TOKENS==='true' && process.env.NODE_ENV!=='production'){
  app.post('/api/dev/token',(req,res)=>{
    const {sub,role}=req.body||{};
    if(typeof sub!=='string'||!/^[-\w]{1,100}$/.test(sub)||!['admin','candidate'].includes(role))return res.status(400).json({error:'Invalid test identity'});
    res.json({token:signToken({sub,role})});
  });
}
app.get('/api/backend/status',async(_req,res)=>{ const {error}=await supabaseAdmin.from('profiles').select('id',{head:true,count:'exact'});res.status(error?503:200).json({database:error?'not_ready':'connected',service:'supabase',detail:error?.message}); });
app.use((err,req,res,next)=>{console.error(err);res.status(err.status>=400&&err.status<500?err.status:500).json({error:err.status>=400&&err.status<500?err.message:'Internal server error'});});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log('UPEC API listening on '+port));
