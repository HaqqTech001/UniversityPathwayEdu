import React, { useState, useEffect } from 'react';
import {
  Bell,
  Pin,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Search,
  Filter,
  Info,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import { getStudentToken } from '../../context/AuthContext';
import { upecAuthApi } from '../../lib/upecAuthApi';

interface NoticeBoardTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

interface NoticeItem {
  id: string;
  title: string;
  category: 'Admissions' | 'Clearance' | 'Examination' | 'Fees' | 'Academic';
  body: string;
  publishedAt: string;
  isPinned?: boolean;
  isRead?: boolean;
}

export default function NoticeBoardTabView({
  currentUser,
  onNavigateTab,
}: NoticeBoardTabViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);

  const [noticeError,setNoticeError]=useState('');
  const [noticeLoading,setNoticeLoading]=useState(false);
  const [notices, setNotices] = useState<NoticeItem[]>([]); // Never display invented institutional announcements.

  // Merge real notifications if available
  useEffect(() => {
    const token = getStudentToken();
    if (!token) {setNoticeError('Sign in to view notices.');return;}
    setNoticeLoading(true);
    upecAuthApi.studentNotifications(token).then((res) => {
      if (Array.isArray(res?.notifications)) {
        setNotices((prev) => {
          const apiNotices: NoticeItem[] = res.notifications.map((n: any) => ({
            id: n.key,
            title: n.title,
            category: (n.type as any) || 'Admissions',
            body: n.body,
            publishedAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-NG') : 'Recent',
            isRead: n.read,
          }));
          return [...apiNotices, ...prev.filter((p) => !apiNotices.some((a) => a.id === p.id))];
        });
      }
    }).catch((error) => setNoticeError(error instanceof Error?error.message:'Unable to load notices.')).finally(()=>setNoticeLoading(false));
  }, []);

  const categories = ['All', 'Admissions', 'Clearance', 'Examination', 'Fees', 'Academic'];

  const filteredNotices = notices.filter((n) => {
    const matchesCat = activeCategory === 'All' || n.category === activeCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.body.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const pinnedNotices = filteredNotices.filter((n) => n.isPinned);
  const regularNotices = filteredNotices.filter((n) => !n.isPinned);

  const markAllAsRead = () => {
    setNoticeError('Read status must be saved by the server. Open each notice to review it; bulk read is not available yet.');
  };

  return (
    <div className="space-y-6">
      {noticeLoading && <p role="status" className="text-sm text-slate-600">Loading notices…</p>}
      {noticeError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{noticeError}</p>}
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Notice Board &amp; Announcements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official institutional updates, academic alerts, timetable announcements and fee notices
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={markAllAsRead}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#111A43] transition-colors cursor-pointer"
          >
            Mark All as Read
          </button>
        </div>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#dce5f0] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search announcements, key terms, dates..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111A43]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#111A43] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'All' ? `All Notices (${notices.length})` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left (Pinned & Feed), Right (Featured, Important Dates, Reminders) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Pinned Notices Section (Highlighted Cards) */}
          {pinnedNotices.length > 0 && (
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Pin size={14} className="text-[#c62839]" />
                <span>Pinned Announcements</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pinnedNotices.map((notice) => (
                  <div
                    key={notice.id}
                    className="p-5 rounded-2xl bg-gradient-to-br from-[#f8faff] to-[#eef3ff] border-2 border-[#111A43]/15 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase text-[#c62839] bg-red-50 px-2 py-0.5 rounded">
                          <Pin size={10} /> Pinned
                        </span>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {notice.publishedAt}
                        </span>
                      </div>
                      <strong className="text-sm font-black text-[#111A43] block mt-1">
                        {notice.title}
                      </strong>
                      <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                        {notice.body}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="mt-4 pt-3 border-t border-slate-200/60 inline-flex items-center gap-1 text-xs font-bold text-[#c62839] hover:underline cursor-pointer"
                    >
                      <span>Read Full Notice</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Latest Announcements Feed */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-4 border-b border-slate-100">
              Latest Announcements Feed
            </h3>

            <div className="divide-y divide-slate-100">
              {regularNotices.map((notice) => (
                <article
                  key={notice.id}
                  className="py-4 hover:bg-slate-50/60 transition-colors rounded-xl px-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-[#111A43]">
                        {notice.category}
                      </span>
                      {!notice.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#c62839]" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">
                      {notice.publishedAt}
                    </span>
                  </div>

                  <strong className="mt-2 text-sm font-bold text-[#111A43] block">
                    {notice.title}
                  </strong>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {notice.body}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedNotice(notice)}
                      className="text-xs font-bold text-[#c62839] hover:underline cursor-pointer"
                    >
                      Read Details →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Notices and dates must originate from the authenticated notifications API. */}
          <div className="rounded-2xl border border-[#dce5f0] bg-white p-6">
            <h3 className="text-sm font-bold text-[#111A43]">Official announcements</h3>
            <p className="mt-2 text-xs text-slate-600">Important dates and clearance instructions will appear in the notices list when published by the institution.</p>
          </div>

          {/* Quick Reminders */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Administrative Reminders
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Keep your student portal password confidential.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Use the Messages section to contact student support.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded bg-slate-100 text-[#111A43]">
                {selectedNotice.category}
              </span>
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <h2 className="mt-4 text-base font-black text-[#111A43]">
              {selectedNotice.title}
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              Published on {selectedNotice.publishedAt} · Official UPEC Announcement
            </p>
            <p className="mt-4 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.body}
            </p>
            <div className="mt-6 pt-3 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setSelectedNotice(null)}
                className="px-4 py-2 rounded-xl bg-[#111A43] text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
