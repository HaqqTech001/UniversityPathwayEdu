import React, { useState } from 'react';
import {
  Users,
  FileText,
  GraduationCap,
  Briefcase,
  Wallet,
  Award,
  Calendar,
  Sun,
  ChevronDown,
  ArrowUpRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  UserPlus,
  BookOpen,
  CreditCard,
} from 'lucide-react';
import { AdminTabId } from '../types';

interface AdminDashboardPageProps {
  onNavigateTab?: (tab: AdminTabId) => void;
}

export default function AdminDashboardPage({ onNavigateTab = () => {} }: AdminDashboardPageProps) {
  const [session, setSession] = useState('2025/2026 Academic Session');
  const [trendRange, setTrendRange] = useState<'this' | 'last' | '2years'>('this');

  return (
    <div className="space-y-6">
      {/* =========================================================================
          PAGE HEADER BAR
          ========================================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#111A43] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Welcome back, Admin. Here's an overview of your institution today.
          </p>
        </div>

        {/* Right Info Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Session Dropdown */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Calendar size={16} className="text-[#111A43]" />
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-[#111A43] block">
                {session}
              </span>
              <span className="text-[10px] text-slate-400">Current Session</span>
            </div>
            <ChevronDown size={14} className="text-slate-400 ml-1" />
          </div>

          {/* Current Date & Time Display */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 shadow-xs">
            <Calendar size={16} className="text-[#D5A75B]" />
            <div className="text-left leading-tight">
              <span className="text-xs font-bold text-[#111A43] block">
                Monday, 14 July 2025
              </span>
              <span className="text-[10px] text-slate-400">10:24 AM</span>
            </div>
            <Sun size={15} className="text-amber-500 ml-1" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 1: 6 TOP KPI CARDS
          ========================================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 site-kpi-grid">
        {/* Card 1: Total Students */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#111A43] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Users size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            1,248
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            Total Students
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp size={12} />
            <span>12%</span>
            <span className="text-slate-400 font-normal">vs last session</span>
          </div>
        </div>

        {/* Card 2: New Applications */}
        <div
          onClick={() => onNavigateTab('students')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#C62839] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#C62839] text-white flex items-center justify-center mb-3 shadow-sm">
            <FileText size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            86
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            New Applications
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp size={12} />
            <span>8%</span>
            <span className="text-slate-400 font-normal truncate">Pending Review: 28</span>
          </div>
        </div>

        {/* Card 3: Programmes */}
        <div
          onClick={() => onNavigateTab('academic')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#D5A75B] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-sm">
            <GraduationCap size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            6
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            Programmes
          </span>
          <div className="text-[11px] font-medium text-slate-400 mt-2">
            Active Programmes
          </div>
        </div>

        {/* Card 4: Staff & Lecturers */}
        <div
          onClick={() => onNavigateTab('staff')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-[#111A43] transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-[#08163B] text-white flex items-center justify-center mb-3 shadow-sm">
            <Briefcase size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            128
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            Staff &amp; Lecturers
          </span>
          <div className="text-[11px] font-medium text-slate-400 mt-2">
            Active: 122
          </div>
        </div>

        {/* Card 5: Total Revenue */}
        <div
          onClick={() => onNavigateTab('finance')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-emerald-600 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Wallet size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            ₦24.8M
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            Total Revenue
          </span>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 mt-2">
            <TrendingUp size={12} />
            <span>18%</span>
            <span className="text-slate-400 font-normal">This Session</span>
          </div>
        </div>

        {/* Card 6: Examinations */}
        <div
          onClick={() => onNavigateTab('cbt')}
          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-purple-600 transition-all cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-3 shadow-sm">
            <Award size={20} />
          </div>
          <strong className="text-xl sm:text-2xl font-black text-[#111A43] block">
            12
          </strong>
          <span className="text-xs font-semibold text-slate-600 block mt-0.5">
            Examinations
          </span>
          <div className="text-[11px] font-medium text-slate-400 mt-2">
            Ongoing: 3
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 2: STUDENT ENROLMENT TREND + REVENUE BREAKDOWN + APPLICATION STATUS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Student Enrolment Trend (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-[#111A43]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Student Enrolment Trend
                </h3>
              </div>
              <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setTrendRange('this')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    trendRange === 'this' ? 'bg-[#C62839] text-white shadow-xs' : 'text-slate-600 hover:text-[#111A43]'
                  }`}
                >
                  This Session
                </button>
                <button
                  type="button"
                  onClick={() => setTrendRange('last')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    trendRange === 'last' ? 'bg-[#C62839] text-white shadow-xs' : 'text-slate-600 hover:text-[#111A43]'
                  }`}
                >
                  Last Session
                </button>
                <button
                  type="button"
                  onClick={() => setTrendRange('2years')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    trendRange === '2years' ? 'bg-[#C62839] text-white shadow-xs' : 'text-slate-600 hover:text-[#111A43]'
                  }`}
                >
                  Last 2 Years
                </button>
              </div>
            </div>

            {/* SVG Trend Line Chart */}
            <div className="mt-6 relative h-48 sm:h-52 w-full">
              {/* Tooltip Pill */}
              <div className="absolute top-2 right-6 px-2.5 py-1 rounded-lg bg-slate-100 text-[#111A43] text-[11px] font-bold border border-slate-200 shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>1,248 Students</span>
              </div>

              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Guide Lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="#F1F5F9" strokeWidth="1" />
                <line x1="0" y1="150" x2="500" y2="150" stroke="#F1F5F9" strokeWidth="1" />

                {/* Area Gradient */}
                <polygon
                  points="0,160 45,150 90,135 135,120 180,105 225,110 270,100 315,90 360,80 405,65 450,55 490,40 490,170 0,170"
                  fill="url(#trendGrad)"
                />
                {/* Curve Line */}
                <polyline
                  fill="none"
                  stroke="#2563EB"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,160 45,150 90,135 135,120 180,105 225,110 270,100 315,90 360,80 405,65 450,55 490,40"
                />

                {/* Point Dots */}
                {[
                  [0, 160], [45, 150], [90, 135], [135, 120], [180, 105], [225, 110],
                  [270, 100], [315, 90], [360, 80], [405, 65], [450, 55], [490, 40]
                ].map(([cx, cy], i) => (
                  <circle
                    key={i}
                    cx={cx}
                    cy={cy}
                    r={i === 11 ? 5 : 3}
                    fill={i === 11 ? '#C62839' : '#2563EB'}
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Month Axis Labels */}
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold pt-2 border-t border-slate-100">
            <span>Sep</span>
            <span>Oct</span>
            <span>Nov</span>
            <span>Dec</span>
            <span>Jan</span>
            <span>Feb</span>
            <span>Mar</span>
            <span>Apr</span>
            <span>May</span>
            <span>Jun</span>
            <span>Jul</span>
          </div>
        </div>

        {/* Center: Revenue Breakdown Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Revenue Breakdown
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>This Session</span>
                <ChevronDown size={12} />
              </span>
            </div>

            {/* Donut Chart Visual */}
            <div className="relative w-40 h-40 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="14" />
                {/* Segment 1: Reg Fees 35% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#111A43" strokeWidth="14" strokeDasharray="83.5 155" strokeDashoffset="0" />
                {/* Segment 2: Lesson Fees 30% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#C62839" strokeWidth="14" strokeDasharray="71.6 167" strokeDashoffset="-83.5" />
                {/* Segment 3: Exam Fees 20% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#D5A75B" strokeWidth="14" strokeDasharray="47.7 191" strokeDashoffset="-155.1" />
                {/* Segment 4: Other 10% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#3B82F6" strokeWidth="14" strokeDasharray="23.8 215" strokeDashoffset="-202.8" />
                {/* Segment 5: Pending 5% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#CBD5E1" strokeWidth="14" strokeDasharray="11.9 227" strokeDashoffset="-226.6" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-[#111A43] leading-none">
                  ₦24.8M
                </span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">
                  Total Revenue
                </span>
              </div>
            </div>
          </div>

          {/* Legend Items */}
          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111A43]" />
                Registration Fees
              </span>
              <strong className="text-[#111A43]">35%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C62839]" />
                Lesson Fees
              </span>
              <strong className="text-[#111A43]">30%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D5A75B]" />
                Examination Fees
              </span>
              <strong className="text-[#111A43]">20%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
                Other Fees
              </span>
              <strong className="text-[#111A43]">10%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                Pending Verification
              </span>
              <strong className="text-slate-500">5%</strong>
            </div>
          </div>
        </div>

        {/* Right: Application Status Donut (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#111A43] flex items-center gap-1.5">
                <AlertCircle size={15} className="text-[#C62839]" />
                <span>Application Status</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateTab('students')}
                className="text-xs font-bold text-[#C62839] hover:underline"
              >
                View All
              </button>
            </div>

            {/* Donut Chart Visual */}
            <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="13" />
                {/* Approved 42 (49%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="13" strokeDasharray="117 122" strokeDashoffset="0" />
                {/* Pending 28 (33%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="13" strokeDasharray="78 161" strokeDashoffset="-117" />
                {/* Rejected 8 (9%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="13" strokeDasharray="22 217" strokeDashoffset="-195" />
                {/* Awaiting Docs 8 (9%) */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#1E3A8A" strokeWidth="13" strokeDasharray="22 217" strokeDashoffset="-217" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-[#111A43] leading-none">86</span>
                <span className="text-[10px] text-slate-400 font-medium mt-0.5">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Approved
              </span>
              <strong className="text-[#111A43]">42</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Pending Review
              </span>
              <strong className="text-[#111A43]">28</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Rejected
              </span>
              <strong className="text-[#111A43]">8</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900" />
                Awaiting Documents
              </span>
              <strong className="text-[#111A43]">8</strong>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 3: RECENT APPLICATIONS + UPCOMING EXAMINATIONS + UPCOMING EVENTS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Applications Table (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-[#C62839]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Recent Applications
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('students')}
                className="text-xs font-bold text-[#C62839] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2">#</th>
                    <th className="py-2">Applicant</th>
                    <th className="py-2">Prog</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { id: 1, name: 'Adebayo, Chisom', prog: 'IJMB', status: 'Pending', date: '14 Jul 2025' },
                    { id: 2, name: 'Okafor, Daniel', prog: 'JAMB', status: 'Approved', date: '13 Jul 2025' },
                    { id: 3, name: 'Mohammed, Aisha', prog: 'WAEC', status: 'Pending', date: '13 Jul 2025' },
                    { id: 4, name: 'Eze, Victoria', prog: 'IJMB', status: 'Approved', date: '12 Jul 2025' },
                    { id: 5, name: 'Yusuf, Ibrahim', prog: 'JAMB', status: 'Awaiting Docs', date: '12 Jul 2025' },
                  ].map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 text-slate-400">{row.id}</td>
                      <td className="py-2.5 font-bold text-[#111A43] truncate max-w-[120px]">
                        {row.name}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-600">{row.prog}</td>
                      <td className="py-2.5">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            row.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700'
                              : row.status === 'Pending'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="py-2.5 text-right text-slate-400 text-[10px] whitespace-nowrap">
                        {row.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Center: Upcoming Examinations (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-[#C62839]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Upcoming Examinations
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('cbt')}
                className="text-xs font-bold text-[#C62839] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400">
                    <th className="py-2">Title</th>
                    <th className="py-2">Prog</th>
                    <th className="py-2">Date</th>
                    <th className="py-2">Cand</th>
                    <th className="py-2 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { title: 'Mathematics (CBT)', prog: 'JAMB', date: '15 Jul 2025', cand: 320, status: 'Scheduled' },
                    { title: 'English Language (CBT)', prog: 'IJMB', date: '16 Jul 2025', cand: 210, status: 'Scheduled' },
                    { title: 'Physics (CBT)', prog: 'WAEC', date: '18 Jul 2025', cand: 198, status: 'Ongoing' },
                    { title: 'Chemistry (CBT)', prog: 'IJMB', date: '20 Jul 2025', cand: 176, status: 'Scheduled' },
                    { title: 'Biology (CBT)', prog: 'JAMB', date: '22 Jul 2025', cand: 254, status: 'Pending' },
                  ].map((exam, i) => (
                    <tr key={i} className="hover:bg-slate-50">
                      <td className="py-2.5 font-bold text-[#111A43] truncate max-w-[140px]">
                        {exam.title}
                      </td>
                      <td className="py-2.5 font-semibold text-slate-600">{exam.prog}</td>
                      <td className="py-2.5 text-slate-500 whitespace-nowrap">{exam.date}</td>
                      <td className="py-2.5 font-bold text-[#111A43]">{exam.cand}</td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            exam.status === 'Ongoing'
                              ? 'bg-emerald-50 text-emerald-700'
                              : exam.status === 'Scheduled'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Upcoming Events (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-[#C62839]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Upcoming Events
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('notices')}
                className="text-xs font-bold text-[#C62839] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {[
                { day: '15', month: 'JUL', title: 'Departmental Meeting', sub: '10:00 AM – Conference Room' },
                { day: '18', month: 'JUL', title: 'End of Semester Examinations', sub: 'All Programmes' },
                { day: '22', month: 'JUL', title: 'Academic Board Meeting', sub: '2:00 PM – Main Hall' },
                { day: '30', month: 'JUL', title: 'Deadline for Course Registration', sub: 'All Students' },
              ].map((ev, idx) => (
                <div key={idx} className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex flex-col items-center justify-center shrink-0 border border-blue-100 leading-none">
                    <span className="text-xs font-black">{ev.day}</span>
                    <span className="text-[9px] font-bold text-[#C62839] uppercase mt-0.5">{ev.month}</span>
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs font-bold text-[#111A43] block truncate">
                      {ev.title}
                    </strong>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">
                      {ev.sub}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROW 4: STUDENT STATUS OVERVIEW + FEE PAYMENT STATUS + RECENT ACTIVITIES
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Student Status Overview Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#111A43] flex items-center gap-1.5">
                <Users size={16} className="text-[#111A43]" />
                <span>Student Status Overview</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>This Session</span>
                <ChevronDown size={12} />
              </span>
            </div>

            {/* Donut Chart */}
            <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="13" />
                {/* Active: 93% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#111A43" strokeWidth="13" strokeDasharray="222 239" strokeDashoffset="0" />
                {/* Suspended: 4% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="13" strokeDasharray="9.5 239" strokeDashoffset="-222" />
                {/* Graduated: 2% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#D5A75B" strokeWidth="13" strokeDasharray="4.8 239" strokeDashoffset="-231.5" />
                {/* Withdrawn: 1% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#94A3B8" strokeWidth="13" strokeDasharray="2.4 239" strokeDashoffset="-236.3" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-black text-[#111A43] leading-none">1,248</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">Students</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#111A43]" />
                Active
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">1,162</strong>
                <span className="text-slate-400 text-[11px]">93%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Suspended
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">48</strong>
                <span className="text-slate-400 text-[11px]">4%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D5A75B]" />
                Graduated
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">28</strong>
                <span className="text-slate-400 text-[11px]">2%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                Withdrawn
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">10</strong>
                <span className="text-slate-400 text-[11px]">1%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Fee Payment Status Donut (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#111A43] flex items-center gap-1.5">
                <CreditCard size={16} className="text-[#111A43]" />
                <span>Fee Payment Status</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                <span>This Session</span>
                <ChevronDown size={12} />
              </span>
            </div>

            {/* Donut Chart */}
            <div className="relative w-36 h-36 mx-auto my-4 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F1F5F9" strokeWidth="13" />
                {/* Fully Paid 68% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10B981" strokeWidth="13" strokeDasharray="162.5 239" strokeDashoffset="0" />
                {/* Partially Paid 22% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#F59E0B" strokeWidth="13" strokeDasharray="52.6 239" strokeDashoffset="-162.5" />
                {/* Not Paid 10% */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="#EF4444" strokeWidth="13" strokeDasharray="23.9 239" strokeDashoffset="-215.1" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-base font-black text-[#111A43] leading-none">₦24.8M</span>
                <span className="text-[10px] text-slate-400 font-medium mt-1">Total</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Fully Paid
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">₦16.7M</strong>
                <span className="text-slate-400 text-[11px]">68%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Partially Paid
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">₦5.4M</strong>
                <span className="text-slate-400 text-[11px]">22%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                Not Paid
              </span>
              <div className="flex items-center gap-3">
                <strong className="text-[#111A43]">₦2.7M</strong>
                <span className="text-slate-400 text-[11px]">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Activities (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-[#C62839]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Recent Activities
                </h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('notices')}
                className="text-xs font-bold text-[#C62839] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="mt-3 space-y-3">
              {[
                {
                  icon: UserPlus,
                  color: 'bg-purple-50 text-purple-700',
                  title: 'New application submitted',
                  desc: 'by Adekunle, Tobi',
                  time: '10 minutes ago',
                },
                {
                  icon: FileCheck,
                  color: 'bg-blue-50 text-blue-700',
                  title: 'Document verified',
                  desc: 'JAMB Result – Okafor, Daniel',
                  time: '1 hour ago',
                },
                {
                  icon: Wallet,
                  color: 'bg-emerald-50 text-emerald-700',
                  title: 'Fee payment confirmed',
                  desc: '₦250,000 – Adebayo, Chisom',
                  time: '2 hours ago',
                },
                {
                  icon: FileText,
                  color: 'bg-amber-50 text-amber-700',
                  title: 'New notice published',
                  desc: '2025/2026 Examination Schedule',
                  time: '3 hours ago',
                },
                {
                  icon: Users,
                  color: 'bg-indigo-50 text-indigo-700',
                  title: 'Staff account created',
                  desc: 'Dr. Emeka O. was added',
                  time: '5 hours ago',
                },
              ].map((act, i) => {
                const Icon = act.icon;
                return (
                  <div key={i} className="flex items-start gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors">
                    <span className={`w-8 h-8 rounded-xl ${act.color} flex items-center justify-center shrink-0`}>
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold text-[#111A43] block truncate">
                        {act.title}
                      </strong>
                      <span className="text-[11px] text-slate-500 block truncate">
                        {act.desc}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                      {act.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
