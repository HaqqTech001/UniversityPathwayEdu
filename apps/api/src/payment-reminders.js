import {supabaseAdmin as db} from './db.js';
import {queueEmail} from './notification-worker.js';
const currency=n=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(Number(n));
const isoDay=date=>{const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const get=type=>parts.find(p=>p.type===type)?.value;return [get('year'),get('month'),get('day')].join('-');};
const relativeDate=(day,shift)=>{const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+shift);return date.toISOString().slice(0,10);};
export async function queueMonthlyPaymentReminders(){
 const today=isoDay(new Date());
 const dates=[today,relativeDate(today,3),relativeDate(today,7)];
 const bills=await db.from('upec_student_monthly_fees').select('id,student_account_id,programme_code,due_on,amount_due_ngn,amount_paid_ngn,status').in('due_on',dates).in('status',['unpaid','partial']).order('due_on').limit(500);
 if(bills.error)throw bills.error;
 let queued=0,skipped=0;
 const ids=[...new Set((bills.data||[]).map(b=>b.student_account_id))];
 if(!ids.length)return {queued,skipped};
 const accounts=await db.from('local_accounts').select('id,email,full_name,verified_at').in('id',ids);
 if(accounts.error)throw accounts.error;
 const byId=new Map((accounts.data||[]).map(a=>[a.id,a]));
 for(const bill of bills.data||[]){
  const account=byId.get(bill.student_account_id);
  const outstanding=Number(bill.amount_due_ngn)-Number(bill.amount_paid_ngn);
  if(!account?.verified_at||!account.email||outstanding<=0){skipped++;continue;}
  const remaining=[7,3,0].find(days=>relativeDate(today,days)===bill.due_on);
  if(remaining===undefined)continue;
  const stage=remaining===0?'due today':remaining===3?'due in three days':'due in one week';
  const subject='UPEC Monthly Lesson Fee Reminder — '+stage;
  const text=['Dear '+(account.full_name||'Student')+',','','MONTHLY LESSON FEE REMINDER','',
   'We hope this message finds you well. This is a courteous reminder from University Pathway Educational Consult (UPEC) regarding the upcoming payment for your registered programme.','',
   'Programme: '+bill.programme_code,'Monthly charge: '+currency(bill.amount_due_ngn),'Amount already recorded: '+currency(bill.amount_paid_ngn),
   'Outstanding balance: '+currency(outstanding),'Payment due date: '+bill.due_on,'',
   remaining===0?'The recorded payment due date is today.':'The payment due date is approaching in '+remaining+' days.',
   'If you have already paid and your payment is not reflected in your student portal, please contact the Accounts Office with your payment reference so your record can be reviewed.','',
   'For clarification, kindly contact the UPEC Admissions & Accounts Office through our official channels. Please use only officially confirmed payment instructions.','',
   'Thank you for your cooperation and continued commitment to your studies.','',
   'Yours faithfully,','Admissions & Accounts Office','University Pathway Educational Consult (UPEC)','23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State.'].join('\n');
  await queueEmail({key:'fee-due:'+bill.id+':'+remaining+':student',to:account.email,subject,text});
  queued++;
 }
 return {queued,skipped};
}
