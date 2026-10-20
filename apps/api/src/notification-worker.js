import {supabaseAdmin as db} from './db.js';
import {sendEmail} from './mail.js';
export async function queueEmail({key,to,subject,text}){
 if(!key||!to||!subject||!text)throw Error('Missing notification fields');
 const {error}=await db.from('upec_email_outbox').upsert({dedupe_key:key,recipient:to,subject,body:text},{onConflict:'dedupe_key',ignoreDuplicates:true});
 if(error)throw error;
}
export async function processEmailOutbox(){
 const {data,error}=await db.rpc('upec_claim_notification_emails',{p_limit:10});
 if(error)throw error;
 const results={claimed:(data||[]).length,sent:0,failed:0};
 for(const item of data||[]){
  try{
   await sendEmail({to:item.recipient,subject:item.subject,text:item.body});
   const {error:updateError}=await db.from('upec_email_outbox').update({status:'sent',sent_at:new Date().toISOString(),claimed_until:null,last_error:null}).eq('id',item.id).eq('status','sending').eq('attempts',item.attempts);
   if(updateError)throw updateError;results.sent++;
  }catch(err){
   const next=new Date(Date.now()+Math.min(24,2**item.attempts)*60000).toISOString();
   const failureRecord=await db.from('upec_email_outbox').update({status:item.attempts>=5?'failed':'pending',next_attempt_at:next,claimed_until:null,last_error:String(err?.message||err).slice(0,500)}).eq('id',item.id).eq('status','sending').eq('attempts',item.attempts);
   if(failureRecord.error)throw failureRecord.error;
   results.failed++;
  }
 }
 return results;
}
export async function queueExamReminders(){
 const now=new Date(),future=new Date(now.getTime()+24*3600000);
 const {data:exams,error}=await db.from('upec_assessments').select('id,title,opens_at,restricted').eq('status','published').gte('opens_at',now.toISOString()).lte('opens_at',future.toISOString()).limit(100);
 if(error)throw error;
 let queued=0;
 for(const exam of exams||[]){
  let accounts;
  if(exam.restricted){
   const assigned=await db.from('upec_assessment_eligibility').select('student_account_id').eq('assessment_id',exam.id).limit(200);
   if(assigned.error)throw assigned.error;
   const ids=(assigned.data||[]).map(x=>x.student_account_id);
   if(!ids.length)continue;
   accounts=await db.from('local_accounts').select('id,email').in('id',ids).not('verified_at','is',null);
  }else{
   // Open examination email blasts require an approved enrollment audience.
   continue;
  }
  if(accounts.error)throw accounts.error;
  for(const account of accounts.data||[]){
   if(!account.email)continue;
   await queueEmail({key:'exam:'+exam.id+':'+exam.opens_at+':'+account.id,to:account.email,subject:'UPEC examination reminder — '+exam.title,text:'Your assigned assessment '+exam.title+' opens on '+new Date(exam.opens_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})+'. Sign in to the student portal for details.'});
   queued++;
  }
 }
 return {queued};
}
