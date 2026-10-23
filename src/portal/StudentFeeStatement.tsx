import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
type Entry={id:string;programme_code:string;status:string;charge:number;paid:number;period:string;category:'Registration'|'Monthly lessons'};
const money=(n:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(n);
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentFeeStatement(){
 const [entries,setEntries]=useState<Entry[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const load=async()=>{
  setLoading(true);setError('');
  try{
   const token=getStudentToken();if(!token)throw Error('Sign in to view your statement.');
   const headers={Authorization:'Bearer '+token};
   const [r,m]=await Promise.all([fetch(base+'/api/student/finance/registration-invoices',{headers}),fetch(base+'/api/student/finance/monthly-fees',{headers})]);
   if(!r.ok||!m.ok)throw Error('Unable to load your complete fee statement.');
   const [registration,monthly]=await Promise.all([r.json(),m.json()]);
   const a:Entry[]=(registration.invoices||[]).map((x:any)=>({id:x.id,programme_code:x.programme_code,period:x.academic_session,charge:Number(x.fee_amount_ngn),paid:Number(x.amount_paid_ngn),status:x.status,category:'Registration'}));
   const b:Entry[]=(monthly.fees||[]).map((x:any)=>({id:x.id,programme_code:x.programme_code,period:x.billing_month,charge:Number(x.amount_due_ngn),paid:Number(x.amount_paid_ngn),status:x.status,category:'Monthly lessons'}));
   setEntries([...a,...b]);
  }catch(e){setError(e instanceof Error?e.message:'Unable to load statement.');}finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[]);
 const total=entries.reduce((n,x)=>n+x.charge,0),paid=entries.reduce((n,x)=>n+x.paid,0);
 const print=()=>window.print();
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="fee-statement-title">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-[#C62839]">UPEC · STUDENT FINANCE</p><h2 id="fee-statement-title" className="mt-1 text-xl font-extrabold text-[#111A43]">My Fee Statement</h2><p className="mt-2 text-sm text-slate-600">A summary of issued registration and monthly lesson invoices. Figures reflect payments entered by the accounts office.</p></div><div className="flex gap-2 print:hidden"><button type="button" onClick={()=>void load()} disabled={loading} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-[#111A43]">Refresh</button><button type="button" disabled={loading||!!error||!entries.length} onClick={print} className="rounded-xl bg-[#111A43] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Print statement</button></div></div>
  <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">This is an account statement, not an official bank receipt or proof that an unverified transfer has cleared.</p>
  {error&&<p role="alert" className="mt-4 text-red-700">{error}</p>}
  {loading?<p className="mt-5">Loading your statement…</p>:!error&&entries.length===0?<p className="mt-5 text-slate-600">No invoices have been issued to your account.</p>:!error&&<><div className="mt-5 grid gap-3 sm:grid-cols-3">{[['Total billed',total],['Payments recorded',paid],['Outstanding',Math.max(0,total-paid)]].map(([label,n])=><div key={String(label)} className="rounded-xl border border-slate-200 bg-[#F7F8FC] p-4"><p className="text-xs font-semibold text-slate-600">{label}</p><p className="mt-1 font-extrabold text-[#111A43]">{money(Number(n))}</p></div>)}</div>{(['Registration','Monthly lessons'] as const).map(category=><div key={category} className="mt-6"><h3 className="font-bold text-[#111A43]">{category}</h3><div className="mt-3 overflow-x-auto"><table className="w-full min-w-[550px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Programme</th><th className="p-3">Session / Month</th><th className="p-3">Charge</th><th className="p-3">Paid</th><th className="p-3">Balance</th><th className="p-3">Status</th></tr></thead><tbody>{entries.filter(e=>e.category===category).map(e=><tr key={e.id} className="border-b"><td className="p-3">{e.programme_code}</td><td className="p-3">{e.period}</td><td className="p-3">{money(e.charge)}</td><td className="p-3">{money(e.paid)}</td><td className="p-3">{money(Math.max(0,e.charge-e.paid))}</td><td className="p-3 capitalize">{e.status}</td></tr>)}</tbody></table>{!entries.some(e=>e.category===category)&&<p className="p-3 text-sm text-slate-500">No {category.toLowerCase()} invoices.</p>}</div></div>)}</>}
 </section>;
}
