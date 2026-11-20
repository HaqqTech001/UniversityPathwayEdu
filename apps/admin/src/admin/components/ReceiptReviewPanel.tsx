import React, { useCallback, useEffect, useState } from 'react';

type Receipt = {id:string;student_account_id:string;application_id?:string;monthly_fee_id?:string;review_status:string;created_at:string;mime_type:string};
type Kind = 'application'|'monthly';
const root = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/,'');
const endpoint = (kind:Kind) => root+'/api/staff/finance/'+(kind==='application'?'application-receipts':'monthly-receipts');
const auth = () => ({Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')});
async function read(response:Response) { const data=await response.json();if(!response.ok)throw Error(data.error||'Request failed.');return data; }

export default function ReceiptReviewPanel(){
  const [kind,setKind]=useState<Kind>('application');
  const [status,setStatus]=useState('pending');
  const [receipts,setReceipts]=useState<Receipt[]>([]);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [message,setMessage]=useState('');
  const [saving,setSaving]=useState<string|null>(null);
  const [refresh,setRefresh]=useState(0);
  const load=useCallback(async(signal:AbortSignal)=>{
    setLoading(true);setError('');setReceipts([]);
    try{
      const data=await read(await fetch(endpoint(kind)+'?status='+status,{headers:auth(),signal}));
      if(!signal.aborted)setReceipts(data.receipts||[]);
    }catch(e){if(!signal.aborted)setError(e instanceof Error?e.message:'Could not load receipts.');}
    finally{if(!signal.aborted)setLoading(false);}
  },[kind,status]);
  useEffect(()=>{const controller=new AbortController();void load(controller.signal);return()=>controller.abort();},[load,refresh]);
  const preview=async(id:string)=>{
    setError('');
    try{
      const data=await read(await fetch(endpoint(kind)+'/'+encodeURIComponent(id)+'/preview',{headers:auth()}));
      if(typeof data.previewUrl!=='string')throw Error('Preview unavailable.');
      window.open(data.previewUrl,'_blank','noopener,noreferrer');
    }catch(e){setError(e instanceof Error?e.message:'Unable to preview receipt.');}
  };
  const review=async(id:string,decision:'approved'|'rejected')=>{
    if(!window.confirm('Mark this receipt as '+decision+'? This does NOT record a bank payment.'))return;
    setSaving(id);setError('');setMessage('');
    try{
      const data=await read(await fetch(endpoint(kind)+'/'+encodeURIComponent(id)+'/review',{
        method:'PATCH',headers:{...auth(),'Content-Type':'application/json'},body:JSON.stringify({status:decision})
      }));
      setMessage(data.message||'Receipt reviewed. Bank transfer must be verified and recorded separately.');
      setRefresh(n=>n+1);
    }catch(e){setError(e instanceof Error?e.message:'Unable to review receipt.');}
    finally{setSaving(null);}
  };
  return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div><h2 className="text-lg font-bold text-[#111A43]">Payment evidence review</h2>
      <p className="text-xs text-amber-800 mt-1">Approving a receipt does not confirm or record payment. Independently verify the bank transfer and post it to the correct invoice.</p></div>
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-xs font-semibold">Receipt type <select value={kind} onChange={e=>setKind(e.target.value as Kind)} className="ml-2 rounded-lg border p-2"><option value="application">Application</option><option value="monthly">Monthly lessons</option></select></label>
      <label className="text-xs font-semibold">Status <select value={status} onChange={e=>setStatus(e.target.value)} className="ml-2 rounded-lg border p-2"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option></select></label>
      <button type="button" onClick={()=>setRefresh(n=>n+1)} disabled={loading} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-50">Refresh</button>
    </div>
    {error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}
    {message&&<p role="status" className="text-sm text-emerald-700">{message}</p>}
    {loading?<p className="text-sm">Loading receipts…</p>:receipts.length===0?<p className="text-sm text-slate-500">No receipts for this filter.</p>:(
      <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b text-slate-500"><th className="p-2">Receipt</th><th className="p-2">Student account</th><th className="p-2">Submitted</th><th className="p-2">Status</th><th className="p-2">Actions</th></tr></thead><tbody>
      {receipts.map(receipt=><tr key={receipt.id} className="border-b"><td className="p-2 font-mono break-all">{receipt.id}</td><td className="p-2 font-mono break-all">{receipt.student_account_id}</td><td className="p-2">{new Date(receipt.created_at).toLocaleDateString('en-NG')}</td><td className="p-2">{receipt.review_status}</td><td className="p-2"><div className="flex gap-2">
        <button type="button" onClick={()=>preview(receipt.id)} className="rounded-lg border px-2 py-1">Preview</button>
        {receipt.review_status==='pending'&&<><button type="button" disabled={saving!==null} onClick={()=>review(receipt.id,'approved')} className="rounded-lg bg-emerald-700 px-2 py-1 text-white disabled:opacity-50">Approve evidence</button><button type="button" disabled={saving!==null} onClick={()=>review(receipt.id,'rejected')} className="rounded-lg bg-[#C62839] px-2 py-1 text-white disabled:opacity-50">Reject</button></>}
      </div></td></tr>)}</tbody></table></div>
    )}
  </section>;
}
