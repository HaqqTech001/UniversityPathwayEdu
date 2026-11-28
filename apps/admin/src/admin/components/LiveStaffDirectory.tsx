import React, { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
type Member={account_id:string;role:string;permissions:unknown;active:boolean;full_name?:string|null;email?:string|null};
export default function LiveStaffDirectory(){
 const [members,setMembers]=useState<Member[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState('');
 const [revision,setRevision]=useState(0);
 const [query,setQuery]=useState('');
 const [page,setPage]=useState(0);
 const [total,setTotal]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [pageSize,setPageSize]=useState(25);
 useEffect(()=>{
  const controller=new AbortController();
  const token=sessionStorage.getItem('upec_admin_session');
  setLoading(true);setError('');
  if(!token){setError('Your Admin session has expired. Please sign in again.');setLoading(false);return()=>controller.abort();}
  const root=(import.meta.env.VITE_API_URL||'').replace(/\/$/,'');
  fetch(root+'/api/staff/members?limit='+pageSize+'&offset='+(page*pageSize),{signal:controller.signal,headers:{Authorization:'Bearer '+token}})
   .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Staff directory unavailable');return data;})
   .then(data=>{if(!controller.signal.aborted){setMembers(Array.isArray(data.members)?data.members:[]);setTotal(Number(data.total)||0);setHasMore(Boolean(data.hasMore));}})
   .catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to load staff');})
   .finally(()=>{if(!controller.signal.aborted)setLoading(false);});
  return()=>controller.abort();
 },[revision,page,pageSize]);
 const filtered=useMemo(()=>members.filter(member=>[member.full_name,member.email,member.role,member.account_id].join(' ').toLowerCase().includes(query.trim().toLowerCase())),[members,query]);
 const permissions=(value:unknown)=>Array.isArray(value)?value.join(', '):value&&typeof value==='object'?Object.keys(value as Record<string,unknown>).join(', '):'—';
 return <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-[#111A43]">Staff directory</h2><p className="text-xs text-slate-500">Live staff accounts, assigned roles and access permissions.</p></div><button type="button" disabled={loading} onClick={()=>setRevision(n=>n+1)} className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs disabled:opacity-50"><RefreshCw size={14} className={loading?'animate-spin':''}/>Refresh</button></div>
  <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><div className="relative min-w-0 flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search this page by name, email or role" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]"/></div><span className="text-xs text-slate-500">{total.toLocaleString('en-NG')} staff accounts</span></div>
  {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
  {loading?<p className="py-8 text-center text-xs text-slate-500">Loading staff…</p>:!error&&filtered.length===0?<div className="py-10 text-center"><Users size={26} className="mx-auto text-slate-300"/><p className="mt-2 text-sm font-semibold text-slate-600">No staff records found on this page.</p></div>:!error&&<div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-xs"><thead><tr className="border-b bg-slate-50 text-slate-500"><th className="p-3">Staff member</th><th className="p-3">Role</th><th className="p-3">Status</th><th className="p-3">Permissions</th></tr></thead><tbody>{filtered.map(m=><tr key={m.account_id} className="border-b last:border-0 hover:bg-slate-50"><td className="p-3"><div className="font-semibold text-slate-800">{m.full_name||'Name unavailable'}</div><div className="break-all text-[11px] text-slate-500">{m.email||m.account_id}</div></td><td className="p-3 capitalize">{m.role.replaceAll('_',' ')}</td><td className="p-3"><span className={m.active?'rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700':'rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600'}>{m.active?'Active':'Inactive'}</span></td><td className="max-w-[260px] whitespace-normal p-3 text-slate-600">{permissions(m.permissions)}</td></tr>)}</tbody></table></div>}
  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span>Showing {total?Math.min(page*pageSize+1,total):0}–{Math.min((page+1)*pageSize,total)} of {total}</span><div className="flex items-center gap-2"><select value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(0);}} className="rounded-lg border border-slate-200 px-2 py-1.5"><option value={25}>25 per page</option><option value={50}>50 per page</option><option value={100}>100 per page</option></select><button type="button" disabled={page===0||loading} onClick={()=>setPage(n=>Math.max(0,n-1))} className="rounded-lg border px-2 py-1.5 disabled:opacity-40"><ChevronLeft size={15}/></button><span>Page {page+1} of {Math.max(1,Math.ceil(total/pageSize))}</span><button type="button" disabled={!hasMore||loading} onClick={()=>setPage(n=>n+1)} className="rounded-lg border px-2 py-1.5 disabled:opacity-40"><ChevronRight size={15}/></button></div></div>
  <p className="text-[11px] text-amber-800">Creating staff accounts and changing roles or permissions are not available until the backend exposes those authorized actions.</p>
 </section>;
}
