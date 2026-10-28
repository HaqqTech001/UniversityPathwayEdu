import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, FileText, GraduationCap, Layers3, Plus, RefreshCw, Search, SlidersHorizontal, Users, X } from 'lucide-react';

type Area = 'Programmes' | 'Subjects' | 'Classes & Streams' | 'Timetable' | 'Attendance' | 'Assignments';
type AcademicRecord = { id:string; title:string; subtitle?:string; status?:string; details:Record<string,string> };
const sections = [
  {name:'Programmes', icon:GraduationCap, description:'Programme records'},
  {name:'Subjects', icon:BookOpen, description:'Courses and subjects'},
  {name:'Classes & Streams', icon:Layers3, description:'Class organisation'},
  {name:'Timetable', icon:CalendarDays, description:'Schedules and sessions'},
  {name:'Attendance', icon:ClipboardCheck, description:'Attendance records'},
  {name:'Assignments', icon:FileText, description:'Tasks and submissions'},
] as const;
const toast=(message:string)=>window.dispatchEvent(new CustomEvent('upec-admin-toast',{detail:{message,kind:'info'}}));

/** Academic lists require a verified API contract. Never populate them with design-preview records. */
export default function AdminAcademicPage(){
  const [area,setArea]=useState<Area|null>(null);
  const [selected,setSelected]=useState<AcademicRecord|null>(null);
  const [query,setQuery]=useState('');
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const [status,setStatus]=useState('All');
  const [showFilters,setShowFilters]=useState(false);
  const [refreshCount,setRefreshCount]=useState(0);
  const records:AcademicRecord[]=[];
  const filtered=useMemo(()=>records.filter(item=>(status==='All'||item.status===status)&&[item.title,item.subtitle,...Object.values(item.details)].some(value=>String(value||'').toLowerCase().includes(query.trim().toLowerCase()))),[records,query,status]);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const currentPage=Math.min(page,pages);
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const open=(next:Area)=>{setArea(next);setSelected(null);setQuery('');setStatus('All');setPage(1);setShowFilters(false);};
  const back=()=>{setArea(null);setSelected(null);setQuery('');setPage(1);};
  useEffect(()=>{setPage(1);},[query,status,pageSize]);
  const refresh=()=>{setRefreshCount(n=>n+1);toast('Academic records are awaiting a connected staff API; no demonstration data will be shown.');};
  return <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
    <header className="flex shrink-0 min-w-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold leading-tight tracking-tight text-[#111A43] sm:text-2xl">Academic Management</h1>
        <p className="truncate text-[10px] leading-tight text-slate-500 sm:text-xs">Manage programmes, subjects, classes, schedules and academic records</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label="Refresh academic records" title="Refresh academic records" onClick={refresh} className="rounded-lg border border-slate-200 bg-white p-2 text-[#111A43] hover:bg-slate-50"><RefreshCw size={17}/></button>
        <button type="button" onClick={()=>toast('Creating academic records requires the authenticated academic management API.')} className="inline-flex items-center gap-1 rounded-lg bg-[#C62839] px-3 py-2 text-xs font-bold text-white hover:bg-[#af2232]"><Plus size={16}/>Create</button>
      </div>
    </header>
    {!area ? <>
      <section className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Academic statistics">
        {[
          {label:'Programmes',icon:GraduationCap},
          {label:'Subjects',icon:BookOpen},
          {label:'Classes',icon:Users},
          {label:'Attendance',icon:ClipboardCheck},
        ].map(({label,icon:Icon})=><div key={label} className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-white p-3"><span className="rounded-lg bg-[#F7F8FC] p-2 text-[#111A43]"><Icon size={18}/></span><div className="min-w-0"><p className="text-[10px] text-slate-500">{label}</p><p className="text-sm font-bold text-[#111A43]" title="Awaiting verified API">—</p></div></div>)}
      </section>
      <section className="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
        <h2 className="text-sm font-bold text-[#111A43]">Academic workspace</h2>
        <p className="mt-0.5 text-xs text-slate-500">Choose a section to manage its records.</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {sections.map(({name,icon:Icon,description})=><button key={name} type="button" onClick={()=>open(name)} className="group flex min-w-0 flex-col items-start gap-2 rounded-xl border border-slate-200 bg-[#F7F8FC] p-3 text-left transition hover:border-[#C62839] hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839] sm:p-4"><span className="rounded-lg bg-white p-2 text-[#111A43] group-hover:text-[#C62839]"><Icon size={20}/></span><span className="text-xs font-bold text-[#111A43] sm:text-sm">{name}</span><span className="hidden text-[11px] text-slate-500 sm:block">{description}</span></button>)}
        </div>
      </section>
    </> : <>
      <div className="flex shrink-0 items-center justify-between gap-2">
        <button type="button" onClick={back} className="inline-flex items-center gap-1 text-xs font-semibold text-[#111A43] hover:text-[#C62839]"><ArrowLeft size={16}/>Academic workspace</button>
        <span className="truncate text-xs font-bold text-[#111A43]">{area}</span>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <div className="relative min-w-[140px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${area.toLowerCase()}…`} aria-label={`Search ${area}`} className="w-full rounded-lg border border-slate-200 bg-[#F7F8FC] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]"/></div>
        <button type="button" aria-expanded={showFilters} onClick={()=>setShowFilters(v=>!v)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#111A43]"><SlidersHorizontal size={15}/>Filters</button>
        {showFilters&&<select aria-label="Record status" value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option>All</option><option>Active</option><option>Inactive</option><option>Pending</option></select>}
      </div>
      <div className="flex min-h-0 min-w-0 flex-1 gap-2">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={`${area} records`}>
          <div className="shrink-0 border-b border-slate-100 px-3 py-3"><h2 className="text-sm font-bold text-[#111A43]">{area} records</h2><p className="text-[11px] text-slate-500">Verified academic records only</p></div>
          <div className="min-h-0 flex-1 overflow-auto">
            <div className="hidden min-w-[480px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px] gap-3 border-b border-slate-100 bg-[#F7F8FC] px-4 py-3 text-[11px] font-bold uppercase text-slate-500 sm:grid"><span>Record</span><span>Information</span><span>Status</span></div>
            {visible.map(item=><button key={item.id} type="button" onClick={()=>setSelected(item)} className={`grid w-full grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px] sm:gap-3 ${selected?.id===item.id?'bg-rose-50':''}`}><span className="truncate text-xs font-semibold text-[#111A43]">{item.title}</span><span className="truncate text-xs text-slate-500">{item.subtitle||'—'}</span><span className="text-xs text-slate-600">{item.status||'—'}</span></button>)}
            {!visible.length&&<div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 py-10 text-center"><FileText size={28} className="text-slate-300"/><p className="text-sm font-semibold text-[#111A43]">No verified {area.toLowerCase()} records available</p><p className="max-w-md text-xs text-slate-500">This academic section is awaiting its authenticated data endpoint. No example records or invented totals are displayed.</p></div>}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white p-3 text-xs text-slate-600">
            <span>Showing {filtered.length?(currentPage-1)*pageSize+1:0}–{Math.min(currentPage*pageSize,filtered.length)} of {filtered.length}</span>
            <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={currentPage===1} onClick={()=>setPage(p=>Math.max(1,p-1))} aria-label="Previous page" className="rounded-lg border px-2 py-1 disabled:opacity-40"><ChevronLeft size={15}/></button><span>Page {currentPage} of {pages}</span><button type="button" disabled={currentPage===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} aria-label="Next page" className="rounded-lg border px-2 py-1 disabled:opacity-40"><ChevronRight size={15}/></button><select aria-label="Records per page" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="rounded-lg border px-2 py-1"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></div>
          </footer>
        </section>
        {selected&&<aside className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 shadow-xl sm:static sm:z-auto sm:w-[340px] sm:shrink-0 sm:rounded-2xl sm:border sm:border-slate-200" aria-label="Academic record details"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#111A43]">Record details</h3><button type="button" onClick={()=>setSelected(null)} aria-label="Close details" className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div><p className="mt-4 break-words text-sm font-bold text-[#111A43]">{selected.title}</p>{Object.entries(selected.details).map(([key,value])=><div key={key} className="border-b border-slate-100 py-3"><p className="text-[11px] text-slate-500">{key}</p><p className="break-words text-xs font-medium text-[#111A43]">{value}</p></div>)}</aside>}
      </div>
    </>}
  </div>;
}
