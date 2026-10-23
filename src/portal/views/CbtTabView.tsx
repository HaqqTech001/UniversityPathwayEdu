import React, { useState } from 'react';
import {
  BookOpenCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Award,
  Zap,
  HelpCircle,
  Flag,
  FileText,
  ChevronRight,
  TrendingUp,
  Sliders,
  Calendar,
  Sparkles,
  X,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import CbtExamWizard from '../CbtExamWizard';
import JambPastQuestions from '../JambPastQuestions';
import InstitutionalAssessments from '../InstitutionalAssessments';

interface CbtTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

export default function CbtTabView({
  currentUser,
  onNavigateTab,
}: CbtTabViewProps) {
  const [activeMode, setActiveMode] = useState<'timed' | 'untimed' | 'speed'>('timed');
  const [showFullWizard, setShowFullWizard] = useState(false);
  const [selectedSubTab, setSelectedSubTab] = useState<'practice' | 'past_questions' | 'assessments'>('practice');

  const subjects = [
    { id: 'eng', name: 'Use of English', questions: 60, time: '40 mins', score: '78%' },
    { id: 'mth', name: 'Mathematics', questions: 40, time: '45 mins', score: '72%' },
    { id: 'phy', name: 'Physics', questions: 40, time: '40 mins', score: '68%' },
    { id: 'chm', name: 'Chemistry', questions: 40, time: '40 mins', score: '75%' },
    { id: 'bio', name: 'Biology', questions: 40, time: '40 mins', score: '82%' },
  ];

  const recentHistory = [
    { id: 'h1', date: '21 Oct 2026', test: 'Full Mock Exam #2', subject: 'JAMB UTME 4-in-1', score: '274 / 400', pct: '68.5%', status: 'Passed' },
    { id: 'h2', date: '19 Oct 2026', test: 'Subject Speed Drill', subject: 'Use of English', score: '52 / 60', pct: '86.7%', status: 'Excellent' },
    { id: 'h3', date: '16 Oct 2026', test: 'Diagnostic Test', subject: 'Physics & Chemistry', score: '64 / 80', pct: '80.0%', status: 'Passed' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            CBT Practice Simulator
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate standard UTME, IJMB &amp; JUPEB examinations with authentic timed questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFullWizard(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <Play size={14} fill="white" />
            <span>Launch Exam Simulator</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#dce5f0] pb-2">
        <button
          type="button"
          onClick={() => setSelectedSubTab('practice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedSubTab === 'practice'
              ? 'bg-[#111A43] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          CBT Practice &amp; Drills
        </button>
        <button
          type="button"
          onClick={() => setSelectedSubTab('past_questions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedSubTab === 'past_questions'
              ? 'bg-[#111A43] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          JAMB Historical Past Questions
        </button>
        <button
          type="button"
          onClick={() => setSelectedSubTab('assessments')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedSubTab === 'assessments'
              ? 'bg-[#111A43] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Institutional Assessments
        </button>
      </div>

      {selectedSubTab === 'past_questions' && (
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
          <JambPastQuestions />
        </div>
      )}

      {selectedSubTab === 'assessments' && (
        <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
          <InstitutionalAssessments />
        </div>
      )}

      {selectedSubTab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* LEFT COLUMN: Subjects, Active Test Banner, Question Grid Preview, History */}
          <div className="space-y-6">
            {/* Active Practice Continuation Card (From Mockup) */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#111A43] via-[#162758] to-[#1c3275] rounded-2xl p-6 text-white shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 text-[#f0bb5b] text-[11px] font-bold border border-red-500/30">
                    <Clock size={12} />
                    <span>In-Progress Practice Session</span>
                  </span>
                  <h2 className="mt-2 text-lg font-black">
                    Full Mock Examination #3 (UTME 4 Subjects)
                  </h2>
                  <p className="text-xs text-slate-300 mt-1">
                    Progress: 18 of 60 questions answered · English, Biology, Chemistry, Physics
                  </p>

                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowFullWizard(true)}
                      className="px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <Play size={14} fill="white" />
                      <span>Resume Examination</span>
                    </button>
                  </div>
                </div>

                {/* Circular Timer Widget */}
                <div className="flex items-center gap-4 bg-white/10 rounded-2xl p-4 backdrop-blur-xs border border-white/10 self-start sm:self-center">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-bold text-slate-300 block">
                      Time Remaining
                    </span>
                    <strong className="text-2xl font-black text-white font-mono block mt-0.5">
                      58:42
                    </strong>
                    <span className="text-[10px] text-emerald-400 font-semibold">
                      Timer Active
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Selector Grid */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Select Subject for Individual Practice Drill
                </h2>
                <span className="text-xs text-slate-400">Authentic Curriculum Bank</span>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {subjects.map((subj) => (
                  <div
                    key={subj.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-[#111A43] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <strong className="text-sm font-bold text-[#111A43]">
                        {subj.name}
                      </strong>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {subj.score} avg
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {subj.questions} Questions · {subj.time}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowFullWizard(true)}
                      className="mt-3 w-full py-1.5 rounded-lg bg-[#111A43] hover:bg-[#1c3275] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Practice Now
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Practice Question Grid Preview (1..20 Mockup Feature) */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-extrabold text-[#111A43]">
                    Question Palette &amp; Navigation Simulation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Preview of the standard JAMB 8-key question navigator
                  </p>
                </div>
                {/* Legend */}
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Answered
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> Flagged
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-3 h-3 rounded-md bg-slate-200 inline-block" /> Unattempted
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: 20 }, (_, i) => {
                  const num = i + 1;
                  const isAnswered = [1, 2, 3, 5, 6, 7, 8, 9, 11, 12, 14, 15, 17, 18].includes(num);
                  const isFlagged = [4, 10, 16].includes(num);
                  return (
                    <div
                      key={num}
                      className={`h-9 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                        isAnswered
                          ? 'bg-emerald-500 text-white'
                          : isFlagged
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Practice History Table */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Recent Practice History &amp; Diagnostics
                </h3>
                <span className="text-xs text-slate-400">Past 30 Days</span>
              </div>

              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-bold">
                      <th className="py-2.5">Date</th>
                      <th className="py-2.5">Session Name</th>
                      <th className="py-2.5">Subject Stream</th>
                      <th className="py-2.5">Raw Score</th>
                      <th className="py-2.5">Percentage</th>
                      <th className="py-2.5 text-right">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentHistory.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/70">
                        <td className="py-3 text-slate-500">{item.date}</td>
                        <td className="py-3 font-bold text-[#111A43]">{item.test}</td>
                        <td className="py-3 text-slate-600">{item.subject}</td>
                        <td className="py-3 font-mono font-bold">{item.score}</td>
                        <td className="py-3 font-bold text-emerald-700">{item.pct}</td>
                        <td className="py-3 text-right">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Performance Stats, Strategy Carousel & Announcements */}
          <div className="space-y-6">
            {/* 3 KPI Summary Cards */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
                Performance Diagnostics
              </h3>
              <div className="mt-4 space-y-3.5">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Average</span>
                    <strong className="text-lg font-black text-[#111A43]">74.5%</strong>
                  </div>
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp size={18} />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy Rate</span>
                    <strong className="text-lg font-black text-[#111A43]">82.1%</strong>
                  </div>
                  <span className="p-2 rounded-lg bg-blue-100 text-[#2456a0]">
                    <CheckCircle2 size={18} />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Drills</span>
                    <strong className="text-lg font-black text-[#111A43]">14 Tests</strong>
                  </div>
                  <span className="p-2 rounded-lg bg-purple-100 text-purple-700">
                    <Award size={18} />
                  </span>
                </div>
              </div>
            </div>

            {/* Exam Strategy Tip Card */}
            <div className="bg-gradient-to-br from-[#111A43] to-[#1c3275] rounded-2xl p-6 text-white shadow-md">
              <div className="flex items-center gap-2 pb-2">
                <Sparkles size={18} className="text-[#d5a75b]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#d5a75b]">
                  Exam Strategy Tip
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-200">
                <strong>JAMB UTME Time Management:</strong> Allocate approximately 40 seconds per question on English Language comprehension. Answer all straightforward questions first, flag tricky calculations, and return in the final 15 minutes.
              </p>
            </div>

            {/* CBT Announcements */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Calendar size={18} className="text-[#c62839]" />
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Upcoming CBT Events
                </h3>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-[#c62839] uppercase block">Saturday, 8 Nov 2026</span>
                  <strong className="text-xs font-bold text-[#111A43] block mt-0.5">Statewide UTME Simulation Mock</strong>
                  <p className="text-[11px] text-slate-500 mt-1">Simulated 400-mark nationwide ranking exam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Exam Runner Modal if opened */}
      {showFullWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-8 my-auto max-h-[95vh] overflow-y-auto relative shadow-2xl">
            <button
              type="button"
              onClick={() => setShowFullWizard(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
            <CbtExamWizard />
          </div>
        </div>
      )}
    </div>
  );
}
