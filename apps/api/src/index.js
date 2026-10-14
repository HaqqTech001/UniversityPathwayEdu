import 'dotenv/config';
import express from 'express';
import {supabaseAdmin} from './db.js';
import {signToken} from './security.js';
import localAuth from './localAuth.js';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.use('/api/auth',localAuth);
app.get('/health',(_req,res)=>res.json({status:'ok',service:'upec-api'}));
if(process.env.ENABLE_DEV_TOKENS==='true' && process.env.NODE_ENV!=='production'){
  app.post('/api/dev/token',(req,res)=>{
    const {sub,role}=req.body||{};
    if(typeof sub!=='string'||!/^[-\w]{1,100}$/.test(sub)||!['admin','candidate'].includes(role))return res.status(400).json({error:'Invalid test identity'});
    res.json({token:signToken({sub,role})});
  });
}
app.get('/api/backend/status',async(_req,res)=>{ const {error}=await supabaseAdmin.from('profiles').select('id',{head:true,count:'exact'});res.status(error?503:200).json({database:error?'not_ready':'connected',service:'supabase',detail:error?.message}); });
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
const port=Number(process.env.PORT||4000);
app.listen(port,()=>console.log('UPEC API listening on '+port));
