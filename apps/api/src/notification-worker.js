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
   const paymentKey=/^fee-due:([0-9a-f-]{36}):(-?3|0|7):(student|guardian)$/i.exec(item.dedupe_key);
   if(paymentKey){
    const {data:bill,error:billError}=await db.from('upec_student_monthly_fees').select('status,amount_due_ngn,amount_paid_ngn').eq('id',paymentKey[1]).maybeSingle();
    if(billError)throw billError;
    const pending=bill?await db.from('upec_monthly_payment_evidence').select('id').eq('monthly_fee_id',paymentKey[1]).eq('review_status','pending').limit(1):{data:[],error:null};
    if(pending.error)throw pending.error;
    if(!bill||!['unpaid','partial'].includes(bill.status)||Number(bill.amount_paid_ngn)>=Number(bill.amount_due_ngn)||pending.data.length){
     const cancelled=await db.from('upec_email_outbox').update({status:'cancelled',claimed_until:null,last_error:'Payment settled or invoice no longer payable before delivery'}).eq('id',item.id).eq('status','sending').eq('attempts',item.attempts);
     if(cancelled.error)throw cancelled.error;
     results.cancelled=(results.cancelled||0)+1;
     continue;
    }
   }
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
   await queueEmail({key:'exam:'+exam.id+':'+exam.opens_at+':'+account.id,to:account.email,subject:'Examination reminder — '+exam.title+' | University Pathway Educational Consult',text:'Your assigned assessment '+exam.title+' opens on '+new Date(exam.opens_at).toLocaleString('en-NG',{timeZone:'Africa/Lagos'})+'. Sign in to the student portal for details.'});
   queued++;
  }
 }
 return {queued};
}
