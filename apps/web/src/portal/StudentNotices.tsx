import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
export default function StudentNotices(){
 const [notices,setNotices]=useState<Array<{id:string;title:string;body:string;published_at:string}>>([]);
 const [loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{const token=getStudentToken();if(!token){setError('Please sign in again.');setLoading(false);return;}upecAuthApi.studentNotices(token).then(r=>setNotices(r.notices)).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="font-serif text-xl font-bold text-[#111a43]">Student Notice Board</h2><p className="mt-2 text-sm text-slate-600">Official announcements published by UPEC administration.</p>{loading?<p className="mt-5">Loading notices...</p>:error?<p role="alert" className="mt-5 text-red-700">{error}</p>:notices.length===0?<p className="mt-5 text-sm text-slate-500">No published announcements yet.</p>:<div className="mt-5 space-y-4">{notices.map(n=><article key={n.id} className="rounded-xl border border-slate-200 p-4"><span className="text-xs font-bold text-[#c62839]">{new Date(n.published_at).toLocaleDateString()}</span><h3 className="mt-1 font-bold text-[#111a43]">{n.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{n.body}</p></article>)}</div>}</section>;
}
