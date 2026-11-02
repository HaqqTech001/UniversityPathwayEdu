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
const studentIdPattern = /^UP\/\d{4}\/\d{3,}$/i;

async function assignStudentId(accountId, regDate = new Date()) {
  const year = regDate.getFullYear();
  try {
    const { data, error } = await db.rpc('upec_assign_student_id', {
      p_account_id: accountId,
      p_year: year,
    });
    if (!error && data) return data;
  } catch (_) {}

  // Database-backed sequential fallback if RPC not installed yet
  const prefix = `UP/${year}/`;
  let nextSerial = 1;
  try {
    const { data: existingList } = await db
      .from('local_accounts')
      .select('student_id')
      .ilike('student_id', `${prefix}%`)
      .order('student_id', { ascending: false })
      .limit(100);

    let maxSerial = 0;
    if (Array.isArray(existingList)) {
      for (const item of existingList) {
        const match = item?.student_id?.match(/^UP\/\d{4}\/(\d+)$/i);
        if (match) {
          const val = parseInt(match[1], 10);
          if (!isNaN(val) && val > maxSerial) maxSerial = val;
        }
      }
    }
    nextSerial = maxSerial + 1;
  } catch (_) {}

  const studentId = `${prefix}${String(nextSerial).padStart(3, '0')}`;

  try {
    await db.from('local_accounts').update({ student_id: studentId }).eq('id', accountId);
  } catch (_) {}

  try {
    await db.from('student_identifiers').upsert({
      account_id: accountId,
      student_id: studentId,
      year,
      serial: nextSerial,
    });
  } catch (_) {}

  return studentId;
}

