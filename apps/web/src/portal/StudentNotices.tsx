import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
type Notice={id:string;title:string;body:string;published_at:string};
export default function StudentNotices(){
 const [notices,setNotices]=useState<Notice[]>([]);
 const [query,setQuery]=useState('');
 const [loading,setLoading]=useState(true),[error,setError]=useState(''),[refreshing,setRefreshing]=useState(false);
 const load=async()=>{
  const token=getStudentToken();
  if(!token){setError('Please sign in again.');setLoading(false);return;}
  setRefreshing(true);
  try{const result=await upecAuthApi.studentNotices(token);setNotices(result.notices||[]);setError('');}
  catch(e){setError(e instanceof Error?e.message:'Unable to load notices.');}
  finally{setLoading(false);setRefreshing(false);}
 };
 useEffect(()=>{void load();},[]);
 const visible=notices.filter(n=>(n.title+' '+n.body).toLowerCase().includes(query.trim().toLowerCase()));
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-labelledby="student-notices-heading">
  <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 id="student-notices-heading" className="font-serif text-xl font-bold text-[#111a43]">Student Notice Board</h2><p className="mt-2 text-sm text-slate-600">Official announcements published by UPEC administration.</p></div><button type="button" onClick={()=>void load()} disabled={refreshing} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-[#111a43] disabled:opacity-50">{refreshing?'Checking…':'Refresh notices'}</button></div>
  {error&&<p role="alert" className="mt-5 text-red-700">{error}</p>}
  {!loading&&notices.length>0&&<label className="mt-5 block text-sm font-semibold text-[#111a43]">Search announcements<input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by title or content" className="mt-2 block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 focus:border-[#111a43] focus:outline-none focus:ring-2 focus:ring-[#111a43]/20"/></label>}
  {loading?<p className="mt-5">Loading notices…</p>:notices.length===0?<p className="mt-5 text-sm text-slate-500">No published announcements yet.</p>:visible.length===0?<p className="mt-5 text-sm text-slate-500">No announcements match your search.</p>:<div className="mt-5 space-y-4">{visible.map(n=><article key={n.id} className="rounded-xl border border-slate-200 bg-[#f7f8fc] p-4 sm:p-5"><time dateTime={n.published_at} className="text-xs font-bold text-[#c62839]">{new Date(n.published_at).toLocaleDateString('en-NG',{day:'numeric',month:'long',year:'numeric'})}</time><h3 className="mt-2 text-lg font-bold text-[#111a43]">{n.title}</h3><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{n.body}</p></article>)}</div>}
 </section>;
}
