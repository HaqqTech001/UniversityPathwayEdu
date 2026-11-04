import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Edit2,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Layers,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserCheck,
  Users,
  X,
} from 'lucide-react';

type Area = 'Programmes' | 'Subjects' | 'Timetable' | 'Attendance' | 'Assignments';
type AcademicRecord = {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  details: Record<string, string>;
};

const sections = [
  { name: 'Programmes' as const, icon: GraduationCap, description: 'Academic pathways, degrees, and certificate programmes' },
  { name: 'Subjects' as const, icon: BookOpen, description: 'Curriculum courses, modules, and subject offerings' },
  { name: 'Timetable' as const, icon: CalendarDays, description: 'Cohort schedules, weekly periods, and lecture matrices' },
  { name: 'Attendance' as const, icon: ClipboardCheck, description: 'Class attendance tracking and session logs' },
  { name: 'Assignments' as const, icon: FileText, description: 'Coursework tasks, submission deadlines, and evaluation' },
];

const fieldMap: Record<string, { key: string; label: string; type: string; optional?: boolean }[]> = {
  Attendance: [
    { key: 'programme_id', label: 'Programme', type: 'programme' },
    { key: 'learning_mode', label: 'Learning mode', type: 'mode' },
    { key: 'student_id', label: 'Student', type: 'student' },
    { key: 'attendance_date', label: 'Date', type: 'date' },
    { key: 'status', label: 'Attendance status', type: 'attendance' },
    { key: 'notes', label: 'Notes', type: 'text', optional: true },
  ],
  Assignments: [
    { key: 'programme_id', label: 'Programme', type: 'programme' },
    { key: 'learning_mode', label: 'Learning mode', type: 'mode' },
    { key: 'subject_id', label: 'Subject', type: 'subject' },
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'instructions', label: 'Instructions', type: 'text', optional: true },
    { key: 'due_at', label: 'Due date', type: 'datetime-local' },
    { key: 'status', label: 'Publication status', type: 'assignment' },
  ],
};

const toast = (message: string, kind: 'info' | 'error' | 'success' = 'info') =>
  window.dispatchEvent(new CustomEvent('upec-admin-toast', { detail: { message, kind } }));

