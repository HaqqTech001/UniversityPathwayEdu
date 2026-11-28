import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Activity, RefreshCw, Search, ChevronDown, FileText, CheckCircle2, Clock3, AlertCircle } from 'lucide-react';

type ActivityItem = { id: string; title: string; body: string; created_at: string; status?: string; reference_number?: string };
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
async function loadActivity(offset: number) {
  const token = sessionStorage.getItem('upec_admin_session');
  if (!token) throw new Error('Your Admin session has expired. Please sign in again.');
  const response = await fetch(API_BASE + '/api/staff/activity?limit=50&offset=' + offset, { headers: { Authorization: 'Bearer ' + token } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to load application activity.');
  return data as { activities?: ActivityItem[]; total?: number; hasMore?: boolean };
}
function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}
export default function AdminNotificationsPage() {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [error, setError] = useState('');
  const load = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await loadActivity(0);
      setItems(data.activities || []); setTotal(data.total || 0); setHasMore(Boolean(data.hasMore));
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load activity.'); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true); setError('');
    try {
      const data = await loadActivity(items.length);
      const incoming = data.activities || [];
      setItems(current => { const known = new Set(current.map(item => item.id)); return [...current, ...incoming.filter(item => !known.has(item.id))]; });
      setHasMore(Boolean(data.hasMore)); setTotal(data.total || total);
    } catch (e) { setError(e instanceof Error ? e.message : 'Unable to load more activity.'); }
    finally { setLoadingMore(false); }
  };
  const filtered = useMemo(() => items.filter(item => {
    const matchesStatus = status === 'all' || item.status === status;
    const matchesQuery = [item.title, item.body, item.reference_number].join(' ').toLowerCase().includes(query.trim().toLowerCase());
    return matchesStatus && matchesQuery;
  }), [items, query, status]);
  const statusIcon = (value?: string) => value === 'approved' ? <CheckCircle2 size={16}/> : value === 'rejected' || value === 'action_required' ? <AlertCircle size={16}/> : <Clock3 size={16}/>;
  return <div className="min-w-0 space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-extrabold tracking-tight text-[#111A43] sm:text-2xl">Activity &amp; Notifications</h1><p className="mt-1 text-xs text-slate-500">Live application status activity. This feed does not represent email or push-notification delivery.</p></div>
      <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/>Refresh</button>
    </header>
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-2xl font-black text-[#111A43]">{loading ? '—' : total.toLocaleString('en-NG')}</p><p className="mt-1 text-xs font-semibold text-slate-600">Total applications</p></div>
      <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-2xl font-black text-[#111A43]">{loading ? '—' : items.length.toLocaleString('en-NG')}</p><p className="mt-1 text-xs font-semibold text-slate-600">Activity records loaded</p></div>
      <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 sm:col-span-1"><p className="text-2xl font-black text-[#111A43]">{loading ? '—' : items.filter(item => item.status === 'under_review').length.toLocaleString('en-NG')}</p><p className="mt-1 text-xs font-semibold text-slate-600">Currently under review (loaded records)</p></div>
    </section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-2 border-b border-slate-100 p-3 sm:flex-row">
        <div className="relative min-w-0 flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search applications, students or references" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]"/></div>
        <div className="relative"><select value={status} onChange={e => setStatus(e.target.value)} className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs sm:w-48"><option value="all">All statuses</option><option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="action_required">Action required</option><option value="rejected">Rejected</option></select><ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"/></div>
      </div>
      {error && <p role="alert" className="m-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{error}</p>}
      {loading ? <p className="p-8 text-center text-xs text-slate-500">Loading live activity…</p> : filtered.length === 0 ? <div className="p-10 text-center"><Activity size={28} className="mx-auto text-slate-300"/><p className="mt-2 text-sm font-bold text-[#111A43]">No activity found</p><p className="mt-1 text-xs text-slate-500">New application submissions and review updates will appear here.</p></div> :
        <div className="divide-y divide-slate-100">{filtered.map(item => <article key={item.id} className="flex gap-3 p-4">
          <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : item.status === 'rejected' || item.status === 'action_required' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-[#111A43]'}`}>{statusIcon(item.status)}</span>
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-xs font-bold text-[#111A43]">{item.title}</h2><time className="text-[10px] text-slate-400">{formatDate(item.created_at)}</time></div><p className="mt-1 break-words text-xs text-slate-600">{item.body}</p>{item.reference_number && <p className="mt-1 font-mono text-[10px] text-slate-400">{item.reference_number}</p>}</div>
        </article>)}</div>}
      {hasMore && <div className="border-t border-slate-100 p-3 text-center"><button type="button" onClick={() => void loadMore()} disabled={loadingMore} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load more activity'}</button></div>}
    </section>
  </div>;
}
