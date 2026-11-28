import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Search, Send, RefreshCw, UserRound, ArrowLeft, Paperclip, AlertCircle } from 'lucide-react';

type Conversation = {
  student_account_id: string;
  body: string;
  created_at: string;
  author_role: string;
  student: { id: string; full_name?: string | null; email?: string | null; phone?: string | null } | null;
};
type Message = {
  id: string;
  author_role: string;
  body: string;
  created_at: string;
  attachments?: { id: string; file_name: string; mime_type: string; size_bytes: number }[];
};
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const API_ROOT = '/api/staff';

function authToken() {
  const token = sessionStorage.getItem('upec_admin_session');
  if (!token) throw new Error('Your Admin session has expired. Please sign in again.');
  return token;
}
async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', 'Bearer ' + authToken());
  if (init.body && !(init.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(API_BASE + API_ROOT + path, { ...init, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'The messaging request could not be completed.');
  return data as T;
}
function dateLabel(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const threadEnd = useRef<HTMLDivElement>(null);

  const loadConversations = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true); else setLoading(true);
    setError('');
    try {
      const data = await api<{ conversations?: Conversation[] }>('/support/conversations');
      const rows = data.conversations || [];
      setConversations(rows);
      setSelectedId(current => current && rows.some(row => row.student_account_id === current) ? current : rows[0]?.student_account_id || '');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load support conversations.');
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, []);

  const loadThread = useCallback(async (studentId: string) => {
    if (!studentId) { setMessages([]); return; }
    setThreadLoading(true); setError('');
    try {
      const data = await api<{ messages?: Message[] }>('/support/conversations/' + encodeURIComponent(studentId));
      setMessages(data.messages || []);
    } catch (e) {
      setMessages([]);
      setError(e instanceof Error ? e.message : 'Unable to load this conversation.');
    } finally { setThreadLoading(false); }
  }, []);

  useEffect(() => { void loadConversations(); }, [loadConversations]);
  useEffect(() => { void loadThread(selectedId); }, [selectedId, loadThread]);
  useEffect(() => { threadEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const filtered = useMemo(() => conversations.filter(row => {
    const student = row.student;
    const haystack = [student?.full_name, student?.email, student?.phone, row.body].join(' ').toLowerCase();
    return haystack.includes(search.trim().toLowerCase());
  }), [conversations, search]);
  const selected = conversations.find(row => row.student_account_id === selectedId);
  const notify = (message: string, kind: 'success' | 'error' = 'success') =>
    window.dispatchEvent(new CustomEvent('upec-admin-toast', { detail: { message, kind } }));

  const openAttachment = async (fileId: string) => {
    const popup = window.open('about:blank', '_blank');
    if (popup) popup.opener = null;
    try {
      const result = await api<{ url: string }>('/support/files/' + encodeURIComponent(fileId));
      if (!popup) throw new Error('Allow pop-ups for this site to open attachments.');
      popup.location.href = result.url;
    } catch (e) {
      popup?.close();
      const message = e instanceof Error ? e.message : 'Unable to open attachment.';
      setError(message); notify(message, 'error');
    }
  };

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = draft.trim();
    if (!selectedId || !body || sending) return;
    setSending(true); setError('');
    try {
      const data = await api<{ message: Message }>('/support/conversations/' + encodeURIComponent(selectedId), {
        method: 'POST', body: JSON.stringify({ body }),
      });
      setMessages(current => [...current, data.message]);
      setDraft('');
      await loadConversations(true);
      notify('Message sent to the student.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Unable to send message.';
      setError(message); notify(message, 'error');
    } finally { setSending(false); }
  };

  return <div className="min-w-0 space-y-4 sm:space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <div><h1 className="text-xl font-extrabold tracking-tight text-[#111A43] sm:text-2xl">Student Support Inbox</h1><p className="mt-1 text-xs text-slate-500">Real conversations from the authenticated student support service.</p></div>
      <button type="button" onClick={() => void loadConversations(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50"><RefreshCw size={15} className={refreshing ? 'animate-spin' : ''}/>Refresh</button>
    </header>
    {error && <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800"><AlertCircle size={16} className="shrink-0"/><span>{error}</span></div>}
    <div className="grid min-h-[520px] grid-cols-1 gap-3 overflow-hidden rounded-2xl lg:grid-cols-12">
      <aside className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-4 ${selectedId ? 'hidden lg:flex lg:flex-col' : 'flex flex-col'}`}>
        <div className="border-b border-slate-100 p-3">
          <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students or messages" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-[#111A43]"/></div>
          <p className="mt-2 text-[11px] text-slate-500">{conversations.length} conversations · latest 100</p>
        </div>
        <div className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto">
          {loading && <p className="p-5 text-xs text-slate-500">Loading conversations…</p>}
          {!loading && filtered.length === 0 && <div className="p-8 text-center"><MessageSquare size={25} className="mx-auto text-slate-300"/><p className="mt-2 text-xs font-semibold text-slate-600">No conversations found</p><p className="mt-1 text-[11px] text-slate-400">Student support messages will appear here.</p></div>}
          {filtered.map(row => {
            const name = row.student?.full_name || row.student?.email || 'Student';
            return <button key={row.student_account_id} type="button" onClick={() => setSelectedId(row.student_account_id)} className={`flex w-full items-start gap-3 p-3 text-left hover:bg-slate-50 ${selectedId === row.student_account_id ? 'border-l-4 border-[#C62839] bg-rose-50/50' : ''}`}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111A43] text-white"><UserRound size={18}/></span>
              <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold text-[#111A43]">{name}</span><span className="block truncate text-[11px] text-slate-500">{row.body || 'Attachment'}</span><span className="mt-1 block text-[10px] text-slate-400">{dateLabel(row.created_at)}</span></span>
              {row.author_role === 'student' && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#C62839]" title="Latest message from student"/>}
            </button>;
          })}
        </div>
      </aside>
      <section className={`min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white lg:col-span-8 ${selectedId ? 'flex flex-col' : 'hidden lg:flex lg:flex-col'}`}>
        {!selectedId ? <div className="flex flex-1 flex-col items-center justify-center p-8 text-center"><MessageSquare size={32} className="text-slate-300"/><p className="mt-3 text-sm font-bold text-[#111A43]">Select a conversation</p><p className="mt-1 text-xs text-slate-500">Choose a student from the inbox to view and reply.</p></div> : <>
          <div className="flex items-center gap-3 border-b border-slate-100 p-3 sm:p-4">
            <button type="button" onClick={() => setSelectedId('')} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Back to conversations"><ArrowLeft size={17}/></button>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#111A43] text-white"><UserRound size={18}/></span>
            <div className="min-w-0 flex-1"><h2 className="truncate text-sm font-bold text-[#111A43]">{selected?.student?.full_name || selected?.student?.email || 'Student'}</h2><p className="truncate text-[11px] text-slate-500">{selected?.student?.email || selectedId}{selected?.student?.phone ? ' · '+selected.student.phone : ''}</p></div>
          </div>
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#F7F8FC] p-3 sm:p-5">
            {threadLoading && <p className="text-center text-xs text-slate-500">Loading messages…</p>}
            {!threadLoading && messages.length === 0 && <div className="py-12 text-center text-xs text-slate-500">No messages in this conversation yet.</div>}
            {messages.map(message => <div key={message.id} className={`flex ${message.author_role === 'staff' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[88%] rounded-2xl px-3 py-2.5 shadow-sm sm:max-w-[75%] ${message.author_role === 'staff' ? 'rounded-tr-sm bg-[#111A43] text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
                <p className="whitespace-pre-wrap break-words text-xs leading-relaxed">{message.body || (message.attachments?.length ? 'Attachment' : '')}</p>
                {message.attachments?.map(file => <button type="button" key={file.id} onClick={() => void openAttachment(file.id)} className={`mt-2 flex items-center gap-1 text-[10px] underline ${message.author_role === 'staff' ? 'text-slate-200' : 'text-[#C62839]'}`}><Paperclip size={12}/>{file.file_name}</button>)}
                <p className={`mt-1 text-right text-[10px] ${message.author_role === 'staff' ? 'text-slate-300' : 'text-slate-400'}`}>{dateLabel(message.created_at)}</p>
              </div>
            </div>)}
            <div ref={threadEnd}/>
          </div>
          <form onSubmit={sendMessage} className="flex items-end gap-2 border-t border-slate-100 p-3 sm:p-4">
            <textarea value={draft} onChange={e => setDraft(e.target.value)} rows={2} maxLength={3000} placeholder="Write a reply to this student…" className="min-h-[44px] min-w-0 flex-1 resize-y rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#111A43]" />
            <button type="submit" disabled={!draft.trim() || sending || threadLoading} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#C62839] px-4 text-xs font-bold text-white hover:bg-[#a51b2b] disabled:cursor-not-allowed disabled:opacity-50"><Send size={15}/>{sending ? 'Sending…' : 'Send'}</button>
          </form>
        </>}
      </section>
    </div>
  </div>;
}
