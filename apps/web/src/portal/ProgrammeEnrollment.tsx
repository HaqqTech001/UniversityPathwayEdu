import {notifyPortal} from '../components/PortalToasts';
import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import ConductAcknowledgement from './ConductAcknowledgement';
import CommonApplicationForm from './CommonApplicationForm';

type Programme={code:string;name:string};
export default function ProgrammeEnrollment(){
 const [programmes,setProgrammes]=useState<Programme[]>([]);
 const [selected,setSelected]=useState<Programme|null>(null);
 const [agreed,setAgreed]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
  let active=true;
  const token=getStudentToken();
  if(!token){setError('Please sign in to view programmes.');setLoading(false);return;}
  fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/admissions/programmes',{headers:{Authorization:'Bearer '+token}})
   .then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load available programmes');return data;})
   .then(data=>{if(active)setProgrammes(data.programmes||[]);})
   .catch(e=>{if(active){const message=e.message||'Could not load programmes';setError(message);notifyPortal('error',message);}})
   .finally(()=>{if(active)setLoading(false);});
  return()=>{active=false;};
 },[]);
 return <div className="space-y-5">
  {!agreed&&<section className="rounded-2xl border border-[#dce5f0] bg-white p-4 sm:p-6">
   <h2 className="text-lg font-black text-[#111A43]">Available Programmes</h2>
   <p className="mt-1 text-sm text-slate-600">Choose the programme you want to apply for. You will need to acknowledge the Code of Conduct before completing your application.</p>
   {loading?<p role="status" className="mt-5 text-sm">Loading available programmes…</p>:error?<p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>:programmes.length===0?<p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No programmes are currently available for application.</p>:<div className="mt-5 grid gap-3 sm:grid-cols-2">{programmes.map(p=><button key={p.code} type="button" onClick={()=>setSelected(p)} className="flex min-h-24 flex-col items-start justify-center rounded-xl border border-[#dce5f0] bg-[#f7f8fc] p-4 text-left transition-colors hover:border-[#C62839] hover:bg-red-50"><strong className="text-base text-[#111A43]">{p.name}</strong><span className="mt-1 text-xs text-slate-500">{p.code}</span></button>)}</div>}
  </section>}
  {selected&&!agreed&&<div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08163b]/75 p-3 sm:p-5" role="presentation">
   <div role="dialog" aria-modal="true" aria-labelledby="programme-conduct-heading" className="max-h-[95dvh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-4 shadow-2xl sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-4"><h2 id="programme-conduct-heading" className="text-xl font-black text-[#111A43]">Code of Conduct — {selected.name}</h2><button type="button" aria-label="Close code of conduct" onClick={()=>setSelected(null)} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600">Close</button></div>
    <ConductAcknowledgement programme={selected.name} onAccepted={()=>{sessionStorage.setItem('upec_selected_programme',selected.code);setAgreed(true);setSelected(null);}} onCancel={()=>setSelected(null)}/>
   </div>
  </div>}
  {agreed&&<><button type="button" onClick={()=>{setAgreed(false);setSelected(null);sessionStorage.removeItem('upec_selected_programme');}} className="text-sm font-bold text-[#C62839]">← Choose another programme</button><CommonApplicationForm/></>}
 </div>;
}
