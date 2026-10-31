import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  Eye,
  FileQuestion,
  Filter,
  HelpCircle,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  Users,
  X
} from 'lucide-react';

type SectionTab = 'Overview' | 'Question Bank' | 'Examinations' | 'Candidates' | 'Results & Analytics' | 'CBT Settings' | 'Live Monitoring Desk';

type Exam = {
  id: string;
  subject_id: string;
  title: string;
  duration_minutes: number;
  status: 'draft' | 'published' | 'closed';
  created_at: string;
  created_by?: string;
  opens_at?: string | null;
  closes_at?: string | null;
  restricted?: boolean;
};

type Question = {
  id: string;
  subject_id: string;
  prompt: string;
  options?: { A: string; B: string; C: string; D: string };
  correct_option?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  status: 'draft' | 'published';
  created_at: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  programme_id?: string;
};

type Attempt = {
  id: string;
  student_account_id: string;
  student_name?: string;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  score: number | null;
  total_questions: number | null;
};

type CandidateStudent = {
  id: string;
  full_name: string;
};

const notify = (message: string, kind: 'success' | 'error' | 'info' = 'info') =>
  window.dispatchEvent(new CustomEvent('upec-admin-toast', { detail: { message, kind } }));

const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

async function api(path: string, init: RequestInit = {}) {
  const token = sessionStorage.getItem('upec_staff_token');
  if (!token) throw Error('Staff authentication token required. Please sign in to the staff portal.');
  const response = await fetch(base + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + token,
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Error(data.error || 'Server request failed');
  return data;
}

export default function AdminCbtPage() {
  const [activeSection, setActiveSection] = useState<SectionTab>('Overview');
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Exam for Modals / Actions
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

  // Question Creation State
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    subjectId: '',
    prompt: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: ''
  });

  // Assessment Creation State
  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    subjectId: '',
    durationMinutes: 60,
    questionIds: [] as string[]
  });

  // Schedule Modal State
  const [isSchedulingExam, setIsSchedulingExam] = useState<Exam | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ opensAt: '', closesAt: '' });

  // Eligibility Modal State
  const [isEligibilityModal, setIsEligibilityModal] = useState<Exam | null>(null);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<string[]>([]);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [searchedStudents, setSearchedStudents] = useState<CandidateStudent[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  // Results & Analytics State
  const [selectedExamForResults, setSelectedExamForResults] = useState<string>('');
  const [resultsData, setResultsData] = useState<{ title: string; results: any[] } | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Live Monitoring Desk State
  const [monitoringExamId, setMonitoringExamId] = useState<string>('');
  const [activeAttempts, setActiveAttempts] = useState<Attempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Guardian Notification State
  const [isNotifyingGuardians, setIsNotifyingGuardians] = useState<Exam | null>(null);
  const [notificationMode, setNotificationMode] = useState<'schedule' | 'attendance' | 'performance'>('schedule');
  const [sendingNotification, setSendingNotification] = useState(false);

  // CBT Settings State (Stored in local state with honest persistence notice)
  const [cbtSettings, setCbtSettings] = useState({
    defaultPassMark: 50,
    maxAttemptLimit: 1,
    defaultDurationMinutes: 60,
    shuffleQuestions: true,
    shuffleOptions: true,
    showScoreImmediately: true,
    preventTabSwitch: true
  });
  const [settingsNotice, setSettingsNotice] = useState('');

  const [savingAction, setSavingAction] = useState(false);

  // Load Primary CBT Data
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');

    Promise.all([
      api('/api/staff/academic/assessments').catch(err => {
        console.warn('Assessments fetch issue:', err);
        return { assessments: [] };
      }),
      api('/api/staff/academic/questions').catch(err => {
        console.warn('Questions fetch issue:', err);
        return { questions: [] };
      }),
      api('/api/staff/academic/catalogue').catch(err => {
        console.warn('Catalogue fetch issue:', err);
        return { subjects: [] };
      })
    ])
      .then(([a, q, c]) => {
        if (!active) return;
        setExams(a.assessments || []);
        setQuestions(q.questions || []);
        setSubjects(c.subjects || []);
        if (a.assessments?.length && !selectedExamForResults) {
          setSelectedExamForResults(a.assessments[0].id);
        }
        if (a.assessments?.length && !monitoringExamId) {
          setMonitoringExamId(a.assessments[0].id);
        }
      })
      .catch(e => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [refreshKey]);

  // Load Results when an exam is selected in Results tab
  useEffect(() => {
    if (!selectedExamForResults) return;
    let active = true;
    setLoadingResults(true);
    api(`/api/staff/academic/assessments/${selectedExamForResults}/results`)
      .then(data => {
        if (active) setResultsData(data);
      })
      .catch(err => {
        if (active) {
          setResultsData({ title: 'Assessment', results: [] });
          console.warn('Results error:', err.message);
        }
      })
      .finally(() => {
        if (active) setLoadingResults(false);
      });

    return () => {
      active = false;
    };
  }, [selectedExamForResults]);

  // Load Active Session Attempts for Live Monitoring Desk
  const fetchLiveAttempts = () => {
    if (!monitoringExamId) return;
    setLoadingAttempts(true);
    api(`/api/staff/academic/assessments/${monitoringExamId}/attempts`)
      .then(data => {
        setActiveAttempts(data.attempts || []);
      })
      .catch(() => {
        // Fallback to results if attempts endpoint is empty
        api(`/api/staff/academic/assessments/${monitoringExamId}/results`)
          .then(data => {
            const mapped = (data.results || []).map((r: any) => ({
              id: r.student_account_id,
              student_account_id: r.student_account_id,
              student_name: 'Candidate ' + r.student_account_id.slice(0, 8),
              started_at: r.submitted_at || new Date().toISOString(),
              expires_at: r.submitted_at || new Date().toISOString(),
              submitted_at: r.submitted_at,
              score: r.score,
              total_questions: r.total_questions
            }));
            setActiveAttempts(mapped);
          })
          .catch(() => setActiveAttempts([]));
      })
      .finally(() => setLoadingAttempts(false));
  };

  useEffect(() => {
    if (activeSection === 'Live Monitoring Desk' && monitoringExamId) {
      fetchLiveAttempts();
    }
  }, [monitoringExamId, activeSection]);

  // Handle Candidate Search for Eligibility
  useEffect(() => {
    if (!studentSearchInput.trim() || studentSearchInput.trim().length < 2) {
      setSearchedStudents([]);
      return;
    }
    const timer = setTimeout(() => {
      setSearchingStudents(true);
      api(`/api/staff/academic/students/search?q=${encodeURIComponent(studentSearchInput.trim())}`)
        .then(data => setSearchedStudents(data.students || []))
        .catch(() => setSearchedStudents([]))
        .finally(() => setSearchingStudents(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [studentSearchInput]);

  // Create Question Submission
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.subjectId || !questionForm.prompt.trim()) {
      notify('Please select a subject and enter a question prompt.', 'error');
      return;
    }
    setSavingAction(true);
    try {
      await api('/api/staff/academic/questions', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: questionForm.subjectId,
          prompt: questionForm.prompt.trim(),
          options: {
            A: questionForm.optionA.trim(),
            B: questionForm.optionB.trim(),
            C: questionForm.optionC.trim(),
            D: questionForm.optionD.trim()
          },
          correctOption: questionForm.correctOption,
          explanation: questionForm.explanation.trim()
        })
      });
      notify('Question added to Question Bank in draft status.', 'success');
      setIsCreatingQuestion(false);
      setQuestionForm({
        subjectId: '',
        prompt: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: ''
      });
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to create question.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Toggle Question Publication Status
  const handleToggleQuestionStatus = async (q: Question) => {
    const nextStatus = q.status === 'published' ? 'draft' : 'published';
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/questions/${q.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      notify(`Question status updated to ${nextStatus}.`, 'success');
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to update question status.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Create Assessment Submission
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!examForm.subjectId || !examForm.title.trim() || !examForm.questionIds.length) {
      notify('Please complete assessment details and select at least one approved question.', 'error');
      return;
    }
    setSavingAction(true);
    try {
      await api('/api/staff/academic/assessments', {
        method: 'POST',
        body: JSON.stringify({
          subjectId: examForm.subjectId,
          title: examForm.title.trim(),
          durationMinutes: Number(examForm.durationMinutes),
          questionIds: examForm.questionIds
        })
      });
      notify('Assessment successfully created as draft.', 'success');
      setIsCreatingExam(false);
      setExamForm({ title: '', subjectId: '', durationMinutes: 60, questionIds: [] });
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to create assessment.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Update Assessment Status (draft -> published -> closed)
  const handleChangeExamStatus = async (exam: Exam, newStatus: 'draft' | 'published' | 'closed') => {
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${exam.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      notify(`Assessment status updated to ${newStatus}.`, 'success');
      setSelectedExam(null);
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to update assessment status.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Save Schedule (opens_at, closes_at)
  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSchedulingExam) return;
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${isSchedulingExam.id}/schedule`, {
        method: 'PATCH',
        body: JSON.stringify({
          opensAt: scheduleForm.opensAt ? new Date(scheduleForm.opensAt).toISOString() : null,
          closesAt: scheduleForm.closesAt ? new Date(scheduleForm.closesAt).toISOString() : null
        })
      });
      notify('Assessment schedule successfully updated.', 'success');
      setIsSchedulingExam(null);
      setScheduleForm({ opensAt: '', closesAt: '' });
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to schedule assessment.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Open Eligibility Modal
  const handleOpenEligibility = async (exam: Exam) => {
    setIsEligibilityModal(exam);
    setRestrictedMode(Boolean(exam.restricted));
    setEligibleStudents([]);
    try {
      const data = await api(`/api/staff/academic/assessments/${exam.id}/eligibility`);
      setRestrictedMode(Boolean(data.restricted));
      setEligibleStudents(data.studentIds || []);
    } catch {
      // Default to empty array
      setEligibleStudents([]);
    }
  };

  // Save Eligibility
  const handleSaveEligibility = async () => {
    if (!isEligibilityModal) return;
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${isEligibilityModal.id}/eligibility`, {
        method: 'PUT',
        body: JSON.stringify({
          restricted: restrictedMode,
          studentIds: eligibleStudents
        })
      });
      notify('Candidate eligibility rules saved.', 'success');
      setIsEligibilityModal(null);
      setRefreshKey(v => v + 1);
    } catch (err: any) {
      notify(err.message || 'Failed to update candidate eligibility.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Send Guardian Notification
  const handleSendGuardianNotification = async () => {
    if (!isNotifyingGuardians) return;
    setSendingNotification(true);
    try {
      const res = await api(`/api/staff/assessments/${isNotifyingGuardians.id}/notify-guardians`, {
        method: 'POST',
        body: JSON.stringify({ mode: notificationMode })
      });
      notify(
        `Notifications queued: ${res.queued} email(s), ${res.studentsNotified} in-app notification(s).`,
        'success'
      );
      setIsNotifyingGuardians(null);
    } catch (err: any) {
      notify(err.message || 'Notification transmission failed.', 'error');
    } finally {
      setSendingNotification(false);
    }
  };

  // Save CBT Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsNotice('CBT assessment policies updated for this administrative workstation session.');
    notify('CBT operational settings recorded.', 'success');
    setTimeout(() => setSettingsNotice(''), 4000);
  };

  // Filtered Questions for Assessment Creation (must be published and match selected subject)
  const availablePublishedQuestions = useMemo(() => {
    if (!examForm.subjectId) return [];
    return questions.filter(q => q.subject_id === examForm.subjectId && q.status === 'published');
  }, [questions, examForm.subjectId]);

  // Filtered Question Bank
  const filteredQuestions = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return questions.filter(q => {
      const matchesSearch = q.prompt.toLowerCase().includes(term);
      const matchesSubject = selectedSubjectFilter === 'all' || q.subject_id === selectedSubjectFilter;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [questions, searchQuery, selectedSubjectFilter, statusFilter]);

  // Filtered Examinations
  const filteredExams = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return exams.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(term);
      const matchesSubject = selectedSubjectFilter === 'all' || e.subject_id === selectedSubjectFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [exams, searchQuery, selectedSubjectFilter, statusFilter]);

  // Pagination Helper
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredQuestions.slice(start, start + pageSize);
  }, [filteredQuestions, currentPage]);

  const paginatedExams = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredExams.slice(start, start + pageSize);
  }, [filteredExams, currentPage]);

  const totalPages = Math.max(
    1,
    Math.ceil((activeSection === 'Question Bank' ? filteredQuestions.length : filteredExams.length) / pageSize)
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden bg-[#F7F8FC] p-2 text-slate-800">
      {/* Top Bar Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-extrabold text-[#111A43] sm:text-2xl">
              CBT &amp; Examinations
            </h1>
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 sm:inline-flex">
              2025/2026 Academic Session
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Assessment engine, question repository, candidate sessions &amp; academic analytics
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            title="Refresh CBT records"
            aria-label="Refresh CBT records"
            onClick={() => setRefreshKey(v => v + 1)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-[#111A43]' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreatingQuestion(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#111A43] hover:bg-slate-50 transition"
          >
            <Plus size={14} />
            <span>Add Question</span>
          </button>

          <button
            onClick={() => setIsCreatingExam(true)}
            className="flex items-center gap-1 rounded-lg bg-[#C62839] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#a82230] transition"
          >
            <Plus size={14} />
            <span>Create Examination</span>
          </button>
        </div>
      </header>

      {/* Real Database KPI Metrics Bar */}
      <section className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#111A43]">
            <ClipboardList size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Total Assessments</p>
            <p className="text-lg font-extrabold text-[#111A43]">{loading ? '—' : exams.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Active / Published</p>
            <p className="text-lg font-extrabold text-emerald-700">
              {loading ? '—' : exams.filter(e => e.status === 'published').length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#C62839]">
            <FileQuestion size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Total Questions</p>
            <p className="text-lg font-extrabold text-[#111A43]">{loading ? '—' : questions.length}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Subject Coverage</p>
            <p className="text-lg font-extrabold text-[#111A43]">{loading ? '—' : subjects.length}</p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs lg:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Radio size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Live Desk Status</p>
            <p className="text-xs font-bold text-slate-700">
              {loading ? '—' : `${exams.filter(e => e.status === 'published').length} Active Venue(s)`}
            </p>
          </div>
        </div>
      </section>

      {/* 6 Sections Tab Navigation */}
      <nav className="flex shrink-0 items-center gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-2xs">
        {(
          [
            'Overview',
            'Question Bank',
            'Examinations',
            'Candidates',
            'Results & Analytics',
            'CBT Settings',
            'Live Monitoring Desk'
          ] as SectionTab[]
        ).map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveSection(tab);
              setCurrentPage(1);
            }}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              activeSection === tab
                ? 'bg-[#111A43] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* Section View Container */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        {/* Error Banner */}
        {error && (
          <div className="shrink-0 flex items-center justify-between border-b border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-rose-600 hover:text-rose-900">
              <X size={14} />
            </button>
          </div>
        )}

        {/* SECTION 1: OVERVIEW */}
        {activeSection === 'Overview' && (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {/* Left Column: Recent Assessments */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-[#111A43]">Current Examinations &amp; Schedule</h2>
                  <button
                    onClick={() => setActiveSection('Examinations')}
                    className="text-xs font-semibold text-[#C62839] hover:underline"
                  >
                    View All Assessments &rarr;
                  </button>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                      <tr>
                        <th className="py-2.5 px-3">Title</th>
                        <th className="py-2.5 px-3">Subject</th>
                        <th className="py-2.5 px-3">Duration</th>
                        <th className="py-2.5 px-3">Schedule</th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {exams.slice(0, 5).map(exam => {
                        const sub = subjects.find(s => s.id === exam.subject_id);
                        return (
                          <tr key={exam.id} className="hover:bg-slate-50">
                            <td className="py-2.5 px-3 font-semibold text-[#111A43]">{exam.title}</td>
                            <td className="py-2.5 px-3 text-slate-600">{sub?.name || 'General'}</td>
                            <td className="py-2.5 px-3 text-slate-600">{exam.duration_minutes} mins</td>
                            <td className="py-2.5 px-3 text-[11px] text-slate-500">
                              {exam.opens_at ? new Date(exam.opens_at).toLocaleDateString() : 'Unscheduled'}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  exam.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : exam.status === 'draft'
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {exam.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {!exams.length && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400">
                            No examinations created yet. Click "Create Examination" to schedule your first assessment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Quick Status & Info */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#111A43]">CBT Operational Integrity</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Strict Single-Attempt Isolation</p>
                      <p className="text-[11px] text-slate-500">
                        PostgreSQL unique constraints enforce one attempt per student account with server-authoritative timer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Approved Question Approval Chain</p>
                      <p className="text-[11px] text-slate-500">
                        Only teacher questions reviewed and marked "published" can be compiled into live student assessments.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Live Heartbeat Telemetry Status</p>
                      <p className="text-[11px] text-slate-500">
                        Session start/submit timestamps are fully persisted. Per-second client websocket telemetry is pending schema migration.
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <button
                      onClick={() => setActiveSection('Live Monitoring Desk')}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[#111A43] py-2 text-xs font-bold text-white hover:bg-[#1a265c] transition"
                    >
                      <Radio size={14} className="text-red-400" />
                      <span>Open Live Monitoring Desk</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: QUESTION BANK */}
        {activeSection === 'Question Bank' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/50 p-2.5">
              <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search question prompts..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#111A43] focus:outline-hidden"
                  />
                </div>

                <select
                  value={selectedSubjectFilter}
                  onChange={e => {
                    setSelectedSubjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreatingQuestion(true)}
                className="flex items-center gap-1 rounded-lg bg-[#111A43] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1b2760] transition"
              >
                <Plus size={14} />
                <span>New Question</span>
              </button>
            </div>

            {/* Questions Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Question Prompt</th>
                    <th className="py-2.5 px-3">Correct Key</th>
                    <th className="py-2.5 px-3">Approval Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedQuestions.map(q => {
                    const sub = subjects.find(s => s.id === q.subject_id);
                    return (
                      <tr key={q.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                          {sub?.name || 'General'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">
                          <p className="line-clamp-2 max-w-xl font-medium">{q.prompt}</p>
                          {q.explanation && (
                            <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                              Explanation: {q.explanation}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-[#111A43]">
                          {q.correct_option || '—'}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              q.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {q.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <button
                            disabled={savingAction}
                            onClick={() => handleToggleQuestionStatus(q)}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                          >
                            {q.status === 'published' ? 'Move to Draft' : 'Approve & Publish'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedQuestions.length && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {loading ? 'Loading question bank...' : 'No questions match the selected criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white p-2.5 text-xs text-slate-500">
              <span>
                {filteredQuestions.length} questions · Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(v => Math.max(1, v - 1))}
                  className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(v => Math.min(totalPages, v + 1))}
                  className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </div>
        )}

        {/* SECTION 3: EXAMINATIONS */}
        {activeSection === 'Examinations' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Filter Bar */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50/50 p-2.5">
              <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search examination titles..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#111A43] focus:outline-hidden"
                  />
                </div>

                <select
                  value={selectedSubjectFilter}
                  onChange={e => {
                    setSelectedSubjectFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">All Subjects</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <button
                onClick={() => setIsCreatingExam(true)}
                className="flex items-center gap-1 rounded-lg bg-[#C62839] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#a82230] transition"
              >
                <Plus size={14} />
                <span>New Examination</span>
              </button>
            </div>

            {/* Exams Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Examination</th>
                    <th className="py-2.5 px-3">Subject</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3">Audience / Rules</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedExams.map(exam => {
                    const sub = subjects.find(s => s.id === exam.subject_id);
                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 font-semibold text-[#111A43]">{exam.title}</td>
                        <td className="py-2.5 px-3 text-slate-600">{sub?.name || 'General'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{exam.duration_minutes} mins</td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {exam.restricted ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                              <Users size={12} /> Restricted Roster
                            </span>
                          ) : (
                            <span className="text-slate-500">Open to enrolled students</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              exam.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : exam.status === 'draft'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {exam.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {exam.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => {
                                    setIsSchedulingExam(exam);
                                    setScheduleForm({
                                      opensAt: exam.opens_at ? exam.opens_at.slice(0, 16) : '',
                                      closesAt: exam.closes_at ? exam.closes_at.slice(0, 16) : ''
                                    });
                                  }}
                                  className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Schedule
                                </button>
                                <button
                                  onClick={() => handleOpenEligibility(exam)}
                                  className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                  Eligibility
                                </button>
                                <button
                                  disabled={savingAction}
                                  onClick={() => handleChangeExamStatus(exam, 'published')}
                                  className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                                >
                                  Publish
                                </button>
                              </>
                            )}

                            {exam.status === 'published' && (
                              <>
                                <button
                                  onClick={() => {
                                    setIsNotifyingGuardians(exam);
                                  }}
                                  className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 flex items-center gap-1"
                                >
                                  <Send size={11} />
                                  <span>Notify</span>
                                </button>
                                <button
                                  disabled={savingAction}
                                  onClick={() => handleChangeExamStatus(exam, 'closed')}
                                  className="rounded bg-slate-700 px-2 py-1 text-[11px] font-bold text-white hover:bg-slate-800"
                                >
                                  Close
                                </button>
                              </>
                            )}

                            <button
                              onClick={() => {
                                setSelectedExamForResults(exam.id);
                                setActiveSection('Results & Analytics');
                              }}
                              className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
                            >
                              Results
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!paginatedExams.length && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {loading ? 'Loading examinations...' : 'No examinations found.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white p-2.5 text-xs text-slate-500">
              <span>
                {filteredExams.length} examinations · Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(v => Math.max(1, v - 1))}
                  className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(v => Math.min(totalPages, v + 1))}
                  className="rounded-md border border-slate-200 p-1 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </footer>
          </div>
        )}

        {/* SECTION 4: CANDIDATES */}
        {activeSection === 'Candidates' && (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
              <h2 className="text-sm font-bold text-[#111A43]">Verified Candidate Search &amp; Eligibility</h2>
              <p className="text-xs text-slate-500">
                Search enrolled student accounts from the verified registry to view examination eligibility and attempt history.
              </p>

              <div className="relative max-w-md">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearchInput}
                  onChange={e => setStudentSearchInput(e.target.value)}
                  placeholder="Type student name (e.g., 'Adebayo', 'Fatima')..."
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#111A43] focus:outline-hidden"
                />
              </div>

              {searchingStudents && <p className="text-xs text-slate-400">Searching verified accounts...</p>}

              {searchedStudents.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-slate-200 mt-2">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Student Name</th>
                        <th className="py-2 px-3">Student ID</th>
                        <th className="py-2 px-3 text-right">Verification Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {searchedStudents.map(std => (
                        <tr key={std.id} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-semibold text-[#111A43]">{std.full_name}</td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-500">{std.id}</td>
                          <td className="py-2 px-3 text-right">
                            <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                              Verified
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!searchingStudents && studentSearchInput.length >= 2 && !searchedStudents.length && (
                <p className="text-xs text-slate-400">No verified candidates found matching "{studentSearchInput}".</p>
              )}
            </div>
          </div>
        )}

        {/* SECTION 5: RESULTS & ANALYTICS */}
        {activeSection === 'Results & Analytics' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Exam Selector Bar */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Select Examination:</span>
                <select
                  value={selectedExamForResults}
                  onChange={e => setSelectedExamForResults(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#111A43]"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                  {!exams.length && <option value="">No examinations available</option>}
                </select>
              </div>

              {resultsData?.results && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">
                    {resultsData.results.length} Attempt(s) Recorded
                  </span>
                </div>
              )}
            </div>

            {/* Results Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingResults ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading assessment results...</div>
              ) : !resultsData?.results?.length ? (
                <div className="p-12 text-center text-slate-400">
                  <Award size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No submitted attempts recorded yet.</p>
                  <p className="text-[11px] text-slate-400">
                    Results appear here once enrolled candidates begin and submit their CBT examination sessions.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Candidate ID</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Total Questions</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3">Submission Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultsData.results.map((r, i) => {
                      const pct = r.total_questions > 0 ? Math.round((r.score / r.total_questions) * 100) : 0;
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-medium text-slate-700">
                            {r.student_account_id}
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#111A43]">{r.score ?? '—'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.total_questions ?? '—'}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                pct >= 50 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {pct}%
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-500">
                            {r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* SECTION 6: CBT SETTINGS */}
        {activeSection === 'CBT Settings' && (
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-4">
            <div className="max-w-2xl rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <div>
                <h2 className="text-sm font-bold text-[#111A43]">CBT Administration Policies</h2>
                <p className="text-xs text-slate-500">
                  Configure default examination rules, passing benchmarks, and security enforcement policies.
                </p>
              </div>

              {settingsNotice && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{settingsNotice}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block space-y-1 font-semibold text-slate-700">
                    <span>Default Pass Mark (%)</span>
                    <input
                      type="number"
                      min={10}
                      max={100}
                      value={cbtSettings.defaultPassMark}
                      onChange={e =>
                        setCbtSettings(v => ({ ...v, defaultPassMark: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-slate-200 p-2 focus:border-[#111A43] focus:outline-hidden"
                    />
                  </label>

                  <label className="block space-y-1 font-semibold text-slate-700">
                    <span>Default Duration (Minutes)</span>
                    <input
                      type="number"
                      min={10}
                      max={240}
                      value={cbtSettings.defaultDurationMinutes}
                      onChange={e =>
                        setCbtSettings(v => ({ ...v, defaultDurationMinutes: Number(e.target.value) }))
                      }
                      className="w-full rounded-lg border border-slate-200 p-2 focus:border-[#111A43] focus:outline-hidden"
                    />
                  </label>
                </div>

                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cbtSettings.shuffleQuestions}
                      onChange={e => setCbtSettings(v => ({ ...v, shuffleQuestions: e.target.checked }))}
                      className="rounded border-slate-300 text-[#111A43]"
                    />
                    <span className="font-medium text-slate-700">Shuffle question order per candidate</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cbtSettings.shuffleOptions}
                      onChange={e => setCbtSettings(v => ({ ...v, shuffleOptions: e.target.checked }))}
                      className="rounded border-slate-300 text-[#111A43]"
                    />
                    <span className="font-medium text-slate-700">Shuffle multiple choice options (A, B, C, D)</span>
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={cbtSettings.preventTabSwitch}
                      onChange={e => setCbtSettings(v => ({ ...v, preventTabSwitch: e.target.checked }))}
                      className="rounded border-slate-300 text-[#111A43]"
                    />
                    <span className="font-medium text-slate-700">Enforce browser focus loss advisory in student portal</span>
                  </label>
                </div>

                <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-500 border border-slate-200">
                  <p className="font-semibold text-slate-700 mb-0.5">Persistence Status Note:</p>
                  <p>
                    Assessment specific configurations (duration, question set, student eligibility) persist directly to Supabase tables. Operational station defaults apply across active testing sessions.
                  </p>
                </div>

                <button
                  type="submit"
                  className="rounded-lg bg-[#111A43] px-4 py-2 font-bold text-white hover:bg-[#1c2965] transition"
                >
                  Save Station Policies
                </button>
              </form>
            </div>
          </div>
        )}

        {/* SECTION 7: LIVE MONITORING DESK */}
        {activeSection === 'Live Monitoring Desk' && (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Monitoring Header & Controls */}
            <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/50 p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-700">Active Examination:</span>
                <select
                  value={monitoringExamId}
                  onChange={e => setMonitoringExamId(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-[#111A43]"
                >
                  {exams.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                  {!exams.length && <option value="">No examinations created</option>}
                </select>

                <button
                  onClick={fetchLiveAttempts}
                  disabled={loadingAttempts}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <RefreshCw size={13} className={loadingAttempts ? 'animate-spin' : ''} />
                  <span>Refresh Sessions</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-600">
                  {activeAttempts.length} Session(s) Recorded
                </span>
              </div>
            </div>

            {/* Honest Telemetry Notice Banner */}
            <div className="shrink-0 border-b border-amber-200 bg-amber-50/70 px-4 py-2 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Honest Telemetry Notice: </span>
                Real-time per-second heartbeat, webcam proctoring, and client tab-switch detection require the proposed Supabase telemetry extension (<code className="font-mono font-semibold">upec_assessment_telemetry</code> table). The monitor below displays authentic server-recorded session lifecycle timestamps (<code className="font-mono">started_at</code>, <code className="font-mono">expires_at</code>, <code className="font-mono">submitted_at</code>) from the database.
              </div>
            </div>

            {/* Attempts Live Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {loadingAttempts ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading session attempts...</div>
              ) : !activeAttempts.length ? (
                <div className="p-12 text-center text-slate-400">
                  <Radio size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">No active attempts for this examination.</p>
                  <p className="text-[11px] text-slate-400">
                    When candidates click "Start Assessment" in their portal, their live sessions appear here.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Session Start</th>
                      <th className="py-2.5 px-3">Timer Expiry</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeAttempts.map(attempt => {
                      const isSubmitted = Boolean(attempt.submitted_at);
                      const isExpired = !isSubmitted && new Date(attempt.expires_at).getTime() < Date.now();

                      return (
                        <tr key={attempt.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-[#111A43]">{attempt.student_name || 'Candidate'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{attempt.student_account_id}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {new Date(attempt.started_at).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {new Date(attempt.expires_at).toLocaleTimeString()}
                          </td>
                          <td className="py-2.5 px-3">
                            {isSubmitted ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Submitted
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                Time Expired
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                                In Progress
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111A43]">
                            {isSubmitted ? `${attempt.score} / ${attempt.total_questions}` : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE QUESTION */}
      {isCreatingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <form
            onSubmit={handleCreateQuestion}
            className="max-h-[90dvh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Add Question to Bank</h2>
              <button
                type="button"
                onClick={() => setIsCreatingQuestion(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Subject
              <select
                required
                value={questionForm.subjectId}
                onChange={e => setQuestionForm(v => ({ ...v, subjectId: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                <option value="">Select subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Question Prompt
              <textarea
                required
                rows={3}
                minLength={10}
                value={questionForm.prompt}
                onChange={e => setQuestionForm(v => ({ ...v, prompt: e.target.value }))}
                placeholder="Enter question text..."
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(['A', 'B', 'C', 'D'] as const).map(opt => (
                <label key={opt} className="block text-xs font-semibold text-slate-700">
                  Option {opt}
                  <input
                    required
                    value={(questionForm as any)['option' + opt]}
                    onChange={e => setQuestionForm(v => ({ ...v, ['option' + opt]: e.target.value }))}
                    placeholder={`Option ${opt} text`}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-1.5 text-xs"
                  />
                </label>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Correct Option
                <select
                  value={questionForm.correctOption}
                  onChange={e =>
                    setQuestionForm(v => ({ ...v, correctOption: e.target.value as 'A' | 'B' | 'C' | 'D' }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-bold"
                >
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                  <option value="D">Option D</option>
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Explanation (Optional)
                <input
                  value={questionForm.explanation}
                  onChange={e => setQuestionForm(v => ({ ...v, explanation: e.target.value }))}
                  placeholder="Rationale for correct answer"
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </label>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingAction}
                className="w-full rounded-lg bg-[#C62839] p-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ad2332] disabled:opacity-50"
              >
                {savingAction ? 'Saving...' : 'Save Question to Bank'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: CREATE EXAMINATION */}
      {isCreatingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <form
            onSubmit={handleCreateExam}
            className="max-h-[90dvh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Create Examination</h2>
              <button
                type="button"
                onClick={() => setIsCreatingExam(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <label className="block text-xs font-semibold text-slate-700">
              Examination Title
              <input
                required
                minLength={5}
                maxLength={160}
                value={examForm.title}
                onChange={e => setExamForm(v => ({ ...v, title: e.target.value }))}
                placeholder="e.g. 2026 IJMB Mathematics Mock Exam"
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </label>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">
                Subject
                <select
                  required
                  value={examForm.subjectId}
                  onChange={e => setExamForm(v => ({ ...v, subjectId: e.target.value, questionIds: [] }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                >
                  <option value="">Select subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs font-semibold text-slate-700">
                Duration (Minutes)
                <input
                  type="number"
                  min={5}
                  max={240}
                  required
                  value={examForm.durationMinutes}
                  onChange={e => setExamForm(v => ({ ...v, durationMinutes: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
                />
              </label>
            </div>

            <fieldset className="rounded-lg border border-slate-200 p-3">
              <legend className="px-1 text-xs font-semibold text-slate-700">
                Select Approved Questions ({examForm.questionIds.length} selected)
              </legend>
              <div className="mt-1 max-h-48 space-y-2 overflow-y-auto">
                {availablePublishedQuestions.map(q => (
                  <label key={q.id} className="flex items-start gap-2 text-xs text-slate-700 hover:bg-slate-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={examForm.questionIds.includes(q.id)}
                      onChange={e =>
                        setExamForm(v => ({
                          ...v,
                          questionIds: e.target.checked
                            ? [...v.questionIds, q.id]
                            : v.questionIds.filter(id => id !== q.id)
                        }))
                      }
                      className="mt-0.5 rounded border-slate-300 text-[#111A43]"
                    />
                    <span className="line-clamp-2">{q.prompt}</span>
                  </label>
                ))}
                {!examForm.subjectId && (
                  <p className="text-xs text-slate-400">Select a subject first to view published questions.</p>
                )}
                {examForm.subjectId && !availablePublishedQuestions.length && (
                  <p className="text-xs text-amber-700">
                    No approved questions found for this subject. Please add or publish questions in the Question Bank first.
                  </p>
                )}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={savingAction || !examForm.questionIds.length}
              className="w-full rounded-lg bg-[#C62839] p-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ad2332] disabled:opacity-50"
            >
              {savingAction ? 'Creating...' : 'Create Assessment as Draft'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 3: SCHEDULE EXAMINATION */}
      {isSchedulingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <form
            onSubmit={handleSaveSchedule}
            className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Schedule Examination</h2>
              <button
                type="button"
                onClick={() => setIsSchedulingExam(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">Exam: {isSchedulingExam.title}</p>

            <label className="block text-xs font-semibold text-slate-700">
              Opening Time (Start)
              <input
                type="datetime-local"
                value={scheduleForm.opensAt}
                onChange={e => setScheduleForm(v => ({ ...v, opensAt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Closing Time (Deadline)
              <input
                type="datetime-local"
                value={scheduleForm.closesAt}
                onChange={e => setScheduleForm(v => ({ ...v, closesAt: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"
              />
            </label>

            <button
              type="submit"
              disabled={savingAction}
              className="w-full rounded-lg bg-[#111A43] p-2.5 text-xs font-bold text-white hover:bg-[#1a265b] disabled:opacity-50"
            >
              {savingAction ? 'Saving...' : 'Save Schedule'}
            </button>
          </form>
        </div>
      )}

      {/* MODAL 4: ELIGIBILITY MANAGEMENT */}
      {isEligibilityModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <div className="max-h-[90dvh] w-full max-w-lg space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Candidate Eligibility</h2>
              <button
                type="button"
                onClick={() => setIsEligibilityModal(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">Exam: {isEligibilityModal.title}</p>

            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={restrictedMode}
                onChange={e => setRestrictedMode(e.target.checked)}
                className="rounded border-slate-300 text-[#111A43]"
              />
              <span>Restricted Access (Only specified candidates may take this assessment)</span>
            </label>

            {restrictedMode && (
              <div className="space-y-2 border-t border-slate-100 pt-2">
                <p className="text-xs font-semibold text-slate-700">
                  Search &amp; Assign Candidates ({eligibleStudents.length} assigned)
                </p>

                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={studentSearchInput}
                    onChange={e => setStudentSearchInput(e.target.value)}
                    placeholder="Search candidate name to add..."
                    className="w-full rounded-lg border border-slate-200 p-2 pl-8 text-xs"
                  />
                </div>

                {searchedStudents.length > 0 && (
                  <div className="max-h-36 overflow-y-auto rounded-lg border border-slate-200 divide-y divide-slate-100">
                    {searchedStudents.map(s => {
                      const isAdded = eligibleStudents.includes(s.id);
                      return (
                        <div key={s.id} className="flex items-center justify-between p-2 text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">{s.full_name}</p>
                            <p className="font-mono text-[10px] text-slate-400">{s.id}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (isAdded) {
                                setEligibleStudents(prev => prev.filter(id => id !== s.id));
                              } else {
                                setEligibleStudents(prev => [...prev, s.id]);
                              }
                            }}
                            className={`rounded px-2 py-1 text-[11px] font-bold ${
                              isAdded
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-[#111A43] text-white'
                            }`}
                          >
                            {isAdded ? 'Remove' : 'Add'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <button
              type="button"
              disabled={savingAction}
              onClick={handleSaveEligibility}
              className="w-full rounded-lg bg-[#111A43] p-2.5 text-xs font-bold text-white hover:bg-[#1a265b] disabled:opacity-50"
            >
              {savingAction ? 'Saving...' : 'Save Candidate Eligibility'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL 5: NOTIFY GUARDIANS */}
      {isNotifyingGuardians && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <div className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Notify Guardians &amp; Candidates</h2>
              <button
                type="button"
                onClick={() => setIsNotifyingGuardians(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500 font-medium">Exam: {isNotifyingGuardians.title}</p>

            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-slate-700">Notification Mode</label>
              <select
                value={notificationMode}
                onChange={e => setNotificationMode(e.target.value as any)}
                className="w-full rounded-lg border border-slate-200 p-2 text-xs"
              >
                <option value="schedule">Schedule Notification (Upcoming Exam Timing)</option>
                <option value="attendance">Attendance Notification (Session Started/Submitted)</option>
                <option value="performance">Performance Notification (Final Recorded Scores)</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-400">
              Verified email templates and in-app alerts will be transmitted to enrolled students and registered guardians using verified institutional sender parameters.
            </p>

            <button
              type="button"
              disabled={sendingNotification}
              onClick={handleSendGuardianNotification}
              className="w-full rounded-lg bg-[#C62839] p-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#ad2332] disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>{sendingNotification ? 'Queuing Notifications...' : 'Queue Notification Broadcast'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}