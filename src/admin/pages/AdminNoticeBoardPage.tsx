import React, { useState } from 'react';
import {
  Megaphone,
  Pin,
  Calendar,
  Users,
  Eye,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Send,
  Upload,
  Bold,
  Italic,
  Underline,
  Link2,
  List,
  ListOrdered,
  Quote,
  Code,
  Paperclip,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface Notice {
  id: number;
  title: string;
  category: 'General' | 'Examinations' | 'Payments' | 'Events' | 'Academic';
  audience: string;
  priority: 'High' | 'Medium' | 'Low';
  date: string;
  views: string;
  status: 'Published' | 'Draft' | 'Archived';
}

const mockNotices: Notice[] = [
  {
    id: 1,
    title: 'Resumption Date for 2025/2026',
    category: 'General',
    audience: 'All Students',
    priority: 'High',
    date: '14 Jul 2025',
    views: '1,248',
    status: 'Published',
  },
  {
    id: 2,
    title: 'CBT Examination Schedule',
    category: 'Examinations',
    audience: 'All Students',
    priority: 'High',
    date: '13 Jul 2025',
    views: '980',
    status: 'Published',
  },
  {
    id: 3,
    title: 'Payment Deadline Reminder',
    category: 'Payments',
    audience: 'All Students',
    priority: 'High',
    date: '12 Jul 2025',
    views: '1,102',
    status: 'Published',
  },
  {
    id: 4,
    title: 'Career Guidance Seminar',
    category: 'Events',
    audience: 'All Students',
    priority: 'Medium',
    date: '11 Jul 2025',
    views: '765',
    status: 'Published',
  },
  {
    id: 5,
    title: 'New Learning Resources Added',
    category: 'Academic',
    audience: 'All Students',
    priority: 'Low',
    date: '10 Jul 2025',
    views: '623',
    status: 'Published',
  },
  {
    id: 6,
    title: 'Hostel Allocation Information',
    category: 'General',
    audience: 'All Students',
    priority: 'Medium',
    date: '09 Jul 2025',
    views: '812',
    status: 'Published',
  },
  {
    id: 7,
    title: 'Important: Fee Structure Update',
    category: 'Payments',
    audience: 'All Students',
    priority: 'High',
    date: '08 Jul 2025',
    views: '1,020',
    status: 'Published',
  },
  {
    id: 8,
    title: 'Extramural Lessons Schedule',
    category: 'Academic',
    audience: 'All Students',
    priority: 'Medium',
    date: '07 Jul 2025',
    views: '544',
    status: 'Published',
  },
  {
    id: 9,
    title: 'Student Handbook Updated',
    category: 'General',
    audience: 'All Students',
    priority: 'Low',
    date: '06 Jul 2025',
    views: '498',
    status: 'Published',
  },
  {
    id: 10,
    title: 'Orientation Programme',
    category: 'Events',
    audience: 'New Students',
    priority: 'High',
    date: '05 Jul 2025',
    views: '910',
    status: 'Published',
  },
];

export default function AdminNoticeBoardPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedAudience, setSelectedAudience] = useState('All Audiences');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [searchFilter, setSearchFilter] = useState('');

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formPriority, setFormPriority] = useState('Normal');
  const [formAudience, setFormAudience] = useState('');
  const [formContent, setFormContent] = useState('');

  const filteredNotices = mockNotices.filter((n) => {
    if (activeTab === 'Announcements' && n.category !== 'General') return false;
    if (activeTab === 'Events' && n.category !== 'Events') return false;
    if (activeTab === 'Academic Updates' && n.category !== 'Academic') return false;
    if (activeTab === 'Payment Notices' && n.category !== 'Payments') return false;
    if (selectedCategory !== 'All Categories' && n.category !== selectedCategory) return false;
    if (selectedAudience !== 'All Audiences' && n.audience !== selectedAudience) return false;
    if (selectedStatus !== 'All Status' && n.status !== selectedStatus) return false;
    if (
      searchFilter &&
      !n.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !n.category.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getPriorityBadge = (priority: Notice['priority']) => {
    switch (priority) {
      case 'High':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">High</span>;
      case 'Medium':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Medium</span>;
      case 'Low':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">Low</span>;
    }
  };

  const getCategoryIcon = (category: Notice['category']) => {
    switch (category) {
      case 'General':
        return '📢';
      case 'Examinations':
        return '🎓';
      case 'Payments':
        return '💳';
      case 'Events':
        return '📅';
      case 'Academic':
        return '📚';
      default:
        return '📌';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-[#111A43] tracking-tight">Notice Board &amp; Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage announcements, notices, important updates and events for students, parents and staff.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm text-xs">
            <Calendar size={15} className="text-[#111A43]" />
            <div>
              <p className="font-bold text-[#111A43]">2025/2026 Academic Session</p>
              <p className="text-[10px] text-slate-400">Current Session</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-all">
            <Plus size={15} />
            Create Announcement &gt;
          </button>
        </div>
      </div>

      {activeTab==='Overview'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
        <h2 className="text-lg font-bold text-[#111A43]">Notice board workspace</h2>
        <p className="mt-1 text-sm text-slate-600">Choose the announcement area you need. Publishing and delivery require authenticated backend integration.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {['All Notices','Announcements','Events','Academic Updates','Payment Notices','General','Archived'].map(tab=><button key={tab} type="button" onClick={()=>setActiveTab(tab)} className="min-w-0 rounded-xl border border-slate-200 bg-[#F7F8FC] px-4 py-4 text-left text-sm font-semibold text-[#111A43] transition hover:border-[#C62839] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839]">{tab}<span aria-hidden="true" className="float-right text-[#C62839]">→</span></button>)}
        </div>
      </section>}
      {false&&<>
      {/* Hidden preview metrics are not production statistics. */}
      <div className="grid grid-cols-1 min-[460px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Megaphone size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">48</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Announcements</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <Pin size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">12</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Important Notices</p>
            <p className="text-[10px] font-bold text-rose-600 mt-0.5">↑ 20% <span className="font-normal text-slate-400">High Priority</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">8</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Upcoming Events</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 14% <span className="font-normal text-slate-400">Next 30 Days</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">1,248</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Recipients</p>
            <p className="text-[10px] text-slate-400 mt-0.5">All Students &amp; Staff</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Eye size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">98%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Average View Rate</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 6% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>
      </div>

      </>}
      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['Overview', 'All Notices', 'Announcements', 'Events', 'Academic Updates', 'Payment Notices', 'General', 'Archived'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3.5 whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-800'
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62839] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab==='Overview'?null:activeTab==='All Notices'?<>
      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notices by title, content or author..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Categories">Category: All Categories</option>
            <option value="General">General</option>
            <option value="Examinations">Examinations</option>
            <option value="Payments">Payments</option>
            <option value="Events">Events</option>
            <option value="Academic">Academic</option>
          </select>

          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Audiences">Audience: All Audiences</option>
            <option value="All Students">All Students</option>
            <option value="New Students">New Students</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Status">Status: All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
          </select>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e]">
            <Filter size={13} />
            Filter
          </button>

          <button
            onClick={() => {
              setSelectedCategory('All Categories');
              setSelectedAudience('All Audiences');
              setSelectedStatus('All Status');
              setSearchFilter('');
            }}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mid Section: Notices Table + Create Announcement Form */}
      <div className="grid min-w-0 grid-cols-1 gap-4 items-start">
        {/* Left Column: Notices Table */}
        <div className="min-w-0 w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-7 text-center">#</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Audience</th>
                  <th className="py-3 px-2">Priority</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-center">Views</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNotices.map((n, idx) => (
                  <tr key={n.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm shrink-0">{getCategoryIcon(n.category)}</span>
                        <span className="font-semibold text-[#111A43] whitespace-nowrap">{n.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-slate-600">{n.category}</td>
                    <td className="py-3 px-2 text-slate-600 whitespace-nowrap">{n.audience}</td>
                    <td className="py-3 px-2">{getPriorityBadge(n.priority)}</td>
                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{n.date}</td>
                    <td className="py-3 px-2 text-center font-bold text-[#111A43]">{n.views}</td>
                    <td className="py-3 px-2">
                      <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">1 - 10</span> of <span className="font-semibold text-slate-700">48</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-[#111A43] text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">5</button>
              <span className="text-slate-400">...</span>
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600">
                <option>10 per page</option>
                <option>20 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Create Announcement Form */}
        <div className="min-w-0 w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-[#C62839]" />
            <h3 className="text-sm font-bold text-[#111A43]">Create Announcement</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter announcement title..."
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Category</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="">Select category</option>
                  <option value="General">General</option>
                  <option value="Examinations">Examinations</option>
                  <option value="Payments">Payments</option>
                  <option value="Events">Events</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Priority</label>
                <select
                  value={formPriority}
                  onChange={(e) => setFormPriority(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
                >
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Audience</label>
              <select
                value={formAudience}
                onChange={(e) => setFormAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="">Select audience</option>
                <option value="All Students">All Students</option>
                <option value="New Students">New Students</option>
                <option value="Parents">Parents</option>
                <option value="Staff">Staff</option>
              </select>
            </div>

            {/* Rich Text Toolbar & Content */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Content</label>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-2 text-slate-600">
                  <button className="p-1 hover:bg-slate-200 rounded"><Bold size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><Italic size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><Underline size={13} /></button>
                  <span className="w-px h-4 bg-slate-300 mx-1" />
                  <button className="p-1 hover:bg-slate-200 rounded"><Link2 size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><List size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><ListOrdered size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><Quote size={13} /></button>
                  <button className="p-1 hover:bg-slate-200 rounded"><Code size={13} /></button>
                </div>
                <textarea
                  rows={4}
                  placeholder="Write your announcement here..."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full p-3 text-xs focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Attachments Dropzone */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Attachments (Optional)</label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:bg-slate-50 cursor-pointer">
                <Upload size={20} className="mx-auto text-slate-400" />
                <p className="font-semibold text-slate-700 mt-1">Click to upload files</p>
                <p className="text-[10px] text-slate-400 mt-0.5">PDF, Images, Videos (Max 10MB each)</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button className="flex-1 py-2.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                Save as Draft
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-colors">
                <Send size={13} />
                Publish Announcement
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Upcoming Events + Notice Views Analytics + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Upcoming Events */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#111A43]" />
              <h3 className="text-sm font-bold text-[#111A43]">Upcoming Events</h3>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3">
            {[
              {
                day: '16',
                month: 'JUL',
                title: 'Career Guidance Seminar',
                time: '10:00 AM - 12:00 PM | Main Hall',
              },
              {
                day: '20',
                month: 'JUL',
                title: 'New Student Orientation',
                time: '09:00 AM - 01:00 PM | Lecture Theatre',
              },
              {
                day: '25',
                month: 'JUL',
                title: 'Extramural Lessons Commencement',
                time: '08:00 AM | All Centres',
              },
              {
                day: '30',
                month: 'JUL',
                title: 'Academic Fair',
                time: '10:00 AM - 03:00 PM | School Premises',
              },
            ].map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 flex flex-col items-center justify-center shrink-0">
                  <span className="text-sm font-black text-[#C62839] leading-none">{ev.day}</span>
                  <span className="text-[9px] font-bold text-slate-500 mt-0.5">{ev.month}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-[#111A43] truncate">{ev.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{ev.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notice Views Analytics */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Notice Views Analytics</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Month</option>
            </select>
          </div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-2.5 h-36 px-2 pt-4 border-b border-slate-100">
            {[
              { label: 'Jul 8', pct: 40 },
              { label: 'Jul 10', pct: 60 },
              { label: 'Jul 12', pct: 55 },
              { label: 'Jul 14', pct: 90 },
              { label: 'Jul 16', pct: 75 },
              { label: 'Jul 18', pct: 95 },
              { label: 'Jul 20', pct: 85 },
            ].map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div
                  className="w-full bg-blue-600 rounded-t-lg transition-all"
                  style={{ height: `${b.pct}%` }}
                />
                <span className="text-[9px] font-medium text-slate-500">{b.label}</span>
              </div>
            ))}
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-3 gap-2.5 pt-1">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <Eye size={16} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-[#111A43]">12,450</p>
                <p className="text-[9px] text-slate-400">Total Views</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <Users size={16} className="text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-[#111A43]">1,248</p>
                <p className="text-[9px] text-slate-400">Unique Viewers</p>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-600">98%</p>
                <p className="text-[9px] text-slate-400">Average View Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Activities</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              {
                title: 'Notice published',
                desc: 'Resumption Date for 2025/2026',
                time: '10 minutes ago',
                user: 'Admin User',
                color: 'bg-rose-100 text-rose-700',
              },
              {
                title: 'Notice updated',
                desc: 'Payment Deadline Reminder',
                time: '1 hour ago',
                user: 'Admin User',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                title: 'Attachment added',
                desc: 'CBT Examination Schedule',
                time: '2 hours ago',
                user: 'Admin User',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                title: 'Notice archived',
                desc: 'Old Academic Calendar',
                time: '5 hours ago',
                user: 'Admin User',
                color: 'bg-amber-100 text-amber-700',
              },
              {
                title: 'Notice published',
                desc: 'Career Guidance Seminar',
                time: '1 day ago',
                user: 'Admin User',
                color: 'bg-rose-100 text-rose-700',
              },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <Megaphone size={12} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#111A43] leading-snug">{act.title}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.desc}</p>
                  <div className="flex items-center justify-between mt-0.5 text-[10px] text-slate-400">
                    <span>{act.time}</span>
                    <span>{act.user}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>:<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
        <h2 className="text-lg font-bold text-[#111A43]">{activeTab}</h2>
        <p className="mt-2 text-sm text-slate-600">This section is awaiting live records and authenticated management endpoints. No sample entries are presented as published or delivered records here.</p>
        <p className="mt-2 text-xs text-amber-700">The All Notices overview contains design-preview information and is not yet connected to production data.</p>
      </section>}
    </div>
  );
}
