import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Users,
  UserCheck,
  Calendar,
  FileText,
  Plus,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedProgramme, setSelectedProgramme] = useState('IJMB Programme');
  const [programmeDetailTab, setProgrammeDetailTab] = useState('Overview');

  const programmes = [
    {
      id: 1,
      name: 'IJMB Programme',
      mode: 'Physical',
      duration: '9 Months',
      subjects: 12,
      classes: 4,
      status: 'Active',
    },
    {
      id: 2,
      name: 'JAMB Programme',
      mode: 'Physical',
      duration: '9 Months',
      subjects: 14,
      classes: 6,
      status: 'Active',
    },
    {
      id: 3,
      name: 'WAEC Programme',
      mode: 'Physical',
      duration: '9 Months',
      subjects: 10,
      classes: 5,
      status: 'Active',
    },
    {
      id: 4,
      name: 'Extramural Lessons',
      mode: 'Online & Physical',
      duration: 'Flexible',
      subjects: 8,
      classes: 3,
      status: 'Active',
    },
    {
      id: 5,
      name: 'Consultation Programme',
      mode: 'Online & Physical',
      duration: 'Flexible',
      subjects: 6,
      classes: 2,
      status: 'Active',
    },
    {
      id: 6,
      name: 'Special Tutorial Classes',
      mode: 'Physical',
      duration: 'Flexible',
      subjects: 8,
      classes: 3,
      status: 'Inactive',
    },
  ];

  const todayClasses = [
    {
      time: '08:00 – 09:00',
      subject: 'Mathematics',
      programme: 'IJMB',
      class: 'IJMB A',
      lecturer: 'Mr. A. Yusuf',
      room: 'Hall 1',
      status: 'Ongoing',
    },
    {
      time: '09:00 – 10:00',
      subject: 'English Language',
      programme: 'JAMB',
      class: 'JAMB B',
      lecturer: 'Mrs. R. Bello',
      room: 'Hall 2',
      status: 'Upcoming',
    },
    {
      time: '10:30 – 11:30',
      subject: 'Chemistry',
      programme: 'WAEC',
      class: 'WAEC A',
      lecturer: 'Dr. K. Ahmed',
      room: 'Lab 1',
      status: 'Upcoming',
    },
    {
      time: '12:00 – 01:00',
      subject: 'Physics',
      programme: 'IJMB',
      class: 'IJMB B',
      lecturer: 'Mr. S. Lawal',
      room: 'Hall 3',
      status: 'Upcoming',
    },
    {
      time: '02:00 – 03:00',
      subject: 'Further Maths',
      programme: 'JAMB',
      class: 'JAMB A',
      lecturer: 'Dr. M. Ibrahim',
      room: 'Hall 1',
      status: 'Upcoming',
    },
  ];

  const recentAssignments = [
    {
      title: 'Mathematics Assignment 1',
      programme: 'IJMB Programme',
      dueDate: 'Due: 15 Jul 2025',
      submitted: '128/150 submitted',
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'English Essay',
      programme: 'JAMB Programme',
      dueDate: 'Due: 16 Jul 2025',
      submitted: '98/120 submitted',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Chemistry Practical Report',
      programme: 'WAEC Programme',
      dueDate: 'Due: 18 Jul 2025',
      submitted: '76/100 submitted',
      color: 'bg-purple-100 text-purple-700',
    },
    {
      title: 'Physics Problem Set',
      programme: 'IJMB Programme',
      dueDate: 'Due: 20 Jul 2025',
      submitted: '54/80 submitted',
      color: 'bg-cyan-100 text-cyan-700',
    },
    {
      title: 'Project Work',
      programme: 'All Programmes',
      dueDate: 'Due: 25 Jul 2025',
      submitted: '32/60 submitted',
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-[#111A43] tracking-tight">Academic Management</h1>
          <p className="max-w-full truncate text-[10px] leading-tight text-slate-500 sm:text-xs">Manage programmes, subjects, classes, timetables, attendance and assignments.</p>
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
            Create New &gt;
          </button>
        </div>
      </div>

      {activeTab === 'Overview' && <>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#111A43]">Academic workspace</h2>
          <p className="mt-1 text-sm text-slate-500">Choose an area to manage. Detailed records and actions open in their own workspace.</p>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {['Programmes', 'Subjects', 'Classes & Streams', 'Timetable', 'Attendance', 'Assignments'].map(section => (
              <button key={section} type="button" onClick={() => setActiveTab(section)} className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-[#F7F8FC] px-4 py-4 text-left text-sm font-semibold text-[#111A43] transition hover:border-[#C62839] hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C62839]">
                <span>{section}</span><ChevronRight size={17} className="shrink-0 text-[#C62839]" />
              </button>
            ))}
          </div>
        </div>
      </>}
      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['Overview', 'Programmes', 'Subjects', 'Classes & Streams', 'Timetable', 'Attendance', 'Assignments'].map((tab) => {
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

      {activeTab !== 'Overview' && <>
      {/* Contextual summary for the selected workspace */}
      <div className="grid grid-cols-1 min-[460px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5">
        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#111A43] flex items-center justify-center text-white shrink-0">
            <GraduationCap size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">6</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Programmes</p>
            <p className="text-[10px] text-slate-400">Active Programmes</p>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">48</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Subjects</p>
            <p className="text-[10px] text-slate-400">Across Programmes</p>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">24</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Classes</p>
            <p className="text-[10px] text-slate-400">Active Classes</p>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0">
            <UserCheck size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">128</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Lecturers</p>
            <p className="text-[10px] text-slate-400">Active Lecturers</p>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Calendar size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">86%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Average Attendance</p>
            <p className="text-[10px] text-slate-400">This Session</p>
          </div>
        </div>

        <div className="min-w-0 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <FileText size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xl font-black text-[#111A43] leading-none">312</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Assignments</p>
            <p className="text-[10px] text-slate-400">Total Submissions</p>
          </div>
        </div>
      </div>


      </>}

      {activeTab==='Programmes'?<>
      {/* Mid Section: Programmes Table + Programme Details Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Programmes Table */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap size={18} className="text-[#111A43]" />
              <h2 className="text-base font-bold text-[#111A43]">Programmes</h2>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors">
              <Plus size={14} />
              Add Programme
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search programmes..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
              />
            </div>
            <select className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none">
              <option>Status: All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
            <select className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none">
              <option>Mode: All Modes</option>
              <option>Physical</option>
              <option>Online &amp; Physical</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Programme Name</th>
                  <th className="py-2.5 px-3">Mode</th>
                  <th className="py-2.5 px-3">Duration</th>
                  <th className="py-2.5 px-2 text-center">Subjects</th>
                  <th className="py-2.5 px-2 text-center">Classes</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {programmes.map((p, idx) => {
                  const isSelected = selectedProgramme === p.name;
                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProgramme(p.name)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-[#111A43] whitespace-nowrap">{p.name}</td>
                      <td className="py-3 px-3 text-slate-600">{p.mode}</td>
                      <td className="py-3 px-3 text-slate-600">{p.duration}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{p.subjects}</td>
                      <td className="py-3 px-2 text-center font-semibold text-slate-700">{p.classes}</td>
                      <td className="py-3 px-3">
                        {p.status === 'Active' ? (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
                        ) : (
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Inactive</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                          <MoreVertical size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Programme Details Card */}
        <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-[#111A43]">Programme Details</span>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          {/* Banner */}
          <div className="flex items-start gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=300&q=80"
              alt="Programme banner"
              className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111A43] truncate">{selectedProgramme}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Interim Joint Matriculation Board</p>
              <p className="text-[10px] text-slate-400 mt-1">9 Months | Physical | 12 Subjects</p>
              <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-800 mt-2 bg-white px-2 py-1 rounded-lg border border-slate-200">
                <Edit2 size={11} />
                Edit
              </button>
            </div>
          </div>

          {/* Details Subtabs */}
          <div className="border-b border-slate-200">
            <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
              {['Overview', 'Subjects', 'Classes', 'Timetable'].map((tab) => {
                const isActive = programmeDetailTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setProgrammeDetailTab(tab)}
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

          {/* 4 Mini Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0">
                <Users size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Total Students</p>
                <p className="text-base font-black text-[#111A43]">320</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#C62839] flex items-center justify-center text-white shrink-0">
                <GraduationCap size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Total Classes</p>
                <p className="text-base font-black text-[#111A43]">4</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center text-white shrink-0">
                <UserCheck size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Lecturers</p>
                <p className="text-base font-black text-[#111A43]">8</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600 flex items-center justify-center text-white shrink-0">
                <Calendar size={16} />
              </div>
              <div>
                <p className="text-[11px] text-slate-500">Attendance Rate</p>
                <p className="text-base font-black text-[#111A43]">88%</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-700">Description</p>
            <div className="flex items-center justify-between text-xs text-slate-500 mt-1">
              <p>Preparatory programme for university admission through IJMB.</p>
              <button className="text-blue-600 hover:text-blue-700 font-semibold whitespace-nowrap ml-2">View Details →</button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Today's Classes + Attendance Summary + Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Today's Classes */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-[#111A43]" />
              <h3 className="text-sm font-bold text-[#111A43]">Today&apos;s Classes</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">Monday, 14 July 2025</span>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View Full Timetable</button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Subject</th>
                  <th className="py-2 px-2">Prog</th>
                  <th className="py-2 px-2">Class</th>
                  <th className="py-2 px-2">Lecturer</th>
                  <th className="py-2 px-2">Room</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayClasses.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 font-mono text-[11px] text-slate-500">{c.time}</td>
                    <td className="py-2.5 px-2 font-bold text-[#111A43] whitespace-nowrap">{c.subject}</td>
                    <td className="py-2.5 px-2 text-slate-600">{c.programme}</td>
                    <td className="py-2.5 px-2 text-slate-600">{c.class}</td>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">{c.lecturer}</td>
                    <td className="py-2.5 px-2 text-slate-600">{c.room}</td>
                    <td className="py-2.5 px-2">
                      {c.status === 'Ongoing' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Ongoing</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Upcoming</span>
                      )}
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <button className="text-slate-400 hover:text-slate-600">
                        <MoreVertical size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Attendance Summary</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>

          {/* Bar chart representation */}
          <div className="flex items-end justify-between gap-3 h-36 px-2 pt-4 border-b border-slate-100">
            {[
              { day: 'Mon', pct: 92 },
              { day: 'Tue', pct: 86 },
              { day: 'Wed', pct: 88 },
              { day: 'Thu', pct: 84 },
              { day: 'Fri', pct: 90 },
            ].map((bar) => (
              <div key={bar.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600">{bar.pct}%</span>
                <div
                  className="w-full bg-blue-600 rounded-t-lg transition-all"
                  style={{ height: `${bar.pct}%` }}
                />
                <span className="text-[10px] font-medium text-slate-500">{bar.day}</span>
              </div>
            ))}
          </div>

          {/* Donut and Legend */}
          <div className="flex items-center justify-between pt-1">
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span className="text-slate-600">Present</span>
                <span className="font-bold text-[#111A43] ml-auto">1,102 (86%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C62839]"></span>
                <span className="text-slate-600">Absent</span>
                <span className="font-bold text-[#111A43] ml-auto">148 (11%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="text-slate-600">Late</span>
                <span className="font-bold text-[#111A43] ml-auto">38 (3%)</span>
              </div>
            </div>

            {/* Donut Circle */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  strokeDasharray="86, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-black text-[#111A43]">86%</span>
                <p className="text-[9px] text-slate-400">Overall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Assignments */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Assignments</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3">
            {recentAssignments.map((a, i) => (
              <div key={i} className="flex items-start gap-3 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 font-bold ${a.color}`}>
                  <FileText size={15} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-[#111A43] truncate">{a.title}</p>
                  <p className="text-[11px] text-slate-500">{a.programme}</p>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-rose-600 font-semibold">{a.dueDate}</span>
                    <span className="text-slate-400">{a.submitted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>:<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
        <h2 className="text-lg font-bold text-[#111A43]">{activeTab}</h2>
        <p className="mt-2 text-sm text-slate-600">This section needs live academic records and authenticated management endpoints before it can be used.</p>
        <p className="mt-2 text-xs text-amber-700">The Programmes overview contains design-preview data, not verified institutional records.</p>
      </section>}
    </div>
  );
}