async function issueCode(account, purpose) {
  const { data: last, error: readError } = await db.from('local_auth_challenges').select('created_at').eq('account_id', account.id).eq('purpose', purpose).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (readError) throw readError;
  if (last && Date.now() - new Date(last.created_at).getTime() < 60000) throw Object.assign(Error('Wait before requesting another code'), { status: 429 });
  const code = crypto.randomInt(0, 1000000).toString().padStart(6, '0');
  const { error } = await db.from('local_auth_challenges').insert({ account_id: account.id, purpose, token_hash: hashCode(account.id, purpose, code), expires_at: new Date(Date.now() + 10 * 60000).toISOString() });
  if (error) throw error;

  const studentId = account.student_id || account.studentId || '';
  const studentIdHtml = (purpose === 'signup' && studentId) ? `
    <div style="margin:20px 0;padding:18px 20px;background:#f0f4ff;border:1px solid #c9d8ff;border-radius:10px">
      <div style="font-size:11px;font-weight:bold;letter-spacing:1px;color:#123578;text-transform:uppercase">Official Student ID</div>
      <div style="font-size:26px;font-weight:bold;color:#111A43;letter-spacing:2px;margin:6px 0;font-family:monospace">${studentId}</div>
      <p style="font-size:12px;color:#3b4a6b;margin:0">Keep this Student ID safe. You can use either this Student ID (${studentId}) or your registered email address to sign in to your student portal.</p>
    </div>` : '';

  const studentIdText = (purpose === 'signup' && studentId) ? `\n\nYour official Student ID is: ${studentId}\nYou can use this Student ID or your email address to sign in to your student portal.\n` : '';

  await sendEmail({
    to: account.email,
    subject: purpose === 'signup' ? `Your verification code & Student ID (${studentId || 'UPEC'}) — University Pathway` : 'Password recovery — University Pathway Educational Consult',
    text: `Your security code is ${code}. It expires in 10 minutes. Never share it.${studentIdText}`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;background:#fff;color:#15203b"><div style="font-size:13px;font-weight:bold;letter-spacing:2px;color:#9d1c36">UNIVERSITY PATHWAY EDUCATIONAL CONSULT</div><h1 style="font-size:25px;margin-top:20px">${purpose === 'signup' ? 'Welcome & Verify Your Email' : 'Reset Your Password'}</h1>${studentIdHtml}<p>Enter this verification code in your student portal to activate your account:</p><div style="font-size:36px;font-weight:bold;letter-spacing:9px;padding:18px;background:#f4f6fa;text-align:center;color:#111A43;border-radius:8px">${code}</div><p style="margin-top:16px">This code expires in 10 minutes. Never share it with anyone.</p><p style="font-size:12px;color:#697586;margin-top:24px;border-top:1px solid #eee;padding-top:16px">University Pathway Educational Consult · Automated security email</p></div>`,
  });
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

  // Concurrency-safe immediate Student ID generation
  let studentId = '';
  try {
    studentId = await assignStudentId(data.id);
    data.student_id = studentId;
  } catch (idErr) {
    console.error('Student ID generation fallback issue:', idErr);
  }

  try{await issueCode({...data, student_id: studentId},'signup');}catch(err){console.error('Registration email delivery failed',err);return res.status(202).json({message:'Account created. Verification email could not be delivered yet; please request another code from the verification screen.',studentId,emailPending:true});}
  res.status(201).json({message:'Verification code sent',studentId});
}));
router.post('/resend',wrap(async(req,res)=>{
  const rawIdentifier=String(req.body?.email||req.body?.identifier||'').trim();
  const purpose=req.body?.purpose==='recovery'?'recovery':'signup';
  let account = null;
  if (studentIdPattern.test(rawIdentifier)) {
    const {data} = await db.from('local_accounts').select('id,email,verified_at,student_id').ilike('student_id', rawIdentifier.toUpperCase()).maybeSingle();
    account = data;
  } else {
    const email = normalize(rawIdentifier);
    if(!emailPattern.test(email))return respond(res,400,'Invalid email or Student ID');
    const {data,error}=await db.from('local_accounts').select('id,email,verified_at,student_id').eq('email',email).maybeSingle();
    if(error)throw error;
    account = data;
  }
  if(account && (purpose==='recovery'||!account.verified_at))await issueCode(account,purpose);
  res.json({message:'If eligible, a code has been sent'});
}));
router.post('/verify',wrap(async(req,res)=>{
  const email=normalize(req.body?.email),code=String(req.body?.code||''),purpose=req.body?.purpose;
  if(!emailPattern.test(email)||!/^\d{6}$/.test(code)||purpose!=='signup')return respond(res,400,'Invalid verification request');
  const {data:account,error}=await db.from('local_accounts').select('id,email,verified_at,student_id').eq('email',email).maybeSingle();
  if(error)throw error;
  if(!account||!(await verifyCode(account,'signup',code)))return respond(res,400,'Invalid or expired code');
  
  let studentId = account.student_id;
  if (!studentId) {
    try { studentId = await assignStudentId(account.id); } catch (_) {}
  }
  
  const {error:saveError}=await db.from('local_accounts').update({verified_at:new Date().toISOString()}).eq('id',account.id);
  if(saveError)throw saveError;
  res.json({message:'Email verified', studentId: studentId || null});
}));
router.post('/login',wrap(async(req,res)=>{
  const rawIdentifier=String(req.body?.identifier||req.body?.email||'').trim();
  const password=req.body?.password;
  if(!rawIdentifier||typeof password!=='string')return respond(res,400,'Enter your email address or Student ID, and your password.');

  let account = null;
  const isStudentId = studentIdPattern.test(rawIdentifier);

  if (isStudentId) {
    const upperId = rawIdentifier.toUpperCase();
    let {data, error} = await db.from('local_accounts').select('*').ilike('student_id', upperId).maybeSingle();
    if (error && error.code !== '42703') throw error;
    account = data;

    if (!account) {
      try {
        const { data: identRow } = await db.from('student_identifiers').select('account_id').ilike('student_id', upperId).maybeSingle();
        if (identRow?.account_id) {
          const accRes = await db.from('local_accounts').select('*').eq('id', identRow.account_id).maybeSingle();
          account = accRes.data;
        }
      } catch (_) {}
    }
  } else {
    const email=normalize(rawIdentifier);
    if(!emailPattern.test(email))return respond(res,400,'Enter a valid email address or Student ID in UP/YYYY/SERIAL format.');
    const {data,error}=await db.from('local_accounts').select('*').eq('email',email).maybeSingle();
    if(error)throw error;
    account = data;
  }

  const candidate=await hashPassword(password);
  // Constant-time check to prevent timing and enumeration attacks
  const passwordsMatch = account ? equalHash(account.password_hash, candidate) : false;

  if(!account || !passwordsMatch){
    await delay();
    return respond(res,401,'Incorrect email/Student ID or password.');
  }
  if(!account.verified_at)return respond(res,403,'Verify your email before signing in');

  let studentId = account.student_id;
  if (!studentId) {
    try { studentId = await assignStudentId(account.id, new Date(account.created_at || Date.now())); } catch (_) {}
  }

  res.json({
    token:signToken({sub:account.id,role:'student'}),
    user:{
      id:account.id,
      studentId:studentId || null,
      email:account.email,
      fullName:account.full_name,
      phone:account.phone,
      isEmailVerified:true
    }
  });
}));
router.post('/resolve-identifier',wrap(async(req,res)=>{
  const identifier=String(req.body?.identifier||'').trim();
  const password=req.body?.password;
  if(!identifier)return respond(res,400,'Identifier is required.');

  if(typeof password==='string'){
    let account = null;
    if(studentIdPattern.test(identifier)){
      const upperId = identifier.toUpperCase();
      const {data} = await db.from('local_accounts').select('id,email,password_hash').ilike('student_id',upperId).maybeSingle();
      account = data;
    } else {
      const email = normalize(identifier);
      const {data} = await db.from('local_accounts').select('id,email,password_hash').eq('email',email).maybeSingle();
      account = data;
    }
    const candidate=await hashPassword(password);
    const valid = account && equalHash(account.password_hash, candidate);
    if(!valid){
      await delay();
      return respond(res,401,'Invalid login credentials.');
    }
    return res.json({resolved:true, email:account.email});
  }

  // Without password: check format only without disclosing account existence
  if(studentIdPattern.test(identifier)){
    return res.json({validFormat:true, type:'student_id'});
  }
  if(emailPattern.test(normalize(identifier))){
    return res.json({validFormat:true, type:'email'});
  }
  return respond(res,400,'Format must be a valid email or Student ID (UP/YYYY/SERIAL).');
}));
router.post('/recover',wrap(async(req,res)=>{
  const rawIdentifier=String(req.body?.email||req.body?.identifier||'').trim();
  let account = null;
  if(studentIdPattern.test(rawIdentifier)){
    const {data} = await db.from('local_accounts').select('id,email,student_id').ilike('student_id', rawIdentifier.toUpperCase()).maybeSingle();
    account = data;
  } else {
    const email=normalize(rawIdentifier);
    if(!emailPattern.test(email))return respond(res,400,'Invalid email or Student ID');
    const {data,error}=await db.from('local_accounts').select('id,email,student_id').eq('email',email).maybeSingle();
    if(error)throw error;
    account = data;
  }
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
  let {data,error}=await db.from('local_accounts').select('id,email,full_name,phone,verified_at,student_id').eq('id',req.actor.sub).single();
  if(error && error.code==='42703'){
    const fallback=await db.from('local_accounts').select('id,email,full_name,phone,verified_at').eq('id',req.actor.sub).single();
    data=fallback.data;
    error=fallback.error;
  }
  if(error||!data)return respond(res,401,'Unauthorized');
  res.json({user:{id:data.id,studentId:data.student_id||null,email:data.email,fullName:data.full_name,phone:data.phone,isEmailVerified:!!data.verified_at}});
}));
export default router;
