import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
type Resource={id:string;title:string;description:string;resource_url:string;resource_type:string;subject_id:string};
export default function StudentLearningResources(){
 const [items,setItems]=useState<Resource[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true),[search,setSearch]=useState('');
 useEffect(()=>{const token=getStudentToken();if(!token){setError('Sign in to access learning materials.');setBusy(false);return;}
 upecAuthApi.learningResources(token).then(r=>setItems(r.resources)).catch(e=>setError(e.message)).finally(()=>setBusy(false));},[]);
 const matches=items.filter(r=>(r.title+' '+r.description+' '+r.resource_type).toLowerCase().includes(search.toLowerCase()));
 return <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="learning-heading">
 <h3 id="learning-heading" className="font-serif text-lg font-bold text-[#111a43]">Learning Materials</h3><p className="mt-2 text-sm text-slate-600">Approved learning notes, exercises and educational resources from UPEC teachers.</p>
 <label className="mt-4 block text-sm font-semibold text-[#111a43]">Search resources<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title or topic" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>
 {error&&<p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
 {busy?<p className="mt-4 text-sm">Loading resources...</p>:<div className="mt-5 grid gap-4 sm:grid-cols-2">{matches.length===0?<p className="text-sm text-slate-500">No matching approved resources available.</p>:matches.map(r=><article className="rounded-xl border border-slate-200 p-4" key={r.id}><p className="text-xs font-semibold uppercase text-[#c62839]">{r.resource_type}</p><h4 className="mt-2 font-bold text-[#111a43]">{r.title}</h4><p className="mt-2 text-sm text-slate-600">{r.description}</p><a className="mt-3 inline-block font-semibold text-[#c62839] underline" href={r.resource_url} target="_blank" rel="noopener noreferrer">Open resource</a></article>)}</div>}
 </section>;
}
