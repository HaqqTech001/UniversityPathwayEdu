import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import StudentCodeOfConduct from '../components/StudentCodeOfConduct';
const VERSION='upec-student-code-2026-10-poster-v1';
export default function ConductAcknowledgement(){
 const [accepted,setAccepted]=useState(false),[checked,setChecked]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const request=async(method='GET',body?:object)=>{const token=getStudentToken();if(!token)throw Error('Please sign in.');const r=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/conduct/acceptance',{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const json=await r.json();if(!r.ok)throw Error(json.error||'Unable to save acknowledgement');return json;};
 useEffect(()=>{void request().then(r=>setAccepted(!!r.accepted)).catch(e=>setError(e.message));},[]);
 const save=async()=>{setBusy(true);setError('');try{await request('POST',{version:VERSION,accepted:true});setAccepted(true);}catch(e){setError(e.message);}finally{setBusy(false);}};
 return <section aria-label="Student conduct acceptance" className="space-y-4"><StudentCodeOfConduct/>{accepted?<p role="status" className="rounded-xl bg-emerald-50 p-4 font-semibold text-emerald-800">You have acknowledged the current Students’ Code of Conduct.</p>:<div className="rounded-xl border border-slate-200 bg-white p-5"><label className="flex items-start gap-3 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/> I have read and understand the 14 rules in UPEC’s Students’ Code of Conduct and agree to comply with them.</label><button type="button" disabled={!checked||busy} onClick={()=>void save()} className="mt-4 rounded-xl bg-[#c62839] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Saving…':'Acknowledge Code of Conduct'}</button></div>}{error&&<p role="alert" className="text-red-700">{error}</p>}</section>;
}
