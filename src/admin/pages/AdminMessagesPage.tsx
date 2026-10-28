import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Mail,
  FileText,
  Clock,
  Plus,
  Search,
  Filter,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image,
  Film,
  FileCode,
  Link2,
  Smile,
  Send,
  Download,
  Calendar,
  Archive,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface Conversation {
  id: string;
  name: string;
  roleType: 'Students' | 'Parents' | 'Staff' | 'Groups';
  avatar: string;
  snippet: string;
  time: string;
  unread?: number;
  online?: boolean;
  appId?: string;
  programme?: string;
  phone?: string;
  email?: string;
}

const mockConversations: Conversation[] = [
  {
    id: 'c1',
    name: 'Adebayo, Chisom',
    roleType: 'Students',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    snippet: 'Good afternoon sir, I have uploaded...',
    time: '10:24 AM',
    unread: 2,
    online: true,
    appId: 'APP-2025-001',
    programme: 'IJMB Programme',
    phone: '09012345678',
    email: 'chisomadebayo@gmail.com',
  },
  {
    id: 'c2',
    name: 'JAMB 2025 Applicants',
    roleType: 'Groups',
    avatar: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=150&q=80',
    snippet: 'Admin: The CBT schedule has been...',
    time: '09:18 AM',
    unread: 12,
  },
  {
    id: 'c3',
    name: 'Okafor, Daniel',
    roleType: 'Students',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    snippet: 'Thanks for the feedback.',
    time: '08:45 AM',
    unread: 1,
    online: false,
    appId: 'APP-2025-002',
    programme: 'JAMB Programme',
    phone: '09032214456',
    email: 'daniel.okafor@gmail.com',
  },
  {
    id: 'c4',
    name: 'Parents - IJMB 2025',
    roleType: 'Parents',
    avatar: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=150&q=80',
    snippet: 'Mrs. Bello: Please when is the next...',
    time: 'Yesterday',
    unread: 5,
  },
  {
    id: 'c5',
    name: 'Mohammed, Aisha',
    roleType: 'Students',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    snippet: 'The documents have been submitted.',
    time: 'Yesterday',
    online: true,
    appId: 'APP-2025-003',
    programme: 'WAEC Programme',
    phone: '08133347788',
    email: 'aisha.m@gmail.com',
  },
  {
    id: 'c6',
    name: 'Staff - Academic',
    roleType: 'Staff',
    avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=150&q=80',
    snippet: 'Dr. Ahmed: Meeting by 2pm today.',
    time: '14 Jul 2025',
    unread: 3,
  },
  {
    id: 'c7',
    name: 'Eze, Victoria',
    roleType: 'Students',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    snippet: 'Alright, I will check and get back.',
    time: '13 Jul 2025',
  },
  {
    id: 'c8',
    name: 'Parents - WAEC 2025',
    roleType: 'Parents',
    avatar: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=150&q=80',
    snippet: 'Mr. Yusuf: Thank you for the update.',
    time: '13 Jul 2025',
    unread: 4,
  },
  {
    id: 'c9',
    name: 'Admissions Team',
    roleType: 'Staff',
    avatar: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=150&q=80',
    snippet: 'New application received: APP-2025-...',
    time: '12 Jul 2025',
  },
  {
    id: 'c10',
    name: 'Lawal, Zainab',
    roleType: 'Students',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80',
    snippet: 'Can I still make the payment tomorrow?',
    time: '12 Jul 2025',
    unread: 1,
  },
];

