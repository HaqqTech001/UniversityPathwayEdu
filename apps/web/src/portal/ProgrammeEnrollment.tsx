import {notifyPortal} from '../components/PortalToasts';
import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import ConductAcknowledgement from './ConductAcknowledgement';
import CommonApplicationForm from './CommonApplicationForm';

type Programme={code:string;name:string;description?:string};
export default function ProgrammeEnrollment({onClose}: {onClose?:()=>void}){
 const [programmes,setProgrammes]=useState<Programme[]>([]);
 const [selected,setSelected]=useState<Programme|null>(null);
 const [step,setStep]=useState<'programme'|'conduct'|'application'>('programme');
 const [loading,setLoading]=useState(false),[error,setError]=useState('');
 const [retry,setRetry]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();
  const token=getStudentToken();
  if(!token){setError('Please sign in again to access available programmes.');notifyPortal('error','Sign in to start a programme application.');return;}
  setLoading(true);setError('');
  fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\\/$/,'')+'/api/student/admissions/programmes',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
    .then(async r=>{const data=await r.json();if(!r.ok)throw Error(data.error||'Unable to load available programmes');return data;})
    .then(data=>{setProgrammes(Array.isArray(data.programmes)?data.programmes:[]);})
    .catch(e=>{if(controller.signal.aborted)return;const message=e instanceof Error?e.message:'Programme list could not be loaded';setError(message);notifyPortal('error',message);})
    .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[retry]);
 const choose=(programme:Programme)=>{setSelected(programme);setStep('conduct');notifyPortal('info','Review the Code of Conduct to continue with '+programme.name+'.');};
 const back=()=>{if(step==='application'){setStep('programme');sessionStorage.removeItem('upec_selected_programme');}else{setStep('programme');setSelected(null);}};
 return <div className="fixed inset-0 z-[90] flex items-center justify-center bg-[#08163b]/75 p-3 sm:p-6" role="presentation">
  <section role="dialog" aria-modal="true" aria-labelledby="enrollment-title" className="flex max-h-[96dvh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-[#f7f8fc] shadow-2xl">
   <header className="flex shrink-0 items-center justify-between gap-3 bg-[#111A43] px-5 py-5 text-white sm:px-7">
    <div><p className="text-xs font-bold uppercase tracking-wider text-[#f4c879]">Student admissions wizard</p><h2 id="enrollment-title" className="mt-1 text-xl font-extrabold">New Programme Application</h2><p className="mt-1 text-xs text-slate-200">{step==='programme'?'Step 1 · Choose your programme':step==='conduct'?'Step 2 · Code of Conduct':'Step 3 · Complete your application and payment'}</p></div>
    <button type="button" onClick={onClose} aria-label="Close application wizard" className="rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">Close</button>
   </header>
   <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-7">
    {step==='programme'&&<div className="space-y-5">
      <div><h3 className="text-lg font-bold text-[#111A43]">Select an available programme</h3><p className="mt-1 text-sm text-slate-600">Only programmes opened for applications by the admissions team appear here.</p></div>
      {loading?<p role="status" className="rounded-xl bg-white p-5 text-sm">Loading approved programmes…</p>:error?<div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800"><p>{error}</p><button type="button" onClick={()=>setRetry(n=>n+1)} className="mt-3 rounded-lg bg-[#111A43] px-4 py-2 font-bold text-white">Retry</button></div>:programmes.length===0?<div className="rounded-2xl border border-amber-200 bg-amber-50 p-5"><h4 className="font-bold text-[#111A43]">Admissions programmes have not been published</h4><p className="mt-2 text-sm text-amber-900">The admissions system returned no active programmes. Staff must activate the approved programmes in the academic catalogue. Applications cannot be submitted for an unpublished programme.</p><button type="button" onClick={()=>setRetry(n=>n+1)} className="mt-4 rounded-lg border border-[#111A43] bg-white px-4 py-2 text-sm font-bold text-[#111A43]">Check again</button></div>:<div className="grid gap-3 sm:grid-cols-2">{programmes.map(programme=><button key={programme.code} type="button" onClick={()=>choose(programme)} className="rounded-2xl border border-[#dce5f0] bg-white p-5 text-left shadow-sm transition hover:border-[#c62839] hover:shadow-lg"><strong className="block text-lg text-[#111A43]">{programme.name}</strong><p className="mt-2 text-sm text-slate-600">{programme.description||'Apply for this programme'}</p><span className="mt-3 inline-block text-xs font-bold text-[#c62839]">Select & continue →</span></button>)}</div>}
    </div>}
    {step==='conduct'&&selected&&<div className="space-y-4"><button type="button" onClick={back} className="text-sm font-bold text-[#c62839]">← Back to programmes</button><ConductAcknowledgement programme={selected.name} onCancel={back} onAccepted={()=>{sessionStorage.setItem('upec_selected_programme',selected.code);setStep('application');}}/></div>}
    {step==='application'&&selected&&<div className="space-y-4"><p className="rounded-xl bg-blue-50 p-3 text-sm text-[#111A43]">Selected programme: <strong>{selected.name}</strong></p><CommonApplicationForm key={selected.code} selectedProgrammeCode={selected.code}/></div>}
   </div>
  </section>
 </div>;
}
