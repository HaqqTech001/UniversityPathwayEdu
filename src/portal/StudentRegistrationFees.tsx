import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
type Invoice={id:string;programme_code:string;academic_session:string;fee_amount_ngn:number;amount_paid_ngn:number;status:string;created_at:string};
const money=(amount:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(Number(amount));
export default function StudentRegistrationFees(){
 const [invoices,setInvoices]=useState<Invoice[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const [reloadKey,setReloadKey]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  const load=async()=>{
   setLoading(true);setError('');
   try{
    const token=getStudentToken();if(!token)throw Error('Please sign in again.');
    const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\\/$/,'')+'/api/student/finance/registration-invoices',{headers:{Authorization:'Bearer '+token},signal:controller.signal});
    const result=await response.json();
    if(!response.ok)throw Error(result.error||'Unable to load registration invoices.');
    if(!controller.signal.aborted)setInvoices(result.invoices||[]);
   }catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load registration invoices.');}
   finally{if(!controller.signal.aborted)setLoading(false);}
  };
  void load();
  return()=>controller.abort();
 },[reloadKey]);
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="registration-fees-title"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="registration-fees-title" className="text-xl font-extrabold text-[#111A43]">Programme Registration Fees</h2><p className="mt-2 text-sm text-slate-600">Registration fees are billed separately from your monthly lesson fees. Only verified payments recorded by the accounts office appear as paid.</p></div><button type="button" onClick={()=>setReloadKey(key=>key+1)} disabled={loading} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-[#111A43] disabled:opacity-50">{loading?'Loading…':'Refresh'}</button></div>
 {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{loading?<p className="mt-4">Loading registration bills…</p>:invoices.length===0?<p className="mt-4 text-sm text-slate-600">No programme registration invoice has been issued to your account yet.</p>:<div className="mt-5 overflow-x-auto"><table className="min-w-[620px] w-full text-left text-sm"><thead><tr className="border-b border-slate-200"><th className="p-3">Programme</th><th className="p-3">Session</th><th className="p-3">Charge</th><th className="p-3">Verified paid</th><th className="p-3">Balance</th><th className="p-3">Status</th></tr></thead><tbody>{invoices.map(i=><tr key={i.id} className="border-b border-slate-100"><td className="p-3 font-semibold text-[#111A43]">{i.programme_code}</td><td className="p-3">{i.academic_session}</td><td className="p-3">{money(i.fee_amount_ngn)}</td><td className="p-3">{money(i.amount_paid_ngn)}</td><td className="p-3 font-bold">{money(Math.max(0,Number(i.fee_amount_ngn)-Number(i.amount_paid_ngn)))}</td><td className="p-3 capitalize">{i.status}</td></tr>)}</tbody></table></div>}</section>;
}
