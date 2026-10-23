import crypto from 'node:crypto';
import { Router } from 'express';
import { supabaseAdmin as db } from './db.js';
import { sendEmail } from './mail.js';
import { signToken, requireRole } from './security.js';

const router = Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const normalize = v => String(v || '').trim().toLowerCase();
const hashPassword = password => new Promise((resolve,reject) => crypto.scrypt(password, required('AUTH_PASSWORD_PEPPER'),64,(err,key)=>err?reject(err):resolve(key.toString('hex'))));
const equalHash = (a,b) => {const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y);};
const hashCode = (id,purpose,code) => crypto.createHmac('sha256', required('OTP_SECRET')).update(id+':'+purpose+':'+code).digest('hex');
const required = key => {if(!process.env[key]||process.env[key].length<32)throw Error(key+' must be at least 32 characters');return process.env[key];};
const respond = (res,status,message) => res.status(status).json({error:message});
const delay = () => new Promise(r=>setTimeout(r,300));
const buckets = new Map();
function throttle(req,res,next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  if (buckets.size > 10000) for (const [ip,b] of buckets) if (b.until <= now) buckets.delete(ip);
  const bucket = buckets.get(key);
  if (!bucket || bucket.until <= now) { buckets.set(key,{count:1,until:now+60000}); return next(); }
  if (++bucket.count > 20) {res.set('Retry-After',String(Math.ceil((bucket.until-now)/1000)));return respond(res,429,'Too many requests. Try again shortly.');}
  next();
}
router.use(throttle);
async function issueCode(account,purpose) {
  const {data:last,error:readError}=await db.from('local_auth_challenges').select('created_at').eq('account_id',account.id).eq('purpose',purpose).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(readError)throw readError;
  if(last && Date.now()-new Date(last.created_at).getTime()<60000)throw Object.assign(Error('Wait before requesting another code'),{status:429});
  const code=crypto.randomInt(0,1000000).toString().padStart(6,'0');
  const {error}=await db.from('local_auth_challenges').insert({account_id:account.id,purpose,token_hash:hashCode(account.id,purpose,code),expires_at:new Date(Date.now()+10*60000).toISOString()});
  if(error)throw error;
  await sendEmail({to:account.email,subject:purpose==='signup'?'Your verification code — University Pathway Educational Consult':'Password recovery — University Pathway Educational Consult',text:'Your security code is '+code+'. It expires in 10 minutes. Never share it.',html:'<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#fff;color:#15203b"><div style="font-size:13px;font-weight:bold;letter-spacing:2px;color:#9d1c36">UNIVERSITY PATHWAY</div><h1 style="font-size:25px;margin-top:20px">'+(purpose==='signup'?'Verify your email':'Reset your password')+'</h1><p>Enter this verification code in your student portal:</p><div style="font-size:36px;font-weight:bold;letter-spacing:9px;padding:18px;background:#f4f6fa;text-align:center">'+code+'</div><p>This code expires in 10 minutes. Never share it with anyone.</p><p style="font-size:12px;color:#697586">University Pathway Educational Consult · Automated security email</p></div>'});
}
async function verifyCode(account,purpose,code) {
  const {data:challenge,error}=await db.from('local_auth_challenges').select('*').eq('account_id',account.id).eq('purpose',purpose).is('consumed_at',null).order('created_at',{ascending:false}).limit(1).maybeSingle();
  if(error)throw error;
  if(!challenge || challenge.attempts>=5 || new Date(challenge.expires_at).getTime()<Date.now())return false;
  const {data:updated,error:updateError}=await db.from('local_auth_challenges').update({attempts:challenge.attempts+1}).eq('id',challenge.id).eq('attempts',challenge.attempts).is('consumed_at',null).select('id').maybeSingle();
  if(updateError)throw updateError;
  if(!updated)return false;
  if(!equalHash(challenge.token_hash,hashCode(account.id,purpose,code)))return false;
  const {error:consumeError}=await db.from('local_auth_challenges').update({consumed_at:new Date().toISOString()}).eq('id',challenge.id).is('consumed_at',null);
  if(consumeError)throw consumeError;
  return true;
}
const wrap = fn => (req,res,next)=>Promise.resolve(fn(req,res)).catch(next);
router.post('/register',wrap(async(req,res)=>{
  const {fullName,phone,password}=req.body||{},email=normalize(req.body?.email);
  if(!emailPattern.test(email))return respond(res,400,'Enter a valid email address.');
  if(String(fullName||'').trim().length<2)return respond(res,400,'Enter your full name.');
  if(String(phone||'').trim().length<5)return respond(res,400,'Enter a valid phone number.');
  if(typeof password!=='string'||password.length<10||password.length>128)return respond(res,400,'Password must have at least 10 characters.');
  const password_hash=await hashPassword(password);
  const {data,error}=await db.from('local_accounts').insert({email,full_name:fullName.trim(),phone:phone.trim(),password_hash}).select('id,email').single();
  if(error){if(error.code==='23505')return respond(res,409,'Email already registered');throw error;}
  try{await issueCode(data,'signup');}catch(err){console.error('Registration email delivery failed',err);return res.status(202).json({message:'Account created. Verification email could not be delivered yet; please request another code from the verification screen.',emailPending:true});}
  res.status(201).json({message:'Verification code sent'});
}));
router.post('/resend',wrap(async(req,res)=>{
  const email=normalize(req.body?.email),purpose=req.body?.purpose==='recovery'?'recovery':'signup';
  if(!emailPattern.test(email))return respond(res,400,'Invalid email');
  const {data:account,error}=await db.from('local_accounts').select('id,email,verified_at').eq('email',email).maybeSingle();
  if(error)throw error;
  if(account && (purpose==='recovery'||!account.verified_at))await issueCode(account,purpose);
  res.json({message:'If eligible, a code has been sent'});
}));
router.post('/verify',wrap(async(req,res)=>{
  const email=normalize(req.body?.email),code=String(req.body?.code||''),purpose=req.body?.purpose;
  if(!emailPattern.test(email)||!/^\d{6}$/.test(code)||purpose!=='signup')return respond(res,400,'Invalid verification request');
  const {data:account,error}=await db.from('local_accounts').select('id,email,verified_at').eq('email',email).maybeSingle();
  if(error)throw error;
  if(!account||!(await verifyCode(account,'signup',code)))return respond(res,400,'Invalid or expired code');
  const {error:saveError}=await db.from('local_accounts').update({verified_at:new Date().toISOString()}).eq('id',account.id);
  if(saveError)throw saveError;
  res.json({message:'Email verified'});
}));
router.post('/login',wrap(async(req,res)=>{
  const email=normalize(req.body?.email),password=req.body?.password;
  if(!emailPattern.test(email)||typeof password!=='string')return respond(res,400,'Enter your email address and password.');
  const {data:account,error}=await db.from('local_accounts').select('*').eq('email',email).maybeSingle();
  if(error)throw error;
  const candidate=await hashPassword(password);
  if(!account||!equalHash(account.password_hash,candidate)){await delay();return respond(res,401,'Incorrect email or password.');}
  if(!account.verified_at)return respond(res,403,'Verify your email before signing in');
  res.json({token:signToken({sub:account.id,role:'student'}),user:{id:account.id,email:account.email,fullName:account.full_name,phone:account.phone,isEmailVerified:true}});
}));
router.post('/recover',wrap(async(req,res)=>{
  const email=normalize(req.body?.email);
  if(!emailPattern.test(email))return respond(res,400,'Invalid email');
  const {data:account,error}=await db.from('local_accounts').select('id,email').eq('email',email).maybeSingle();
  if(error)throw error;
  if(account)await issueCode(account,'recovery');
  res.json({message:'If the account exists, a recovery code has been sent'});
}));
router.post('/reset',wrap(async(req,res)=>{
  const email=normalize(req.body?.email),code=String(req.body?.code||''),password=req.body?.password;
  if(!emailPattern.test(email)||!/^\d{6}$/.test(code)||typeof password!=='string'||password.length<10||password.length>128)return respond(res,400,'Invalid recovery request');
  const {data:account,error}=await db.from('local_accounts').select('id,email').eq('email',email).maybeSingle();
  if(error)throw error;
  if(!account||!(await verifyCode(account,'recovery',code)))return respond(res,400,'Invalid or expired code');
  const {error:saveError}=await db.from('local_accounts').update({password_hash:await hashPassword(password)}).eq('id',account.id);
  if(saveError)throw saveError;
  res.json({message:'Password updated'});
}));
router.get('/me',requireRole('student'),wrap(async(req,res)=>{
  const {data,error}=await db.from('local_accounts').select('id,email,full_name,phone,verified_at').eq('id',req.actor.sub).single();
  if(error||!data)return respond(res,401,'Unauthorized');
  res.json({user:{id:data.id,email:data.email,fullName:data.full_name,phone:data.phone,isEmailVerified:!!data.verified_at}});
}));
export default router;
