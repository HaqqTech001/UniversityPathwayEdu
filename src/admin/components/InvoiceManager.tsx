import React,{useEffect,useState} from 'react';
type Application={id:string;reference_number:string;programme:string;status:string;account_id:string};
type Invoice={id:string;student_account_id:string;programme_code:string;billing_month:string;due_on:string;amount_due_ngn:number;amount_paid_ngn:number;status:string};
const root=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/finance';
const auth=()=>({Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')});
async function parse(response:Response){const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed.');return data;}
const money=(n:number)=>new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(n);
export default function InvoiceManager(){
  const [invoices,setInvoices]=useState<Invoice[]>([]);
  const [loading,setLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');
  const [notice,setNotice]=useState('');
  const [reload,setReload]=useState(0);
  const [applicationQuery,setApplicationQuery]=useState('');
  const [applications,setApplications]=useState<Application[]>([]);
  const [selectedApplication,setSelectedApplication]=useState('');
  const [searching,setSearching]=useState(false);
  const chosen=applications.find(a=>a.id===selectedApplication);
  const studentId=chosen?.account_id||'';
  const programme=chosen?.programme||'';
  const searchApplications=async(event:React.FormEvent)=>{
    event.preventDefault();setError('');setApplications([]);setSelectedApplication('');
    if(applicationQuery.trim().length<3){setError('Enter at least 3 characters of an application reference.');return;}
    setSearching(true);
    try{
      const data=await parse(await fetch(root+'/application-search?q='+encodeURIComponent(applicationQuery.trim()),{headers:auth()}));
      setApplications((data.applications||[]).filter((a:Application)=>a.status==='approved'&&['IJMB','JAMB','WAEC'].includes(a.programme)));
    }catch(e){setError(e instanceof Error?e.message:'Application search failed.');}
    finally{setSearching(false);}
  };
  const [month,setMonth]=useState(()=>new Date().toISOString().slice(0,7));
  const [dueOn,setDueOn]=useState('');
  const [paymentInvoice,setPaymentInvoice]=useState('');
  const [paymentAmount,setPaymentAmount]=useState('');
  const [reference,setReference]=useState('');
  useEffect(()=>{
    const controller=new AbortController();
    setLoading(true);setError('');
    (async()=>{
      try{
        const data=await parse(await fetch(root+'/invoices',{headers:auth(),signal:controller.signal}));
        if(!controller.signal.aborted)setInvoices(Array.isArray(data.invoices)?data.invoices:[]);
      }catch(e){
        if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load invoices.');
      }finally{
        if(!controller.signal.aborted)setLoading(false);
      }
    })();
    return()=>controller.abort();
  },[reload]);
  const create=async(event:React.FormEvent)=>{
    event.preventDefault();
    if(!chosen||!studentId){setError('Select an approved programme application first.');return;}
    if(!window.confirm('Create monthly invoice for '+chosen.reference_number+' ('+programme+') in '+month+'?'))return;
    setSaving(true);setError('');setNotice('');
    try{
      await parse(await fetch(root+'/invoices',{method:'POST',headers:{...auth(),'Content-Type':'application/json'},
        body:JSON.stringify({studentId:studentId.trim(),programmeCode:programme,billingMonth:month+'-01',dueOn})}));
      setNotice('Monthly invoice created.');setReload(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Unable to create invoice.');}
    finally{setSaving(false);}
  };
  const record=async(event:React.FormEvent)=>{
    event.preventDefault();
    const amountNgn=Number(paymentAmount);
    if(!Number.isFinite(amountNgn)||amountNgn<=0||reference.trim().length<5){setError('Enter a valid payment amount and transaction reference.');return;}
    if(!window.confirm('Confirm bank transfer has been independently verified for '+money(amountNgn)+'? This will POST a real payment.'))return;
    setSaving(true);setError('');setNotice('');
    try{
      await parse(await fetch(root+'/invoices/'+encodeURIComponent(paymentInvoice)+'/payments',{
        method:'POST',headers:{...auth(),'Content-Type':'application/json'},
        body:JSON.stringify({amountNgn,reference:reference.trim()})
      }));
      setNotice('Verified payment recorded.');setPaymentInvoice('');setPaymentAmount('');setReference('');setReload(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Unable to record payment.');}
    finally{setSaving(false);}
  };
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h2 className="text-lg font-bold text-[#111A43]">Monthly invoices and verified payments</h2>
    <p className="text-xs text-amber-800">Record a payment only after checking the actual bank transfer. Receipt approval alone is not proof of funds.</p>
    <form onSubmit={searchApplications} className="flex flex-wrap items-end gap-3">
      <label className="text-xs font-semibold">Application reference<input value={applicationQuery} onChange={e=>setApplicationQuery(e.target.value)} required minLength={3} maxLength={100} placeholder="Search reference" className="mt-1 block w-64 rounded-lg border p-2"/></label>
      <button disabled={searching} className="rounded-lg border px-3 py-2 text-xs font-bold disabled:opacity-50">{searching?'Searching…':'Find approved student'}</button>
    </form>
    <form onSubmit={create} className="flex flex-wrap items-end gap-3">
      <label className="text-xs font-semibold">Approved application<select required value={selectedApplication} onChange={e=>setSelectedApplication(e.target.value)} className="mt-1 block w-72 rounded-lg border p-2"><option value="">Select an approved application</option>{applications.map(a=><option key={a.id} value={a.id}>{a.reference_number} · {a.programme}</option>)}</select></label>
      <p className="text-xs text-slate-500">Programme: {programme||'Select application'}</p>
      <label className="text-xs font-semibold">Billing month<input required type="month" value={month} onChange={e=>setMonth(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
      <label className="text-xs font-semibold">Due date<input required type="date" value={dueOn} onChange={e=>setDueOn(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
      <button disabled={saving||!chosen} className="rounded-lg bg-[#111A43] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Create invoice</button>
    </form>
    {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
    {notice&&<p role="status" className="text-sm text-emerald-700">{notice}</p>}
    {loading?<p className="text-sm">Loading invoices…</p>:invoices.length===0?<p className="text-sm text-slate-500">No monthly invoices found.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Account / Programme</th><th className="p-2">Billing month</th><th className="p-2">Due</th><th className="p-2">Paid</th><th className="p-2">Status</th><th className="p-2">Action</th></tr></thead><tbody>{invoices.map(i=><tr key={i.id} className="border-b"><td className="p-2"><span className="font-mono break-all">{i.student_account_id}</span><br/>{i.programme_code}</td><td className="p-2">{i.billing_month}</td><td className="p-2">{money(i.amount_due_ngn)}</td><td className="p-2">{money(i.amount_paid_ngn)}</td><td className="p-2">{i.status}</td><td className="p-2"><button type="button" onClick={()=>setPaymentInvoice(i.id)} className="rounded-lg border px-2 py-1">Record verified payment</button></td></tr>)}</tbody></table></div>}
    {paymentInvoice&&<form onSubmit={record} className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-3">
      <h3 className="text-sm font-bold">Record payment against invoice</h3><p className="break-all font-mono text-xs">{paymentInvoice}</p>
      <div className="flex flex-wrap gap-3"><label className="text-xs font-semibold">Verified amount (NGN)<input required type="number" min="0.01" step="0.01" value={paymentAmount} onChange={e=>setPaymentAmount(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label>
      <label className="text-xs font-semibold">Bank transaction reference<input required minLength={5} maxLength={120} value={reference} onChange={e=>setReference(e.target.value)} className="mt-1 block rounded-lg border p-2"/></label></div>
      <div className="flex gap-2"><button disabled={saving} className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Post verified payment</button><button type="button" onClick={()=>setPaymentInvoice('')} className="rounded-lg border px-3 py-2 text-xs">Cancel</button></div>
    </form>}
  </section>;
}
