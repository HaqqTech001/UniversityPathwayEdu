import React, { useState, useEffect, useRef } from 'react';
import {
  Mail,
  Send,
  Paperclip,
  CheckCircle2,
  Clock,
  Search,
  User,
  ShieldCheck,
  RefreshCw,
  MoreVertical,
  HelpCircle,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import { getStudentToken } from '../../context/AuthContext';

interface MessagesTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

interface Thread {
  id: string;
  name: string;
  department: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  online: boolean;
  avatarBg: string;
}

interface Message {
  id: string;
  author: 'student' | 'support';
  authorName: string;
  body: string;
  time: string;
}

export default function MessagesTabView({
  currentUser,
  onNavigateTab,
}: MessagesTabViewProps) {
  const [activeThreadId, setActiveThreadId] = useState('admissions');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const threads: Thread[] = [{
    id: 'admissions',
    name: 'Student Support',
    department: 'Support messages',
    lastMessage: '',
    time: '',
    unreadCount: 0,
    online: false,
    avatarBg: 'bg-[#111A43]',
  }];
  const [messages, setMessages] = useState<Message[]>([]);
  const [sendError, setSendError] = useState('');
  const [loadingMessages,setLoadingMessages]=useState(false);

  // Real backend sync with support endpoint
  useEffect(() => {
    const token = getStudentToken();
    if (!token) {setSendError('Sign in to load your messages.');return;}
    setLoadingMessages(true);
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
    fetch(base + '/api/student/support/messages', {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then(async (r) => {if(!r.ok)throw Error('Could not load support messages ('+r.status+').');return r.json();})
      .then((data) => {
        if (Array.isArray(data?.messages)) {
          const apiMessages: Message[] = data.messages.map((m: any) => ({
            id: m.id,
            author: m.author_role === 'student' ? 'student' : 'support',
            authorName: m.author_role === 'student' ? currentUser.fullName : 'Admissions Support',
            body: m.body,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(apiMessages);
        }
      })
      .catch((e) => setSendError(e instanceof Error?e.message:'Could not load support messages.'))
      .finally(()=>setLoadingMessages(false));
  }, [currentUser.fullName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || sending) return;

    setSending(true);
    setSendError('');

    // Try sending to real backend
    try {
      const token = getStudentToken();
      if (token) {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
        const response = await fetch(base + '/api/student/support/messages', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ body: text }),
        });
        const result=await response.json().catch(()=>({}));
        if (!response.ok || !result.message?.id) throw new Error(result.error||'Support service rejected the message');
        const saved=result.message;
        setMessages((prev) => [...prev, {id:saved.id,author:'student',authorName:currentUser.fullName,body:saved.body,time:new Date(saved.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}]);
        setDraft('');
      } else { throw new Error('You must sign in before sending a message'); }
    } catch (e) {
      setSendError('Your message was not sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Student Support Messages
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Communicate directly with admissions officers, academic advisors and billing helpdesk
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Student support</span>
          </span>
        </div>
      </div>

      {loadingMessages && <p role="status" className="p-3 text-xs text-slate-600">Loading messages…</p>}
      {sendError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{sendError}</p>}
      {/* Two-Column Chat Card (Matching Mockup) */}
      <div className="bg-white rounded-2xl border border-[#dce5f0] shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[580px]">
        {/* LEFT COLUMN: Threads & Departments List */}
        <div className="border-r border-slate-100 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-100">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111A43]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {threads.map((thread) => {
              const isActive = activeThreadId === thread.id;
              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isActive ? 'bg-white shadow-xs border-l-4 border-[#c62839]' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full ${thread.avatarBg} text-white flex items-center justify-center text-xs font-black shadow-xs`}>
                      {thread.name[0]}
                    </div>
                    {thread.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <strong className="text-xs font-bold text-[#111A43] truncate">
                        {thread.name}
                      </strong>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {thread.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {thread.lastMessage}
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      {thread.department}
                    </span>
                  </div>

                  {thread.unreadCount && (
                    <span className="w-5 h-5 rounded-full bg-[#c62839] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {thread.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat Conversation */}
        <div className="flex flex-col bg-white">
          {/* Conversation Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full ${activeThread.avatarBg} text-white flex items-center justify-center text-xs font-black`}>
                {activeThread.name[0]}
              </div>
              <div>
                <strong className="text-sm font-bold text-[#111A43] block">
                  {activeThread.name}
                </strong>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] text-slate-500 font-medium">
                    {activeThread.online ? 'Active now · Average reply 15 mins' : 'Offline · Replies during office hours'}
                  </span>
                </div>
              </div>
            </div>

            <span className="text-xs text-slate-400 font-mono hidden sm:inline">
              Ref: {currentUser.application?.referenceNumber || 'STU-2026'}
            </span>
          </div>

          {/* Messages Log Area */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
            <div className="text-center my-2">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                Today, October 23, 2026
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.author === 'student';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">
                    {msg.authorName}
                  </span>
                  <div
                    className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[#111A43] text-white rounded-tr-xs shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.body}</p>
                    <span
                      className={`text-[9px] block mt-1.5 text-right ${
                        isMe ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {msg.time}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 sm:p-4 border-t border-slate-100 bg-white flex items-center gap-2"
          >
            <button
              type="button"
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Attach Document"
            >
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message to the support desk..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-[#111A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111A43]"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending}
              className="p-2.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white transition-colors cursor-pointer disabled:opacity-40"
              title="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
