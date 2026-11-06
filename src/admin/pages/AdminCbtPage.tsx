import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileQuestion,
  Lock,
  Plus,
  Radio,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Settings,
  ShieldAlert,
  Users,
  X
} from 'lucide-react';

type SectionTab =
  | 'Overview'
  | 'Question Bank'
  | 'Examinations'
  | 'Candidates'
  | 'Results & Analytics'
  | 'CBT Settings'
  | 'Live Monitoring Desk';

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
  correction_release_mode?: 'after_close' | 'scheduled' | 'manual';
  corrections_release_at?: string | null;
  corrections_released_at?: string | null;
};

type Question = {
  id: string;
  subject_id: string;
  prompt: string;
  options?: { A: string; B: string; C: string; D: string };
  correct_option?: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  solution_steps?: string;
  topic?: string;
  subtopic?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  exam_type?: string;
  exam_year?: number | null;
  question_type?: string;
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
  student_name?: string | null;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  score: number | null;
  total_questions: number | null;
};

type ResultRecord = {
  student_account_id: string;
  student_name?: string | null;
  score: number | null;
  total_questions: number | null;
  submitted_at: string | null;
};

type CandidateStudent = {
  id: string;
  full_name: string;
};

type SectionState<T> = {
  data: T;
  loading: boolean;
  error: string | null;
  statusCode?: number | null;
};

const notify = (message: string, kind: 'success' | 'error' | 'info' = 'info') =>
  window.dispatchEvent(new CustomEvent('upec-admin-toast', { detail: { message, kind } }));

