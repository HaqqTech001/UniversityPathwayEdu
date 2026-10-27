import React, { useState } from 'react';
import {
  Bell,
  Mail,
  Smartphone,
  Users,
  CheckCircle,
  BarChart2,
  Plus,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Send,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface NotificationItem {
  id: number;
  title: string;
  type: string;
  audience: string;
  channel: string;
  scheduledDate: string;
  status: 'Scheduled' | 'Sent' | 'Failed';
  openRate: string;
}

const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Payment Deadline Reminder',
    type: 'Payment',
    audience: 'Students + Parents',
    channel: 'Email + In-App',
    scheduledDate: '14 Jul 2025, 10:00 AM',
    status: 'Scheduled',
    openRate: '-',
  },
  {
    id: 2,
    title: 'CBT Examination Notice',
    type: 'Examination',
    audience: 'All Students',
    channel: 'Email + In-App',
    scheduledDate: '13 Jul 2025, 08:00 AM',
    status: 'Sent',
    openRate: '78%',
  },
  {
    id: 3,
    title: 'Application Approval',
    type: 'Application',
    audience: 'Student',
    channel: 'Email',
    scheduledDate: '12 Jul 2025, 03:45 PM',
    status: 'Sent',
    openRate: '82%',
  },
  {
    id: 4,
    title: 'Fee Structure Update',
    type: 'Finance',
    audience: 'Students + Parents',
    channel: 'Email + In-App',
    scheduledDate: '11 Jul 2025, 09:30 AM',
    status: 'Sent',
    openRate: '65%',
  },
  {
    id: 5,
    title: 'New Lecture Materials',
    type: 'Academic',
    audience: 'All Students',
    channel: 'In-App',
    scheduledDate: '10 Jul 2025, 01:00 PM',
    status: 'Sent',
    openRate: '72%',
  },
  {
    id: 6,
    title: 'Hostel Allocation Result',
    type: 'Hostel',
    audience: 'Selected Students',
    channel: 'Email',
    scheduledDate: '09 Jul 2025, 11:00 AM',
    status: 'Sent',
    openRate: '70%',
  },
  {
    id: 7,
    title: 'Orientation Programme',
    type: 'General',
    audience: 'New Students',
    channel: 'Email + In-App',
    scheduledDate: '08 Jul 2025, 10:00 AM',
    status: 'Failed',
    openRate: '0%',
  },
  {
    id: 8,
    title: 'Class Schedule Update',
    type: 'Academic',
    audience: 'All Students',
    channel: 'In-App',
    scheduledDate: '07 Jul 2025, 02:00 PM',
    status: 'Sent',
    openRate: '68%',
  },
  {
    id: 9,
    title: 'Document Verification',
    type: 'Application',
    audience: 'Selected Students',
    channel: 'Email',
    scheduledDate: '06 Jul 2025, 09:00 AM',
    status: 'Sent',
    openRate: '74%',
  },
  {
    id: 10,
    title: 'Welcome Message',
    type: 'General',
    audience: 'New Students',
    channel: 'Email + In-App',
    scheduledDate: '05 Jul 2025, 08:30 AM',
    status: 'Sent',
    openRate: '88%',
  },
];

