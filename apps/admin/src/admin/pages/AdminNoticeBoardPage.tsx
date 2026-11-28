import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Megaphone, Plus, RefreshCw, Search, Send, Eye, FileText } from 'lucide-react';

type Notice = { id: string; title: string; body: string; audience: 'students'|'everyone'; status: 'draft'|'published'; published_at: string|null; created_at: string };
const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/staff/academic/notices';
function authHeaders(json = false): HeadersInit {
  const token = sessionStorage.getItem('upec_admin_session');
  if (!token) throw new Error('Your Admin session has expired. Please sign in again.');
  return { Authorization: 'Bearer ' + token, ...(json ? { 'Content-Type': 'application/json' } : {}) };
}
async function readError(response: Response) { const data = await response.json().catch(() => ({})); return data.error || data.message || 'Request failed (' + response.status + ').'; }

export default function AdminNoticeBoardPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<'students'|'everyone'>('students');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const response = await fetch(API, { headers: authHeaders() });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      setNotices(Array.isArray(data.notices) ? data.notices : []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load notices.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => notices.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(query.toLowerCase())), [notices, query]);
  const save = async (publish: boolean) => {
    if (title.trim().length < 5 || body.trim().length < 10) { setError('Enter a title (at least 5 characters) and announcement content (at least 10 characters).'); return; }
    setSaving(true); setError('');
    try {
      const response = await fetch(API, { method: 'POST', headers: authHeaders(true), body: JSON.stringify({ title: title.trim(), body: body.trim(), audience }) });
      if (!response.ok) throw new Error(await readError(response));
      const data = await response.json();
      if (publish && data.notice?.id) {
        const published = await fetch(API + '/' + data.notice.id + '/status', { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ status: 'published' }) });
        if (!published.ok) throw new Error(await readError(published));
      }
      setTitle(''); setBody(''); setAudience('students'); setShowForm(false); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to save notice.'); }
    finally { setSaving(false); }
  };
  const setStatus = async (notice: Notice) => {
    setError('');
    try {
      const response = await fetch(API + '/' + notice.id + '/status', { method: 'PATCH', headers: authHeaders(true), body: JSON.stringify({ status: notice.status === 'published' ? 'draft' : 'published' }) });
      if (!response.ok) throw new Error(await readError(response));
      await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to update notice.'); }
  };
  const published = notices.filter(n => n.status === 'published').length;
  const drafts = notices.length - published;

  return <div className="min-w-0 space-y-5">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h1 className="text-xl font-extrabold text-[#111A43] sm:text-2xl">Notice Board &amp; Announcements</h1><p className="mt-1 text-sm text-slate-500">Create, publish and manage official student announcements.</p></div>
      <div className="flex gap-2"><button onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-[#111A43] disabled:opacity-50"><RefreshCw size={15}/>Refresh</button><button onClick={() => setShowForm(v => !v)} className="inline-flex items-center gap-2 rounded-xl bg-[#C62839] px-4 py-2.5 text-sm font-bold text-white"><Plus size={16}/>Create notice</button></div>
    </header>
    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Total notices</p><p className="mt-1 text-2xl font-black text-[#111A43]">{notices.length}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Published</p><p className="mt-1 text-2xl font-black text-emerald-700">{published}</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-xs font-semibold text-slate-500">Drafts</p><p className="mt-1 text-2xl font-black text-amber-700">{drafts}</p></div>
    </div>
    {showForm && <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><div className="mb-4 flex items-center gap-2"><Megaphone size={18} className="text-[#C62839]"/><h2 className="font-bold text-[#111A43]">New announcement</h2></div><div className="grid gap-4"><label className="grid gap-1 text-sm font-semibold text-slate-700">Title<input maxLength={180} value={title} onChange={e=>setTitle(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal" placeholder="Announcement title"/></label><label className="grid gap-1 text-sm font-semibold text-slate-700">Audience<select value={audience} onChange={e=>setAudience(e.target.value as 'students'|'everyone')} className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal"><option value="students">Students</option><option value="everyone">Everyone</option></select></label><label className="grid gap-1 text-sm font-semibold text-slate-700">Announcement content<textarea rows={5} maxLength={6000} value={body} onChange={e=>setBody(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2.5 font-normal" placeholder="Write the full announcement..."/></label><div className="flex flex-wrap justify-end gap-2"><button onClick={()=>setShowForm(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold">Cancel</button><button disabled={saving} onClick={()=>void save(false)} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Save draft</button><button disabled={saving} onClick={()=>void save(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#C62839] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Send size={15}/>{saving?'Saving...':'Publish'}</button></div></div></section>}
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#111A43]">Live notice records</h2><p className="text-xs text-slate-500">Records are loaded from the UPEC database.</p></div><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search notices..." className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm sm:w-64"/></div></div>
      {loading ? <div className="p-10 text-center text-sm text-slate-500">Loading notices...</div> : filtered.length===0 ? <div className="p-10 text-center"><FileText size={28} className="mx-auto text-slate-300"/><p className="mt-2 text-sm font-semibold text-slate-700">No notices found</p><p className="mt-1 text-xs text-slate-500">{notices.length?'Try another search.':'Create the first announcement to get started.'}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3">Announcement</th><th className="px-4 py-3">Audience</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map(n=><tr key={n.id}><td className="max-w-md px-4 py-3"><p className="font-semibold text-[#111A43]">{n.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{n.body}</p></td><td className="px-4 py-3 text-slate-600">{n.audience==='everyone'?'Everyone':'Students'}</td><td className="px-4 py-3 text-slate-500">{new Date(n.created_at).toLocaleDateString()}</td><td className="px-4 py-3"><span className={'rounded-full px-2.5 py-1 text-xs font-bold '+(n.status==='published'?'bg-emerald-50 text-emerald-700':'bg-amber-50 text-amber-700')}>{n.status}</span></td><td className="px-4 py-3"><button onClick={()=>void setStatus(n)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#111A43]"><Eye size={13}/>{n.status==='published'?'Unpublish':'Publish'}</button></td></tr>)}</tbody></table></div>}
    </section>
  </div>;
}
