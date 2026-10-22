import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
type Resource={id:string;title:string;description:string;resource_url:string;resource_type:string;subject_id:string};
export default function StudentLearningResources(){
 const [items,setItems]=useState<Resource[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true),[search,setSearch]=useState(''),[typeFilter,setTypeFilter]=useState('all');
 const load=async()=>{const token=getStudentToken();if(!token){setError('Sign in to access learning materials.');setBusy(false);return;}
  setBusy(true);setError('');
  try{const result=await upecAuthApi.learningResources(token);setItems(result.resources||[]);}
  catch(e){setError(e instanceof Error?e.message:'Unable to load learning materials.');}
  finally{setBusy(false);}
 };
 useEffect(()=>{void load();},[]);
 const open=async(id:string)=>{try{setError('');const token=getStudentToken();if(!token)throw Error('Sign in again.');const result=await upecAuthApi.openLearningResource(token,id);window.open(result.url,'_blank','noopener,noreferrer');}catch(e){setError(e instanceof Error?e.message:'Resource unavailable.');}};
 const matches=items.filter(r=>(typeFilter==='all'||r.resource_type===typeFilter)&&(r.title+' '+r.description+' '+r.resource_type).toLowerCase().includes(search.trim().toLowerCase()));
 return <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="learning-heading">
 <div className="flex flex-wrap items-start justify-between gap-3"><h3 id="learning-heading" className="font-serif text-lg font-bold text-[#111a43]">Learning Materials</h3><button type="button" disabled={busy} onClick={()=>void load()} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-[#111a43] disabled:opacity-50">{busy?'Refreshing…':'Refresh materials'}</button></div><p className="mt-2 text-sm text-slate-600">Approved learning notes, exercises and educational resources from UPEC teachers.</p>
 <label className="mt-4 block text-sm font-semibold text-[#111a43]">Search resources<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or topic" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
 <label className="mt-3 block text-sm font-semibold text-[#111a43]">Material type<select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 sm:max-w-sm"><option value="all">All materials</option>{[...new Set(items.map(r=>r.resource_type))].sort().map(type=><option key={type} value={type}>{type.replaceAll('_',' ')}</option>)}</select></label>
 {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
 {busy?<p className="mt-4 text-sm">Loading resources...</p>:<div className="mt-5 grid gap-4 sm:grid-cols-2">{matches.length===0?<p className="text-sm text-slate-500">No matching approved resources available.</p>:matches.map(r=><article className="rounded-xl border border-slate-200 p-4" key={r.id}><p className="text-xs font-semibold uppercase text-[#c62839]">{r.resource_type}</p><h4 className="mt-2 font-bold text-[#111a43]">{r.title}</h4><p className="mt-2 text-sm text-slate-600">{r.description}</p><button type="button" onClick={()=>void open(r.id)} className="mt-3 font-semibold text-[#c62839] underline">Open resource</button></article>)}</div>}
 </section>;
}