const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function api(path: string, init: RequestInit = {}) {
  const token = sessionStorage.getItem('upec_staff_token');
  if (!token) throw new ApiError('Staff authentication token required. Please sign in to the staff portal.', 401);
  const response = await fetch(base + path, {
    ...init,
    headers: {
      Authorization: 'Bearer ' + token,
      ...(init.body ? { 'Content-Type': 'application/json' } : {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(data.error || `Server request failed with status ${response.status}`, response.status);
  }
  return data;
}


const parseQuestionCsv = (input: string) => {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    if (ch === '"' && quoted && input[i + 1] === '"') { cell += '"'; i++; }
    else if (ch === '"') quoted = !quoted;
    else if (ch === ',' && !quoted) { row.push(cell.trim()); cell = ''; }
    else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  if (quoted) throw new Error('The CSV contains an unclosed quotation mark.');
  row.push(cell.trim());
  if (row.some(value => value !== '')) rows.push(row);
  if (rows.length < 2) throw new Error('Choose a CSV with a header and at least one question.');
  const headers = rows[0].map(value => value.toLowerCase().replace(/[\s_-]+/g, ''));
  const required = ['prompt','optiona','optionb','optionc','optiond','correctoption'];
  const missing = required.filter(header => !headers.includes(header));
  if (missing.length) throw new Error('Missing required CSV columns: ' + missing.join(', '));
  if (new Set(headers).size !== headers.length) throw new Error('The CSV contains duplicate column headings.');
  return rows.slice(1).map((values, index) => {
    if (values.length !== headers.length) throw new Error('CSV row ' + (index + 2) + ' has ' + values.length + ' values; expected ' + headers.length + '.');
    return Object.fromEntries(headers.map((header, column) => [header, values[column] || '']));
  });
};

const SETTINGS_STORAGE_KEY = 'upec_cbt_station_settings';

export default function AdminCbtPage() {
  const [activeSection, setActiveSection] = useState<SectionTab>('Overview');

  // Granular Section-Level Data & Error States (preserving successful sections when others fail)
  const [examsState, setExamsState] = useState<SectionState<Exam[]>>({ data: [], loading: true, error: null });
  const [questionsState, setQuestionsState] = useState<SectionState<Question[]>>({ data: [], loading: true, error: null });
  const [subjectsState, setSubjectsState] = useState<SectionState<Subject[]>>({ data: [], loading: true, error: null });
  const [resultsState, setResultsState] = useState<SectionState<{ title: string; results: ResultRecord[] } | null>>({
    data: null,
    loading: false,
    error: null
  });
  const [attemptsState, setAttemptsState] = useState<SectionState<Attempt[]>>({ data: [], loading: false, error: null });

  // Filtering & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Selected Exam Targets
  const [selectedExamForResults, setSelectedExamForResults] = useState<string>('');
  const [monitoringExamId, setMonitoringExamId] = useState<string>('');

  // Modals & Action Forms
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
  const [bulkCsv, setBulkCsv] = useState('');
  const [isPdfExtractOpen, setIsPdfExtractOpen] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfSubjectId, setPdfSubjectId] = useState('');
  const [pdfExamType, setPdfExamType] = useState('JAMB');
  const [pdfExamYear, setPdfExamYear] = useState('');
  const [pdfCandidates, setPdfCandidates] = useState<any[]>([]);
  const [pdfExtracting, setPdfExtracting] = useState(false);
  const [isProviderImportOpen, setIsProviderImportOpen] = useState(false);
  const [providerName, setProviderName] = useState('auto');
  const [providerExam, setProviderExam] = useState('utme');
  const [providerSubject, setProviderSubject] = useState('mathematics');
  const [providerYear, setProviderYear] = useState('2024');
  const [providerTargetSubject, setProviderTargetSubject] = useState('');
  const [providerPreview, setProviderPreview] = useState<any[]>([]);
  const [providerSelected, setProviderSelected] = useState<number[]>([]);
  const [providerLoading, setProviderLoading] = useState(false);

  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    subjectId: '',
    prompt: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A' as 'A' | 'B' | 'C' | 'D',
    explanation: '',
    solutionSteps: '', topic: '', subtopic: '', difficulty: 'medium', examType: '', examYear: '', questionType: 'single_choice'
  });

  const [isCreatingExam, setIsCreatingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    subjectId: '',
    durationMinutes: 60,
    questionIds: [] as string[]
  });

  const [isSchedulingExam, setIsSchedulingExam] = useState<Exam | null>(null);
  const [scheduleForm, setScheduleForm] = useState({ opensAt: '', closesAt: '' });
  const [correctionPolicyExam, setCorrectionPolicyExam] = useState<Exam | null>(null);
  const [correctionMode, setCorrectionMode] = useState<'after_close' | 'scheduled' | 'manual'>('after_close');
  const [correctionReleaseAt, setCorrectionReleaseAt] = useState('');

  const [isEligibilityModal, setIsEligibilityModal] = useState<Exam | null>(null);
  const [restrictedMode, setRestrictedMode] = useState(false);
  const [eligibleStudents, setEligibleStudents] = useState<string[]>([]);
  const [studentSearchInput, setStudentSearchInput] = useState('');
  const [searchedStudents, setSearchedStudents] = useState<CandidateStudent[]>([]);
  const [searchingStudents, setSearchingStudents] = useState(false);

  const [isNotifyingGuardians, setIsNotifyingGuardians] = useState<Exam | null>(null);
  const [notificationMode, setNotificationMode] = useState<'schedule' | 'attendance' | 'performance'>('schedule');
  const [sendingNotification, setSendingNotification] = useState(false);

  // CBT Station Settings (stored durably in localStorage, clearly mapped to engine boundaries)
  type StationSettings = {
    defaultPassMark: number;
    defaultDurationMinutes: number;
    enforceFocusNotice: boolean;
  };

  const [stationSettings, setStationSettings] = useState<StationSettings>(() => {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored) as StationSettings;
    } catch {
      // fallback
    }
    return {
      defaultPassMark: 50,
      defaultDurationMinutes: 60,
      enforceFocusNotice: true
    };
  });
  const [settingsNotice, setSettingsNotice] = useState('');
  const [savingAction, setSavingAction] = useState(false);

  // Independent Data Fetchers
  const fetchAssessments = async () => {
    setExamsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api('/api/staff/academic/assessments');
      setExamsState({ data: res.assessments || [], loading: false, error: null, statusCode: 200 });
      if (res.assessments?.length) {
        setSelectedExamForResults(prev => prev || res.assessments[0].id);
        setMonitoringExamId(prev => prev || res.assessments[0].id);
      }
    } catch (err: any) {
      setExamsState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch assessments.',
        statusCode: err.status || 500
      }));
    }
  };

  const fetchQuestions = async () => {
    setQuestionsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api('/api/staff/academic/questions');
      setQuestionsState({ data: res.questions || [], loading: false, error: null, statusCode: 200 });
    } catch (err: any) {
      setQuestionsState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch questions.',
        statusCode: err.status || 500
      }));
    }
  };

  const fetchCatalogue = async () => {
    setSubjectsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api('/api/staff/academic/catalogue');
      setSubjectsState({ data: res.subjects || [], loading: false, error: null, statusCode: 200 });
    } catch (err: any) {
      setSubjectsState(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Failed to fetch subject catalogue.',
        statusCode: err.status || 500
      }));
    }
  };

  // Initial Data Load
  useEffect(() => {
    void fetchAssessments();
    void fetchQuestions();
    void fetchCatalogue();
  }, []);

  // Fetch Results for Selected Examination
  const fetchResults = async (examId: string) => {
    if (!examId) return;
    setResultsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api(`/api/staff/academic/assessments/${examId}/results`);
      setResultsState({ data: res, loading: false, error: null, statusCode: 200 });
    } catch (err: any) {
      setResultsState({
        data: null,
        loading: false,
        error:
          err.status === 403
            ? 'Access Denied: As an academic teacher, you may only view examination results for assessments you authored.'
            : err.message || 'Failed to fetch examination results.',
        statusCode: err.status || 500
      });
    }
  };

  useEffect(() => {
    if (selectedExamForResults && activeSection === 'Results & Analytics') {
      void fetchResults(selectedExamForResults);
    }
  }, [selectedExamForResults, activeSection]);

  // Fetch Attempts for Live Monitoring Desk (Strictly using /assessments/:id/attempts)
  const fetchLiveAttempts = async (examId: string) => {
    if (!examId) return;
    setAttemptsState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const res = await api(`/api/staff/academic/assessments/${examId}/attempts`);
      setAttemptsState({ data: res.attempts || [], loading: false, error: null, statusCode: 200 });
    } catch (err: any) {
      setAttemptsState({
        data: [],
        loading: false,
        error:
          err.status === 403
            ? 'Access Denied: As an academic teacher, you may only monitor assessments you authored.'
            : err.message || 'Failed to query active candidate sessions from server.',
        statusCode: err.status || 500
      });
    }
  };

  useEffect(() => {
    if (!monitoringExamId || activeSection !== 'Live Monitoring Desk') return;
    void fetchLiveAttempts(monitoringExamId);
    const refreshInterval = window.setInterval(() => {
      void fetchLiveAttempts(monitoringExamId);
    }, 10000);
    return () => window.clearInterval(refreshInterval);
  }, [monitoringExamId, activeSection]);

  // Student Search for Eligibility
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

  // Create Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionForm.subjectId || !questionForm.prompt.trim()) {
      notify('Please select a subject and enter a question prompt.', 'error');
      return;
    }
    setSavingAction(true);
    try {
      await api(editingQuestion ? `/api/staff/academic/questions/${editingQuestion.id}` : '/api/staff/academic/questions', {
        method: editingQuestion ? 'PATCH' : 'POST',
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
          explanation: questionForm.explanation.trim(),
          solutionSteps: questionForm.solutionSteps.trim(), topic: questionForm.topic.trim(), subtopic: questionForm.subtopic.trim(),
          difficulty: questionForm.difficulty, examType: questionForm.examType.trim(), examYear: questionForm.examYear || null,
          questionType: questionForm.questionType
        })
      });
      notify(editingQuestion ? 'Question changes saved.' : 'Question added to Question Bank in draft status.', 'success');
      setEditingQuestion(null);
      setIsCreatingQuestion(false);
      setQuestionForm({
        subjectId: '',
        prompt: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '', solutionSteps: '', topic: '', subtopic: '', difficulty: 'medium', examType: '', examYear: '', questionType: 'single_choice'
      });
      void fetchQuestions();
    } catch (err: any) {
      notify(err.message || 'Failed to create question.', 'error');
    } finally {
      setSavingAction(false);
    }
  };


  const updatePdfCandidate = (index: number, field: string, value: any) => {
    setPdfCandidates(current => current.map((question, i) => i === index ? { ...question, [field]: value } : question));
  };

  const extractPdfQuestions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pdfFile) { notify('Choose a PDF or DOCX question paper first.', 'error'); return; }
    const subjectId = pdfSubjectId || (selectedSubjectFilter !== 'all' ? selectedSubjectFilter : '');
    if (!subjectId) { notify('Choose the subject these questions belong to.', 'error'); return; }
    if (pdfFile.size > 12 * 1024 * 1024) { notify('Document must be 12 MB or smaller.', 'error'); return; }
    setPdfExtracting(true);
    setPdfCandidates([]);
    try {
      const token = sessionStorage.getItem('upec_staff_token');
      if (!token) throw new Error('Staff authentication token required. Please sign in again.');
      const params = new URLSearchParams({ subjectId, examType: pdfExamType, examYear: pdfExamYear });
      const response = await fetch(base + '/api/staff/academic/questions/extract-pdf?' + params.toString(), {
        method: 'POST',
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': pdfFile.name.toLowerCase().endsWith('.docx') ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/pdf' },
        body: pdfFile
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(data.error || 'Document extraction failed.', response.status);
      setPdfCandidates((data.questions || []).map((q: any) => ({ ...q, sourceName: pdfFile.name, sourceReference: pdfFile.name, sourceLicense: 'Uploaded source document' })));
      notify('Extracted ' + (data.extracted || 0) + ' question candidates. Review every answer before importing.', 'success');
    } catch (err: any) {
      notify(err.message || 'Could not extract questions from this document.', 'error');
    } finally { setPdfExtracting(false); }
  };

  const importReviewedPdfQuestions = async () => {
    const subjectId = pdfSubjectId || (selectedSubjectFilter !== 'all' ? selectedSubjectFilter : '');
    const ready = pdfCandidates.filter(q => ['A','B','C','D'].includes(q.correctOption));
    if (!ready.length) { notify('Confirm the correct answer for at least one question before importing.', 'error'); return; }
    if (ready.length !== pdfCandidates.length) { notify('Some questions still need an answer confirmed. Resolve them or remove them before importing.', 'error'); return; }
    setSavingAction(true);
    try {
      const result = await api('/api/staff/academic/questions/bulk', {
        method: 'POST',
        body: JSON.stringify({ questions: ready.map(q => ({
          subjectId, prompt: q.diagramDescription ? q.prompt + '\n\nDiagram: ' + q.diagramDescription : q.prompt, options: q.options, correctOption: q.correctOption,
          explanation: q.explanation, solutionSteps: q.solutionSteps, topic: q.topic,
          subtopic: q.subtopic, difficulty: q.difficulty || 'medium', examType: q.examType || pdfExamType,
          examYear: q.examYear || (pdfExamYear ? Number(pdfExamYear) : null), questionType: 'single_choice',
          sourceName: q.sourceName || pdfFile?.name || 'Document upload', sourceReference: q.sourceReference || pdfFile?.name || '',
          sourceLicense: q.sourceLicense || 'Uploaded source document'
        })) })
      });
      notify('Imported ' + result.imported + ' reviewed questions as drafts. ' + (result.rejected?.length || 0) + ' were rejected.', result.rejected?.length ? 'info' : 'success');
      setPdfCandidates([]);
      setPdfFile(null);
      setIsPdfExtractOpen(false);
      void fetchQuestions();
    } catch (err: any) {
      notify(err.message || 'Could not import reviewed questions.', 'error');
    } finally { setSavingAction(false); }
  };

  const handleBulkQuestionImport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const records = parseQuestionCsv(bulkCsv);
      const questions = records.map(row => ({
        subjectId: row.subjectid || (selectedSubjectFilter !== 'all' ? selectedSubjectFilter : ''),
        prompt: row.prompt,
        options: { A: row.optiona, B: row.optionb, C: row.optionc, D: row.optiond },
        correctOption: (row.correctoption || '').toUpperCase(),
        explanation: row.explanation,
        questionType: row.questiontype || 'single_choice',
        topic: row.topic,
        subtopic: row.subtopic,
        difficulty: row.difficulty || 'medium',
        examType: row.examtype,
        examYear: row.examyear || null,
        solutionSteps: row.solutionsteps,
        sourceName: row.sourcename,
        sourceReference: row.sourcereference,
        sourceLicense: row.sourcelicense
      }));
      setSavingAction(true);
      const result = await api('/api/staff/academic/questions/bulk', {
        method: 'POST', body: JSON.stringify({ questions })
      });
      notify(`Imported ${result.imported} questions; ${result.rejected?.length || 0} rows need correction.`, result.rejected?.length ? 'info' : 'success');
      setBulkCsv('');
      setIsBulkImportOpen(false);
      void fetchQuestions();
    } catch (err: any) {
      notify(err.message || 'Bulk import failed.', 'error');
    } finally { setSavingAction(false); }
  };


  const fetchProviderPreview = async (e: React.FormEvent) => {
    e.preventDefault();
    setProviderLoading(true);
    setProviderPreview([]);
    setProviderSelected([]);
    try {
      const params = new URLSearchParams({
        provider: providerName, exam: providerExam, subject: providerSubject.trim().toLowerCase().replace(/\s+/g, '-'),
        year: providerYear, limit: '30'
      });
      const result = await api(`/api/staff/academic/provider-questions?${params.toString()}`);
      setProviderPreview(result.questions || []);
      setProviderSelected((result.questions || []).map((_: any, index: number) => index));
      notify(`Found ${result.importable || 0} importable questions from ${result.provider}.`, 'success');
    } catch (err: any) {
      notify(err.message || 'Could not retrieve provider questions.', 'error');
    } finally { setProviderLoading(false); }
  };

  const importProviderSelection = async () => {
    if (!providerTargetSubject) { notify('Select the UPEC subject these questions belong to.', 'error'); return; }
    const selected = providerSelected.map(index => providerPreview[index]).filter(Boolean);
    if (!selected.length) { notify('Select at least one question to import.', 'error'); return; }
    setProviderLoading(true);
    try {
      const questions = selected.map(q => ({
        subjectId: providerTargetSubject, prompt: q.prompt, options: q.options,
        correctOption: q.correctOption, explanation: q.explanation,
        solutionSteps: q.solutionSteps, questionType: 'single_choice',
        difficulty: 'medium', examType: q.examType, examYear: q.examYear,
        sourceName: q.sourceProvider, sourceReference: q.providerId,
        sourceLicense: 'Provider terms/licence to be verified before publication'
      }));
      const result = await api('/api/staff/academic/questions/bulk', {
        method: 'POST', body: JSON.stringify({ questions })
      });
      notify(`Imported ${result.imported} questions as drafts. ${result.rejected?.length || 0} were rejected.`, result.rejected?.length ? 'info' : 'success');
      setProviderPreview([]);
      setProviderSelected([]);
      setIsProviderImportOpen(false);
      void fetchQuestions();
    } catch (err: any) {
      notify(err.message || 'Provider import failed.', 'error');
    } finally { setProviderLoading(false); }
  };

  // Toggle Question Status
  const handleToggleQuestionStatus = async (q: Question) => {
    const nextStatus = q.status === 'published' ? 'draft' : 'published';
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/questions/${q.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      notify(`Question status updated to ${nextStatus}.`, 'success');
      void fetchQuestions();
    } catch (err: any) {
      notify(err.message || 'Failed to update question status.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Create Assessment
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
      setExamForm({
        title: '',
        subjectId: '',
        durationMinutes: stationSettings.defaultDurationMinutes || 60,
        questionIds: []
      });
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Failed to create assessment.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Update Assessment Status
  const handleChangeExamStatus = async (exam: Exam, newStatus: 'draft' | 'published' | 'closed') => {
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${exam.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus })
      });
      notify(`Assessment status updated to ${newStatus}.`, 'success');
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Failed to update assessment status.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Save Schedule
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
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Failed to schedule assessment.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  const handleSaveCorrectionPolicy = async () => {
    if (!correctionPolicyExam) return;
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${correctionPolicyExam.id}/correction-policy`, {
        method: 'PATCH',
        body: JSON.stringify({ mode: correctionMode, releaseAt: correctionMode === 'scheduled' ? new Date(correctionReleaseAt).toISOString() : null })
      });
      notify('Correction release policy saved.', 'success');
      setCorrectionPolicyExam(null);
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Unable to save correction policy.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  const handleReleaseCorrections = async (exam: Exam) => {
    setSavingAction(true);
    try {
      await api(`/api/staff/academic/assessments/${exam.id}/corrections/release`, { method: 'POST', body: JSON.stringify({}) });
      notify('Corrections released to candidates.', 'success');
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Corrections could not be released.', 'error');
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
      void fetchAssessments();
    } catch (err: any) {
      notify(err.message || 'Failed to update candidate eligibility.', 'error');
    } finally {
      setSavingAction(false);
    }
  };

  // Send Guardian Notification (Authentic handling, no fabricated delivery counts)
  const handleSendGuardianNotification = async () => {
    if (!isNotifyingGuardians) return;
    setSendingNotification(true);
    try {
      const res = await api(`/api/staff/assessments/${isNotifyingGuardians.id}/notify-guardians`, {
        method: 'POST',
        body: JSON.stringify({ mode: notificationMode })
      });
      if (res.queued === 0 && res.studentsNotified === 0) {
        notify('No eligible candidates with verified guardian contacts found for this examination.', 'info');
      } else {
        const skippedText = res.skipped ? ` (${res.skipped} skipped without verified guardian email)` : '';
        notify(
          `Notification queued: ${res.queued} email(s) queued in outbox, ${res.studentsNotified} in-app alert(s) posted${skippedText}. Background notification worker will process delivery.`,
          'success'
        );
      }
      setIsNotifyingGuardians(null);
    } catch (err: any) {
      notify(
        err.status === 403
          ? 'Permission Denied: CBT management permission required to send candidate and guardian notifications.'
          : err.message || 'Notification transmission failed.',
        'error'
      );
    } finally {
      setSendingNotification(false);
    }
  };

  // Save Station Settings to localStorage
  const handleSaveStationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(stationSettings));
      setSettingsNotice('Station preferences durably saved to this browser session.');
      notify('Station preferences saved.', 'success');
      setTimeout(() => setSettingsNotice(''), 4000);
    } catch {
      notify('Unable to save station preferences to local storage.', 'error');
    }
  };

  // Filtered Questions
  const filteredQuestions = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return questionsState.data.filter(q => {
      const matchesSearch = q.prompt.toLowerCase().includes(term);
      const matchesSubject = selectedSubjectFilter === 'all' || q.subject_id === selectedSubjectFilter;
      const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [questionsState.data, searchQuery, selectedSubjectFilter, statusFilter]);

  // Filtered Exams
  const filteredExams = useMemo(() => {
    const term = searchQuery.toLowerCase().trim();
    return examsState.data.filter(e => {
      const matchesSearch = e.title.toLowerCase().includes(term);
      const matchesSubject = selectedSubjectFilter === 'all' || e.subject_id === selectedSubjectFilter;
      const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
      return matchesSearch && matchesSubject && matchesStatus;
    });
  }, [examsState.data, searchQuery, selectedSubjectFilter, statusFilter]);

  // Available Published Questions for Modal
  const availablePublishedQuestions = useMemo(() => {
    if (!examForm.subjectId) return [];
    return questionsState.data.filter(q => q.subject_id === examForm.subjectId && q.status === 'published');
  }, [questionsState.data, examForm.subjectId]);

  // Pagination
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

  // Results Analytics Calculation (Honest, verified denominators)
  const resultsAnalytics = useMemo(() => {
    if (!resultsState.data?.results) return null;
    const all = resultsState.data.results;
    const validScored = all.filter(r => r.score !== null && r.total_questions !== null && r.total_questions > 0);
    const totalSubmitted = all.length;

    if (!validScored.length) {
      return {
        totalSubmitted,
        validScoredCount: 0,
        averageScore: null,
        highestScore: null,
        lowestScore: null,
        passCount: 0,
        passRate: null
      };
    }

    const scores = validScored.map(r => r.score as number);
    const sumScore = scores.reduce((acc, v) => acc + v, 0);
    const avgScore = (sumScore / validScored.length).toFixed(1);
    const high = Math.max(...scores);
    const low = Math.min(...scores);
    const passCount = validScored.filter(
      r => ((r.score as number) / (r.total_questions as number)) * 100 >= stationSettings.defaultPassMark
    ).length;
    const passRate = Math.round((passCount / validScored.length) * 100);

    return {
      totalSubmitted,
      validScoredCount: validScored.length,
      averageScore: avgScore,
      highestScore: high,
      lowestScore: low,
      passCount,
      passRate
    };
  }, [resultsState.data, stationSettings.defaultPassMark]);

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col gap-2 overflow-hidden bg-[#F7F8FC] p-2 text-slate-800">
      {/* Top Bar Header */}
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xl font-extrabold text-[#111A43] sm:text-2xl">CBT &amp; Examinations</h1>
            <span className="hidden rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 sm:inline-flex">
              2025/2026 Academic Session
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Assessment engine, verified question repository, candidate sessions &amp; academic analytics
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            title="Refresh all datasets"
            aria-label="Refresh all datasets"
            onClick={() => {
              void fetchAssessments();
              void fetchQuestions();
              void fetchCatalogue();
              if (selectedExamForResults) void fetchResults(selectedExamForResults);
              if (monitoringExamId) void fetchLiveAttempts(monitoringExamId);
            }}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <RefreshCw
              size={15}
              className={examsState.loading || questionsState.loading || subjectsState.loading ? 'animate-spin text-[#111A43]' : ''}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => { setProviderTargetSubject(selectedSubjectFilter === 'all' ? '' : selectedSubjectFilter); setIsProviderImportOpen(true); }}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#111A43] hover:bg-slate-50 transition"
          >
            <BookOpen size={14} />
            <span>Provider Library</span>
          </button>

          <button
            onClick={() => { setPdfSubjectId(selectedSubjectFilter === 'all' ? '' : selectedSubjectFilter); setPdfCandidates([]); setIsPdfExtractOpen(true); }}
            className="flex items-center gap-1 rounded-lg border border-[#C62839]/20 bg-[#C62839]/5 px-3 py-2 text-xs font-bold text-[#C62839] hover:bg-[#C62839]/10 transition"
          >
            <FileQuestion size={14} />
            <span>Extract from PDF</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <ClipboardList size={14} />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={() => { setEditingQuestion(null); setQuestionForm({ subjectId: '', prompt: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A', explanation: '', solutionSteps: '', topic: '', subtopic: '', difficulty: 'medium', examType: '', examYear: '', questionType: 'single_choice' }); setIsCreatingQuestion(true); }}
            className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#111A43] hover:bg-slate-50 transition"
          >
            <Plus size={14} />
            <span>Add Question</span>
          </button>

          <button
            onClick={() => {
              setExamForm({
                title: '',
                subjectId: subjectsState.data[0]?.id || '',
                durationMinutes: stationSettings.defaultDurationMinutes || 60,
                questionIds: []
              });
              setIsCreatingExam(true);
            }}
            className="flex items-center gap-1 rounded-lg bg-[#C62839] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#a82230] transition"
          >
            <Plus size={14} />
            <span>Create Examination</span>
          </button>
        </div>
      </header>

      {/* Database KPI Metrics Bar */}
      <section className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#111A43]">
            <ClipboardList size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Total Assessments</p>
            <p className="text-lg font-extrabold text-[#111A43]">
              {examsState.loading ? '—' : examsState.error ? 'Error' : examsState.data.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Active / Published</p>
            <p className="text-lg font-extrabold text-emerald-700">
              {examsState.loading
                ? '—'
                : examsState.error
                ? 'Error'
                : examsState.data.filter(e => e.status === 'published').length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-[#C62839]">
            <FileQuestion size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Total Questions</p>
            <p className="text-lg font-extrabold text-[#111A43]">
              {questionsState.loading ? '—' : questionsState.error ? 'Error' : questionsState.data.length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Subject Coverage</p>
            <p className="text-lg font-extrabold text-[#111A43]">
              {subjectsState.loading ? '—' : subjectsState.error ? 'Error' : subjectsState.data.length}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs lg:flex">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <Radio size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium text-slate-500">Live Desk</p>
            <p className="text-xs font-bold text-slate-700">
              {examsState.loading
                ? '—'
                : `${examsState.data.filter(e => e.status === 'published').length} Active Exam(s)`}
            </p>
          </div>
        </div>
      </section>

      {/* 6 Sections + Desk Tab Navigation */}
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

      {/* Main Content Area */}
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
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

                {examsState.error ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} />
                      <span>{examsState.error}</span>
                    </div>
                    <button
                      onClick={fetchAssessments}
                      className="flex items-center gap-1 rounded bg-rose-100 px-2 py-1 font-bold text-rose-800 hover:bg-rose-200"
                    >
                      <RotateCcw size={12} /> Retry
                    </button>
                  </div>
                ) : examsState.loading ? (
                  <div className="space-y-2 p-4">
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                    <div className="h-8 animate-pulse rounded bg-slate-100" />
                  </div>
                ) : (
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
                        {examsState.data.slice(0, 5).map(exam => {
                          const sub = subjectsState.data.find(s => s.id === exam.subject_id);
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
                        {!examsState.data.length && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-400">
                              No examinations created yet. Click "Create Examination" to schedule your first assessment.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Right Column: Integrity Architecture */}
              <div className="space-y-3">
                <h2 className="text-sm font-bold text-[#111A43]">CBT Operational Integrity</h2>
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Strict Single-Attempt Isolation</p>
                      <p className="text-[11px] text-slate-500">
                        PostgreSQL unique constraint on <code>(assessment_id, student_account_id)</code> prevents duplicate starts.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Server-Authoritative Clock</p>
                      <p className="text-[11px] text-slate-500">
                        Timers expire on the server based on <code>expires_at</code>. Submissions after deadline plus grace period are rejected.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-slate-600">
                    <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Telemetry Boundary</p>
                      <p className="text-[11px] text-slate-500">
                        Per-second heartbeats and tab focus interception require the proposed telemetry table extension.
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
                  {subjectsState.data.map(s => (
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

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchQuestions}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                  title="Retry / Refresh Questions"
                >
                  <RefreshCw size={13} className={questionsState.loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsCreatingQuestion(true)}
                  className="flex items-center gap-1 rounded-lg bg-[#111A43] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#1b2760] transition"
                >
                  <Plus size={14} />
                  <span>New Question</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {questionsState.error && (
              <div className="shrink-0 flex items-center justify-between border-b border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{questionsState.error}</span>
                </div>
                <button
                  onClick={fetchQuestions}
                  className="flex items-center gap-1 rounded bg-rose-100 px-2 py-1 font-bold text-rose-800 hover:bg-rose-200"
                >
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            )}

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
                  {questionsState.loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Loading questions from question repository...
                      </td>
                    </tr>
                  ) : !paginatedQuestions.length ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        {questionsState.error ? 'Unable to load question bank.' : 'No questions match the selected criteria.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedQuestions.map(q => {
                      const sub = subjectsState.data.find(s => s.id === q.subject_id);
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
                          <td className="py-2.5 px-3 font-mono font-bold text-[#111A43]">{q.correct_option || '—'}</td>
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
                            <div className="inline-flex items-center gap-1.5">
                            <button
                              disabled={savingAction}
                              onClick={() => {
                                setEditingQuestion(q);
                                setQuestionForm({
                                  subjectId: q.subject_id,
                                  prompt: q.prompt,
                                  optionA: q.options?.A || '',
                                  optionB: q.options?.B || '',
                                  optionC: q.options?.C || '',
                                  optionD: q.options?.D || '',
                                  correctOption: q.correct_option || 'A',
                                  explanation: q.explanation || '', solutionSteps: q.solution_steps || '', topic: q.topic || '', subtopic: q.subtopic || '',
                                  difficulty: q.difficulty || 'medium', examType: q.exam_type || '', examYear: q.exam_year ? String(q.exam_year) : '', questionType: q.question_type || 'single_choice'
                                });
                                setIsCreatingQuestion(true);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-[#111A43] hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              Edit
                            </button>
                            <button
                              disabled={savingAction}
                              onClick={() => handleToggleQuestionStatus(q)}
                              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 transition disabled:opacity-50"
                            >
                              {q.status === 'published' ? 'Move to Draft' : 'Approve & Publish'}
                            </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
                  {subjectsState.data.map(s => (
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

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchAssessments}
                  className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:bg-slate-50"
                  title="Retry / Refresh Examinations"
                >
                  <RefreshCw size={13} className={examsState.loading ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={() => setIsCreatingExam(true)}
                  className="flex items-center gap-1 rounded-lg bg-[#C62839] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#a82230] transition"
                >
                  <Plus size={14} />
                  <span>New Examination</span>
                </button>
              </div>
            </div>

            {/* Error Banner */}
            {examsState.error && (
              <div className="shrink-0 flex items-center justify-between border-b border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{examsState.error}</span>
                </div>
                <button
                  onClick={fetchAssessments}
                  className="flex items-center gap-1 rounded bg-rose-100 px-2 py-1 font-bold text-rose-800 hover:bg-rose-200"
                >
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            )}

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
                  {examsState.loading ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        Loading assessments...
                      </td>
                    </tr>
                  ) : !paginatedExams.length ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        {examsState.error ? 'Unable to load examinations.' : 'No examinations found.'}
                      </td>
                    </tr>
                  ) : (
                    paginatedExams.map(exam => {
                      const sub = subjectsState.data.find(s => s.id === exam.subject_id);
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
                                      setCorrectionPolicyExam(exam);
                                      setCorrectionMode(exam.correction_release_mode || 'after_close');
                                      setCorrectionReleaseAt(exam.corrections_release_at ? exam.corrections_release_at.slice(0, 16) : '');
                                    }}
                                    className="rounded border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-[#111A43] hover:bg-slate-50"
                                  >
                                    Corrections
                                  </button>
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

                              {exam.status === 'closed' && exam.correction_release_mode === 'manual' && !exam.corrections_released_at && (
                                <button disabled={savingAction} onClick={() => handleReleaseCorrections(exam)} className="rounded bg-[#C62839] px-2 py-1 text-[11px] font-bold text-white hover:bg-[#a82230] disabled:opacity-50">Release corrections</button>
                              )}

                              {exam.status === 'published' && (
                                <>
                                  <button
                                    onClick={() => setIsNotifyingGuardians(exam)}
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
                    })
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
                Search enrolled student accounts from the verified registry to verify student credentials and examine eligibility.
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
                  {examsState.data.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                  {!examsState.data.length && <option value="">No examinations available</option>}
                </select>
              </div>

              <button
                onClick={() => fetchResults(selectedExamForResults)}
                disabled={resultsState.loading}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <RefreshCw size={13} className={resultsState.loading ? 'animate-spin' : ''} />
                <span>Refresh Results</span>
              </button>
            </div>

            {/* Error Banner */}
            {resultsState.error && (
              <div className="shrink-0 flex items-center justify-between border-b border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{resultsState.error}</span>
                </div>
                <button
                  onClick={() => fetchResults(selectedExamForResults)}
                  className="flex items-center gap-1 rounded bg-rose-100 px-2 py-1 font-bold text-rose-800 hover:bg-rose-200"
                >
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Analytics KPI Ribbon (Derived purely from authentic database records) */}
            {resultsAnalytics && (
              <div className="grid shrink-0 grid-cols-2 gap-2 border-b border-slate-200 bg-slate-50/40 p-3 sm:grid-cols-4">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] text-slate-500">Submitted Attempts</p>
                  <p className="text-base font-extrabold text-[#111A43]">{resultsAnalytics.totalSubmitted}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] text-slate-500">Average Score</p>
                  <p className="text-base font-extrabold text-[#111A43]">
                    {resultsAnalytics.averageScore !== null ? resultsAnalytics.averageScore : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] text-slate-500">Score Range (Min - Max)</p>
                  <p className="text-base font-extrabold text-[#111A43]">
                    {resultsAnalytics.lowestScore !== null && resultsAnalytics.highestScore !== null
                      ? `${resultsAnalytics.lowestScore} – ${resultsAnalytics.highestScore}`
                      : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <p className="text-[10px] text-slate-500">
                    Pass Rate (≥ {stationSettings.defaultPassMark}%)
                  </p>
                  <p className="text-base font-extrabold text-emerald-700">
                    {resultsAnalytics.passRate !== null ? `${resultsAnalytics.passRate}%` : '—'}
                  </p>
                </div>
              </div>
            )}

            {/* Results Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {resultsState.loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading assessment results...</div>
              ) : !resultsState.data?.results?.length ? (
                <div className="p-12 text-center text-slate-400">
                  <Award size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    {resultsState.error ? 'Results unavailable.' : 'No submitted attempts recorded yet.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {resultsState.error
                      ? 'Check your staff permissions or retry loading the assessment results.'
                      : 'Results appear here once enrolled candidates begin and submit their CBT examination sessions.'}
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Candidate</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Total Questions</th>
                      <th className="py-2.5 px-3">Percentage</th>
                      <th className="py-2.5 px-3">Submission Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {resultsState.data.results.map((r, i) => {
                      const hasQuestions = r.total_questions !== null && r.total_questions > 0;
                      const pct = hasQuestions && r.score !== null ? Math.round((r.score / (r.total_questions as number)) * 100) : null;
                      return (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-[#111A43]">{r.student_name || 'Enrolled Candidate'}</p>
                            <p className="font-mono text-[10px] text-slate-400">{r.student_account_id}</p>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-[#111A43]">{r.score ?? '—'}</td>
                          <td className="py-2.5 px-3 text-slate-600">{r.total_questions ?? '—'}</td>
                          <td className="py-2.5 px-3">
                            {pct !== null ? (
                              <span
                                className={`inline-flex rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  pct >= stationSettings.defaultPassMark
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {pct}%
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
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
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-6">
            <div className="max-w-3xl space-y-4">
              <div>
                <h2 className="text-base font-bold text-[#111A43]">CBT Administration Policies &amp; Settings</h2>
                <p className="text-xs text-slate-500">
                  Delineation between database-enforced examination rules, locally stored station preferences, and capabilities awaiting schema extension.
                </p>
              </div>

              {settingsNotice && (
                <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{settingsNotice}</span>
                </div>
              )}

              {/* Category A: Database-Enforced Policies (Per Examination) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-[#111A43]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#111A43]">
                    1. Database-Enforced Examination Policies
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  These policies are structurally enforced at the database level by PostgreSQL constraints and server functions:
                </p>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <p className="font-semibold text-slate-800">Single Attempt per Candidate</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enforced by <code>UNIQUE (assessment_id, student_account_id)</code> in <code>upec_assessment_attempts</code>.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <p className="font-semibold text-slate-800">Server-Authoritative Duration</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enforced by <code>upec_begin_assessment</code>. Attempt expires at <code>now() + duration_minutes</code>.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <p className="font-semibold text-slate-800">Opening &amp; Closing Windows</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enforced by <code>opens_at</code> and <code>closes_at</code> database checks. Starts outside the window fail.
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                    <p className="font-semibold text-slate-800">Candidate Eligibility Control</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Enforced by <code>upec_assessment_eligibility</code> table when restricted mode is activated.
                    </p>
                  </div>
                </div>
              </div>

              {/* Category B: Station Preferences (Persisted in localStorage) */}
              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Settings size={16} className="text-[#C62839]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#C62839]">
                    2. Administrative Station Preferences
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500">
                  Settings persisted in browser storage (<code>localStorage</code>) across sessions for this administrative terminal:
                </p>

                <form onSubmit={handleSaveStationSettings} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block space-y-1 font-semibold text-slate-700">
                      <span>Default Pass Mark (%) for Analytics</span>
                      <input
                        type="number"
                        min={10}
                        max={100}
                        value={stationSettings.defaultPassMark}
                        onChange={e =>
                          setStationSettings(v => ({ ...v, defaultPassMark: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-slate-200 p-2 focus:border-[#111A43] focus:outline-hidden"
                      />
                      <span className="text-[10px] font-normal text-slate-400">
                        Used to calculate pass rate percentages in the Results &amp; Analytics tab.
                      </span>
                    </label>

                    <label className="block space-y-1 font-semibold text-slate-700">
                      <span>Default Duration (Minutes) Prefill</span>
                      <input
                        type="number"
                        min={10}
                        max={240}
                        value={stationSettings.defaultDurationMinutes}
                        onChange={e =>
                          setStationSettings(v => ({ ...v, defaultDurationMinutes: Number(e.target.value) }))
                        }
                        className="w-full rounded-lg border border-slate-200 p-2 focus:border-[#111A43] focus:outline-hidden"
                      />
                      <span className="text-[10px] font-normal text-slate-400">
                        Automatically populates the duration field when drafting new assessments.
                      </span>
                    </label>
                  </div>

                  <label className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      checked={stationSettings.enforceFocusNotice}
                      onChange={e => setStationSettings(v => ({ ...v, enforceFocusNotice: e.target.checked }))}
                      className="rounded border-slate-300 text-[#111A43]"
                    />
                    <span className="font-medium text-slate-700">
                      Display browser focus loss guidance banner on student assessment screen
                    </span>
                  </label>

                  <button
                    type="submit"
                    className="rounded-lg bg-[#111A43] px-4 py-2 font-bold text-white hover:bg-[#1c2965] transition"
                  >
                    Save Station Preferences
                  </button>
                </form>
              </div>

              {/* Category C: Features Requiring Database Extension */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-amber-700" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    3. Features Requiring Database Schema Extensions (Not Enforced)
                  </h3>
                </div>
                <p className="text-[11px] text-amber-800">
                  The following capabilities require database migration approval before they can be enforced by the examination engine:
                </p>
                <ul className="list-disc pl-5 text-xs text-amber-900 space-y-1">
                  <li>
                    <strong>Randomized Question Permutation:</strong> Requires <code>shuffle_questions boolean</code> in{' '}
                    <code>upec_assessments</code> and student assessment API query randomization.
                  </li>
                  <li>
                    <strong>Randomized Multiple Choice Options:</strong> Requires server-side permutation of options A–D in the student retrieval endpoint.
                  </li>
                  <li>
                    <strong>Withhold Score Disclosure:</strong> Requires <code>hide_results_until_closed boolean</code> in{' '}
                    <code>upec_assessments</code> and updating <code>upec_submit_assessment</code>.
                  </li>
                  <li>
                    <strong>Candidate Live Heartbeat &amp; Tab-Switch Interception:</strong> Requires the proposed{' '}
                    <code>upec_assessment_telemetry</code> table and heartbeat logging route.
                  </li>
                </ul>
              </div>
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
                  {examsState.data.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.status})
                    </option>
                  ))}
                  {!examsState.data.length && <option value="">No examinations created</option>}
                </select>

                <button
                  onClick={() => fetchLiveAttempts(monitoringExamId)}
                  disabled={attemptsState.loading}
                  className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <RefreshCw size={13} className={attemptsState.loading ? 'animate-spin' : ''} />
                  <span>Refresh Sessions</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-slate-600">
                  {attemptsState.data.length} Session(s) Recorded
                </span>
              </div>
            </div>

            {/* Error Banner */}
            {attemptsState.error && (
              <div className="shrink-0 flex items-center justify-between border-b border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{attemptsState.error}</span>
                </div>
                <button
                  onClick={() => fetchLiveAttempts(monitoringExamId)}
                  className="flex items-center gap-1 rounded bg-rose-100 px-2 py-1 font-bold text-rose-800 hover:bg-rose-200"
                >
                  <RotateCcw size={12} /> Retry
                </button>
              </div>
            )}

            {/* Honest Telemetry Notice Banner */}
            <div className="shrink-0 border-b border-amber-200 bg-amber-50/70 px-4 py-2 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Honest Telemetry Notice: </span>
                Real-time per-second heartbeat and client tab-switch detection require the proposed Supabase telemetry extension (
                <code className="font-mono font-semibold">upec_assessment_telemetry</code> table). The monitor below displays authentic server-recorded session lifecycle timestamps (
                <code className="font-mono">started_at</code>, <code className="font-mono">expires_at</code>, <code className="font-mono">submitted_at</code>) from the database. Examination results are never used as a substitute for active sessions.
              </div>
            </div>

            {/* Attempts Live Table */}
            <div className="min-h-0 flex-1 overflow-y-auto">
              {attemptsState.loading ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading session attempts...</div>
              ) : !attemptsState.data.length ? (
                <div className="p-12 text-center text-slate-400">
                  <Radio size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-semibold text-slate-600">
                    {attemptsState.error ? 'Session data unavailable.' : 'No active or recorded attempts found for this examination.'}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {attemptsState.error
                      ? 'Please check your staff permissions or retry loading candidate sessions.'
                      : 'When enrolled candidates click "Start Assessment" in their portal, their attempts will appear here.'}
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
                    {attemptsState.data.map(attempt => {
                      const isSubmitted = Boolean(attempt.submitted_at);
                      const isOverdueFinalized =
                        isSubmitted &&
                        attempt.submitted_at === attempt.expires_at &&
                        attempt.score === 0;
                      const isExpired = !isSubmitted && new Date(attempt.expires_at).getTime() < Date.now();

                      return (
                        <tr key={attempt.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-[#111A43]">
                              {attempt.student_name || 'Enrolled Candidate'}
                            </p>
                            <p className="font-mono text-[10px] text-slate-400">{attempt.student_account_id}</p>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {attempt.started_at ? new Date(attempt.started_at).toLocaleTimeString() : '—'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {attempt.expires_at ? new Date(attempt.expires_at).toLocaleTimeString() : '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            {isOverdueFinalized ? (
                              <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                                Expired (Auto-Finalized)
                              </span>
                            ) : isSubmitted ? (
                              <span className="inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                Submitted
                              </span>
                            ) : isExpired ? (
                              <span className="inline-flex rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                                Time Expired (Unsubmitted)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                                <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-ping" />
                                In Progress
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-[#111A43]">
                            {isSubmitted && attempt.score !== null && attempt.total_questions !== null
                              ? `${attempt.score} / ${attempt.total_questions}`
                              : '—'}
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
              <h2 className="text-base font-bold text-[#111A43]">{editingQuestion ? 'Edit Question' : 'Add Question to Bank'}</h2>
              <button
                type="button"
                onClick={() => { setIsCreatingQuestion(false); setEditingQuestion(null); }}
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
                {subjectsState.data.map(s => (
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


            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate-700">Topic
                <input value={questionForm.topic} onChange={e => setQuestionForm(v => ({ ...v, topic: e.target.value }))} placeholder="e.g. Algebra" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Subtopic
                <input value={questionForm.subtopic} onChange={e => setQuestionForm(v => ({ ...v, subtopic: e.target.value }))} placeholder="e.g. Linear equations" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
              </label>
              <label className="block text-xs font-semibold text-slate-700">Question type
                <select value="single_choice" disabled className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-600">
                  <option value="single_choice">Single-answer MCQ</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">Difficulty
                <select value={questionForm.difficulty} onChange={e => setQuestionForm(v => ({ ...v, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                  <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">Exam type
                <select value={questionForm.examType} onChange={e => setQuestionForm(v => ({ ...v, examType: e.target.value }))} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                  <option value="">Not specified</option><option value="JAMB">JAMB / UTME</option><option value="WAEC">WAEC</option><option value="NECO">NECO</option><option value="IJMB">IJMB</option><option value="POST-UTME">Post-UTME</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">Exam year
                <input type="number" min="1950" max="2100" value={questionForm.examYear} onChange={e => setQuestionForm(v => ({ ...v, examYear: e.target.value }))} placeholder="e.g. 2024" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
              </label>
            </div>
            <label className="block text-xs font-semibold text-slate-700">Worked solution steps
              <textarea rows={4} value={questionForm.solutionSteps} onChange={e => setQuestionForm(v => ({ ...v, solutionSteps: e.target.value }))} placeholder="Show the full method, calculations and reasoning step by step..." className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
            </label>

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


      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-3">
          <form onSubmit={handleBulkQuestionImport} className="max-h-[90dvh] w-full max-w-3xl space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h2 className="text-base font-bold text-[#111A43]">Import Questions in Bulk</h2>
                <p className="mt-1 text-[11px] text-slate-500">Paste CSV content. Imported questions remain drafts until reviewed and published.</p>
              </div>
              <button type="button" onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <div className="rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600">
              Required headers: <b>prompt, optionA, optionB, optionC, optionD, correctOption</b>. Optional: subjectId, explanation, questionType, topic, subtopic, difficulty, examType, examYear, solutionSteps, sourceName, sourceReference, sourceLicense. If subjectId is omitted, select a subject filter before importing.
            </div>
            <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600 hover:border-[#111A43]">
              <span><strong className="block text-[#111A43]">Choose a CSV file</strong><span className="text-[10px] text-slate-500">Upload a prepared question spreadsheet exported as .csv, or paste below.</span></span>
              <span className="shrink-0 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold">Browse file</span>
              <input type="file" accept=".csv,text/csv" className="sr-only" onChange={async e => { const file=e.target.files?.[0]; if(!file)return; if(file.size>2*1024*1024){notify('CSV file must be 2 MB or smaller.','error');e.target.value='';return;} try { const content=await file.text(); parseQuestionCsv(content); setBulkCsv(content); notify(file.name+' loaded and validated.','success'); } catch(err:any) { notify(err.message||'Could not read CSV file.','error'); } e.target.value=''; }} />
            </label>
            <textarea required rows={12} value={bulkCsv} onChange={e => setBulkCsv(e.target.value)} placeholder={'prompt,optionA,optionB,optionC,optionD,correctOption,explanation,topic,difficulty,examType,examYear,solutionSteps\\n"Find x if 2x + 4 = 10","2","3","4","5","B","Subtract 4, then divide by 2","Linear equations","easy","JAMB",2024,"2x=6; x=3"} className="w-full rounded-lg border border-slate-200 p-3 font-mono text-xs" />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setIsBulkImportOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600">Cancel</button>
              <button type="submit" disabled={savingAction || !bulkCsv.trim()} className="rounded-lg bg-[#C62839] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">{savingAction ? 'Importing...' : 'Validate & Import'}</button>
            </div>
          </form>
        </div>
      )}


      {isPdfExtractOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-3">
          <div className="max-h-[94dvh] w-full max-w-5xl space-y-4 overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#111A43]">Extract questions from a document</h2>
                <p className="mt-1 text-xs text-slate-500">PDFs and DOCX files are supported. Extraction creates editable candidates only; nothing enters the bank until you review and import it.</p>
              </div>
              <button type="button" onClick={() => setIsPdfExtractOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18}/></button>
            </div>
            <form onSubmit={extractPdfQuestions} className="grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="text-xs font-semibold text-slate-700 sm:col-span-2">
                PDF or Word question paper (DOCX, max 12 MB)
                <input type="file" accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={e => setPdfFile(e.target.files?.[0] || null)} className="mt-1 block w-full rounded-lg border border-slate-200 bg-white p-2 text-xs font-normal"/>
                {pdfFile && <span className="mt-1 block text-[10px] text-slate-500">{pdfFile.name} · {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>}
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Destination subject
                <select value={pdfSubjectId || (selectedSubjectFilter !== 'all' ? selectedSubjectFilter : '')} onChange={e => setPdfSubjectId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs">
                  <option value="">Choose subject</option>
                  {subjectsState.data.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="text-xs font-semibold text-slate-700">
                  Exam type
                  <select value={pdfExamType} onChange={e => setPdfExamType(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs">
                    {['JAMB','WAEC','NECO','IJMB','Post-UTME','Other'].map(x => <option key={x}>{x}</option>)}
                  </select>
                </label>
                <label className="text-xs font-semibold text-slate-700">
                  Year (optional)
                  <input type="number" min="1950" max="2100" value={pdfExamYear} onChange={e => setPdfExamYear(e.target.value)} placeholder="e.g. 2024" className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"/>
                </label>
              </div>
              <div className="flex items-end sm:col-span-2 lg:col-span-4">
                <button type="submit" disabled={pdfExtracting || !pdfFile} className="rounded-lg bg-[#111A43] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
                  {pdfExtracting ? 'Extracting document…' : 'Extract question candidates'}
                </button>
              </div>
            </form>
            {pdfCandidates.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div><h3 className="text-sm font-bold text-[#111A43]">Review extracted questions ({pdfCandidates.length})</h3><p className="text-[11px] text-slate-500">Check every prompt, option and answer against the original paper. Unconfirmed answers cannot be imported.</p></div>
                  <button type="button" onClick={importReviewedPdfQuestions} disabled={savingAction || pdfCandidates.some(q => !['A','B','C','D'].includes(q.correctOption))} className="rounded-lg bg-[#C62839] px-4 py-2 text-xs font-bold text-white disabled:opacity-40">{savingAction ? 'Importing…' : 'Import reviewed drafts'}</button>
                </div>
                {pdfCandidates.map((q, index) => (
                  <section key={index} className="space-y-2 rounded-xl border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-2"><div><span className="text-xs font-bold text-[#111A43]">Question {index + 1}</span><span className="ml-2 text-[10px] text-amber-700">{q.reviewNotes || 'Verify against source'}</span></div><button type="button" onClick={() => setPdfCandidates(current => current.filter((_, i) => i !== index))} className="shrink-0 text-[10px] font-semibold text-rose-600 hover:underline">Remove</button></div>
                    <textarea value={q.prompt} onChange={e => updatePdfCandidate(index, 'prompt', e.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 p-2 text-xs" aria-label={'Question '+(index+1)+' prompt'}/>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {(['A','B','C','D'] as const).map(letter => <label key={letter} className="text-[10px] font-semibold text-slate-600">{letter}<input value={q.options[letter]} onChange={e => updatePdfCandidate(index, 'options', {...q.options,[letter]:e.target.value})} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"/></label>)}
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <label className="text-[10px] font-semibold text-slate-600">Correct answer<select value={q.correctOption || ''} onChange={e => updatePdfCandidate(index,'correctOption',e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"><option value="">Needs verification</option>{['A','B','C','D'].map(x=><option key={x}>{x}</option>)}</select></label>
                      <label className="text-[10px] font-semibold text-slate-600">Topic<input value={q.topic || ''} onChange={e=>updatePdfCandidate(index,'topic',e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"/></label>
                      <label className="text-[10px] font-semibold text-slate-600">Difficulty<select value={q.difficulty || 'medium'} onChange={e=>updatePdfCandidate(index,'difficulty',e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select></label>
                    </div>
                    {q.diagramDescription && <label className="block text-[10px] font-semibold text-slate-600">Diagram / figure description<textarea value={q.diagramDescription} onChange={e=>updatePdfCandidate(index,'diagramDescription',e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"/></label>}
                    <label className="block text-[10px] font-semibold text-slate-600">Explanation<textarea value={q.explanation || ''} onChange={e=>updatePdfCandidate(index,'explanation',e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"/></label>
                    <label className="block text-[10px] font-semibold text-slate-600">Worked solution<textarea value={q.solutionSteps || ''} onChange={e=>updatePdfCandidate(index,'solutionSteps',e.target.value)} rows={2} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal"/></label>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {isProviderImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3">
          <div className="max-h-[92dvh] w-full max-w-5xl space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#111A43]">External Past-Question Providers</h2>
                <p className="mt-1 text-[11px] text-slate-500">Preview provider content, select questions and import them into the UPEC bank as drafts.</p>
              </div>
              <button type="button" onClick={() => setIsProviderImportOpen(false)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={fetchProviderPreview} className="grid grid-cols-2 gap-2 md:grid-cols-5">
              <label className="text-[11px] font-semibold text-slate-600">Provider
                <select value={providerName} onChange={e => setProviderName(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                  <option value="auto">Automatic fallback</option><option value="aloc">ALOC Station</option><option value="sdashapi">SdashAPI</option>
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">Exam
                <select value={providerExam} onChange={e => setProviderExam(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                  <option value="utme">JAMB / UTME</option><option value="waec">WAEC</option><option value="neco">NECO</option><option value="post-utme">Post-UTME</option>
                </select>
              </label>
              <label className="text-[11px] font-semibold text-slate-600">Provider subject slug
                <input required value={providerSubject} onChange={e => setProviderSubject(e.target.value)} placeholder="mathematics" className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
              </label>
              <label className="text-[11px] font-semibold text-slate-600">Year
                <input required type="number" min="1990" max="2030" value={providerYear} onChange={e => setProviderYear(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs" />
              </label>
              <button disabled={providerLoading} className="self-end rounded-lg bg-[#111A43] px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{providerLoading ? 'Loading...' : 'Fetch Questions'}</button>
            </form>
            <label className="block max-w-sm text-[11px] font-semibold text-slate-600">Save under UPEC subject
              <select required value={providerTargetSubject} onChange={e => setProviderTargetSubject(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs">
                <option value="">Choose destination subject</option>
                {subjectsState.data.map(subject => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            {providerPreview.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{providerSelected.length} of {providerPreview.length} selected</span>
                  <button type="button" onClick={() => setProviderSelected(providerSelected.length === providerPreview.length ? [] : providerPreview.map((_: any, i: number) => i))} className="font-semibold text-[#111A43]">{providerSelected.length === providerPreview.length ? 'Clear selection' : 'Select all'}</button>
                </div>
                <div className="max-h-[42dvh] space-y-2 overflow-y-auto">
                  {providerPreview.map((q: any, index: number) => (
                    <label key={q.providerId + '-' + index} className="flex gap-3 rounded-xl border border-slate-200 p-3 text-xs">
                      <input type="checkbox" checked={providerSelected.includes(index)} onChange={e => setProviderSelected(old => e.target.checked ? [...old, index] : old.filter(x => x !== index))} className="mt-1" />
                      <span className="min-w-0 flex-1">
                        <span className="font-semibold text-slate-800">{index + 1}. {q.prompt}</span>
                        <span className="mt-2 grid grid-cols-1 gap-1 text-slate-600 sm:grid-cols-2">
                          {(['A','B','C','D'] as const).map(key => <span key={key}>{key}. {q.options?.[key]}</span>)}
                        </span>
                        <span className="mt-2 block text-[11px] text-emerald-700">Answer: {q.correctOption} · {q.sourceProvider} · {q.examYear || providerYear}</span>
                        {q.explanation && <span className="mt-1 block text-[11px] text-slate-500">Explanation: {q.explanation}</span>}
                      </span>
                    </label>
                  ))}
                </div>
                <div className="flex justify-end">
                  <button type="button" disabled={providerLoading || !providerSelected.length} onClick={importProviderSelection} className="rounded-lg bg-[#C62839] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">Import selected as drafts ({providerSelected.length})</button>
                </div>
              </div>
            ) : <p className="rounded-lg bg-slate-50 p-4 text-xs text-slate-500">No preview loaded. Fetch questions to review available content.</p>}
            <p className="text-[10px] leading-relaxed text-slate-400">Provider credentials remain on the API server. Review provider terms and content rights before publishing or retaining imported material.</p>
          </div>
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
                  {subjectsState.data.map(s => (
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
          <form onSubmit={handleSaveSchedule} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl">
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
                              isAdded ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-[#111A43] text-white'
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

      {correctionPolicyExam && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3">
          <form onSubmit={e => { e.preventDefault(); void handleSaveCorrectionPolicy(); }} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-[#111A43]">Correction release policy</h2>
              <button type="button" onClick={() => setCorrectionPolicyExam(null)} className="text-slate-400 hover:text-slate-700"><X size={18} /></button>
            </div>
            <p className="text-xs text-slate-500">{correctionPolicyExam.title}</p>
            <label className="block text-xs font-semibold text-slate-700">When should candidates see corrections?
              <select value={correctionMode} onChange={e => setCorrectionMode(e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm">
                <option value="after_close">Automatically after the examination closes</option>
                <option value="scheduled">At a scheduled date and time after closing</option>
                <option value="manual">Only when an administrator releases them</option>
              </select>
            </label>
            {correctionMode === 'scheduled' && <label className="block text-xs font-semibold text-slate-700">Correction release date and time
              <input required type="datetime-local" value={correctionReleaseAt} onChange={e => setCorrectionReleaseAt(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 text-sm" />
            </label>}
            <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">Correct answers and explanations stay hidden during the examination. Even after the closing time, release waits until no candidate has an active attempt.</p>
            <button type="submit" disabled={savingAction || (correctionMode === 'scheduled' && !correctionReleaseAt)} className="w-full rounded-lg bg-[#111A43] p-2.5 text-sm font-bold text-white disabled:opacity-50">{savingAction ? 'Saving…' : 'Save correction policy'}</button>
          </form>
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
              Emails will be queued to the institutional outbox (<code>upec_email_outbox</code>) and in-app alerts posted to candidate portals. Background worker delivers queued outbox emails.
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