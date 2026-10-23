import {notifyPortal} from '../components/PortalToasts';
import {useEffect,useRef,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {studentConductRules} from '../components/StudentCodeOfConduct';

const VERSION='upec-student-code-2026-10-poster-v1';
interface Props { programme?:string; onAccepted?:()=>void; onCancel?:()=>void; }

export default function ConductAcknowledgement({programme,onAccepted,onCancel}:Props){
 const [accepted,setAccepted]=useState(false);
 const [checked,setChecked]=useState(false);
 const [reachedEnd,setReachedEnd]=useState(false);
 const [busy,setBusy]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const scrollRef=useRef<HTMLDivElement>(null);
 const request=async(method='GET',body?:object)=>{
  const token=getStudentToken();if(!token)throw Error('Please sign in.');
  const r=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/conduct/acceptance',{
   method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})
  });
  const json=await r.json();if(!r.ok)throw Error(json.error||'Unable to save acknowledgement');return json;
 };
 useEffect(()=>{let active=true;void request().then(r=>{if(active)setAccepted(!!r.accepted);}).catch(e=>{if(active)setError(e?.message||String(e));}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
 const confirmScroll=()=>{const el=scrollRef.current;if(el&&el.scrollTop+el.clientHeight>=el.scrollHeight-20)setReachedEnd(true);};
 const save=async()=>{
  setBusy(true);setError('');
  try{await request('POST',{version:VERSION,accepted:true});setAccepted(true);notifyPortal('success','Code of Conduct acknowledgement saved.');onAccepted?.();}
  catch(e){const message=e instanceof Error?e.message:String(e);setError(message);notifyPortal('error',message);}
  finally{setBusy(false);}
 };
 return <section aria-label="Student conduct acceptance" className="space-y-4">
  <div ref={scrollRef} onScroll={confirmScroll} tabIndex={0} className="max-h-[min(56vh,520px)] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-[#f7f8fc] p-4 sm:p-6">
   <h3 className="text-xl font-black text-[#111A43]">Students’ Code of Conduct</h3>
   <p className="mt-2 text-sm text-slate-600">{programme?'Programme: '+programme+'. ':''}Read the rules carefully before acknowledging.</p>
   <ol className="mt-5 space-y-3">{studentConductRules.map(([title,body],i)=><li key={title} className="flex gap-3 rounded-xl bg-white p-4 shadow-sm"><span className="font-bold text-[#C62839]">{i+1}.</span><div><strong className="text-sm text-[#111A43]">{title}</strong><p className="mt-1 text-sm leading-6 text-slate-600">{body}</p></div></li>)}</ol>
   <p className="mt-4 text-xs font-semibold text-slate-600">End of the Students’ Code of Conduct.</p>
  </div>
  {loading?<p role="status" className="text-sm text-slate-600">Checking previous acknowledgement…</p>:accepted?<div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">You have acknowledged the current code of conduct. <button type="button" className="ml-2 underline" onClick={()=>onAccepted?.()}>Continue application</button></div>:<>
   <p className="text-xs text-slate-500">Scroll to the bottom of the rules or tick the checkbox to enable acknowledgement.</p>
   <label className="flex items-start gap-3 text-sm text-slate-700"><input className="mt-1" type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/> I have read, understood and agree to comply with the Students’ Code of Conduct.</label>
   <div className="flex flex-wrap gap-3"><button type="button" disabled={busy||loading||(!checked&&!reachedEnd)} onClick={()=>void save()} className="rounded-xl bg-[#C62839] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{busy?'Saving…':'Acknowledge & Continue'}</button>{onCancel&&<button type="button" onClick={onCancel} className="rounded-xl border border-slate-300 px-5 py-3 font-bold text-[#111A43]">Cancel</button>}</div>
  </>}
  {error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
 </section>;
}
