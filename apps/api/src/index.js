import 'dotenv/config';
import express from 'express';
import {initializeDatabase} from './db.js';
import rooms from './rooms.js';
import {signToken} from './security.js';
const app=express();
app.disable('x-powered-by');
app.use(express.json({limit:'32kb'}));
app.get('/health',(_req,res)=>res.json({status:'ok',service:'upec-api'}));
if(process.env.ENABLE_DEV_TOKENS==='true' && process.env.NODE_ENV!=='production'){
  app.post('/api/dev/token',(req,res)=>{
    const {sub,role}=req.body||{};
    if(typeof sub!=='string'||!/^[-\w]{1,100}$/.test(sub)||!['admin','candidate'].includes(role))return res.status(400).json({error:'Invalid test identity'});
    res.json({token:signToken({sub,role})});
  });
}
app.use('/api/cbt',rooms);
app.use((err,req,res,next)=>{console.error(err);res.status(500).json({error:'Internal server error'});});
const port=Number(process.env.PORT||4000);
initializeDatabase().then(()=>app.listen(port,()=>console.log('UPEC API listening on '+port))).catch(err=>{console.error('Database initialization failed',err);process.exit(1);});