export default function AdminMessagesPage() {
  const [activeTab, setActiveTab] = useState('Messages');
  const [filterCategory, setFilterCategory] = useState<'All' | 'Students' | 'Parents' | 'Staff' | 'Groups'>('All');
  const [selectedChat, setSelectedChat] = useState<Conversation>(mockConversations[0]);
  const [messageInput, setMessageInput] = useState('');
  const [rightTab, setRightTab] = useState<'Profile' | 'Documents' | 'History'>('Profile');

  const filteredList = mockConversations.filter((c) => {
    if (filterCategory === 'All') return true;
    return c.roleType === filterCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Communication &amp; Messaging</h1>
          <p className="text-sm text-slate-500 mt-1">Chat with students, parents, staff and groups. Send messages, files and important information.</p>
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
            New Message &gt;
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 min-[460px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">1,248</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Conversations</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">320</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Students</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 8% <span className="font-normal text-slate-400">Active Conversations</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">36</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Group Chats</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 20% <span className="font-normal text-slate-400">Dept &amp; Classes</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">582</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Emails Sent</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 15% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">124</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Files Shared</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 22% <span className="font-normal text-slate-400">Docs, Images</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-700 flex items-center justify-center text-white shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">98%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Response Rate</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 6% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['Messages', 'Group Chats', 'Broadcast Message', 'Email Communication', 'Message Templates', 'Archived'].map((tab) => {
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

      {activeTab==='Messages'?<>
      {/* 3-Column Messaging Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Col 1: Conversation List (3.5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[680px]">
          {/* Search & Filter */}
          <div className="p-3.5 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full pl-8 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <Filter size={13} />
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
              {(['All', 'Students', 'Parents', 'Staff', 'Groups'] as const).map((cat) => {
                const isCatActive = filterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                      isCatActive
                        ? 'bg-[#C62839] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
            {filteredList.map((conv) => {
              const isSelected = selectedChat.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedChat(conv)}
                  className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-rose-50/50 border-l-4 border-[#C62839]' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatar}
                      alt={conv.name}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    {conv.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#111A43] truncate">{conv.name}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-1">{conv.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{conv.snippet}</p>
                  </div>
                  {conv.unread && (
                    <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C62839] text-white shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2: Active Chat Pane (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[680px]">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-3">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#111A43] truncate">{selectedChat.name}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  {selectedChat.programme || 'IJMB Programme'} • {selectedChat.appId || 'APP-2025-001'} • {selectedChat.phone || '09012345678'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500">
              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"><Phone size={15} /></button>
              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"><Video size={15} /></button>
              <button className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600"><MoreVertical size={15} /></button>
            </div>
          </div>

          {/* Chat Thread Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30 text-xs">
            {/* Date Badge */}
            <div className="flex justify-center">
              <span className="text-[10px] font-bold text-slate-400 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                Today, 14 July 2025
              </span>
            </div>

            {/* Message 1: Incoming (Student) */}
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <img src={selectedChat.avatar} alt="Sender" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
              <div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-xs text-slate-700 leading-relaxed">
                  <p>Good afternoon sir,</p>
                  <p className="mt-1">I have uploaded my payment proof. Please can you confirm if it has been received?</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block pl-1">10:12 AM</span>
              </div>
            </div>

            {/* Message 2: Outgoing (Admin) */}
            <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-[#111A43] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
                AU
              </div>
              <div>
                <div className="bg-[#E0E7FF]/70 text-[#111A43] p-3 rounded-2xl rounded-tr-sm border border-blue-200 shadow-xs leading-relaxed">
                  <p>Good afternoon Chisom,</p>
                  <p className="mt-1">Yes, your payment proof has been received. It is currently under review and you will be notified once it is verified.</p>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1 pr-1">
                  <span>10:18 AM</span>
                  <span className="text-blue-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Message 3: Incoming (Student) */}
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <img src={selectedChat.avatar} alt="Sender" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
              <div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-xs text-slate-700 leading-relaxed">
                  <p>Alright sir, thank you.</p>
                  <p className="mt-1">I also have a question about the CBT schedule. When will it start?</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block pl-1">10:20 AM</span>
              </div>
            </div>

            {/* Message 4: Outgoing (Admin) */}
            <div className="flex items-start gap-2.5 max-w-[85%] ml-auto flex-row-reverse">
              <div className="w-7 h-7 rounded-full bg-[#111A43] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
                AU
              </div>
              <div>
                <div className="bg-[#E0E7FF]/70 text-[#111A43] p-3 rounded-2xl rounded-tr-sm border border-blue-200 shadow-xs leading-relaxed">
                  <p>The CBT practice will begin next week. You will receive a detailed schedule on the notice board and via email.</p>
                </div>
                <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 mt-1 pr-1">
                  <span>10:23 AM</span>
                  <span className="text-blue-600 font-bold">✓✓</span>
                </div>
              </div>
            </div>

            {/* Message 5: Incoming (Student) */}
            <div className="flex items-start gap-2.5 max-w-[85%]">
              <img src={selectedChat.avatar} alt="Sender" className="w-7 h-7 rounded-full object-cover shrink-0 mt-1" />
              <div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-slate-200 shadow-xs text-slate-700 leading-relaxed">
                  <p>Thank you very much sir.</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block pl-1">10:24 AM</span>
              </div>
            </div>
          </div>

          {/* Message Composer */}
          <div className="p-3 border-t border-slate-100 bg-white space-y-2">
            <div className="flex items-center gap-3 text-slate-400 px-1">
              <button className="hover:text-slate-600"><Paperclip size={15} /></button>
              <button className="hover:text-slate-600"><Image size={15} /></button>
              <button className="hover:text-slate-600"><Film size={15} /></button>
              <button className="hover:text-slate-600"><FileText size={15} /></button>
              <button className="hover:text-slate-600"><Link2 size={15} /></button>
              <button className="hover:text-slate-600"><Smile size={15} /></button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
              <button className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm transition-colors">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Col 3: Student Information Sidebar (3.5 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Users size={16} className="text-[#111A43]" />
            <h3 className="text-sm font-bold text-[#111A43]">Student Information</h3>
          </div>

          {/* Profile Overview */}
          <div className="text-center pt-1">
            <img
              src={selectedChat.avatar}
              alt={selectedChat.name}
              className="w-16 h-16 rounded-full object-cover mx-auto ring-2 ring-slate-100 shadow-sm"
            />
            <div className="flex items-center justify-center gap-2 mt-2">
              <h4 className="font-bold text-sm text-[#111A43]">{selectedChat.name}</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">{selectedChat.appId || 'APP-2025-001'}</p>
            <p className="text-[11px] text-slate-600 font-medium">{selectedChat.programme || 'IJMB Programme'}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{selectedChat.phone || '09012345678'}</p>

            <div className="flex items-center justify-center gap-2 mt-3">
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"><Phone size={14} /></button>
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"><Mail size={14} /></button>
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"><MoreVertical size={14} /></button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="border-b border-slate-200">
            <div className="flex items-center justify-around text-xs font-semibold text-slate-500">
              {(['Profile', 'Documents', 'History'] as const).map((tab) => {
                const isActive = rightTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={`pb-2 transition-colors relative ${
                      isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-700'
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

          {/* Profile Fields */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Full Name</span>
              <span className="font-semibold text-slate-700">{selectedChat.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Programme</span>
              <span className="font-semibold text-slate-700">{selectedChat.programme || 'IJMB Programme'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Application ID</span>
              <span className="font-mono text-slate-700">{selectedChat.appId || 'APP-2025-001'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Email</span>
              <span className="text-slate-700 truncate max-w-[140px]">{selectedChat.email || 'chisomadebayo@gmail.com'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Phone</span>
              <span className="text-slate-700 font-mono">{selectedChat.phone || '09012345678'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Status</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Application Submitted
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guardian</span>
              <span className="font-semibold text-slate-700">Mr. Adebayo (Father)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Guardian Phone</span>
              <span className="text-slate-700 font-mono">08012345678</span>
            </div>
          </div>

          {/* Recent Files */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#111A43]">Recent Files</span>
              <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Payment_Proof.jpg', size: '2.1 MB • 14 Jul 2025', color: 'text-blue-600 bg-blue-50' },
                { name: 'Olevel_Result.pdf', size: '1.4 MB • 12 Jul 2025', color: 'text-rose-600 bg-rose-50' },
                { name: 'Passport_Photo.jpg', size: '320 KB • 10 Jul 2025', color: 'text-blue-600 bg-blue-50' },
              ].map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[#111A43] truncate text-[11px]">{f.name}</p>
                    <p className="text-[10px] text-slate-400">{f.size}</p>
                  </div>
                  <button className={`p-1.5 rounded-lg border border-slate-200 ${f.color}`}>
                    <Download size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold text-[#111A43] block">Quick Actions</span>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs transition-colors">
                <Mail size={12} />
                Send Email
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors">
                <ExternalLink size={12} />
                View App
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                <Calendar size={12} />
                Schedule
              </button>
              <button className="flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl transition-colors">
                <Archive size={12} />
                Archive
              </button>
            </div>
          </div>
        </div>
      </div>
      </>:<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
        <h2 className="text-lg font-bold text-[#111A43]">{activeTab}</h2>
        <p className="mt-2 text-sm text-slate-600">This communication section is awaiting authenticated messaging and delivery APIs. Messages are not sent from this preview.</p>
        <p className="mt-2 text-xs text-amber-700">The Messages workspace currently displays design-preview conversations, not actual student or staff communications.</p>
      </section>}
    </div>
  );
}
