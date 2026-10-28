import React, { useState } from 'react';
import {
  FileCheck,
  FileQuestion,
  Users,
  CheckCircle,
  Play,
  Clock,
  Plus,
  Calendar,
  ChevronDown,
  Upload,
  Sparkles,
  BookOpen,
  MoreVertical,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function AdminCbtPage() {
  const [activeTab, setActiveTab] = useState('Overview');

  const recentExams = [
    {
      id: 1,
      title: 'Mathematics (CBT)',
      programme: 'JAMB',
      type: 'Practice',
      date: '15 Jul 2025',
      candidates: 320,
      status: 'Ongoing',
    },
    {
      id: 2,
      title: 'English Language (CBT)',
      programme: 'IJMB',
      type: 'Main Exam',
      date: '12 Jul 2025',
      candidates: 210,
      status: 'Completed',
    },
    {
      id: 3,
      title: 'Chemistry (CBT)',
      programme: 'WAEC',
      type: 'Practice',
      date: '10 Jul 2025',
      candidates: 198,
      status: 'Completed',
    },
    {
      id: 4,
      title: 'Physics (CBT)',
      programme: 'JAMB',
      type: 'Mock Exam',
      date: '08 Jul 2025',
      candidates: 254,
      status: 'Completed',
    },
    {
      id: 5,
      title: 'Biology (CBT)',
      programme: 'IJMB',
      type: 'Main Exam',
      date: '05 Jul 2025',
      candidates: 176,
      status: 'Completed',
    },
  ];

  const recentResults = [
    {
      id: 1,
      name: 'Adebayo, Chisom',
      programme: 'IJMB',
      exam: 'Mathematics',
      score: '78/100',
      percentage: '78%',
      status: 'Pass',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 2,
      name: 'Okafor, Daniel',
      programme: 'JAMB',
      exam: 'English Language',
      score: '65/100',
      percentage: '65%',
      status: 'Pass',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 3,
      name: 'Mohammed, Aisha',
      programme: 'WAEC',
      exam: 'Chemistry',
      score: '42/100',
      percentage: '42%',
      status: 'Fail',
      avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 4,
      name: 'Eze, Victoria',
      programme: 'IJMB',
      exam: 'Physics',
      score: '88/100',
      percentage: '88%',
      status: 'Pass',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    },
    {
      id: 5,
      name: 'Yusuf, Ibrahim',
      programme: 'JAMB',
      exam: 'Biology',
      score: '55/100',
      percentage: '55%',
      status: 'Pass',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    },
  ];

  const topSubjects = [
    { subject: 'Mathematics', avgScore: '82%', passRate: '88%' },
    { subject: 'English Language', avgScore: '78%', passRate: '85%' },
    { subject: 'Physics', avgScore: '74%', passRate: '79%' },
    { subject: 'Chemistry', avgScore: '71%', passRate: '76%' },
    { subject: 'Biology', avgScore: '68%', passRate: '72%' },
    { subject: 'Further Mathematics', avgScore: '65%', passRate: '70%' },
    { subject: 'Economics', avgScore: '62%', passRate: '68%' },
    { subject: 'Government', avgScore: '58%', passRate: '64%' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">CBT &amp; Examinations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage question bank, create examinations, schedule CBT, monitor candidates and view results.</p>
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
            Create New Exam &gt;
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 min-[460px]:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <FileQuestion size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">2,485</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Questions</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">Across All Subjects</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <FileCheck size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">48</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Examinations</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 8% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">3,862</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Attempts</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 15% <span className="font-normal text-slate-400">All Programmes</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">78%</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Average Pass Rate</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 6% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Play size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">12</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Ongoing Exams</p>
            <p className="text-[10px] font-bold text-emerald-600 mt-0.5">Live Now</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">4</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Upcoming Exams</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Next 7 Days</p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['Overview', 'Question Bank', 'Examinations', 'Candidates', 'Results & Analytics', 'CBT Settings'].map((tab) => {
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

      {activeTab==='Overview'?<>
      {/* Mid Section: Recent Examinations + Quick Actions & Question Bank */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Examinations */}
        <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-[#C62839]" />
              <h2 className="text-base font-bold text-[#111A43]">Recent Examinations</h2>
            </div>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3">Programme</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Candidates</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExams.map((e, idx) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#111A43] whitespace-nowrap">{e.title}</td>
                    <td className="py-3 px-3 font-semibold text-slate-700">{e.programme}</td>
                    <td className="py-3 px-3 text-slate-600">{e.type}</td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">{e.date}</td>
                    <td className="py-3 px-3 text-center font-bold text-[#111A43]">{e.candidates}</td>
                    <td className="py-3 px-3">
                      {e.status === 'Ongoing' ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Ongoing</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">Completed</span>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button className="p-1 text-slate-400 hover:text-slate-600">
                        <MoreVertical size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Quick Actions & Question Bank Overview */}
        <div className="xl:col-span-5 space-y-5">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-500 font-bold">⚡</span>
              <h3 className="text-sm font-bold text-[#111A43]">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                <Plus size={15} />
                Add Questions
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                <FileCheck size={15} />
                Create Exam
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                <Upload size={15} />
                Upload Questions
              </button>
              <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors">
                <Sparkles size={15} />
                Generate from Past Questions
              </button>
            </div>
          </div>

          {/* Question Bank Overview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-blue-600" />
                <h3 className="text-sm font-bold text-[#111A43]">Question Bank Overview</h3>
              </div>
              <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <p className="text-base font-black text-blue-800">1,245</p>
                <p className="text-[10px] text-blue-600 font-semibold mt-0.5">Multiple Choice</p>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-100 text-center">
                <p className="text-base font-black text-rose-800">582</p>
                <p className="text-[10px] text-rose-600 font-semibold mt-0.5">Theory</p>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <p className="text-base font-black text-amber-800">524</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Past Questions</p>
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-100 text-center">
                <p className="text-base font-black text-purple-800">134</p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">Custom Questions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Results + Performance Analytics + Top Performing Subjects */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Results */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Results</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 w-7">#</th>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-2">Prog</th>
                  <th className="py-2 px-2">Exam</th>
                  <th className="py-2 px-2">Score</th>
                  <th className="py-2 px-2">Percentage</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentResults.map((r, i) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={r.avatar}
                          alt={r.name}
                          className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        <span className="font-semibold text-[#111A43] whitespace-nowrap">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-slate-700">{r.programme}</td>
                    <td className="py-2.5 px-2 text-slate-600 whitespace-nowrap">{r.exam}</td>
                    <td className="py-2.5 px-2 font-mono text-slate-700">{r.score}</td>
                    <td className="py-2.5 px-2 font-bold text-[#111A43]">{r.percentage}</td>
                    <td className="py-2.5 px-2">
                      {r.status === 'Pass' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Pass</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Fail</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performance Analytics */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Performance Analytics</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Session</option>
              <option>Last Session</option>
            </select>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-2.5 h-36 px-2 pt-4 border-b border-slate-100">
            {[
              { label: 'JAMB', pct: 78 },
              { label: 'IJMB', pct: 82 },
              { label: 'WAEC', pct: 74 },
              { label: 'Extramural', pct: 68 },
              { label: 'Special Class', pct: 88 },
            ].map((b) => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[10px] font-bold text-slate-600">{b.pct}%</span>
                <div
                  className="w-full bg-blue-600 rounded-t-lg transition-all"
                  style={{ height: `${b.pct}%` }}
                />
                <span className="text-[9px] font-medium text-slate-500 truncate w-full text-center">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Programme Breakdown */}
          <div className="space-y-1.5 text-xs">
            {[
              { name: 'JAMB Programme', pct: '78%', count: '1,245', color: 'bg-blue-600' },
              { name: 'IJMB Programme', pct: '82%', count: '980', color: 'bg-sky-500' },
              { name: 'WAEC Programme', pct: '74%', count: '560', color: 'bg-[#C62839]' },
              { name: 'Extramural Lessons', pct: '68%', count: '320', color: 'bg-amber-500' },
              { name: 'Special Classes', pct: '88%', count: '210', color: 'bg-purple-600' },
            ].map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${p.color}`} />
                  <span className="text-slate-600">{p.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#111A43]">{p.pct}</span>
                  <span className="text-slate-400 text-[11px] w-10 text-right">{p.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Subjects */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Top Performing Subjects</h3>
            <select className="text-xs bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg text-slate-600">
              <option>This Session</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-1 w-6">#</th>
                  <th className="py-2 px-2">Subject</th>
                  <th className="py-2 px-2 text-right">Avg Score</th>
                  <th className="py-2 px-2 text-right">Pass Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topSubjects.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2 px-1 text-slate-400 text-[11px]">{idx + 1}</td>
                    <td className="py-2 px-2 font-medium text-slate-700 whitespace-nowrap">{s.subject}</td>
                    <td className="py-2 px-2 text-right font-bold text-[#111A43]">{s.avgScore}</td>
                    <td className="py-2 px-2 text-right font-bold text-emerald-600">{s.passRate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      </>:<section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" aria-live="polite">
        <h2 className="text-lg font-bold text-[#111A43]">{activeTab}</h2>
        <p className="mt-2 text-sm text-slate-600">This section is not yet connected to live CBT records. Its controls will be enabled after authenticated backend integration.</p>
        <p className="mt-2 text-xs text-amber-700">Overview figures are design samples, not verified examination statistics.</p>
      </section>}
    </div>
  );
}
