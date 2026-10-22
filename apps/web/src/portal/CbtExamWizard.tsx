import {shuffledPracticePool,shufflePracticeOptions} from './practiceSelection.js';
import {getStudentToken} from '../context/AuthContext';
import {upecAuthApi} from '../lib/upecAuthApi';
import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Flag,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Award,
  History,
  Play,
  X,
  Keyboard,
  Info,
  Check,
  Zap,
  TrendingUp,
  Sliders,
  HelpCircle,
  Monitor,
} from 'lucide-react';
import { CBT_QUESTION_BANK, CbtQuestion } from './cbtQuestionBank';
import { useAuth } from '../context/AuthContext';

export interface ExamAttemptRecord {
  id: string;
  examType: string;
  mode: string;
  subjects: string[];
  score: number;
  totalScore: number;
  percentage: number;
  date: string;
  subjectBreakdown: Record<string, { correct: number; total: number }>;
}

export default function CbtExamWizard() {
  const { currentUser } = useAuth();

  // Wizard Stage: 'setup' | 'exam' | 'results'
  const [stage, setStage] = useState<'setup' | 'exam' | 'results'>('setup');

  // Setup options
  const [examType, setExamType] = useState('JAMB (UTME)');
  const [practiceMode, setPracticeMode] = useState<'timed' | 'untimed' | 'speed'>('timed');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Use of English',
    'Biology',
    'Chemistry',
    'Physics',
  ]);
  const [questionSource,setQuestionSource]=useState<'sample'|'aloc'>('sample');
  const [historicalYear,setHistoricalYear]=useState(2025);
  const [providerLoading,setProviderLoading]=useState(false);
  const [providerError,setProviderError]=useState('');
  const [durationMinutes, setDurationMinutes] = useState(15); // 15 mins for realistic mini-mock

  // Examination state
  const [examQuestions, setExamQuestions] = useState<CbtQuestion[]>([]);
  const [activeSubject, setActiveSubject] = useState<string>('Use of English');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(durationMinutes * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [showPaletteDrawer, setShowPaletteDrawer] = useState(false);
  const [keyboardHelpOpen, setKeyboardHelpOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const examScreenRef = useRef<HTMLDivElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [fullscreenError, setFullscreenError] = useState('');
  const stopCamera = () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    cameraStreamRef.current = null;
    setCameraEnabled(false);
  };
  const enableCamera = async () => {
    try {
      setCameraError('');
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera unavailable. Use HTTPS and a supported browser.');
      const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
      cameraStreamRef.current = stream;
      if (cameraVideoRef.current) cameraVideoRef.current.srcObject = stream;
      setCameraEnabled(true);
    } catch (error) {
      setCameraError(error instanceof Error ? error.message : 'Camera permission was not granted.');
    }
  };
  useEffect(() => {
    if (cameraVideoRef.current && cameraStreamRef.current) cameraVideoRef.current.srcObject = cameraStreamRef.current;
  }, [cameraEnabled, stage]);
  useEffect(() => () => {
    cameraStreamRef.current?.getTracks().forEach(track => track.stop());
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
  }, []);
  const enterExamFullscreen = async () => {
    try {
      setFullscreenError('');
      await examScreenRef.current?.requestFullscreen();
    } catch {
      setFullscreenError('Your browser blocked fullscreen. You can continue in the expanded exam view.');
    }
  };
  const [calcA, setCalcA] = useState('');
  const [calcB, setCalcB] = useState('');
  const [calcOperation, setCalcOperation] = useState('+');

  // Results & History
  const [latestAttempt, setLatestAttempt] = useState<ExamAttemptRecord | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<ExamAttemptRecord[]>(() => {
    try {
      const saved = localStorage.getItem('upec_cbt_attempt_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const availableSubjectsList = [
    'Use of English', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
    'Geography', 'Government', 'Economics', 'Agricultural Science',
    'Commerce', 'Accounting', 'Literature in English', 'Christian Religious Studies',
    'Islamic Religious Studies', 'History', 'Further Mathematics', 'French',
    'Arabic', 'Hausa', 'Igbo', 'Yoruba', 'Music', 'Fine Arts', 'Home Economics',
    'Physical and Health Education',
  ];
  const subjectsWithQuestions = new Set(CBT_QUESTION_BANK.map(question => question.subject));
  const unavailableSubjects = selectedSubjects.filter(subject => !subjectsWithQuestions.has(subject));
  const canStartExam = selectedSubjects.length === 4 && (questionSource==='aloc'||unavailableSubjects.length===0) && !providerLoading;

  // Filter current subject's questions
  const currentSubjectQuestions = examQuestions.filter(
    (q) => q.subject === activeSubject
  );
  const activeQuestion = currentSubjectQuestions[currentQuestionIndex];

  // Subject questions count & answered count
  const totalQuestionsCount = examQuestions.length;
  const totalAnsweredCount = Object.keys(answers).length;

  // Toggle subject selection during setup
  const toggleSubject = (sub: string) => {
    if (sub === 'Use of English') return; // Compulsory in JAMB
    if (selectedSubjects.includes(sub)) {
      if (selectedSubjects.length > 2) {
        setSelectedSubjects(selectedSubjects.filter((s) => s !== sub));
      }
    } else {
      if (selectedSubjects.length < 4) {
        setSelectedSubjects([...selectedSubjects, sub]);
      }
    }
  };

  // Start Exam Handler
  const handleStartExam = async () => {
    if (!canStartExam) return;
    if(questionSource==='aloc'&&(!Number.isInteger(historicalYear)||historicalYear<1990||historicalYear>2030)){setProviderError('Select a valid historical question year.');return;}
    setProviderError('');
    let questions:CbtQuestion[]=[];
    if(questionSource==='aloc'){
      setProviderLoading(true);
      try{
        const token=getStudentToken();if(!token)throw Error('Please sign in again.');
        const aliases:Record<string,string>={'Use of English':'english','Agricultural Science':'agricultural-science','Literature in English':'literature-in-english','Christian Religious Studies':'crs','Islamic Religious Studies':'irs'};
        const requested=await Promise.all(selectedSubjects.map(async subject=>{
          const code=aliases[subject]||subject.toLowerCase().replaceAll(' ','-');
          const collected:any[]=[];let cursor:string|undefined=undefined;
          for(let page=0;page<4;page++){
            const result=await upecAuthApi.utmePracticeQuestions(token,code,historicalYear,cursor,30);
            collected.push(...(Array.isArray(result.questions)?result.questions:[]));
            const next=result.pagination?.nextCursor;
            if(!next||typeof next!=='string'||next===cursor)break;
            cursor=next;
          }
          const items=collected.map((raw:any)=>{
            const options=['a','b','c','d'].map(k=>raw.options?.[k]??raw.options?.[k.toUpperCase()]);
            const answer='abcd'.indexOf(String(raw.correctAnswer||'').toLowerCase());
            if(!raw.id||!String(raw.text||raw.questionHtml||'').trim()||options.some(v=>typeof v!=='string'||!v.trim())||answer<0)return null;
            return {id:String(raw.id),subject,topic:'Historical UTME '+historicalYear,prompt:String(raw.text||raw.questionHtml),options:options as string[],answer,explanation:'This provider tier does not include worked solutions.'} as CbtQuestion;
          }).filter((q:CbtQuestion|null):q is CbtQuestion=>q!==null);
          const distinct=[...new Map(items.map(q=>[q.id,q])).values()];
          if(distinct.length<5)throw Error('Insufficient usable '+subject+' questions for '+historicalYear+'. Choose another year or the sample demonstration.');
          return shuffledPracticePool(distinct,Math.min(20,distinct.length));
        }));
        questions=requested.flat();
      }catch(error){setProviderError(error instanceof Error?error.message:'Unable to load historical questions.');return;}
      finally{setProviderLoading(false);}
    }else{
      questions=selectedSubjects.flatMap(subject=>shuffledPracticePool(CBT_QUESTION_BANK.filter(q=>q.subject===subject)));
    }
    if(!questions.length){setProviderError('No practice questions are available.');return;}
    if(questionSource==='aloc'&&questions.length<20){setProviderError('Historical drill requires at least 5 valid questions per subject.');return;}
    setExamQuestions(questions.map(q=>shufflePracticeOptions(q)));
    setActiveSubject(selectedSubjects[0]||'Use of English');
    setCurrentQuestionIndex(0);setAnswers({});setFlagged([]);
    const totalSecs=practiceMode==='speed'?selectedSubjects.length*2*60:durationMinutes*60;
    setTimeRemaining(totalSecs);setStage('exam');window.scrollTo({top:0,behavior:'smooth'});
  };

  // Timer loop
  useEffect(() => {
    if (stage !== 'exam' || practiceMode === 'untimed') return;

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleForceSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, practiceMode]);

  // Keyboard Shortcuts (A, B, C, D, P, N, S, R, F)
  useEffect(() => {
    if (stage !== 'exam') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input or textarea
      if (
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(
          (e.target as HTMLElement).tagName
        )
      ) {
        return;
      }

      if (isSubmitModalOpen) {
        const key = e.key.toUpperCase();
        if (key === 'R' || e.key === 'Escape') { e.preventDefault(); setIsSubmitModalOpen(false); }
        if (key === 'Y') { e.preventDefault(); handleForceSubmit(); }
        return;
      }
      if (calculatorOpen || keyboardHelpOpen || showPaletteDrawer) return;
      const key = e.key.toUpperCase();

      if (['A', 'B', 'C', 'D'].includes(key) && activeQuestion) {
        const optionIndex = key.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3
        setAnswers((prev) => ({ ...prev, [activeQuestion.id]: optionIndex }));
      } else if (key === 'P' || e.key === 'ArrowLeft') {
        // Previous
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex((prev) => prev - 1);
        }
      } else if (key === 'N' || e.key === 'ArrowRight') {
        // Next
        if (currentQuestionIndex < currentSubjectQuestions.length - 1) {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      } else if (key === 'S') {
        // Submit
        setIsSubmitModalOpen(true);
      } else if (key === 'F' && activeQuestion) {
        // Flag
        toggleFlag(activeQuestion.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, activeQuestion, currentQuestionIndex, currentSubjectQuestions.length, isSubmitModalOpen, calculatorOpen, keyboardHelpOpen, showPaletteDrawer]);

  const toggleFlag = (id: string) => {
    setFlagged((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearResponse = (id: string) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const selectAnswer = (questionId: string, optionIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
  };

  // Grade and Finalize Exam
  const handleForceSubmit = () => {
    stopCamera();
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitModalOpen(false);

    // Calculate score
    let correctCount = 0;
    const breakdown: Record<string, { correct: number; total: number }> = {};

    examQuestions.forEach((q) => {
      if (!breakdown[q.subject]) {
        breakdown[q.subject] = { correct: 0, total: 0 };
      }
      breakdown[q.subject].total += 1;

      if (answers[q.id] === q.answer) {
        correctCount += 1;
        breakdown[q.subject].correct += 1;
      }
    });

    const percent = Math.round((correctCount / totalQuestionsCount) * 100) || 0;
    const scaledScore = Math.round((correctCount / totalQuestionsCount) * 100);

    const attempt: ExamAttemptRecord = {
      id: `ATT-${Date.now()}`,
      examType: questionSource==='aloc'?'JAMB historical practice ('+historicalYear+', third-party)':'UPEC original sample practice',
      mode: practiceMode === 'timed' ? 'Timed Exam' : practiceMode === 'speed' ? 'Speed Drill' : 'Topic Practice',
      subjects: selectedSubjects,
      score: scaledScore,
      totalScore: 100,
      percentage: percent,
      date: new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      subjectBreakdown: breakdown,
    };

    setLatestAttempt(attempt);
    const updatedHistory = [attempt, ...attemptHistory].slice(0, 15);
    setAttemptHistory(updatedHistory);
    try {
      localStorage.setItem('upec_cbt_attempt_history', JSON.stringify(updatedHistory));
    } catch {
      // ignore storage error
    }

    setStage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format Timer
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // =========================================================================
  // VIEW 1: EXAM SETUP WIZARD
  // =========================================================================
  if (stage === 'setup') {
    return (
      <div className="space-y-6 font-sans">
        {/* Banner */}
        <div className="bg-[#08163b] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#0f2150]">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90 block mb-1">
              COMPUTER-BASED TEST (CBT) SIMULATOR
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-white leading-tight">
              JAMB UTME &amp; Post-UTME Practice Examination
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Configure your practice examination session. Test your subject speed, question mastery, and time allocation in a JAMB-inspired practice environment using original sample questions.
            </p>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-[#c62839]/20 to-transparent pointer-events-none" />
        </div>

        {/* Setup Configuration Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-white rounded-md border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            {/* 1. Exam Type */}
            <div>
              <label className="block text-xs font-bold text-[#0b1a42] uppercase tracking-wider mb-2">
                1. Examination Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  'JAMB (UTME)',
                  'Post-UTME Drills',
                  'WAEC O’Level',
                  'A’Level / IJMB',
                ].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setExamType(type)}
                    className={`py-3 px-3 rounded-2xl text-xs font-bold border transition-all text-center cursor-pointer ${
                      examType === type
                        ? 'border-[#0b1a42] bg-[#0b1a42] text-white shadow-sm'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Practice Mode */}
            <div>
              <label className="block text-xs font-bold text-[#0b1a42] uppercase tracking-wider mb-2">
                2. Practice Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  {
                    id: 'timed',
                    title: 'Timed Simulation',
                    desc: 'Countdown timer with automatic submission and scoring.',
                    icon: Clock,
                  },
                  {
                    id: 'speed',
                    title: 'Speed Drill',
                    desc: 'Accelerated 2 mins/subject drill for rapid accuracy.',
                    icon: Zap,
                  },
                  {
                    id: 'untimed',
                    title: 'Study Revision',
                    desc: 'Untimed session for learning at your own pace.',
                    icon: BookOpen,
                  },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = practiceMode === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPracticeMode(m.id as any)}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#c62839] bg-red-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className={active ? 'text-[#c62839]' : 'text-slate-500'} />
                        <h4 className="text-xs font-bold text-[#0b1a42]">{m.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-tight">{m.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Subject Combination Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#0b1a42] uppercase tracking-wider">
                  3. Select 4 Subjects (English is Compulsory)
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  {selectedSubjects.length} of 4 selected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {availableSubjectsList.map((subj) => {
                  const isSelected = selectedSubjects.includes(subj);
                  const isEnglish = subj === 'Use of English';
                  const hasQuestions = subjectsWithQuestions.has(subj);

                  return (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => toggleSubject(subj)}
                      disabled={isEnglish}
                      className={`py-3 px-3.5 rounded-2xl text-xs font-bold border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-left">{subj}{!hasQuestions && <span className="block text-[10px] font-normal text-amber-700">Questions coming soon</span>}</span>
                      {isSelected ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-xs leading-6 text-slate-500">Choose your intended UTME subject combination. Subjects without a question bank are shown for planning but cannot start a practice session yet.</p>
              {!canStartExam && <p role="status" className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900">{selectedSubjects.length !== 4 ? 'Select exactly four subjects, including Use of English.' : 'Questions are not yet available for: ' + unavailableSubjects.join(', ') + '. Select available subjects to practise.'}</p>}
            </div>

            <div className="rounded-xl border border-slate-200 bg-[#f7f8fc] p-4 space-y-3"><label className="block text-sm font-bold text-[#111A43]">Practice question source<select className="mt-2 w-full rounded-lg border border-slate-300 bg-white p-3" value={questionSource} onChange={e=>{setQuestionSource(e.target.value as 'sample'|'aloc');setProviderError('');}}><option value="sample">UPEC original sample questions</option><option value="aloc">ALOC historical JAMB questions (provider required)</option></select></label>{questionSource==='aloc'&&<><label className="block text-sm font-bold">Historical question year<input className="mt-2 block w-full rounded-lg border border-slate-300 p-3" type="number" min="1990" max="2030" value={historicalYear} onChange={e=>setHistoricalYear(Number(e.target.value))}/></label><p className="text-xs text-amber-900">This loads a short third-party practice drill, NOT a standard 180-question JAMB mock. All four subjects must return usable questions. No official endorsement is implied.</p></>}{providerError&&<p role="alert" className="text-sm text-red-700">{providerError}</p>}</div>
            {/* 4. Duration Setting for Timed Mode */}
            {practiceMode === 'timed' && (
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] uppercase tracking-wider mb-2">
                  4. Session Time Duration
                </label>
                <div className="flex items-center gap-3">
                  {[10, 15, 20, 30].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setDurationMinutes(mins)}
                      className={`py-2 px-4 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        durationMinutes === mins
                          ? 'bg-[#0b1a42] text-white border-[#0b1a42]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mins} Minutes
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Launch Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                <span>Candidate: </span>
                <strong className="text-[#0b1a42]">{currentUser?.fullName}</strong>
                <span className="mx-2">•</span>
                <span className="font-mono">{currentUser?.regNumber}</span>
              </div>

              <button
                type="button"
                onClick={()=>void handleStartExam()}
                disabled={!canStartExam}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#c62839]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play size={15} />
                <span>Begin Examination Now</span>
              </button>
            </div>
          </div>

          {/* Instructions & JAMB Keyboard Shortcuts Guide */}
          <div className="lg:col-span-4 space-y-6">
            {/* Shortcuts guide */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Keyboard size={18} className="text-[#c62839]" />
                <h3 className="font-serif text-sm font-bold text-[#0b1a42]">
                  JAMB Keyboard Shortcuts
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Choose Option A, B, C, D</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Keys A, B, C, D
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Previous Question</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Key P or ←
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Next Question</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Key N or →
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Clear Answer / Reverse</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Key R
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-600">Flag for Review</span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Key F
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-600">Submit Examination</span>
                  <span className="font-mono font-bold bg-red-50 text-[#c62839] px-2 py-0.5 rounded border border-red-200">
                    Key S
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                Keyboard shortcuts operate in real time just like the official national CBT test centres.
              </p>
            </div>

            {/* Recent Attempts History */}
            {attemptHistory.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-serif text-sm font-bold text-[#0b1a42] flex items-center gap-1.5">
                    <History size={15} className="text-[#0b1a42]" />
                    <span>Previous Practice Scores</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {attemptHistory.length} saved
                  </span>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {attemptHistory.slice(0, 5).map((att) => (
                    <div
                      key={att.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-[#0b1a42]">{att.score} / {att.totalScore}</p>
                        <p className="text-[10px] text-slate-400">{att.date}</p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          att.percentage >= 60
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FULLSCREEN CBT EXAMINATION EXPERIENCE
  // =========================================================================
  if (stage === 'exam') {
    return (
      <div ref={examScreenRef} className="fixed inset-0 z-[100] overflow-y-auto bg-[#eef2f5] p-3 sm:p-5 space-y-4 font-sans select-none">
        {/* Top Examination Control Strip */}
        <header className="bg-[#147b37] text-white rounded-md p-3 sm:p-4 border border-[#0c6028] shadow-md flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
          {/* Candidate identity & Subject selector */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f0bb5b] block">
                CANDIDATE: {currentUser?.fullName} ({currentUser?.regNumber})
              </span>
              <div className="flex flex-wrap items-center gap-1.5 mt-1">
                {selectedSubjects.map((sub) => {
                  const isActive = activeSubject === sub;
                  return (
                    <button
                      key={sub}
                      type="button"
                      onClick={() => {
                        setActiveSubject(sub);
                        setCurrentQuestionIndex(0);
                      }}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#c62839] text-white shadow-sm'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timer & Controls */}
          <div className="flex items-center gap-3">
            {practiceMode !== 'untimed' && (
              <div
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm sm:text-base font-bold shadow-inner ${
                  timeRemaining <= 120
                    ? 'bg-red-600 text-white animate-pulse'
                    : timeRemaining <= 300
                    ? 'bg-amber-500 text-white'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <Clock size={16} />
                <span>{formatTime(timeRemaining)}</span>
              </div>
            )}

            <button type="button" onClick={() => setCalculatorOpen(true)} className="rounded bg-white/15 px-3 py-2 text-xs font-bold hover:bg-white/25" title="Open calculator">Calculator</button>
            <button type="button" onClick={enterExamFullscreen} className="rounded bg-white/15 px-3 py-2 text-xs font-bold hover:bg-white/25">Fullscreen</button>
            {/* Mobile Question Palette Toggle */}
            <button
              type="button"
              onClick={() => setShowPaletteDrawer(!showPaletteDrawer)}
              className="lg:hidden px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
            >
              Palette ({totalAnsweredCount}/{totalQuestionsCount})
            </button>

            <button
              type="button"
              onClick={() => setKeyboardHelpOpen(true)}
              className="hidden sm:inline-flex p-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer"
              title="Keyboard shortcuts"
            >
              <Keyboard size={16} />
            </button>

            {/* Final Submission Button */}
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 rounded bg-red-700 hover:bg-red-800 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
            >
              Submit Exam
            </button>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-3 rounded border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <span className="font-bold">UPEC practice exam · {currentUser?.fullName || 'Candidate'}</span>
          <span>Answered {totalAnsweredCount}/{totalQuestionsCount}</span>
          <span className="ml-auto font-semibold">{cameraEnabled ? 'Camera preview on · Not recording' : 'Camera off · Not recording'}</span>
          <button type="button" onClick={cameraEnabled ? stopCamera : enableCamera} className="rounded bg-slate-800 px-3 py-2 font-bold text-white">{cameraEnabled ? 'Turn off camera' : 'Enable camera preview'}</button>
          {cameraEnabled && <video ref={cameraVideoRef} autoPlay muted playsInline aria-label="Your camera preview" className="h-24 w-32 rounded bg-black object-cover"/>}
          {cameraError && <p role="alert" className="w-full text-red-700">{cameraError}</p>}
          {fullscreenError && <p role="status" className="w-full text-amber-700">{fullscreenError}</p>}
        </div>
        {/* Examination Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Main Question Panel (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-8 shadow-sm space-y-6">
            {activeQuestion ? (
              <>
                {/* Header: Question Number & Action Tools */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-[#0b1a42]">
                      Question {currentQuestionIndex + 1} of {currentSubjectQuestions.length}
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                      • {activeQuestion.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFlag(activeQuestion.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        flagged.includes(activeQuestion.id)
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Flag size={13} />
                      <span>{flagged.includes(activeQuestion.id) ? 'Flagged' : 'Flag'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => clearResponse(activeQuestion.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Clear</span>
                    </button>
                  </div>
                </div>

                {/* Comprehension Passage (if applicable) */}
                {activeQuestion.passage && (
                  <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs text-slate-700 leading-relaxed max-h-40 overflow-y-auto">
                    <p className="font-bold text-[#0b1a42] uppercase text-[10px] mb-1">
                      Read the passage below carefully:
                    </p>
                    <p>{activeQuestion.passage}</p>
                  </div>
                )}

                {/* Question Prompt */}
                <div className="py-2">
                  <h3 className="text-base sm:text-lg font-semibold text-[#08163b] leading-relaxed">
                    {activeQuestion.prompt}
                  </h3>
                </div>

                {/* Options (A, B, C, D) */}
                <div className="space-y-3 pt-2">
                  {activeQuestion.options.map((option, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    const isSelected = answers[activeQuestion.id] === idx;

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectAnswer(activeQuestion.id, idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer min-h-[50px] ${
                          isSelected
                            ? 'border-[#0b1a42] bg-[#0b1a42] text-white shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <span
                          className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center shrink-0 text-xs ${
                            isSelected
                              ? 'bg-white text-[#0b1a42]'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {letter}
                        </span>
                        <span className="text-xs sm:text-sm font-medium leading-snug flex-1">
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Question Navigation Controls (Previous / Next) */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0b1a42] hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                    Shortcut: Key P for Previous, N for Next
                  </span>

                  <button
                    type="button"
                    disabled={currentQuestionIndex === currentSubjectQuestions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#152e69] text-white text-xs font-bold disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-slate-500">
                <p>No questions found for this subject.</p>
              </div>
            )}
          </div>

          {/* Desktop Right Question Palette (4 cols) */}
          <aside className="hidden lg:block lg:col-span-4 bg-white rounded-md border border-slate-200/90 p-6 shadow-xs space-y-5 sticky top-36">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="font-serif text-sm font-bold text-[#0b1a42]">
                {activeSubject} Palette
              </h4>
              <span className="text-[11px] font-bold text-slate-500">
                {currentSubjectQuestions.filter((q) => answers[q.id] !== undefined).length}/
                {currentSubjectQuestions.length} Answered
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-red-500" />
                <span>Unanswered</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-[#1765ba]" />
                <span>Current</span>
              </div>
            </div>

            {/* Questions Numbers Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {currentSubjectQuestions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentQuestionIndex;
                const isFlagged = flagged.includes(q.id);

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold relative flex items-center justify-center transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-[#1765ba] text-white ring-2 ring-[#1765ba] ring-offset-2'
                        : isFlagged
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : isAnswered
                        ? 'bg-emerald-500 text-white'
                        : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && !isCurrent && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Overall Examination Progress */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#0b1a42]">
                <span>Total Answered:</span>
                <span>
                  {totalAnsweredCount} / {totalQuestionsCount}
                </span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${(totalAnsweredCount / (totalQuestionsCount || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>
          </aside>
        </div>

        {calculatorOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Practice calculator">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between"><h3 className="font-bold text-[#08163b]">Practice calculator</h3><button type="button" onClick={() => setCalculatorOpen(false)} aria-label="Close calculator"><X size={20}/></button></div>
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                <input type="number" aria-label="First number" value={calcA} onChange={e => setCalcA(e.target.value)} className="min-w-0 rounded border p-2"/>
                <select aria-label="Operation" value={calcOperation} onChange={e => setCalcOperation(e.target.value)} className="rounded border p-2"><option>+</option><option>-</option><option>×</option><option>÷</option></select>
                <input type="number" aria-label="Second number" value={calcB} onChange={e => setCalcB(e.target.value)} className="min-w-0 rounded border p-2"/>
              </div>
              <p className="mt-4 rounded bg-slate-100 p-4 text-lg font-bold text-[#08163b]">Result: {calcA === '' || calcB === '' ? '—' : calcOperation === '÷' && Number(calcB) === 0 ? 'Undefined' : calcOperation === '+' ? Number(calcA) + Number(calcB) : calcOperation === '-' ? Number(calcA) - Number(calcB) : calcOperation === '×' ? Number(calcA) * Number(calcB) : Number(calcA) / Number(calcB)}</p>
              <p className="mt-2 text-xs text-slate-500">Basic practice calculator; not a reproduction of JAMB's calculator.</p>
            </div>
          </div>
        )}

        {/* Mobile Palette Drawer Overlay */}
        {showPaletteDrawer && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setShowPaletteDrawer(false)}
            />
            <div className="fixed bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 shadow-2xl z-50 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-serif text-sm font-bold text-[#0b1a42]">
                  {activeSubject} Question Palette
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPaletteDrawer(false)}
                  className="p-1 rounded-lg text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2.5">
                {currentSubjectQuestions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isCurrent = idx === currentQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowPaletteDrawer(false);
                      }}
                      className={`h-12 rounded-xl text-xs font-bold flex items-center justify-center ${
                        isCurrent
                          ? 'bg-[#0b1a42] text-white'
                          : isAnswered
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Keyboard Shortcuts Modal */}
        {keyboardHelpOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h4 className="font-serif text-sm font-bold text-[#0b1a42]">
                  Keyboard Shortcuts
                </h4>
                <button
                  type="button"
                  onClick={() => setKeyboardHelpOpen(false)}
                  className="p-1 rounded-lg text-slate-500"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-2 text-xs">
                <p><strong>A, B, C, D:</strong> Select answer option</p>
                <p><strong>P or ←:</strong> Previous question</p>
                <p><strong>N or →:</strong> Next question</p>
                <p><strong>R:</strong> Return from submission confirmation</p><p><strong>Y:</strong> Confirm submission</p>
                <p><strong>F:</strong> Flag / Unflag question</p>
                <p><strong>S:</strong> Open submit modal</p>
              </div>
              <button
                type="button"
                onClick={() => setKeyboardHelpOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#0b1a42] text-white text-xs font-bold"
              >
                Close Guide
              </button>
            </div>
          </div>
        )}

        {/* Final Submission Confirmation Dialog */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
                  <ShieldAlert size={26} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                  Submit Examination?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Once submitted, your responses will be evaluated and graded immediately.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Questions:</span>
                  <strong className="text-[#0b1a42]">{totalQuestionsCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Answered Questions:</span>
                  <strong className="text-emerald-700">{totalAnsweredCount}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Unanswered Questions:</span>
                  <strong className="text-[#c62839]">
                    {totalQuestionsCount - totalAnsweredCount}
                  </strong>
                </div>
                {totalQuestionsCount - totalAnsweredCount > 0 && (
                  <p className="text-[11px] text-amber-700 font-semibold pt-1 border-t border-slate-200">
                    Warning: You still have {totalQuestionsCount - totalAnsweredCount} unanswered questions!
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={handleForceSubmit}
                  className="flex-1 py-3 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-xs font-bold text-white shadow-md cursor-pointer"
                >
                  Confirm &amp; Grade
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: EXAMINATION PERFORMANCE REPORT & REVIEW
  // =========================================================================
  return (
    <div className="space-y-6 font-sans">
      {/* Score Summary Banner */}
      <div className="bg-[#08163b] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-[#0f2150]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f0bb5b] block mb-1">
              UPEC PRACTICE CBT EVALUATION REPORT
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-white">
              Examination Performance Sheet
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Candidate: <strong>{currentUser?.fullName}</strong> ({currentUser?.regNumber}) • {latestAttempt?.mode}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-[10px] font-bold text-slate-300 uppercase block">
              Aggregate Score
            </span>
            <p className="font-serif text-3xl sm:text-4xl font-black text-[#f0bb5b] mt-0.5">
              {latestAttempt?.score} / {latestAttempt?.totalScore}
            </p>
            <span className="text-[10px] font-bold text-emerald-300">
              {latestAttempt?.percentage}% Overall Mastery
            </span>
          </div>
        </div>
      </div>

      {/* Subject-by-Subject Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {latestAttempt &&
          Object.entries(latestAttempt.subjectBreakdown).map(([sub, data]) => {
            const pct = Math.round((data.correct / (data.total || 1)) * 100);
            return (
              <div
                key={sub}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0b1a42] truncate max-w-[130px]">
                    {sub}
                  </h4>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      pct >= 60 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {pct}%
                  </span>
                </div>
                <p className="font-serif text-2xl font-black text-[#0b1a42]">
                  {data.correct} / {data.total}
                </p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${pct >= 60 ? 'bg-emerald-500' : 'bg-[#c62839]'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
      </div>

      {/* Question-by-Question Solution Review */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#0b1a42]">
              Detailed Question Solutions &amp; Explanations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review correct answer rationales compiled by University Pathway educators.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStage('setup')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RotateCcw size={14} />
            <span>Retake or Start New Session</span>
          </button>
        </div>

        <div className="space-y-4">
          {examQuestions.map((q, idx) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.answer;
            const isAnswered = userAnswer !== undefined;

            return (
              <article
                key={q.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-red-200 bg-red-50/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {q.subject} • Question {idx + 1}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                      isCorrect
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {isCorrect ? (
                      <>
                        <Check size={11} /> Correct
                      </>
                    ) : (
                      <>
                        <X size={11} /> {isAnswered ? 'Incorrect' : 'Unanswered'}
                      </>
                    )}
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#0b1a42] leading-relaxed">
                  {q.prompt}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 font-bold block">Your Answer:</span>
                    <strong className={isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                      {isAnswered
                        ? `${String.fromCharCode(65 + userAnswer)}. ${q.options[userAnswer]}`
                        : 'No answer selected'}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-emerald-300">
                    <span className="text-[10px] text-emerald-600 font-bold block">Correct Key:</span>
                    <strong className="text-emerald-800">
                      {String.fromCharCode(65 + q.answer)}. {q.options[q.answer]}
                    </strong>
                  </div>
                </div>

                <div className="mt-3 p-3 rounded-xl bg-white/80 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                  <strong className="text-[#0b1a42] block text-[11px] mb-0.5">Solution Rationale:</strong>
                  <span>{q.explanation}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
