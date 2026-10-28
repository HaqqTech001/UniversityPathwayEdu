import React, { useState, useEffect } from 'react';
import {getStudentToken} from '../../context/AuthContext';
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
    { id: 'eng', name: 'Use of English', questions: 60, time: '40 mins', score: '—' },
    { id: 'mth', name: 'Mathematics', questions: 40, time: '45 mins', score: '—' },
    { id: 'phy', name: 'Physics', questions: 40, time: '40 mins', score: '—' },
    { id: 'chm', name: 'Chemistry', questions: 40, time: '40 mins', score: '—' },
    { id: 'bio', name: 'Biology', questions: 40, time: '40 mins', score: '—' },
  ];

  const [recentHistory,setRecentHistory]=useState<Array<{id:string;date:string;test:string;subject:string;score:string;pct:string;status:string}>>([]);
  const [historyError,setHistoryError]=useState('');
  const [historyLoading,setHistoryLoading]=useState(false);
  useEffect(()=>{
    const token=getStudentToken();
    if(!token){setHistoryError('Sign in to view assessment results.');return;}
    let active=true;setHistoryLoading(true);
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/assessment-results',{headers:{Authorization:'Bearer '+token}})
      .then(async r=>{const data=await r.json().catch(()=>({}));if(!r.ok)throw Error(data.error||'Could not load assessment results.');return data;})
      .then(data=>{if(active)setRecentHistory((data.results||[]).map((r:any)=>({id:r.id,date:new Date(r.submitted_at).toLocaleDateString('en-NG'),test:'Institutional Assessment',subject:'Assessment '+String(r.assessment_id).slice(0,8),score:String(r.score??0)+' / '+String(r.total_questions??0),pct:r.total_questions?Math.round(Number(r.score||0)/Number(r.total_questions)*100)+'%':'—',status:'Submitted'})));})
      .catch(e=>{if(active)setHistoryError(e instanceof Error?e.message:'Assessment history unavailable.');})
      .finally(()=>{if(active)setHistoryLoading(false);});
    return ()=>{active=false;};
  },[]);

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
            {/* Never display invented in-progress exams or countdowns. */}
            <div className="rounded-2xl bg-gradient-to-r from-[#111A43] to-[#1c3275] p-6 text-white shadow-md">
              <h2 className="text-lg font-black">Ready for CBT practice?</h2>
              <p className="mt-2 text-sm text-slate-200">Start a practice session to view your real questions, timer and progress.</p>
              <button type="button" onClick={() => setShowFullWizard(true)} className="mt-4 rounded-xl bg-[#c62839] px-4 py-2 text-sm font-bold text-white">Start Practice</button>
            </div>

            {/* Subject Selector Grid */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h2 className="text-sm font-extrabold text-[#111A43]">
                  Select Subject for Individual Practice Drill
                </h2>
                <span className="text-xs text-slate-400">Choose a practice subject</span>
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
            <div className="rounded-2xl border border-[#dce5f0] bg-white p-6">
              <h3 className="font-extrabold text-[#111A43]">Live CBT question navigator</h3>
              <p className="mt-2 text-xs text-slate-600">Question numbers, answered status and flagged questions are displayed inside an active CBT session, using your actual responses.</p>
              <button type="button" onClick={()=>setShowFullWizard(true)} className="mt-4 rounded-xl bg-[#111A43] px-4 py-2 text-xs font-bold text-white">Start CBT session</button>
            </div>

            {/* Recent Practice History Table */}
            <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Recent Practice History &amp; Diagnostics
                </h3>
                <span className="text-xs text-slate-400">Saved results</span>
              </div>

              {historyLoading && <p role="status" className="text-sm text-slate-600">Loading assessment results…</p>}
              {historyError && <p role="alert" className="text-sm text-red-700">{historyError}</p>}
              {!historyLoading && !historyError && recentHistory.length===0 && <p className="text-sm text-slate-600">No completed assessments recorded yet.</p>}
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
                    <strong className="text-lg font-black text-[#111A43]">{recentHistory.length ? (recentHistory.reduce((sum,item)=>sum+Number.parseFloat(item.pct||'0'),0)/recentHistory.length).toFixed(1)+'%' : '—'}</strong>
                  </div>
                  <span className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <TrendingUp size={18} />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Accuracy Rate</span>
                    <strong className="text-lg font-black text-[#111A43]">{recentHistory.length ? (recentHistory.reduce((sum,item)=>sum+Number.parseFloat(item.pct||'0'),0)/recentHistory.length).toFixed(1)+'%' : '—'}</strong>
                  </div>
                  <span className="p-2 rounded-lg bg-blue-100 text-[#2456a0]">
                    <CheckCircle2 size={18} />
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Completed Drills</span>
                    <strong className="text-lg font-black text-[#111A43]">{recentHistory.length+' Tests'}</strong>
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

            <div className="rounded-2xl border border-[#dce5f0] bg-white p-6 shadow-xs">
              <h3 className="text-sm font-extrabold text-[#111A43]">Upcoming CBT Events</h3>
              <p className="mt-3 text-xs text-slate-600">No verified upcoming CBT events have been published here.</p>
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
