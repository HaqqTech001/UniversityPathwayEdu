import React,{useEffect,useState} from 'react';
type Application={id:string;reference_number:string;programme:string;academic_session:string;status:string;account_id:string};
type Invoice={id:string;student_account_id:string;programme_code:string;academic_session:string;fee_amount_ngn:number;amount_paid_ngn:number;status:string};
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/finance';
const headers=()=>({Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')});
async function json(response:Response){const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed.');return data;}
const money=(n:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
export default function RegistrationInvoiceManager(){
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [query,setQuery]=useState('');
  const [results,setResults]=useState<Application[]>([]);
  const [selected,setSelected]=useState('');
  const [paymentId,setPaymentId]=useState('');
  const [amount,setAmount]=useState('');
  const [reference,setReference]=useState('');
  const [busy,setBusy]=useState(false);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();setLoading(true);
    (async()=>{try{const data=await json(await fetch(base+'/registration-invoices',{headers:headers(),signal:controller.signal}));if(!controller.signal.aborted)setInvoices(data.invoices||[]);}
      catch(e){if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load invoices.');}
      finally{if(!controller.signal.aborted)setLoading(false);}})();
    return()=>controller.abort();
  },[reload]);
  const search=async(event:React.FormEvent)=>{
    event.preventDefault();setError('');setResults([]);setSelected('');
    if(query.trim().length<3){setError('Enter at least three characters of the application reference.');return;}
    setBusy(true);
    try{const data=await json(await fetch(base+'/application-search?q='+encodeURIComponent(query.trim()),{headers:headers()}));setResults(data.applications||[]);}
    catch(e){setError(e instanceof Error?e.message:'Search failed.');}
    finally{setBusy(false);}
  };
  const create=async()=>{
    if(!selected||busy)return;
    if(!window.confirm('Create registration invoice for selected application?'))return;
    setBusy(true);setError('');setNotice('');
    try{await json(await fetch(base+'/registration-invoices',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({applicationId:selected})}));
      setNotice('Registration invoice created.');setReload(n=>n+1);setSelected('');}
    catch(e){setError(e instanceof Error?e.message:'Invoice creation failed.');}
    finally{setBusy(false);}
  };
  const post=async(event:React.FormEvent)=>{
    event.preventDefault();
    const amountNgn=Number(amount);
    if(!Number.isFinite(amountNgn)||amountNgn<=0||reference.trim().length<5){setError('Enter a valid amount and bank reference.');return;}
    if(!window.confirm('Confirm you independently verified the bank transfer of '+money(amountNgn)+'? This records a real payment.'))return;
    setBusy(true);setError('');setNotice('');
    try{await json(await fetch(base+'/registration-invoices/'+encodeURIComponent(paymentId)+'/payments',{method:'POST',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({amountNgn,reference:reference.trim()})}));
      setNotice('Verified registration payment recorded.');setPaymentId('');setAmount('');setReference('');setReload(n=>n+1);}
    catch(e){setError(e instanceof Error?e.message:'Payment recording failed.');}
    finally{setBusy(false);}
  };
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-[#111A43]">Registration invoices</h2>
    <p className="text-xs text-slate-500">Search submitted applications by reference, create a programme registration invoice, and record independently verified bank payments.</p>
    <form onSubmit={search} className="flex flex-wrap items-end gap-2">
      <label className="text-xs font-semibold">Application reference<input value={query} onChange={e=>setQuery(e.target.value)} minLength={3} maxLength={100} required className="mt-1 block w-64 rounded-lg border p-2" placeholder="Search application reference"/></label>
      <button disabled={busy} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50">Search</button>
    </form>
    {results.length>0&&<div className="space-y-2">
      <label className="block text-xs font-semibold">Matching application<select value={selected} onChange={e=>setSelected(e.target.value)} className="mt-1 block w-full max-w-xl rounded-lg border p-2"><option value="">Choose an application</option>{results.map(a=><option key={a.id} value={a.id}>{a.reference_number} · {a.programme} · {a.academic_session} · {a.status}</option>)}</select></label>
      <button type="button" disabled={!selected||busy} onClick={create} className="rounded-lg bg-[#111A43] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Create registration invoice</button>
    </div>}
    {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
    {notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
    {loading?<p className="text-sm">Loading registration invoices…</p>:invoices.length===0?<p className="text-sm text-slate-500">No registration invoices found.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Account / Programme</th><th className="p-2">Session</th><th className="p-2">Due</th><th className="p-2">Paid</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead><tbody>{invoices.map(i=><tr key={i.id} className="border-b"><td className="p-2"><span className="break-all font-mono">{i.student_account_id}</span><br/>{i.programme_code}</td><td className="p-2">{i.academic_session}</td><td className="p-2">{money(i.fee_amount_ngn)}</td><td className="p-2">{money(i.amount_paid_ngn)}</td><td className="p-2">{i.status}</td><td className="p-2"><button type="button" onClick={()=>setPaymentId(i.id)} className="rounded-lg border px-2 py-1">Record verified payment</button></td></tr>)}</tbody></table></div>}
    {paymentId&&<form onSubmit={post} className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
      <h3 className="text-sm font-bold">Record verified registration payment</h3><p className="break-all font-mono text-xs">{paymentId}</p>
      <div className="flex flex-wrap gap-3"><label className="text-xs font-semibold">Amount (NGN)<input required type="number" min="0.01" step="0.01" value={amount} onChange={e=>setAmount(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
      <label className="text-xs font-semibold">Bank transaction reference<input required minLength={5} maxLength={120} value={reference} onChange={e=>setReference(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label></div>
      <div className="flex gap-2"><button disabled={busy} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Post verified payment</button><button type="button" onClick={()=>setPaymentId('')} className="rounded-lg border px-3 py-2 text-xs">Cancel</button></div>
    </form>}
  </section>;
}