export default function AdminAcademicPage() {
  const [activeTab, setActiveTab] = useState<'overview' | Area>('overview');
  const [selected, setSelected] = useState<AcademicRecord | null>(null);
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [programmeFilter, setProgrammeFilter] = useState('All');
  const [refreshCount, setRefreshCount] = useState(0);

  const [catalogue, setCatalogue] = useState<{ programmes: any[]; subjects: any[] }>({
    programmes: [],
    subjects: [],
  });
  const [loading, setLoading] = useState(true);
  const [academicData, setAcademicData] = useState<Record<string, any[]>>({});
  const [error, setError] = useState('');

  // Editing state
  const [editing, setEditing] = useState<AcademicRecord | null | undefined>(undefined);
  const [form, setForm] = useState({ name: '', code: '', description: '', programmeId: '', active: true });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [otherForm, setOtherForm] = useState<Record<string, string | number | boolean>>({});

  // Student roster for attendance
  const [students, setStudents] = useState<{ id: string; name: string; programme: string; photoUrl?: string | null }[]>([]);
  const [studentPicker, setStudentPicker] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [attendanceStudent, setAttendanceStudent] = useState<string | null>(null);

  // Timetable plans and matrix state
  const [timetableClass, setTimetableClass] = useState('');
  const [timetablePlans, setTimetablePlans] = useState<any[]>([]);
  const [planModal, setPlanModal] = useState(false);
  const [planEditing, setPlanEditing] = useState<any>(null);
  const [planForm, setPlanForm] = useState({ programme_id: '', learning_mode: 'physical', title: '', description: '' });
  const [timetableMode, setTimetableMode] = useState('physical');
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [timetableSaving, setTimetableSaving] = useState(false);
  const [timetableDraft, setTimetableDraft] = useState<Record<string, string>>({});

  const request = async (path: string, init: RequestInit = {}) => {
    const token = sessionStorage.getItem('upec_staff_token');
    if (!token) throw Error('Please sign in to the staff portal.');
    const response = await fetch(
      (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api/staff/academic' + path,
      {
        ...init,
        headers: {
          Authorization: 'Bearer ' + token,
          ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        },
      }
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw Error(data.error || 'Academic request failed.');
    return data;
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      request('/catalogue'),
      request('/attendance/students'),
      request('/timetable-plans'),
      ...['timetable', 'attendance', 'assignments'].map((key) =>
        request('/' + key).then((data) => ({ key, records: data.records || [] }))
      ),
    ])
      .then(([data, roster, plans, ...lists]) => {
        if (active) {
          setTimetablePlans(plans.plans || []);
          setStudents(roster.students || []);
          setCatalogue({ programmes: data.programmes || [], subjects: data.subjects || [] });
          setAcademicData(Object.fromEntries(lists.map((item) => [item.key, item.records])));
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshCount]);

  const currentArea = activeTab === 'overview' ? null : (activeTab as Area);
  const resourceKey = currentArea?.toLowerCase() || '';

  const records: AcademicRecord[] = useMemo(() => {
    if (!currentArea) return [];
    const source =
      currentArea === 'Programmes'
        ? catalogue.programmes
        : currentArea === 'Subjects'
        ? catalogue.subjects
        : academicData[resourceKey] || [];
    return source.map((item) => ({
      id: item.id,
      title: item.name || item.title || item.attendance_date || item.starts_at || 'Record',
      subtitle: item.code || item.stream || item.status || '',
      status: item.active === false ? 'Inactive' : item.status || 'Active',
      details: Object.fromEntries(
        Object.entries(item)
          .filter(([key]) => key !== 'id')
          .map(([key, value]) => [key, String(value ?? '')])
      ),
    }));
  }, [currentArea, catalogue, academicData, resourceKey]);

  const beginEdit = (item?: AcademicRecord) => {
    setEditing(item || null);
    setOtherForm(
      item
        ? Object.fromEntries(
            Object.entries(item.details)
              .filter(([key]) => !['created_at', 'class_id'].includes(key))
              .map(([key, value]) => [key, key === 'due_at' && value ? value.slice(0, 16) : value])
          )
        : {}
    );
    setForm({
      name: item?.details.name || item?.title || '',
      code: item?.details.code || item?.subtitle || '',
      description: item?.details.description || '',
      programmeId: item?.details.programme_id || catalogue.programmes[0]?.id || '',
      active: item?.status !== 'Inactive',
    });
  };

  const save = async () => {
    if (!currentArea) return;
    if (currentArea === 'Subjects' && !form.programmeId) {
      toast('Create a programme before adding subjects.', 'error');
      return;
    }
    setSaving(true);
    try {
      if (
        currentArea !== 'Programmes' &&
        currentArea !== 'Subjects' &&
        fieldMap[currentArea]?.some((field) => !field.optional && !String(otherForm[field.key] ?? '').trim())
      ) {
        toast('Complete all required fields.', 'error');
        return;
      }
      const resource = resourceKey;
      const body =
        currentArea === 'Programmes' || currentArea === 'Subjects'
          ? {
              name: form.name.trim(),
              code:
                currentArea === 'Subjects' &&
                !/IJMB/i.test(catalogue.programmes.find((p) => p.id === form.programmeId)?.name || '')
                  ? null
                  : form.code.trim().toUpperCase(),
              description: form.description.trim(),
              active: form.active,
              ...(currentArea === 'Subjects' ? { programmeId: form.programmeId } : {}),
            }
          : Object.fromEntries(
              Object.entries(otherForm)
                .filter(([key, value]) => !['id', 'created_at', 'class_id'].includes(key) && value !== '' && value !== null)
                .map(([key, value]) => [
                  key,
                  key === 'weekday' ? Number(value) : key === 'due_at' ? new Date(String(value)).toISOString() : value,
                ])
            );
      await request('/' + resource + (editing?.id ? '/' + editing.id : ''), {
        method: editing?.id ? 'PATCH' : 'POST',
        body: JSON.stringify(body),
      });
      toast('Academic record saved.', 'success');
      setEditing(undefined);
      setSelected(null);
      setRefreshCount((n) => n + 1);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: AcademicRecord) => {
    if (!currentArea || !window.confirm('Delete ' + item.title + ' permanently?')) return;
    setDeleting(true);
    try {
      await request('/' + resourceKey + '/' + item.id, { method: 'DELETE' });
      toast('Academic record deleted.', 'success');
      setSelected(null);
      setRefreshCount((n) => n + 1);
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const matchesProgramme =
        programmeFilter === 'All' ||
        item.details.programme_id === programmeFilter ||
        item.details.programme === programmeFilter;
      const matchesQuery =
        !query.trim() ||
        [item.title, item.subtitle, ...Object.values(item.details)].some((value) =>
          String(value || '').toLowerCase().includes(query.trim().toLowerCase())
        );
      return matchesStatus && matchesProgramme && matchesQuery;
    });
  }, [records, query, statusFilter, programmeFilter]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setPage(1);
  }, [query, statusFilter, programmeFilter, pageSize]);

  const activePlan = timetablePlans.find((plan) => plan.id === timetableClass);
  const timetableRows = (academicData.timetable || []).filter((row) => row.plan_id === timetableClass);
  const timetableCell = (day: number, period: number) =>
    timetableRows.find((row) => row.weekday === day && row.period === period);
  const timetableValue = (day: number, period: number) =>
    timetableDraft[day + '-' + period] ?? timetableCell(day, period)?.subject_id ?? '';

  const saveTimetable = async () => {
    if (!timetableClass) {
      toast('Open a timetable first.', 'error');
      return;
    }
    setTimetableSaving(true);
    try {
      const rows = Object.entries(timetableDraft);
      for (const [key, subjectId] of rows) {
        const [weekday, period] = key.split('-').map(Number);
        const old = timetableCell(weekday, period);
        if (old && subjectId !== old.subject_id) {
          if (!subjectId) await request('/timetable/' + old.id, { method: 'DELETE' });
          else await request('/timetable/' + old.id, { method: 'PATCH', body: JSON.stringify({ subject_id: subjectId }) });
        } else if (!old && subjectId) {
          const startHour = 8 + period - 1;
          await request('/timetable', {
            method: 'POST',
            body: JSON.stringify({
              plan_id: timetableClass,
              subject_id: subjectId,
              weekday,
              period,
              learning_mode: timetableMode,
              starts_at: String(startHour).padStart(2, '0') + ':00',
              ends_at: String(startHour + 1).padStart(2, '0') + ':00',
            }),
          });
        }
      }
      setTimetableDraft({});
      setRefreshCount((v) => v + 1);
      toast('Timetable saved successfully.', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
      setRefreshCount((v) => v + 1);
    } finally {
      setTimetableSaving(false);
    }
  };

  const savePlan = async () => {
    if (!planForm.programme_id || !planForm.title.trim() || planForm.description.trim().length < 5) {
      toast('Select programme and complete title and description.', 'error');
      return;
    }
    setTimetableSaving(true);
    try {
      await request('/timetable-plans' + (planEditing ? '/' + planEditing.id : ''), {
        method: planEditing ? 'PATCH' : 'POST',
        body: JSON.stringify(planEditing ? { title: planForm.title, description: planForm.description } : planForm),
      });
      setPlanModal(false);
      setPlanEditing(null);
      setRefreshCount((v) => v + 1);
      toast('Timetable details saved.', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setTimetableSaving(false);
    }
  };

  const deletePlan = async (plan: any) => {
    if (!window.confirm('Delete ' + plan.title + ' and all its timetable periods?')) return;
    try {
      await request('/timetable-plans/' + plan.id, { method: 'DELETE' });
      setTimetableClass('');
      setTimetableOpen(false);
      setRefreshCount((v) => v + 1);
      toast('Timetable plan deleted.', 'success');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  const resetFilters = () => {
    setQuery('');
    setStatusFilter('All');
    setProgrammeFilter('All');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header with Title, Description, Academic Session selector, and Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-[#111A43] tracking-tight">Academic Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage academic programmes, subject curricula, timetables, attendance, and coursework assignments.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] shadow-xs">
            <Calendar size={14} className="text-[#c62839]" />
            <span>2025/2026 Academic Session</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">Current</span>
          </div>

          <button
            type="button"
            onClick={() => setRefreshCount((n) => n + 1)}
            aria-label="Refresh academic records"
            title="Refresh academic data"
            className="p-2.5 bg-white hover:bg-slate-50 text-[#111A43] rounded-xl border border-slate-200 shadow-xs transition-colors"
          >
            <RefreshCw size={15} />
          </button>

          {currentArea && (
            <button
              type="button"
              onClick={() => {
                if (currentArea === 'Timetable') {
                  setPlanEditing(null);
                  setPlanForm({ programme_id: catalogue.programmes[0]?.id || '', learning_mode: 'physical', title: '', description: '' });
                  setPlanModal(true);
                } else {
                  beginEdit();
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
            >
              <Plus size={15} />
              <span>{currentArea === 'Timetable' ? 'Create Timetable' : `Add ${currentArea.slice(0, -1)}`}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#111A43] text-white flex items-center justify-center shrink-0 shadow-xs">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-[#111A43]">{loading ? '—' : catalogue.programmes.length}</div>
            <div className="text-xs font-bold text-slate-700 truncate">Programmes</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active Pathways</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#c62839] text-white flex items-center justify-center shrink-0 shadow-xs">
            <BookOpen size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-[#111A43]">{loading ? '—' : catalogue.subjects.length}</div>
            <div className="text-xs font-bold text-slate-700 truncate">Subjects</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Curriculum Offerings</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#d5a75b] text-white flex items-center justify-center shrink-0 shadow-xs">
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-[#111A43]">{loading ? '—' : timetablePlans.length}</div>
            <div className="text-xs font-bold text-slate-700 truncate">Timetables</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active Cohort Plans</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ClipboardCheck size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-[#111A43]">{loading ? '—' : (academicData.attendance || []).length}</div>
            <div className="text-xs font-bold text-slate-700 truncate">Attendance</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Recorded Sessions</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex items-center gap-3 col-span-2 lg:col-span-1">
          <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileText size={22} />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-black text-[#111A43]">{loading ? '—' : (academicData.assignments || []).length}</div>
            <div className="text-xs font-bold text-slate-700 truncate">Assignments</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Active Coursework</div>
          </div>
        </div>
      </div>

      {/* 3. Sub-tabs Navigation Strip */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-xs font-bold text-slate-500 overflow-x-auto">
        <button
          type="button"
          onClick={() => {
            setActiveTab('overview');
            setSelected(null);
          }}
          className={`pb-3 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'text-[#c62839] border-b-2 border-[#c62839] font-extrabold'
              : 'hover:text-[#111A43]'
          }`}
        >
          Academic Overview
        </button>

        {sections.map((s) => (
          <button
            key={s.name}
            type="button"
            onClick={() => {
              setActiveTab(s.name);
              setSelected(null);
              setQuery('');
              setStatusFilter('All');
              setProgrammeFilter('All');
              setPage(1);
            }}
            className={`pb-3 transition-colors cursor-pointer shrink-0 ${
              activeTab === s.name
                ? 'text-[#c62839] border-b-2 border-[#c62839] font-extrabold'
                : 'hover:text-[#111A43]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setRefreshCount((n) => n + 1)} className="font-bold underline">
            Retry
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB CONTENT: OVERVIEW
          ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sections.map(({ name, icon: Icon, description }) => (
              <button
                key={name}
                type="button"
                onClick={() => {
                  setActiveTab(name);
                  setSelected(null);
                }}
                className="group p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-left hover:border-[#c62839] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8FC] group-hover:bg-red-50 text-[#111A43] group-hover:text-[#c62839] flex items-center justify-center transition-colors">
                      <Icon size={20} />
                    </div>
                    <span className="text-xs font-bold text-slate-400 group-hover:text-[#c62839] flex items-center gap-1">
                      Manage →
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-[#111A43] mt-3 group-hover:text-[#c62839] transition-colors">
                    {name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold mt-3">
                  <span>
                    {name === 'Programmes'
                      ? `${catalogue.programmes.length} Registered`
                      : name === 'Subjects'
                      ? `${catalogue.subjects.length} Courses`
                      : name === 'Timetable'
                      ? `${timetablePlans.length} Plans`
                      : name === 'Attendance'
                      ? `${(academicData.attendance || []).length} Records`
                      : `${(academicData.assignments || []).length} Tasks`}
                  </span>
                  <span className="text-[#111A43] font-bold">Open Module</span>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Roster & Programmes Summary Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-[#111A43]">Active Academic Programmes</h3>
                <p className="text-xs text-slate-500 mt-0.5">Approved university pathway curricula and certificate courses</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('Programmes')}
                className="text-xs font-bold text-[#c62839] hover:underline"
              >
                View All Programmes →
              </button>
            </div>

            <div className="mt-4 divide-y divide-slate-100 text-xs">
              {catalogue.programmes.slice(0, 5).map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <strong className="text-[#111A43] font-bold block text-sm">{p.name}</strong>
                    <span className="text-slate-400 font-mono text-[11px]">{p.code || 'CODE-TBD'}</span>
                    <span className="text-slate-500 ml-2">· {p.description || 'Institutional pathway'}</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                    Active
                  </span>
                </div>
              ))}
              {!catalogue.programmes.length && !loading && (
                <p className="py-8 text-center text-slate-400">No programmes registered yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB CONTENT: TIMETABLE MATRIX
          ========================================================================= */}
      {activeTab === 'Timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#111A43]">
                {timetableOpen ? `Schedule Matrix: ${activePlan?.title || 'Selected Timetable'}` : 'Timetable Plans'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {timetableOpen
                  ? `${catalogue.programmes.find((p) => p.id === activePlan?.programme_id)?.name || ''} · ${activePlan?.learning_mode || 'Physical'} Mode`
                  : 'Manage weekly lecture periods across academic cohorts and learning modes'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {timetableOpen && (
                <button
                  type="button"
                  onClick={() => {
                    setTimetableOpen(false);
                    setTimetableDraft({});
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#111A43] transition-colors"
                >
                  ← Back to Plans
                </button>
              )}

              {timetableOpen ? (
                <button
                  type="button"
                  onClick={() => void saveTimetable()}
                  disabled={timetableSaving || !Object.keys(timetableDraft).length}
                  className="px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {timetableSaving ? 'Saving…' : 'Save Timetable Changes'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPlanEditing(null);
                    setPlanForm({ programme_id: catalogue.programmes[0]?.id || '', learning_mode: 'physical', title: '', description: '' });
                    setPlanModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Create Timetable Plan</span>
                </button>
              )}
            </div>
          </div>

          {!timetableOpen ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {timetablePlans.map((plan) => {
                const progName = catalogue.programmes.find((p) => p.id === plan.programme_id)?.name || 'Pathway';
                const scheduledPeriods = (academicData.timetable || []).filter((x) => x.plan_id === plan.id).length;
                return (
                  <div
                    key={plan.id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between min-h-[170px]"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#c62839]">
                          {progName}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F7F8FC] text-[#111A43] capitalize">
                          {plan.learning_mode}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#111A43] mt-2">{plan.title}</h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{plan.description}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-400 font-semibold">{scheduledPeriods} scheduled periods</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setTimetableClass(plan.id);
                            setTimetableOpen(true);
                            setTimetableDraft({});
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#111A43] hover:bg-[#1c2e6b] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Open Matrix
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPlanEditing(plan);
                            setPlanForm({
                              programme_id: plan.programme_id,
                              learning_mode: plan.learning_mode,
                              title: plan.title,
                              description: plan.description,
                            });
                            setPlanModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-[#111A43] rounded"
                          title="Edit plan details"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void deletePlan(plan)}
                          className="p-1.5 text-slate-400 hover:text-[#c62839] rounded"
                          title="Delete plan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {!timetablePlans.length && !loading && (
                <div className="col-span-full p-12 bg-white rounded-2xl border border-slate-200/80 text-center text-xs text-slate-400">
                  No timetable plans registered. Create a new plan to set up schedule periods.
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-xs">
                <thead>
                  <tr className="bg-[#F7F8FC] border-b border-slate-200">
                    <th className="p-3 text-left font-bold text-[#111A43] w-28">Day</th>
                    {Array.from({ length: 6 }, (_, i) => (
                      <th key={i} className="p-3 text-center font-bold text-[#111A43]">
                        Period {i + 1}
                        <span className="block text-[10px] font-normal text-slate-400">
                          {8 + i}:00 - {9 + i}:00
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, i) => (
                    <tr key={day} className="hover:bg-slate-50/50">
                      <th className="p-3 text-left font-bold text-[#111A43] bg-slate-50/50">{day}</th>
                      {Array.from({ length: 6 }, (_, j) => {
                        const currentVal = timetableValue(i + 1, j + 1);
                        return (
                          <td key={j} className="p-1.5">
                            <select
                              aria-label={`${day} Period ${j + 1}`}
                              value={currentVal}
                              onChange={(e) =>
                                setTimetableDraft((v) => ({ ...v, [`${i + 1}-${j + 1}`]: e.target.value }))
                              }
                              className={`w-full rounded-xl border p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#111A43] ${
                                currentVal ? 'border-slate-300 bg-white text-[#111A43]' : 'border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            >
                              <option value="">— Blank Period —</option>
                              {catalogue.subjects
                                .filter((sub) => sub.programme_id === activePlan?.programme_id)
                                .map((sub) => (
                                  <option key={sub.id} value={sub.id}>
                                    {sub.name}
                                  </option>
                                ))}
                            </select>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Select curriculum subjects for required periods. Empty cells remain unallocated.</span>
                <span className="font-bold text-[#111A43]">Click "Save Timetable Changes" after updating.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB CONTENT: ATTENDANCE
          ========================================================================= */}
      {activeTab === 'Attendance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-extrabold text-[#111A43]">
                {attendanceStudent
                  ? `Attendance: ${students.find((s) => s.id === attendanceStudent)?.name || 'Student'}`
                  : 'Overall Student Attendance'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Recorded daily attendance logs across learning sessions</p>
            </div>

            <div className="flex items-center gap-2">
              {attendanceStudent && (
                <button
                  type="button"
                  onClick={() => setAttendanceStudent(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#111A43] transition-colors"
                >
                  Overall View
                </button>
              )}
              <button
                type="button"
                onClick={() => setStudentPicker(true)}
                className="px-4 py-2 rounded-xl bg-[#111A43] hover:bg-[#1c2e6b] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Select Student Roster
              </button>
            </div>
          </div>

          {/* Breakdown Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {[
              { state: 'present', label: 'Present', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
              { state: 'absent', label: 'Absent', color: 'text-rose-700 bg-rose-50 border-rose-200' },
              { state: 'late', label: 'Late', color: 'text-amber-700 bg-amber-50 border-amber-200' },
              { state: 'excused', label: 'Excused', color: 'text-blue-700 bg-blue-50 border-blue-200' },
            ].map(({ state, label, color }) => {
              const rows = (academicData.attendance || []).filter(
                (x) => (!attendanceStudent || x.student_id === attendanceStudent) && x.status === state
              );
              return (
                <div key={state} className={`p-4 rounded-2xl border ${color} shadow-xs`}>
                  <span className="text-xs font-bold block">{label}</span>
                  <span className="text-2xl font-black mt-1 block">{rows.length}</span>
                </div>
              );
            })}
          </div>

          {/* Records List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Attendance Records Log
            </h3>
            <div className="mt-3 divide-y divide-slate-100 text-xs">
              {(academicData.attendance || [])
                .filter((x) => !attendanceStudent || x.student_id === attendanceStudent)
                .map((row) => {
                  const studentName = students.find((s) => s.id === row.student_id)?.name || row.student_id;
                  return (
                    <div key={row.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <strong className="text-[#111A43] font-bold block">{studentName}</strong>
                        <span className="text-slate-400 text-[11px] font-mono">{row.attendance_date}</span>
                        {row.notes && <span className="text-slate-500 ml-2">· {row.notes}</span>}
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${
                          row.status === 'present'
                            ? 'bg-emerald-50 text-emerald-700'
                            : row.status === 'absent'
                            ? 'bg-rose-50 text-rose-700'
                            : row.status === 'late'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {row.status}
                      </span>
                    </div>
                  );
                })}
              {!(academicData.attendance || []).length && (
                <p className="py-8 text-center text-slate-400">No attendance entries recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB CONTENT: STANDARD CRUD (Programmes, Subjects, Assignments)
          ========================================================================= */}
      {currentArea && currentArea !== 'Timetable' && currentArea !== 'Attendance' && (
        <div className="space-y-4">
          {/* Filter Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${currentArea.toLowerCase()} by name, code or description…`}
                  className="w-full pl-9 pr-3 py-2 bg-[#F7F8FC] border border-slate-200 rounded-xl text-xs font-medium text-[#111A43] placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#111A43]"
                />
              </div>

              {currentArea === 'Subjects' && (
                <select
                  value={programmeFilter}
                  onChange={(e) => setProgrammeFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#111A43] focus:outline-none"
                >
                  <option value="All">All Programmes</option>
                  {catalogue.programmes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-[#111A43] focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                {currentArea === 'Assignments' && (
                  <>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </>
                )}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-[#111A43] border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Records Table and Detail Drawer */}
          <div className="flex gap-4 items-start">
            <div className="flex-1 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-xs">
                  <thead>
                    <tr className="bg-[#F7F8FC] border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                      <th className="p-3.5 text-left w-12">#</th>
                      <th className="p-3.5 text-left">Record Name / Title</th>
                      <th className="p-3.5 text-left">Code / Identifier</th>
                      <th className="p-3.5 text-left">Details</th>
                      <th className="p-3.5 text-left w-24">Status</th>
                      <th className="p-3.5 text-right w-24">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visible.map((item, index) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelected(item)}
                        className={`hover:bg-slate-50/70 transition-colors cursor-pointer ${
                          selected?.id === item.id ? 'bg-red-50/40' : ''
                        }`}
                      >
                        <td className="p-3.5 text-slate-400 font-mono">{(currentPage - 1) * pageSize + index + 1}</td>
                        <td className="p-3.5">
                          <strong className="text-[#111A43] font-bold block text-sm">{item.title}</strong>
                        </td>
                        <td className="p-3.5 font-mono text-slate-600 font-semibold">{item.subtitle || '—'}</td>
                        <td className="p-3.5 text-slate-500 max-w-xs truncate">
                          {item.details.description || item.details.instructions || '—'}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Active' || item.status === 'published'
                                ? 'bg-emerald-50 text-emerald-700'
                                : item.status === 'draft'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => beginEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-[#111A43] rounded"
                              title="Edit record"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              disabled={deleting}
                              onClick={() => void remove(item)}
                              className="p-1.5 text-slate-400 hover:text-[#c62839] rounded"
                              title="Delete record"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!visible.length && !loading && (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-xs text-slate-400">
                          No matching {currentArea.toLowerCase()} records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table Footer / Pagination */}
              <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <span>
                  Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                  {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-[#111A43] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="font-bold text-[#111A43]">
                    Page {currentPage} of {pages}
                  </span>
                  <button
                    type="button"
                    disabled={currentPage === pages}
                    onClick={() => setPage((p) => Math.min(pages, p + 1))}
                    className="p-1.5 rounded-lg border border-slate-200 text-[#111A43] disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="ml-2 px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-[#111A43]"
                  >
                    <option value={10}>10 / page</option>
                    <option value={25}>25 / page</option>
                    <option value={50}>50 / page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Selected Record Aside */}
            {selected && (
              <aside className="w-80 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs shrink-0 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-[#111A43]">Record Details</h3>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Title</span>
                  <h4 className="text-base font-extrabold text-[#111A43] mt-0.5">{selected.title}</h4>
                </div>

                <div className="space-y-2 text-xs divide-y divide-slate-100">
                  {Object.entries(selected.details).map(([key, val]) => (
                    <div key={key} className="pt-2">
                      <span className="text-slate-400 capitalize text-[10px] font-bold block">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[#111A43] font-semibold break-words mt-0.5 block">{val || '—'}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => beginEdit(selected)}
                    className="flex-1 py-2 rounded-xl bg-[#111A43] hover:bg-[#1c2e6b] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Edit Record
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(selected)}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </aside>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODALS: EDIT / CREATE RECORD
          ========================================================================= */}
      {editing !== undefined && currentArea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void save();
            }}
            className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-black text-[#111A43]">
                {editing ? 'Edit' : 'Create'} {currentArea.slice(0, -1)}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(undefined)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={18} />
              </button>
            </div>

            {(currentArea === 'Programmes' || currentArea === 'Subjects') && (
              <>
                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">Name</label>
                  <input
                    required
                    minLength={2}
                    maxLength={160}
                    value={form.name}
                    onChange={(e) => setForm((v) => ({ ...v, name: e.target.value }))}
                    placeholder="e.g. IJMB Science Pathway"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
                  />
                </div>

                {(currentArea === 'Programmes' ||
                  (currentArea === 'Subjects' &&
                    /IJMB/i.test(catalogue.programmes.find((p) => p.id === form.programmeId)?.name || ''))) && (
                  <div>
                    <label className="block text-xs font-bold text-[#111A43] mb-1">Code</label>
                    <input
                      required
                      minLength={2}
                      maxLength={32}
                      value={form.code}
                      onChange={(e) => setForm((v) => ({ ...v, code: e.target.value.toUpperCase() }))}
                      placeholder="e.g. IJMB-SCI-01"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:ring-1 focus:ring-[#111A43] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">Description</label>
                  <textarea
                    required
                    minLength={5}
                    maxLength={2000}
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm((v) => ({ ...v, description: e.target.value }))}
                    placeholder="Brief description of the curriculum or learning objectives…"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
                  />
                </div>

                {currentArea === 'Subjects' && (
                  <div>
                    <label className="block text-xs font-bold text-[#111A43] mb-1">Linked Academic Programme</label>
                    <select
                      required
                      value={form.programmeId}
                      onChange={(e) => setForm((v) => ({ ...v, programmeId: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] focus:outline-none"
                    >
                      <option value="" disabled>
                        Select programme
                      </option>
                      {catalogue.programmes.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs font-semibold text-[#111A43] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm((v) => ({ ...v, active: e.target.checked }))}
                    className="w-4 h-4 text-[#c62839] rounded"
                  />
                  <span>Mark as active in institutional catalogue</span>
                </label>
              </>
            )}

            {currentArea &&
              fieldMap[currentArea]?.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-bold text-[#111A43] mb-1">{field.label}</label>
                  {['programme', 'subject', 'student', 'mode', 'attendance', 'assignment'].includes(field.type) ? (
                    <select
                      required={!field.optional}
                      value={String(otherForm[field.key] ?? '')}
                      onChange={(e) =>
                        setOtherForm((v) => ({
                          ...v,
                          [field.key]: e.target.value,
                          ...(field.key === 'programme_id' ? { subject_id: '' } : {}),
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] focus:outline-none"
                    >
                      <option value="">Select</option>
                      {(field.type === 'programme'
                        ? catalogue.programmes.map((p) => ({ value: p.id, label: p.name }))
                        : field.type === 'subject'
                        ? catalogue.subjects
                            .filter((p) => !otherForm.programme_id || p.programme_id === otherForm.programme_id)
                            .map((p) => ({ value: p.id, label: p.name }))
                        : field.type === 'student'
                        ? students.map((p) => ({ value: p.id, label: p.name }))
                        : field.type === 'mode'
                        ? ['physical', 'online'].map((v) => ({ value: v, label: v }))
                        : field.type === 'attendance'
                        ? ['present', 'absent', 'late', 'excused'].map((v) => ({ value: v, label: v }))
                        : ['draft', 'published', 'closed'].map((v) => ({ value: v, label: v }))
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required={!field.optional}
                      type={field.type}
                      value={String(otherForm[field.key] ?? '')}
                      onChange={(e) => setOtherForm((v) => ({ ...v, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
                    />
                  )}
                </div>
              ))}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditing(undefined)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Create/Edit Timetable Plan */}
      {planModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void savePlan();
            }}
            className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#111A43]">
                {planEditing ? 'Edit Timetable Plan' : 'Create New Timetable Plan'}
              </h3>
              <button
                type="button"
                onClick={() => setPlanModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111A43] mb-1">Academic Programme</label>
              <select
                required
                disabled={!!planEditing}
                value={planForm.programme_id}
                onChange={(e) => setPlanForm((v) => ({ ...v, programme_id: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] focus:outline-none"
              >
                <option value="">Choose programme</option>
                {catalogue.programmes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111A43] mb-1">Learning Mode</label>
              <select
                disabled={!!planEditing}
                value={planForm.learning_mode}
                onChange={(e) => setPlanForm((v) => ({ ...v, learning_mode: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] focus:outline-none"
              >
                <option value="physical">Physical Center</option>
                <option value="online">Online Virtual Lecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111A43] mb-1">Timetable Title</label>
              <input
                required
                value={planForm.title}
                onChange={(e) => setPlanForm((v) => ({ ...v, title: e.target.value }))}
                placeholder="e.g. Morning Stream - 2025/2026 Cohort"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111A43] mb-1">Description</label>
              <textarea
                required
                minLength={5}
                rows={3}
                value={planForm.description}
                onChange={(e) => setPlanForm((v) => ({ ...v, description: e.target.value }))}
                placeholder="Details on schedule cohort, days, and hall location…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setPlanModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={timetableSaving}
                className="px-5 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {timetableSaving ? 'Saving…' : 'Save Timetable'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Student Picker for Attendance */}
      {studentPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#111A43]">Select Student from Roster</h3>
              <button
                type="button"
                onClick={() => setStudentPicker(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="my-3">
              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by student full name…"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-[#111A43] focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {students
                .filter((x) => x.name.toLowerCase().includes(studentSearch.toLowerCase()))
                .map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => {
                      setAttendanceStudent(student.id);
                      setStudentPicker(false);
                      setSelected(null);
                    }}
                    className="w-full p-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors rounded-xl cursor-pointer"
                  >
                    {student.photoUrl ? (
                      <img src={student.photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#111A43] text-white font-bold text-xs flex items-center justify-center shrink-0">
                        {student.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold text-[#111A43] block truncate">{student.name}</strong>
                      <span className="text-[11px] text-slate-400 block truncate">{student.programme}</span>
                    </div>
                  </button>
                ))}
              {!students.length && (
                <p className="py-8 text-center text-xs text-slate-400">No approved students found on roster.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