export default function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState('All Notifications');
  const [selectedType, setSelectedType] = useState('All Types');
  const [selectedAudience, setSelectedAudience] = useState('All Audiences');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [searchFilter, setSearchFilter] = useState('');

  // Form states
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifAudience, setNotifAudience] = useState('');
  const [channelEmail, setChannelEmail] = useState(true);
  const [channelInApp, setChannelInApp] = useState(true);
  const [channelSms, setChannelSms] = useState(false);
  const [scheduleLater, setScheduleLater] = useState(false);

  const filtered = mockNotifications.filter((n) => {
    if (activeTab === 'Scheduled' && n.status !== 'Scheduled') return false;
    if (activeTab === 'Sent' && n.status !== 'Sent') return false;
    if (activeTab === 'Failed' && n.status !== 'Failed') return false;
    if (selectedType !== 'All Types' && n.type !== selectedType) return false;
    if (selectedAudience !== 'All Audiences' && n.audience !== selectedAudience) return false;
    if (selectedStatus !== 'All Statuses' && n.status !== selectedStatus) return false;
    if (
      searchFilter &&
      !n.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !n.type.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getStatusBadge = (status: NotificationItem['status']) => {
    switch (status) {
      case 'Scheduled':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Scheduled</span>;
      case 'Sent':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Sent</span>;
      case 'Failed':
        return <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Failed</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Notification Centre</h1>
          <p className="text-sm text-slate-500 mt-1">Manage in-app and email notifications for students, parents, and staff. Create, schedule and track notifications.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm text-xs">
            <Calendar size={15} className="text-[#111A43]" />
            <div>
              <p className="font-bold text-[#111A43]">2025/2026 Academic Session</p>
              <p className="text-[10px] text-slate-400">Current Session</p>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </div>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-all">
            <Plus size={15} />
            Send New Notification &gt;
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">3,248</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Notifications</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 18% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <Send size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">2,186</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Emails Sent</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 15% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Smartphone size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">1,062</p>
            <p className="text-xs font-bold text-slate-700 mt-1">In-App Notifications</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 22% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">1,248</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Recipients</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">Students &amp; Staff</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">96%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Delivery Success</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 4% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0">
            <BarChart2 size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">68%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Average Open Rate</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 10% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['All Notifications', 'Scheduled', 'Sent', 'Failed', 'Templates', 'Settings'].map((tab) => {
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

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, message or recipient..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Types">Notification Type: All Types</option>
            <option value="Payment">Payment</option>
            <option value="Examination">Examination</option>
            <option value="Application">Application</option>
            <option value="Academic">Academic</option>
            <option value="General">General</option>
          </select>

          <select
            value={selectedAudience}
            onChange={(e) => setSelectedAudience(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Audiences">Audience: All Audiences</option>
            <option value="All Students">All Students</option>
            <option value="Students + Parents">Students + Parents</option>
            <option value="Selected Students">Selected Students</option>
            <option value="New Students">New Students</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Statuses">Status: All Statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
          </select>

          <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600">
            <Calendar size={13} className="text-slate-400" />
            <span>01 Jul 2025 - 14 Jul 2025</span>
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e]">
            <Filter size={13} />
            Filter
          </button>

          <button
            onClick={() => {
              setSelectedType('All Types');
              setSelectedAudience('All Audiences');
              setSelectedStatus('All Statuses');
              setSearchFilter('');
            }}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mid Section: Table + Create Notification Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Notifications Table */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-2">Type</th>
                  <th className="py-3 px-3">Audience</th>
                  <th className="py-3 px-2">Channel</th>
                  <th className="py-3 px-3">Scheduled Date</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Open Rate</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-[#111A43] whitespace-nowrap">{item.title}</td>
                    <td className="py-3 px-2 text-slate-600">{item.type}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{item.audience}</td>
                    <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{item.channel}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{item.scheduledDate}</td>
                    <td className="py-3 px-2">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-2 text-center font-bold text-[#111A43]">{item.openRate}</td>
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
              Showing <span className="font-semibold text-slate-700">1 - 10</span> of <span className="font-semibold text-slate-700">3,248</span>
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
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">325</button>
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

        {/* Right Column: Create Notification Panel */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Send size={16} className="text-[#C62839]" />
            <h3 className="text-sm font-bold text-[#111A43]">Create Notification</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Select Template (Optional)</label>
              <select className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none">
                <option>None</option>
                <option>Payment Deadline</option>
                <option>Exam Notice</option>
                <option>Welcome Onboarding</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter notification title..."
                value={notifTitle}
                onChange={(e) => setNotifTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-slate-600 font-semibold">Message</label>
                <span className="text-[10px] text-slate-400">{notifMessage.length}/1000</span>
              </div>
              <textarea
                rows={4}
                placeholder="Write your message here..."
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                maxLength={1000}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Audience</label>
              <select
                value={notifAudience}
                onChange={(e) => setNotifAudience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none"
              >
                <option value="">Select audience</option>
                <option value="All Students">All Students</option>
                <option value="Students + Parents">Students + Parents</option>
                <option value="Selected Students">Selected Students</option>
                <option value="New Students">New Students</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-semibold mb-1">Channel</label>
              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelEmail}
                    onChange={(e) => setChannelEmail(e.target.checked)}
                    className="rounded border-slate-300 text-[#C62839] focus:ring-[#C62839]"
                  />
                  <span>Email</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={channelInApp}
                    onChange={(e) => setChannelInApp(e.target.checked)}
                    className="rounded border-slate-300 text-[#C62839] focus:ring-[#C62839]"
                  />
                  <span>In-App</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-500">
                  <input
                    type="checkbox"
                    checked={channelSms}
                    onChange={(e) => setChannelSms(e.target.checked)}
                    className="rounded border-slate-300 text-[#C62839] focus:ring-[#C62839]"
                  />
                  <span>SMS (Optional)</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="font-semibold text-slate-700">Schedule for later</span>
              <button
                type="button"
                onClick={() => setScheduleLater(!scheduleLater)}
                className={`w-10 h-5 rounded-full transition-colors relative ${
                  scheduleLater ? 'bg-[#C62839]' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    scheduleLater ? 'left-5.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button className="flex-1 py-2.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                Save as Draft
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-colors">
                <Send size={13} />
                Send Notification
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Notification Analytics + Type Distribution + Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Notification Analytics */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Notification Analytics</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Week</option>
            </select>
          </div>

          {/* Dual Bar Chart */}
          <div className="flex items-end justify-between gap-3 h-40 px-2 pt-4 border-b border-slate-100">
            {[
              { day: 'Jul 8', b1: 70, b2: 45 },
              { day: 'Jul 9', b1: 80, b2: 50 },
              { day: 'Jul 10', b1: 85, b2: 55 },
              { day: 'Jul 11', b1: 65, b2: 40 },
              { day: 'Jul 12', b1: 75, b2: 45 },
              { day: 'Jul 13', b1: 80, b2: 50 },
              { day: 'Jul 14', b1: 90, b2: 60 },
            ].map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div className="flex items-end gap-1 w-full justify-center">
                  <div className="w-2.5 bg-blue-600 rounded-t" style={{ height: `${d.b1}%` }} />
                  <div className="w-2.5 bg-[#C62839] rounded-t" style={{ height: `${d.b2}%` }} />
                </div>
                <span className="text-[10px] font-medium text-slate-500 mt-1">{d.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-blue-600" />
              <span className="text-slate-600">Emails Sent</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-[#C62839]" />
              <span className="text-slate-600">In-App Notifications</span>
            </div>
          </div>
        </div>

        {/* Notification Type Distribution */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Notification Type Distribution</h3>
          </div>

          {/* Donut representation */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#C62839]"
                  strokeDasharray="28, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-black text-[#111A43]">3,248</span>
                <p className="text-[10px] text-slate-400">Total</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            {[
              { label: 'Payment', pct: '28%', count: '910', color: 'bg-rose-800' },
              { label: 'Academic', pct: '24%', count: '780', color: 'bg-purple-800' },
              { label: 'Examination', pct: '18%', count: '584', color: 'bg-rose-600' },
              { label: 'Application', pct: '14%', count: '455', color: 'bg-blue-600' },
              { label: 'General', pct: '10%', count: '325', color: 'bg-amber-500' },
              { label: 'Hostel', pct: '6%', count: '194', color: 'bg-emerald-600' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-slate-600">{item.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-slate-700">{item.pct}</span>
                  <span className="text-slate-400 text-[11px] w-8 text-right">({item.count})</span>
                </div>
              </div>
            ))}
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
                title: 'Notification sent',
                desc: 'CBT Examination Notice (1,248 recipients)',
                time: '10 minutes ago',
                user: 'Admin User',
                color: 'bg-purple-100 text-purple-700',
              },
              {
                title: 'Schedule created',
                desc: 'Payment Deadline Reminder',
                time: '1 hour ago',
                user: 'Admin User',
                color: 'bg-amber-100 text-amber-700',
              },
              {
                title: 'Notification failed',
                desc: 'Orientation Programme (56 failed)',
                time: '2 hours ago',
                user: 'Admin User',
                color: 'bg-rose-100 text-rose-700',
              },
              {
                title: 'Template updated',
                desc: 'Fee Structure Template',
                time: '4 hours ago',
                user: 'Admin User',
                color: 'bg-blue-100 text-blue-700',
              },
              {
                title: 'Bulk notification sent',
                desc: 'Welcome Message (320 recipients)',
                time: '1 day ago',
                user: 'Admin User',
                color: 'bg-emerald-100 text-emerald-700',
              },
            ].map((act, i) => (
              <div key={i} className="flex items-start gap-2.5 pb-2 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${act.color}`}>
                  <Send size={12} />
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
    </div>
  );
}
