import {Router} from 'express';
import {randomInt,randomBytes,scrypt as scryptCb,createHmac,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
import {supabaseAdmin as db} from './db.js';
import {sendEmail} from './mail.js';
import {signToken,requireRole} from './security.js';
const scrypt=promisify(scryptCb),router=Router(),hits=new Map();
const emailOf=v=>String(v||'').trim().toLowerCase();
const validEmail=v=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&v.length<255;
const validPass=v=>typeof v==='string'&&v.length>=12&&v.length<=128;
function secret(){const s=process.env.OTP_SECRET||process.env.JWT_SECRET;if(!s||s.length<32)throw Error('OTP secret missing');return s;}
function otpHash(id,purpose,code){return createHmac('sha256',secret()).update(id+':'+purpose+':'+code).digest('hex');}
async function passwordHash(pass){const salt=randomBytes(16).toString('hex');return salt+':'+(await scrypt(pass,salt,64)).toString('hex');}
async function passwordMatches(pass,stored){try{const [salt,hex]=stored.split(':');const expected=Buffer.from(hex,'hex'),actual=await scrypt(pass,salt,expected.length);return timingSafeEqual(expected,actual);}catch{return false;}}
async function findAccount(email){const {data,error}=await db.from('local_accounts').select('*').eq('email',email).maybeSingle();if(error)throw error;return data;}
async function sendCode(account,purpose){
 const code=String(randomInt(0,1000000)).padStart(6,'0');
 const {error}=await db.from('local_auth_challenges').insert({account_id:account.id,purpose,token_hash:otpHash(account.id,purpose,code),expires_at:new Date(Date.now()+600000).toISOString()});
 if(error)throw error;
 await sendEmail({to:account.email,subject:purpose==='signup'?'Verify your UPEC account':'Reset your UPEC password',text:'Your UPEC verification code is '+code+'. It expires in 10 minutes. Never share it.'});
}
async function checkCode(account,purpose,code){
 if(!/^\d{6}$/.test(String(code||'')))return false;
 const {data,error}=await db.from('local_auth_challenges').select('*').eq('account_id',account.id).eq('purpose',purpose).is('consumed_at',null).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(error)throw error;
 if(!data||data.attempts>=5||Date.parse(data.expires_at)<Date.now())return false;
 const {data:attempt,error:attemptError}=await db.from('local_auth_challenges').update({attempts:data.attempts+1}).eq('id',data.id).eq('attempts',data.attempts).select('id');
 if(attemptError)throw attemptError;
 if(attempt?.length!==1)return false;
 const expected=Buffer.from(data.token_hash,'hex'),actual=Buffer.from(otpHash(account.id,purpose,String(code)),'hex');
 if(expected.length!==actual.length||!timingSafeEqual(expected,actual))return false;
 const {data:used,error:usedError}=await db.from('local_auth_challenges').update({consumed_at:new Date().toISOString()}).eq('id',data.id).is('consumed_at',null).select('id');
 if(usedError)throw usedError;
 return used?.length===1;
}
router.use((req,res,next)=>{
 const key=(req.ip||'unknown')+':'+req.path,now=Date.now(),old=hits.get(key);
 if(hits.size>10000)for(const [k,v] of hits)if(v.until<now)hits.delete(k);
 const item=old&&old.until>now?old:{count:0,until:now+900000};item.count++;hits.set(key,item);
 if(item.count>15)return res.status(429).json({error:'Too many requests. Try again later.'});
 next();
});
router.post('/register',async(req,res)=>{
 try{
 const email=emailOf(req.body?.email),{fullName,phone,password}=req.body||{};
 if(!validEmail(email)||!validPass(password)||typeof fullName!=='string'||fullName.trim().length<2||fullName.length>150||typeof phone!=='string'||phone.trim().length<5||phone.length>30)return res.status(400).json({error:'Provide valid details and a password of at least 12 characters.'});
 if(await findAccount(email))return res.status(409).json({error:'Email already registered.'});
 const {data,error}=await db.from('local_accounts').insert({email,full_name:fullName.trim(),phone:phone.trim(),password_hash:await passwordHash(password)}).select('*').single();
 if(error){if(error.code==='23505')return res.status(409).json({error:'Email already registered.'});throw error;}
 await sendCode(data,'signup');return res.status(201).json({message:'Check your inbox for your six-digit code.'});
 }catch(e){console.error('register',e.message);return res.status(503).json({error:'Registration unavailable.'});}
});
router.post('/verify-email',async(req,res)=>{
 try{const account=await findAccount(emailOf(req.body?.email));if(!account||account.verified_at||!await checkCode(account,'signup',req.body?.code))return res.status(400).json({error:'Invalid or expired code.'});
 const {error}=await db.from('local_accounts').update({verified_at:new Date().toISOString()}).eq('id',account.id);if(error)throw error;return res.json({message:'Verified. Sign in now.'});
 }catch(e){console.error('verify',e.message);return res.status(503).json({error:'Verification unavailable.'});}
});
router.post('/login',async(req,res)=>{
 try{const account=await findAccount(emailOf(req.body?.email));if(!account||!await passwordMatches(req.body?.password||'',account.password_hash))return res.status(401).json({error:'Invalid email or password.'});
 if(!account.verified_at)return res.status(403).json({error:'Verify your email first.'});
 return res.json({token:signToken({sub:account.id,role:'student'}),user:{id:account.id,email:account.email,fullName:account.full_name,phone:account.phone,isEmailVerified:true}});
 }catch(e){console.error('login',e.message);return res.status(503).json({error:'Login unavailable.'});}
});
router.post('/send-code',async(req,res)=>{
 try{const purpose=req.body?.purpose==='recovery'?'recovery':'signup',email=emailOf(req.body?.email);if(!validEmail(email))return res.status(400).json({error:'Invalid email.'});
 const account=await findAccount(email);
 if(account&&((purpose==='signup'&&!account.verified_at)||(purpose==='recovery'&&account.verified_at))){
 const {data,error}=await db.from('local_auth_challenges').select('created_at').eq('account_id',account.id).eq('purpose',purpose).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(error)throw error;
 if(!data||Date.now()-Date.parse(data.created_at)>=60000)await sendCode(account,purpose);
 }
 return res.json({message:'If eligible, a code will be sent shortly.'});
 }catch(e){console.error('send-code',e.message);return res.status(503).json({error:'Unable to send code.'});}
});
router.post('/reset-password',async(req,res)=>{
 try{const account=await findAccount(emailOf(req.body?.email));if(!account||!account.verified_at||!validPass(req.body?.password)||!await checkCode(account,'recovery',req.body?.code))return res.status(400).json({error:'Invalid code or password.'});
 const {error}=await db.from('local_accounts').update({password_hash:await passwordHash(req.body.password),updated_at:new Date().toISOString()}).eq('id',account.id);if(error)throw error;return res.json({message:'Password changed.'});
 }catch(e){console.error('reset',e.message);return res.status(503).json({error:'Password reset unavailable.'});}
});
router.get('/me',requireRole('student'),async(req,res)=>{
 const {data,error}=await db.from('local_accounts').select('id,email,full_name,phone,verified_at').eq('id',req.actor.sub).maybeSingle();
 if(error||!data)return res.status(401).json({error:'Unauthorized'});
 return res.json({id:data.id,email:data.email,fullName:data.full_name,phone:data.phone,isEmailVerified:!!data.verified_at});
});
export default router;
