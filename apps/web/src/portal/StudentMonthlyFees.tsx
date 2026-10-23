import {useEffect,useRef,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';

type Fee={id:string;programme_code:string;billing_month:string;amount_due_ngn:number;amount_paid_ngn:number;status:string};
type Receipt={id:string;monthly_fee_id:string;review_status:string;created_at:string};
const api=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/finance';
const allowed=['application/pdf','image/jpeg','image/png'];
const money=(v:number)=>Number(v).toLocaleString('en-NG',{style:'currency',currency:'NGN'});

export default function StudentMonthlyFees(){
 const [fees,setFees]=useState<Fee[]>([]);
 const [receipts,setReceipts]=useState<Receipt[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [selectedFee,setSelectedFee]=useState('');
 const [file,setFile]=useState<File|null>(null);
 const [dragging,setDragging]=useState(false);
 const [uploading,setUploading]=useState(false);
 const [message,setMessage]=useState('');
 const [reload,setReload]=useState(0);
 const input=useRef<HTMLInputElement>(null);
 useEffect(()=>{
  const controller=new AbortController();
  const token=getStudentToken();
  if(!token){setError('Sign in to view fees.');setLoading(false);return;}
  setLoading(true);setError('');
  Promise.all(['/monthly-fees','/monthly-receipts'].map(async route=>{
   const response=await fetch(api+route,{headers:{Authorization:'Bearer '+token},signal:controller.signal});
   const json=await response.json().catch(()=>({}));
   if(!response.ok)throw Error(json.error||'Unable to fetch payment records.');
   return json;
  })).then(([monthly,evidence])=>{setFees(monthly.fees||[]);setReceipts(evidence.receipts||[]);}).catch(e=>{if(e.name!=='AbortError')setError(e.message);}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[reload]);
 const choose=(candidate:File|undefined)=>{
  setMessage('');
  if(!candidate)return;
  if(!allowed.includes(candidate.type)||candidate.size<1||candidate.size>5242880){setFile(null);setMessage('Choose a PDF, JPG or PNG receipt under 5 MB.');return;}
  setFile(candidate);
 };
 const submit=async(event:React.FormEvent)=>{
  event.preventDefault();setMessage('');
  if(!selectedFee||!fees.some(f=>f.id===selectedFee)){setMessage('Select the monthly fee you paid.');return;}
  if(!file){setMessage('Choose a receipt to upload.');return;}
  const token=getStudentToken();if(!token){setMessage('Sign in before uploading.');return;}
  setUploading(true);
  try{
   const post=async(route:string,body:object)=>{
    const response=await fetch(api+route,{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)});
    const json=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(json.error||'Receipt service unavailable.');
    return json;
   };
   const signed=await post('/monthly-receipts/upload-url',{monthlyFeeId:selectedFee,mimeType:file.type,sizeBytes:file.size});
   const uploaded=await fetch(signed.signedUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});
   if(!uploaded.ok)throw Error('Receipt file upload failed.');
   const confirmed=await post('/monthly-receipts/confirm',{monthlyFeeId:selectedFee,path:signed.path,mimeType:file.type});
   if(!confirmed.receipt?.id)throw Error('The server did not confirm this receipt.');
   setMessage('Receipt submitted for finance review. Reference: '+confirmed.receipt.id+'. This does not confirm payment.');
   setFile(null);if(input.current)input.current.value='';
   setReload(value=>value+1);
  }catch(e){setMessage(e instanceof Error?e.message:'Unable to upload receipt.');}
  finally{setUploading(false);}
 };
 return <section className="rounded-2xl border border-slate-200 bg-white p-6" aria-labelledby="monthly-fees-heading">
  <h2 id="monthly-fees-heading" className="text-xl font-extrabold text-[#111A43]">Monthly Lesson Fees</h2>
  <p className="mt-2 text-sm text-slate-600">Charges are based on your enrolled programme. Payment records are updated by the institution after verification.</p>
  {loading?<p className="mt-5">Loading fee records…</p>:error?<p role="alert" className="mt-5 text-red-700">{error}</p>:fees.length===0?<p className="mt-5 text-sm text-slate-500">No monthly fee records have been issued yet.</p>:<div className="mt-6 overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Month</th><th className="p-3">Programme</th><th className="p-3">Charge</th><th className="p-3">Paid</th><th className="p-3">Balance</th><th className="p-3">Status</th></tr></thead><tbody>{fees.map(f=><tr className="border-b" key={f.id}><td className="p-3">{f.billing_month}</td><td className="p-3">{f.programme_code}</td><td className="p-3">{money(f.amount_due_ngn)}</td><td className="p-3">{money(f.amount_paid_ngn)}</td><td className="p-3">{money(Math.max(0,f.amount_due_ngn-f.amount_paid_ngn))}</td><td className="p-3 capitalize">{f.status.replaceAll('_',' ')}</td></tr>)}</tbody></table></div>}
  <form onSubmit={submit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
   <h3 className="font-bold text-[#111A43]">Submit monthly payment receipt</h3>
   <p className="text-sm text-slate-600">Upload proof of payment for the correct month. Finance staff will review it before your balance is updated.</p>
   <label className="block text-sm font-semibold text-slate-700" htmlFor="monthly-fee-select">Monthly fee</label>
   <select id="monthly-fee-select" required value={selectedFee} onChange={e=>setSelectedFee(e.target.value)} disabled={loading||uploading||fees.length===0} className="w-full rounded-lg border border-slate-300 bg-white p-3">
    <option value="">Select month and programme</option>
    {fees.map(f=><option key={f.id} value={f.id}>{f.billing_month} — {f.programme_code} — {money(Math.max(0,f.amount_due_ngn-f.amount_paid_ngn))} outstanding</option>)}
   </select>
   <div onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={e=>{e.preventDefault();setDragging(false);}} onDrop={e=>{e.preventDefault();setDragging(false);if(!uploading)choose(e.dataTransfer.files[0]);}} className={'rounded-xl border-2 border-dashed p-6 text-center '+(dragging?'border-[#C62839] bg-red-50':'border-slate-300 bg-white')}>
    <p className="text-sm text-slate-700">{file?file.name:'Drag and drop your receipt here, or browse your device'}</p>
    <input ref={input} type="file" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" className="sr-only" onChange={e=>choose(e.target.files?.[0])} />
    <button type="button" disabled={uploading} onClick={()=>input.current?.click()} className="mt-3 rounded-lg bg-[#111A43] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Browse files</button>
    <p className="mt-2 text-xs text-slate-500">PDF, JPG or PNG · Maximum 5 MB</p>
   </div>
   <button type="submit" disabled={uploading||loading||!file||!selectedFee} className="rounded-lg bg-[#C62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{uploading?'Uploading…':'Submit receipt for review'}</button>
   {message&&<p role="status" className="text-sm text-slate-700">{message}</p>}
  </form>
  <div className="mt-8"><div className="flex items-center justify-between"><h3 className="font-bold text-[#111A43]">Submitted monthly receipts</h3><button type="button" onClick={()=>setReload(value=>value+1)} className="text-sm font-semibold text-[#C62839]">Refresh</button></div>
   {receipts.length===0?<p className="mt-3 text-sm text-slate-500">No monthly payment receipts submitted yet.</p>:<ul className="mt-3 space-y-2">{receipts.map(r=><li key={r.id} className="rounded-lg border border-slate-200 p-3 text-sm"><span className="font-semibold capitalize">{r.review_status}</span> · {fees.find(f=>f.id===r.monthly_fee_id)?.billing_month||'Monthly fee'} · {new Date(r.created_at).toLocaleDateString('en-NG')}<p className="break-all text-xs text-slate-500">Reference: {r.id}</p></li>)}</ul>}
  </div>
 </section>;
}
