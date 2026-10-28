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
const toast=(message:string,kind:'info'|'error'|'success'='info')=>window.dispatchEvent(new CustomEvent('upec-admin-toast',{detail:{message,kind}}));

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
  const [catalogue,setCatalogue]=useState<{programmes:any[];subjects:any[]}>({programmes:[],subjects:[]});
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [editing,setEditing]=useState<AcademicRecord|null|undefined>(undefined);
  const [form,setForm]=useState({name:'',code:'',programmeId:'',active:true});
  const [saving,setSaving]=useState(false);
  const [deleting,setDeleting]=useState(false);
  const request=async(path:string,init:RequestInit={})=>{
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token)throw Error('Please sign in to the staff portal.');
    const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/academic'+path,{...init,headers:{Authorization:'Bearer '+token,...(init.body?{'Content-Type':'application/json'}:{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'Academic request failed.');
    return data;
  };
  useEffect(()=>{let active=true;setLoading(true);setError('');request('/catalogue').then(data=>{if(active)setCatalogue({programmes:data.programmes||[],subjects:data.subjects||[]});}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[refreshCount]);
  const records:AcademicRecord[]=(area==='Programmes'?catalogue.programmes:area==='Subjects'?catalogue.subjects:[]).map(item=>({id:item.id,title:item.name,subtitle:item.code,status:item.active?'Active':'Inactive',details:{Code:item.code,Name:item.name,Status:item.active?'Active':'Inactive',...(item.programme_id?{'Programme ID':item.programme_id}:{})}}));
  const beginEdit=(item?:AcademicRecord)=>{setEditing(item||null);setForm({name:item?.title||'',code:item?.subtitle||'',programmeId:item?.details['Programme ID']||catalogue.programmes[0]?.id||'',active:item?.status!=='Inactive'});};
  const save=async()=>{if(area!=='Programmes'&&area!=='Subjects')return;if(area==='Subjects'&&!form.programmeId){toast('Create a programme before adding subjects.','error');return;}setSaving(true);try{const resource=area.toLowerCase(),body={name:form.name.trim(),code:form.code.trim().toUpperCase(),active:form.active,...(area==='Subjects'?{programmeId:form.programmeId}:{})};await request('/'+resource+(editing?.id?'/'+editing.id:''),{method:editing?.id?'PATCH':'POST',body:JSON.stringify(body)});toast('Academic record saved.','success');setEditing(undefined);setSelected(null);setRefreshCount(n=>n+1);}catch(e:any){toast(e.message,'error');}finally{setSaving(false);}};
  const remove=async(item:AcademicRecord)=>{if(area!=='Programmes'&&area!=='Subjects'||!window.confirm('Delete '+item.title+' permanently?'))return;setDeleting(true);try{await request('/'+area.toLowerCase()+'/'+item.id,{method:'DELETE'});toast('Academic record deleted.','success');setSelected(null);setRefreshCount(n=>n+1);}catch(e:any){toast(e.message,'error');}finally{setDeleting(false);}};
  const filtered=useMemo(()=>records.filter(item=>(status==='All'||item.status===status)&&[item.title,item.subtitle,...Object.values(item.details)].some(value=>String(value||'').toLowerCase().includes(query.trim().toLowerCase()))),[records,query,status]);
  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const currentPage=Math.min(page,pages);
  const visible=filtered.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const open=(next:Area)=>{setArea(next);setSelected(null);setQuery('');setStatus('All');setPage(1);setShowFilters(false);};
  const back=()=>{setArea(null);setSelected(null);setQuery('');setPage(1);};
  useEffect(()=>{setPage(1);},[query,status,pageSize]);
  const refresh=()=>setRefreshCount(n=>n+1);
  return <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden">
    {!area&&<header className="flex shrink-0 min-w-0 items-start justify-between gap-2">
      <div className="min-w-0">
        <h1 className="truncate text-xl font-extrabold leading-tight tracking-tight text-[#111A43] sm:text-2xl">Academic Management</h1>
        <p className="truncate text-[10px] leading-tight text-slate-500 sm:text-xs">Manage programmes, subjects, classes, schedules and academic records</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label="Refresh academic records" title="Refresh academic records" onClick={refresh} className="rounded-lg border border-slate-200 bg-white p-2 text-[#111A43] hover:bg-slate-50"><RefreshCw size={17}/></button>

      </div>
    </header>}
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
      <div className="flex shrink-0 min-w-0 items-center gap-2 sm:gap-3"><button type="button" onClick={back} className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[#111A43] hover:text-[#C62839]"><ArrowLeft size={16}/>Back</button><div className="flex min-w-0 flex-1 items-center gap-2"><span className="min-w-0 flex-1 truncate text-lg font-extrabold text-[#111A43] sm:text-xl">{area}</span><button type="button" onClick={refresh} aria-label={`Refresh ${area}`} className="rounded-lg border border-slate-200 bg-white p-2 text-[#111A43]"><RefreshCw size={16}/></button>{(area==='Programmes'||area==='Subjects')&&<button type="button" onClick={()=>beginEdit()} className="inline-flex items-center gap-1 rounded-lg bg-[#C62839] px-3 py-2 text-xs font-bold text-white"><Plus size={15}/>Create</button>}</div></div>
      {area!=='Attendance'&&area!=='Timetable'&&<div className="flex shrink-0 flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <div className="relative min-w-[140px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${area.toLowerCase()}…`} aria-label={`Search ${area}`} className="w-full rounded-lg border border-slate-200 bg-[#F7F8FC] py-2 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]"/></div>
        <button type="button" aria-expanded={showFilters} onClick={()=>setShowFilters(v=>!v)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#111A43]"><SlidersHorizontal size={15}/>Filters</button>
        {showFilters&&<select aria-label="Record status" value={status} onChange={e=>setStatus(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-xs"><option>All</option><option>Active</option><option>Inactive</option><option>Pending</option></select>}
      </div>}
      {area==='Attendance'?<section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-[#111A43]">Attendance analytics</h2><p className="mt-1 text-xs text-slate-500">Attendance trends and breakdowns will display when verified attendance records are available.</p><div className="mt-4 flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-500">No attendance data available for charting</div></section>:area==='Timetable'?<section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4"><h2 className="text-sm font-bold text-[#111A43]">Academic timetable</h2><p className="mt-1 text-xs text-slate-500">Scheduled classes will appear in a weekly calendar when timetable records are connected.</p><div className="mt-4 grid grid-cols-5 gap-1 sm:gap-2">{['Monday','Tuesday','Wednesday','Thursday','Friday'].map(day=><div key={day} className="min-h-40 rounded-lg border border-slate-200 bg-slate-50 p-2"><h3 className="break-words text-[10px] font-semibold text-[#111A43] sm:text-xs">{day}</h3><p className="mt-3 text-[10px] text-slate-400">No sessions</p></div>)}</div></section>:<div className="flex min-h-0 min-w-0 flex-1 gap-2">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-label={`${area} records`}>
          <div className="shrink-0 border-b border-slate-100 px-3 py-3"><h2 className="text-sm font-bold text-[#111A43]">{area} records</h2><p className="text-[11px] text-slate-500">Verified academic records only</p></div>
          <div className="min-h-0 flex-1 overflow-auto">{loading&&<div role="status" className="space-y-3 p-4">{Array.from({length:5},(_,i)=><div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100"/>)}</div>}{error&&<p role="alert" className="p-4 text-xs text-rose-700">{error}</p>}
            <div className="hidden min-w-[480px] grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px] gap-3 border-b border-slate-100 bg-[#F7F8FC] px-4 py-3 text-[11px] font-bold uppercase text-slate-500 sm:grid"><span>Record</span><span>Information</span><span>Status</span></div>
            {visible.map(item=><button key={item.id} type="button" onClick={()=>setSelected(item)} className={`grid w-full grid-cols-1 gap-1 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_100px] sm:gap-3 ${selected?.id===item.id?'bg-rose-50':''}`}><span className="truncate text-xs font-semibold text-[#111A43]">{item.title}</span><span className="truncate text-xs text-slate-500">{item.subtitle||'—'}</span><span className="text-xs text-slate-600">{item.status||'—'}</span></button>)}
            {!loading&&!error&&!visible.length&&<div className="flex min-h-48 flex-col items-center justify-center gap-2 px-5 py-10 text-center"><FileText size={28} className="text-slate-300"/><p className="text-sm font-semibold text-[#111A43]">No verified {area.toLowerCase()} records available</p><p className="max-w-md text-xs text-slate-500">No matching verified records are available.</p></div>}
          </div>
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-white p-3 text-xs text-slate-600">
            <span>Showing {filtered.length?(currentPage-1)*pageSize+1:0}–{Math.min(currentPage*pageSize,filtered.length)} of {filtered.length}</span>
            <div className="flex flex-wrap items-center gap-2"><button type="button" disabled={currentPage===1} onClick={()=>setPage(p=>Math.max(1,p-1))} aria-label="Previous page" className="rounded-lg border px-2 py-1 disabled:opacity-40"><ChevronLeft size={15}/></button><span>Page {currentPage} of {pages}</span><button type="button" disabled={currentPage===pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} aria-label="Next page" className="rounded-lg border px-2 py-1 disabled:opacity-40"><ChevronRight size={15}/></button><select aria-label="Records per page" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="rounded-lg border px-2 py-1"><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></div>
          </footer>
        </section>
        {selected&&<aside className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 shadow-xl sm:static sm:z-auto sm:w-[340px] sm:shrink-0 sm:rounded-2xl sm:border sm:border-slate-200" aria-label="Academic record details"><div className="flex items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#111A43]">Record details</h3><button type="button" onClick={()=>setSelected(null)} aria-label="Close details" className="rounded-lg p-2 hover:bg-slate-100"><X size={18}/></button></div><p className="mt-4 break-words text-sm font-bold text-[#111A43]">{selected.title}</p>{(area==='Programmes'||area==='Subjects')&&<div className="mt-3 flex gap-2"><button type="button" onClick={()=>beginEdit(selected)} className="rounded-lg bg-[#111A43] px-3 py-2 text-xs font-bold text-white">Edit</button><button type="button" disabled={deleting} onClick={()=>remove(selected)} className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700">Delete</button></div>}{Object.entries(selected.details).map(([key,value])=><div key={key} className="border-b border-slate-100 py-3"><p className="text-[11px] text-slate-500">{key}</p><p className="break-words text-xs font-medium text-[#111A43]">{value}</p></div>)}</aside>}
      </div>}
    </>}{editing!==undefined&&<div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3"><form onSubmit={e=>{e.preventDefault();void save();}} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl"><div className="flex items-center justify-between"><h2 className="text-lg font-bold text-[#111A43]">{editing?'Edit':'Create'} {area==='Programmes'?'programme':'subject'}</h2><button type="button" onClick={()=>setEditing(undefined)} aria-label="Close form"><X size={18}/></button></div><label className="block text-xs font-semibold">Name<input required minLength={2} maxLength={160} value={form.name} onChange={e=>setForm(v=>({...v,name:e.target.value}))} className="mt-1 w-full rounded-lg border p-2"/></label><label className="block text-xs font-semibold">Code<input required minLength={2} maxLength={32} value={form.code} onChange={e=>setForm(v=>({...v,code:e.target.value.toUpperCase()}))} className="mt-1 w-full rounded-lg border p-2"/></label>{area==='Subjects'&&<label className="block text-xs font-semibold">Programme<select required value={form.programmeId} onChange={e=>setForm(v=>({...v,programmeId:e.target.value}))} className="mt-1 w-full rounded-lg border p-2"><option value="" disabled>Select programme</option>{catalogue.programmes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}<label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={form.active} onChange={e=>setForm(v=>({...v,active:e.target.checked}))}/>Active</label><div className="flex justify-end gap-2"><button type="button" onClick={()=>setEditing(undefined)} className="rounded-lg border px-4 py-2 text-xs">Cancel</button><button type="submit" disabled={saving} className="rounded-lg bg-[#C62839] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{saving?'Saving…':'Save'}</button></div></form></div>}
  </div>;
}
