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
  const [activeGraph,setActiveGraph]=useState(0);
  const [notifications,setNotifications]=useState<{id:string;title:string;body:string;created_at:string}[]>([]);
  const [notificationsReady,setNotificationsReady]=useState(false);
  useEffect(()=>{
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token){setNotificationsReady(true);return;}
    const controller=new AbortController();
    setNotificationsReady(false);
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/notifications',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{if(!response.ok)throw Error('Notifications unavailable');return response.json();})
      .then(data=>{if(!controller.signal.aborted){const items=Array.isArray(data)?data:Array.isArray(data.notifications)?data.notifications:[];setNotifications(items.map((item:Record<string,unknown>)=>({id:String(item.id||''),title:String(item.title||'Notification'),body:String(item.message||item.body||''),created_at:String(item.created_at||item.sent_at||'')})).sort((a:{created_at:string},b:{created_at:string})=>Date.parse(b.created_at)-Date.parse(a.created_at)).slice(0,5));}})
      .catch(()=>{if(!controller.signal.aborted)setNotifications([]);})
      .finally(()=>{if(!controller.signal.aborted)setNotificationsReady(true);});
    return()=>controller.abort();
  },[retry]);
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
  const actions=[
    {label:'Review applications',tab:'students' as AdminTabId,icon:ClipboardCheck},
    {label:'Review payments',tab:'finance' as AdminTabId,icon:CreditCard},
    {label:'Manage assessments',tab:'cbt' as AdminTabId,icon:BookOpen},
    {label:'Send notification',tab:'notifications' as AdminTabId,icon:Bell},
  ];
  const breakdown=[
    {label:'Submitted',value:metrics?.submitted||0,color:'bg-[#111A43]'},
    {label:'Under review',value:metrics?.under_review||0,color:'bg-[#D5A75B]'},
    {label:'Action required',value:metrics?.action_required||0,color:'bg-[#C62839]'},
  ];
  const maxCount=Math.max(1,...breakdown.map(item=>item.value));
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
    <section aria-label="Quick actions" className="shrink-0">
      <h2 className="mb-2 text-sm font-bold text-[#111A43]">Quick actions</h2>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {actions.map(({label,tab,icon:Icon})=><button key={label} type="button" onClick={()=>onNavigateTab(tab)} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-3 text-left text-xs font-semibold text-[#111A43] hover:border-[#C62839]"><Icon size={17} className="shrink-0 text-[#C62839]"/><span className="min-w-0 flex-1">{label}</span><ArrowUpRight size={14} className="shrink-0 text-slate-400"/></button>)}
      </div>
    </section>
    <section aria-label="Dashboard charts" className="min-w-0">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold text-[#111A43]">Overview charts</h2>
        <div className="flex items-center gap-1 sm:hidden">
          <button type="button" aria-label="Previous chart" onClick={()=>setActiveGraph(0)} className={`rounded-lg px-3 py-1 text-xs ${activeGraph===0?'bg-[#111A43] text-white':'bg-white text-slate-600'}`}>1</button>
          <button type="button" aria-label="Next chart" onClick={()=>setActiveGraph(1)} className={`rounded-lg px-3 py-1 text-xs ${activeGraph===1?'bg-[#111A43] text-white':'bg-white text-slate-600'}`}>2</button>
        </div>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible" ref={element=>{if(element&&element.dataset.bound!=='true'){element.dataset.bound='true';}}}>
        <div className={`min-w-0 w-full shrink-0 snap-center sm:w-auto ${activeGraph===0?'':'max-sm:hidden'}`}>
      <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-bold text-[#111A43]">Application overview</h2><span className="text-[11px] text-slate-400">Current records</span></div>
        <div className="flex flex-col items-center justify-center gap-3 py-4 sm:flex-row">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full" style={{background:metrics&&metrics.total>0?`conic-gradient(#C62839 0% ${Math.min(100,(metrics.action_required/metrics.total)*100)}%, #111A43 ${Math.min(100,(metrics.action_required/metrics.total)*100)}% 100%)`:'#e2e8f0'}}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><strong className="text-2xl font-extrabold text-[#111A43]">{loading||!metrics?'—':metrics.total}</strong><span className="text-[10px] text-slate-500">Applications</span></div></div>
          <div className="text-xs text-slate-600"><p><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#C62839]"/>Action required: {metrics?.action_required??'—'}</p><p className="mt-2"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#111A43]"/>Other applications: {metrics?Math.max(0,metrics.total-metrics.action_required):'—'}</p></div>
        </div>
      </div>
        </div>
        <div className={`min-w-0 w-full shrink-0 snap-center sm:w-auto ${activeGraph===1?'':'max-sm:hidden'}`}>
          <div className="h-full rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="mb-4 text-sm font-bold text-[#111A43]">Application review distribution</h3>
            <div className="space-y-4">
              {breakdown.map(item=><div key={item.label}><div className="mb-1 flex justify-between text-xs"><span className="text-slate-600">{item.label}</span><strong>{loading||!metrics?'—':item.value.toLocaleString('en-NG')}</strong></div><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.color}`} style={{width:metrics?`${Math.min(100,item.value/maxCount*100)}%`:'0%'}}/></div></div>)}
            </div>
          </div>
        </div>
      </div>
    </section>
    <section className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-bold text-[#111A43]">Recent activities</h2><p className="text-xs text-slate-500">Five latest available activity records</p></div><button type="button" onClick={()=>onNavigateTab('notifications')} className="text-xs font-semibold text-[#C62839]">View all</button></div>
      {notifications.length?<div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">{notifications.map((item,index)=><button type="button" key={item.id||index} onClick={()=>onNavigateTab('notifications')} className="min-w-0 rounded-xl border border-slate-200 bg-[#F7F8FC] p-3 text-left hover:border-[#C62839]"><p className="truncate text-xs font-bold text-[#111A43]">{item.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.body}</p><p className="mt-2 text-[10px] text-slate-400">{item.created_at?new Date(item.created_at).toLocaleDateString():''}</p></button>)}</div>:<p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">{notificationsReady?'No recent activity records are available from the staff API.':'Loading recent notifications…'}</p>}
    </section>
    {!loading&&!metrics&&<p className="text-xs text-slate-500">Live application totals are unavailable until staff authentication and the metrics API are accessible. No estimated figures are displayed.</p>}
  </div>;
}
