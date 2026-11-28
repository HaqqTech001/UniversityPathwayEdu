import React,{useEffect,useState} from 'react';
type Member={account_id:string;role:string;permissions:unknown;active:boolean;full_name?:string|null;email?:string|null};
export default function LiveStaffDirectory(){
 const [members,setMembers]=useState<Member[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [revision,setRevision]=useState(0);
 useEffect(()=>{
  const controller=new AbortController();setLoading(true);setError('');
  const root=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
  fetch(root+'/api/staff/members',{signal:controller.signal,headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_admin_session')}})
   .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Staff directory unavailable');return data;})
   .then(data=>{if(!controller.signal.aborted)setMembers(Array.isArray(data.members)?data.members:[]);})
   .catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load staff');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[revision]);
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
  <div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-[#111A43]">Staff directory</h2><p className="text-xs text-slate-500">Authenticated staff accounts and assigned roles. Names are not available from this API.</p></div><button type="button" disabled={loading} onClick={()=>setRevision(n=>n+1)} className="rounded-lg border px-3 py-2 text-xs disabled:opacity-50">Refresh</button></div>
  {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
  {loading?<p className="text-sm">Loading staff…</p>:!error&&members.length===0?<p className="text-sm">No staff records found.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead><tr className="border-b"><th className="p-2">Staff member</th><th className="p-2">Role</th><th className="p-2">Status</th><th className="p-2">Permissions</th></tr></thead><tbody>{members.map(m=><tr key={m.account_id} className="border-b"><td className="p-2"><div className="font-semibold text-slate-800">{m.full_name||"Name unavailable"}</div><div className="break-all text-[11px] text-slate-500">{m.email||m.account_id}</div></td><td className="p-2">{m.role}</td><td className="p-2">{m.active?'Active':'Inactive'}</td><td className="p-2">{Array.isArray(m.permissions)?m.permissions.join(', '):m.permissions&&typeof m.permissions==='object'?Object.keys(m.permissions).join(', '):'—'}</td></tr>)}</tbody></table></div>}
  <p className="text-xs text-amber-800">Account creation and role changes require additional authorized backend endpoints.</p>
 </section>;
}
