import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ClipboardCheck, AlertCircle, GraduationCap, CreditCard, RefreshCw, Users, FileText } from 'lucide-react';
import { AdminTabId } from '../types';

interface Metrics { total:number; students:number; submitted:number; under_review:number; action_required:number }
interface Activity { id:string; title:string; body:string; created_at:string; status?:string; reference_number?:string }
interface Props { onNavigateTab?: (tab:AdminTabId)=>void; permissions?:string[] }
const apiBase=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
const notify = (message:string) => window.dispatchEvent(new CustomEvent('upec-admin-toast',{detail:{message,kind:'error'}}));

export default function AdminDashboardPage({onNavigateTab=()=>{},permissions=[]}:Props) {
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const [activities,setActivities]=useState<Activity[]>([]);
  const [loading,setLoading]=useState(true);
  const [activityLoading,setActivityLoading]=useState(true);
  const [error,setError]=useState('');
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    const token=sessionStorage.getItem('upec_admin_session');
    if(!token){setError('Please sign in again to load dashboard data.');setLoading(false);setActivityLoading(false);return;}
    const controller=new AbortController();
    setLoading(true);setError('');
    fetch(apiBase+'/api/staff/applications/metrics',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load dashboard metrics.');return data;})
      .then(data=>{if(!controller.signal.aborted)setMetrics(data);})
      .catch(reason=>{if(!controller.signal.aborted){setMetrics(null);setError(reason instanceof Error?reason.message:'Dashboard data unavailable.');notify(reason instanceof Error?reason.message:'Dashboard data unavailable.');}})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    if(permissions.includes('applications.read')){
      setActivityLoading(true);
      fetch(apiBase+'/api/staff/activity?limit=5',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
        .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Recent applications unavailable.');return data;})
        .then(data=>{if(!controller.signal.aborted)setActivities(Array.isArray(data.activities)?data.activities:[]);})
        .catch(()=>{if(!controller.signal.aborted)setActivities([]);})
        .finally(()=>{if(!controller.signal.aborted)setActivityLoading(false);});
    }else{setActivities([]);setActivityLoading(false);}
    return()=>controller.abort();
  },[retry,permissions.join('|')]);

  const cards=[
    {label:'Student accounts',value:metrics?.students,icon:Users,tab:'students' as AdminTabId},
    {label:'Applications',value:metrics?.total,icon:FileText,tab:'students' as AdminTabId},
    {label:'Under review',value:metrics?.under_review,icon:ClipboardCheck,tab:'students' as AdminTabId},
    {label:'Action required',value:metrics?.action_required,icon:AlertCircle,tab:'students' as AdminTabId},
  ];
  const statusRows=[
    {label:'Submitted',value:metrics?.submitted??0,color:'#111A43'},
    {label:'Under review',value:metrics?.under_review??0,color:'#D5A75B'},
    {label:'Action required',value:metrics?.action_required??0,color:'#C62839'},
  ];
  const maxCount=Math.max(1,...statusRows.map(row=>row.value));
  const actions=[
    ...(permissions.includes('applications.read')?[{label:'Open student records',tab:'students' as AdminTabId,icon:GraduationCap}]:[]),
    ...(permissions.includes('finance.manage')?[{label:'Review finance',tab:'finance' as AdminTabId,icon:CreditCard}]:[]),
  ];
  return <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:overflow-auto">
    <header className="flex shrink-0 items-center justify-between gap-3">
      <div className="min-w-0"><h1 className="text-xl font-extrabold leading-tight text-[#111A43] sm:text-2xl">Dashboard</h1><p className="text-[11px] text-slate-500 sm:text-xs">A concise view of current operations</p></div>
      <button type="button" onClick={()=>setRetry(n=>n+1)} disabled={loading} aria-label="Refresh dashboard" title="Refresh dashboard" className="rounded-lg border border-slate-200 bg-white p-2 text-[#111A43] disabled:opacity-50"><RefreshCw size={16} className={loading?'animate-spin':''}/></button>
    </header>
    {error&&<div role="alert" className="flex items-center justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800"><span>{error}</span><button type="button" onClick={()=>setRetry(n=>n+1)} className="shrink-0 font-bold underline">Retry</button></div>}
    <section aria-label="Operational metrics" className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map(({label,value,icon:Icon,tab})=><button type="button" key={label} onClick={()=>onNavigateTab(tab)} className="flex min-h-[76px] min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-[#C62839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839]">
        <div className="min-w-0"><p className="text-xl font-extrabold leading-tight tabular-nums text-[#111A43]">{loading?'—':typeof value==='number'?value.toLocaleString('en-NG'):'—'}</p><p className="mt-1 text-[11px] font-medium leading-tight text-slate-600">{label}</p></div><Icon size={19} className="shrink-0 text-[#C62839]"/>
      </button>)}
    </section>
    <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
      <section aria-label="Application status summary" className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-[#111A43]">Application status</h2><p className="text-[11px] text-slate-500">Current application review workload</p></div><span className="text-xs font-semibold text-slate-500">{loading?'—':(metrics?.total??0).toLocaleString('en-NG')} total</span></div>
        <div className="space-y-3">{statusRows.map(row=><div key={row.label}><div className="mb-1 flex items-center justify-between gap-2 text-xs"><span className="text-slate-600">{row.label}</span><strong className="tabular-nums text-[#111A43]">{loading?'—':row.value.toLocaleString('en-NG')}</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-[width] duration-500" style={{width:loading?'0%':`${Math.min(100,row.value/maxCount*100)}%`,backgroundColor:row.color}}/></div></div>)}</div>
      </section>
      <section aria-label="Quick actions" className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <h2 className="mb-3 text-sm font-bold text-[#111A43]">Quick access</h2>
        {actions.length?<div className="space-y-2">{actions.map(({label,tab,icon:Icon})=><button key={label} type="button" onClick={()=>onNavigateTab(tab)} className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-left text-xs font-semibold text-[#111A43] transition hover:border-[#C62839] hover:bg-slate-50"><Icon size={16} className="shrink-0 text-[#C62839]"/><span className="min-w-0 flex-1">{label}</span><ArrowUpRight size={14} className="text-slate-400"/></button>)}</div>:<p className="text-xs text-slate-500">Your role has no additional dashboard shortcuts.</p>}
      </section>
    </div>
    {permissions.includes('applications.read')&&<section className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2"><div><h2 className="text-sm font-bold text-[#111A43]">Recent applications</h2><p className="text-[11px] text-slate-500">Latest application submissions and status updates</p></div><button type="button" onClick={()=>onNavigateTab('students')} className="shrink-0 text-xs font-semibold text-[#C62839]">View all</button></div>
      {activityLoading?<div className="space-y-2" aria-label="Loading recent applications">{[0,1,2].map(i=><div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100"/>)}</div>:activities.length?<div className="divide-y divide-slate-100">{activities.map(item=><button key={item.id} type="button" onClick={()=>onNavigateTab('students')} className="flex w-full min-w-0 items-center justify-between gap-3 py-2 text-left hover:bg-slate-50"><span className="min-w-0"><span className="block truncate text-xs font-semibold capitalize text-[#111A43]">{item.title}</span><span className="mt-0.5 block truncate text-[11px] text-slate-500">{item.body}</span></span><span className="shrink-0 text-[10px] text-slate-400">{item.created_at?new Date(item.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'}):'—'}</span></button>)}</div>:<p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">No application records are available yet.</p>}
    </section>}
  </div>;
}
