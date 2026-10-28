import React, { useEffect, useState } from 'react';
import { ArrowUpRight, FileText, ClipboardCheck, AlertCircle, GraduationCap, CreditCard, BookOpen, MessageSquare, Users, Bell } from 'lucide-react';
import { AdminTabId } from '../types';

interface Metrics { total:number; submitted:number; under_review:number; action_required:number }
interface Props { onNavigateTab?: (tab:AdminTabId)=>void }
const notify = (message:string) => window.dispatchEvent(new CustomEvent('upec-admin-toast',{detail:{message,kind:'error'}}));

export default function AdminDashboardPage({onNavigateTab=()=>{}}:Props) {
  const [metrics,setMetrics]=useState<Metrics|null>(null);
  const [loading,setLoading]=useState(true);
  const [retry,setRetry]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token){setLoading(false);return;}
    setLoading(true);
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/applications/metrics',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load application metrics.');return data;})
      .then(data=>{if(!controller.signal.aborted)setMetrics(data);})
      .catch(error=>{if(!controller.signal.aborted){setMetrics(null);notify(error instanceof Error?error.message:'Dashboard data unavailable.');}})
      .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>controller.abort();
  },[retry]);
  const cards=[
    {label:'Applications',value:metrics?.total,icon:FileText,tab:'students' as AdminTabId},
    {label:'Submitted',value:metrics?.submitted,icon:ClipboardCheck,tab:'students' as AdminTabId},
    {label:'Under review',value:metrics?.under_review,icon:Users,tab:'students' as AdminTabId},
    {label:'Action required',value:metrics?.action_required,icon:AlertCircle,tab:'students' as AdminTabId},
  ];
  const workspaces=[
    {label:'Student & Applications',description:'Review applicants and student records',tab:'students' as AdminTabId,icon:Users},
    {label:'Academic Management',description:'Programmes and academic operations',tab:'academic' as AdminTabId,icon:GraduationCap},
    {label:'Finance & Payments',description:'Invoices, receipts and payment records',tab:'finance' as AdminTabId,icon:CreditCard},
    {label:'CBT & Assessments',description:'Examinations, attempts and results',tab:'cbt' as AdminTabId,icon:ClipboardCheck},
    {label:'Learning Resources',description:'Documents and learning materials',tab:'resources' as AdminTabId,icon:BookOpen},
    {label:'Communications',description:'Conversations and messages',tab:'messages' as AdminTabId,icon:MessageSquare},
    {label:'Notifications',description:'Delivery history and scheduling',tab:'notifications' as AdminTabId,icon:Bell},
    {label:'Staff & Roles',description:'Staff accounts and permissions',tab:'staff' as AdminTabId,icon:Users},
  ];
  return <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:overflow-auto">
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-extrabold leading-tight text-[#111A43] sm:text-2xl">Dashboard</h1><p className="mt-0.5 text-sm text-slate-500">Institution operations and available live application metrics</p></div>
      <button type="button" onClick={()=>setRetry(n=>n+1)} disabled={loading} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">Refresh</button>
    </header>
    <section aria-label="Live application metrics" className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4">
      {cards.map(({label,value,icon:Icon,tab})=><button type="button" key={label} onClick={()=>onNavigateTab(tab)} className="flex min-h-[68px] min-w-0 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-[#C62839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839]">
        <div className="min-w-0"><p className="text-lg font-extrabold leading-tight text-[#111A43]">{loading?'…':typeof value==='number'?value.toLocaleString('en-NG'):'—'}</p><p className="truncate text-[11px] font-medium text-slate-600" title={label}>{label}</p></div><Icon size={19} className="shrink-0 text-[#C62839]"/>
      </button>)}
    </section>
    <section className="min-h-0 rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-3 sm:px-5"><h2 className="text-sm font-bold text-[#111A43]">Workspaces</h2><p className="mt-0.5 text-xs text-slate-500">Select a module to view its own records and management tools.</p></div>
      <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2 sm:p-4 xl:grid-cols-4">
        {workspaces.map(({label,description,tab,icon:Icon})=><button type="button" key={tab} onClick={()=>onNavigateTab(tab)} className="group flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-[#F7F8FC] p-3 text-left transition hover:border-[#C62839] hover:bg-white">
          <span className="rounded-lg bg-white p-2 text-[#111A43]"><Icon size={18}/></span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold text-[#111A43]">{label}</span><span className="mt-1 block text-xs leading-relaxed text-slate-500">{description}</span></span>
          <ArrowUpRight size={15} className="shrink-0 text-slate-400 group-hover:text-[#C62839]"/>
        </button>)}
      </div>
    </section>
    {!loading&&!metrics&&<p className="text-xs text-slate-500">Live application totals are unavailable until staff authentication and the metrics API are accessible. No estimated figures are displayed.</p>}
  </div>;
}
