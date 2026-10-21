import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
type Application={id:string;reference_number:string;programme:string;academic_session:string;status:string;student_registration_number:string|null;submitted_at:string|null};
export default function StudentApplicationRegister(){
 const [items,setItems]=useState<Application[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 const refresh=async()=>{setLoading(true);setError('');try{
  const token=getStudentToken();if(!token)throw Error('Please sign in again.');
  const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/applications/list',{headers:{Authorization:'Bearer '+token}});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to load applications');
  setItems(result.applications||[]);
 }catch(e){setError(e instanceof Error?e.message:'Unable to load applications');}finally{setLoading(false);}};
 useEffect(()=>{void refresh();},[]);
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="student-applications-heading">
 <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 id="student-applications-heading" className="text-lg font-bold text-[#111A43]">My Programme Applications</h2><p className="mt-1 text-sm text-slate-600">Every programme application has a separate record. Your registration number is issued only after admission approval.</p></div><button type="button" onClick={()=>void refresh()} disabled={loading} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-[#111A43]">Refresh</button></div>
 {loading?<p className="mt-5 text-sm">Loading applications…</p>:error?<p className="mt-5 text-sm text-red-700" role="alert">{error}</p>:items.length===0?<p className="mt-5 text-sm text-slate-600">No submitted applications found.</p>:<div className="mt-5 overflow-x-auto"><table className="min-w-[680px] w-full text-left text-sm"><thead className="bg-[#F7F8FC] text-[#111A43]"><tr><th className="p-3">Programme</th><th className="p-3">Session</th><th className="p-3">Application reference</th><th className="p-3">Admission</th><th className="p-3">Registration number</th></tr></thead><tbody>{items.map(a=><tr key={a.id} className="border-b border-slate-100"><td className="p-3 font-semibold">{a.programme}</td><td className="p-3">{a.academic_session}</td><td className="p-3">{a.reference_number}</td><td className="p-3 capitalize">{a.status.replaceAll('_',' ')}</td><td className="p-3">{a.student_registration_number||'Awaiting admission approval'}</td></tr>)}</tbody></table></div>}
 </section>;
}
