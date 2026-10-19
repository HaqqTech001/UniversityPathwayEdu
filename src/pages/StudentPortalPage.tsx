import React, { useState } from 'react';
import {
  GraduationCap,
  User,
  Key,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  AlertCircle,
  Download,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  LogOut,
  FileCheck,
  Printer,
  Edit3,
  Save,
  X,
  ExternalLink,
  Lock,
  Bell,
  Settings as SettingsIcon,
  HelpCircle,
  Check,
  Award,
  ArrowRight,
} from 'lucide-react';
import CbtExamWizard from '../portal/CbtExamWizard';
import StudentBiodataForm from '../components/StudentBiodataForm';
import { useAuth } from '../context/AuthContext';
import StudentPortalLayout from '../layouts/StudentPortalLayout';
import AuthPage from './AuthPage';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StudentPortalPage({ onNavigate }: PageProps) {
  const { currentUser, isAuthenticated, updateBiodata, submitApplication } = useAuth();
  const [applicationProgramme, setApplicationProgramme] = useState('JAMB / UTME');
  const [applicationSession, setApplicationSession] = useState('2026/2027');
  const [applicationSubjects, setApplicationSubjects] = useState('');
  const [applicationSaving, setApplicationSaving] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState<string | null>(null);

  // Navigation tab state controlled by the Left Navigation Drawer
  const [dashboardTab, setDashboardTab] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#cbt') {
      return 'cbt';
    }
    return 'overview';
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#cbt') {
      setDashboardTab('cbt');
    }
  }, []);

  // Edit biodata modal state
  const [isEditingBiodata, setIsEditingBiodata] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    surname: '',
    firstName: '',
    otherNames: '',
    gender: 'Female',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    stateOfOrigin: '',
    lga: '',
    guardianName: '',
    guardianPhone: '',
    guardianRelationship: '',
    previousSchool: '',
    targetInstitution: '',
    targetCourse: '',
  });

  // Settings tab states
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [passwordState, setPasswordState] = useState({
    current: '',
    newPass: '',
    confirmPass: '',
  });
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  // If unauthenticated, render the approved two-column AuthPage directly
  if (!isAuthenticated || !currentUser) {
    return <AuthPage initialMode="signin" onNavigate={onNavigate} />;
  }

  const startEditing = () => {
    setEditForm({
      surname: currentUser.biodata.surname,
      firstName: currentUser.biodata.firstName,
      otherNames: currentUser.biodata.otherNames || '',
      gender: currentUser.biodata.gender,
      dateOfBirth: currentUser.biodata.dateOfBirth,
      phone: currentUser.phone,
      email: currentUser.email,
      address: currentUser.biodata.address,
      stateOfOrigin: currentUser.biodata.stateOfOrigin,
      lga: currentUser.biodata.lga,
      guardianName: currentUser.biodata.guardianName,
      guardianPhone: currentUser.biodata.guardianPhone,
      guardianRelationship: currentUser.biodata.guardianRelationship,
      previousSchool: currentUser.biodata.previousSchool,
      targetInstitution: currentUser.biodata.targetInstitution,
      targetCourse: currentUser.biodata.targetCourse,
    });
    setIsEditingBiodata(true);
  };

  const handleSaveBiodata = async (e: React.FormEvent) => {
    setEditSuccessMsg(null);
    try {
    e.preventDefault();
    await updateBiodata({
      surname: editForm.surname,
      firstName: editForm.firstName,
      otherNames: editForm.otherNames,
      gender: editForm.gender as 'Male' | 'Female',
      dateOfBirth: editForm.dateOfBirth,
      phone: editForm.phone,
      email: editForm.email,
      address: editForm.address,
      stateOfOrigin: editForm.stateOfOrigin,
      lga: editForm.lga,
      guardianName: editForm.guardianName,
      guardianPhone: editForm.guardianPhone,
      guardianRelationship: editForm.guardianRelationship,
      previousSchool: editForm.previousSchool,
      targetInstitution: editForm.targetInstitution,
      targetCourse: editForm.targetCourse,
    });
    setIsEditingBiodata(false);
    setEditSuccessMsg('Your biodata records have been updated successfully.');
    setTimeout(() => setEditSuccessMsg(null), 4000);
    } catch (error) {
      setEditSuccessMsg(error instanceof Error ? error.message : 'Unable to save profile. Please try again.');
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordState.newPass !== passwordState.confirmPass) {
      setPasswordNotice('New passwords do not match. Please re-enter.');
      return;
    }
    if (passwordState.newPass.length < 6) {
      setPasswordNotice('Password must be at least 6 characters.');
      return;
    }
    setPasswordNotice('Password changes are not connected to an authentication service yet. No password was changed.');
    setPasswordState({ current: '', newPass: '', confirmPass: '' });
    setTimeout(() => setPasswordNotice(null), 3500);
  };

  return (
    <StudentPortalLayout
      activeTab={dashboardTab}
      onTabChange={setDashboardTab}
      onNavigate={onNavigate}
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Success Alert */}
        {editSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        {/* =========================================================================
            HEADER IDENTITY STRIP
            ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#08163b] to-[#162f74] text-white flex items-center justify-center font-serif text-xl sm:text-2xl font-black shrink-0 shadow-md">
              {currentUser.biodata.firstName?.[0] || 'U'}
              {currentUser.biodata.surname?.[0] || 'P'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-serif font-black text-[#0b1a42]">
                  {currentUser.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  {currentUser.isEmailVerified ? 'Email verified' : 'Verification pending'}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span>
                  Reg No: <strong className="text-[#0b1a42]">{currentUser.regNumber}</strong>
                </span>
                <span>•</span>
                <span>
                  Centre: <strong>Sawmill Main Centre, Ilorin</strong>
                </span>
                <span>•</span>
                <span>
                  Target: <strong>{currentUser.biodata.targetExam || 'Not selected'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-stretch md:self-auto justify-end">
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0b1a42] transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span>Edit Biodata</span>
            </button>
            <button
              type="button"
              onClick={() => setDashboardTab('documents')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0b1a42] hover:bg-[#122867] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              <Printer size={13} />
              <span>Print Slip</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            DRAWER TAB 1: DASHBOARD (OVERVIEW)
            ========================================================================= */}
        {dashboardTab === 'overview' && (
          <div className="space-y-5 sm:space-y-6">
            <section className="relative isolate overflow-hidden rounded-2xl border border-[#d8e4f3] bg-gradient-to-r from-[#e6f0ff] via-[#edf5ff] to-[#dceafa] p-5 sm:p-8 lg:p-10">
              <img src="/images/campus_atmosphere.jpg" alt="" className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[47%] object-cover opacity-70 lg:block" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#e8f2ff] via-[#e8f2ff]/95 to-[#e8f2ff]/20" />
              <div className="relative max-w-xl">
                <p className="text-sm font-medium text-[#233b68]">Welcome back,</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-[#08163b] sm:text-3xl">{currentUser.biodata.firstName || 'Student'}</h2>
                <p className="mt-3 max-w-md text-sm leading-7 text-[#334b72]">Keep your profile updated and track your journey towards your academic goals.</p>
                <p className="mt-3 text-xs font-semibold text-[#526988]">Your next opportunity could be one step closer today.</p>
              </div>
            </section>

            <section aria-label="Your account status" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <article className="min-w-0 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3"><span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><User size={23}/></span><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">Profile completion</p><p className="mt-1 text-lg font-extrabold text-[#08163b]">{currentUser.profileCompleted ? 'Complete' : 'Incomplete'}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${currentUser.profileCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{currentUser.profileCompleted ? 'Completed' : 'Action needed'}</span></div></div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${currentUser.profileCompleted ? 'w-full bg-emerald-600' : 'w-[15%] bg-red-500'}`}/></div>
                <button type="button" onClick={() => setDashboardTab('profile')} className="mt-4 flex min-h-11 w-full items-center justify-between text-left text-sm font-semibold text-[#30466d]">View profile <ArrowRight size={17}/></button>
              </article>
              <article className="min-w-0 rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3"><span className="rounded-2xl bg-amber-100 p-3 text-amber-700"><FileText size={23}/></span><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">Application status</p><p className="mt-1 text-lg font-extrabold capitalize text-[#08163b]">{currentUser.application?.status.replace(/_/g,' ') || 'Not started'}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${['approved','accepted','completed'].includes(currentUser.application?.status || '') ? 'bg-emerald-100 text-emerald-800' : ['rejected','declined'].includes(currentUser.application?.status || '') ? 'bg-red-100 text-red-800' : currentUser.application ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{['approved','accepted','completed'].includes(currentUser.application?.status || '') ? 'Approved' : ['rejected','declined'].includes(currentUser.application?.status || '') ? 'Needs attention' : currentUser.application ? 'In progress' : 'Not started'}</span></div></div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${currentUser.application ? 'w-1/2 bg-amber-500' : 'w-0'}`}/></div>
                <button type="button" onClick={() => setDashboardTab('applications')} className="mt-4 flex min-h-11 w-full items-center justify-between text-left text-sm font-semibold text-[#30466d]">View application <ArrowRight size={17}/></button>
              </article>
              <article className="min-w-0 rounded-2xl border border-red-100 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                <div className="flex items-start gap-3"><span className={`rounded-2xl p-3 ${currentUser.isEmailVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}><ShieldCheck size={23}/></span><div className="min-w-0"><p className="text-xs font-semibold text-slate-500">Email verification</p><p className="mt-1 text-lg font-extrabold text-[#08163b]">{currentUser.isEmailVerified ? 'Marked verified' : 'Not verified'}</p><span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-bold ${currentUser.isEmailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>{currentUser.isEmailVerified ? 'Verified in preview' : 'Incomplete'}</span></div></div>
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${currentUser.isEmailVerified ? 'w-full bg-emerald-600' : 'w-[10%] bg-red-500'}`}/></div>
                <p className="mt-4 break-all text-xs leading-6 text-slate-500">{currentUser.email} · Verification is not yet backend-confirmed.</p>
              </article>
            </section>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,1fr)]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-lg font-extrabold text-[#08163b]">Application journey</h3><p className="mt-1 text-xs text-slate-500">Follow each step to complete your application.</p></div><button type="button" onClick={() => setDashboardTab('applications')} className="min-h-10 rounded-full bg-[#142f70] px-5 text-xs font-bold text-white">Continue →</button></div>
                  <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label:'Account', done:true },
                      { label:'Profile', done:currentUser.profileCompleted },
                      { label:'Application', done:!!currentUser.application },
                      { label:'Review & status', done:['approved','accepted','completed'].includes(currentUser.application?.status || '') },
                    ].map((step,index) => <div key={step.label} className="flex min-w-0 flex-col items-center text-center"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${step.done ? 'bg-emerald-600' : index===2 && currentUser.application ? 'bg-amber-500' : 'bg-slate-400'}`}>{step.done ? <Check size={18}/> : index+1}</span><p className="mt-3 text-xs font-semibold text-[#08163b]">{step.label}</p><span className={`mt-2 rounded-full px-2 py-1 text-[10px] font-semibold ${step.done ? 'bg-emerald-100 text-emerald-800' : index===2 && currentUser.application ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>{step.done ? 'Completed' : index===2 && currentUser.application ? 'In progress' : 'Not started'}</span></div>)}
                  </div>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <h3 className="text-lg font-extrabold text-[#08163b]">Quick actions</h3>
                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {label:'Edit profile',tab:'profile',Icon:User,tone:'bg-blue-50 text-blue-700'},
                      {label:'Application',tab:'applications',Icon:FileText,tone:'bg-amber-50 text-amber-700'},
                      {label:'Practice CBT',tab:'cbt',Icon:BookOpen,tone:'bg-violet-50 text-violet-700'},
                      {label:'Documents',tab:'documents',Icon:Download,tone:'bg-emerald-50 text-emerald-700'},
                    ].map(item => <button type="button" key={item.tab} onClick={() => setDashboardTab(item.tab)} className={`flex min-h-28 flex-col items-center justify-center gap-3 rounded-2xl p-3 text-center text-xs font-bold transition-transform hover:-translate-y-0.5 ${item.tone}`}><item.Icon size={25}/>{item.label}</button>)}
                  </div>
                </section>
              </div>
              <aside className="space-y-5">
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-extrabold text-[#08163b]">Notifications</h3><button type="button" onClick={() => setDashboardTab('notices')} className="text-xs font-bold text-blue-700">View all</button></div>
                  <div className="mt-6 flex flex-col items-center rounded-xl bg-slate-50 px-4 py-9 text-center"><Bell size={27} className="text-slate-400"/><p className="mt-3 text-sm font-bold">No notifications yet</p><p className="mt-2 text-xs leading-5 text-slate-500">Official updates will appear when connected.</p></div>
                </section>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h3 className="text-lg font-extrabold text-[#08163b]">Important dates</h3><p className="mt-4 rounded-xl bg-slate-50 p-5 text-sm leading-6 text-slate-500">No official dates have been published to your portal.</p></section>
              </aside>
            </div>
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">Account details are loaded from the student service. Official announcements will appear when published.</p>
          </div>
        )}

                {/* =========================================================================
            DRAWER TAB 2: MY PROFILE / BIODATA
            ========================================================================= */}
        {dashboardTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div>
                <h2 className="font-serif text-base font-bold text-[#0b1a42]">
                  Candidate Biodata Record
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registration Number: <strong className="text-[#0b1a42]">{currentUser.regNumber}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={startEditing}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                <Edit3 size={14} />
                <span>Update Biodata</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-xs text-[#0b1a42]">
                  <User size={16} className="text-[#c62839]" />
                  <span>Personal Particulars</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Surname</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.surname}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">First Name</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.firstName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Other Names</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.otherNames || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Gender</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.gender}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Date of Birth</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Phone</span>
                    <strong className="text-[#0b1a42]">{currentUser.phone}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Email</span>
                    <strong className="text-[#0b1a42]">{currentUser.email}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Residential Address</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.address}</strong>
                  </div>
                </div>
              </div>

              {/* Guardian & Target Academic Goals */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 font-bold text-xs text-[#0b1a42]">
                  <GraduationCap size={16} className="text-[#c62839]" />
                  <span>Guardian &amp; Academic Pathway</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3.5 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Guardian Name</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.guardianName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Relationship</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.guardianRelationship}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Guardian Phone</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.guardianPhone}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Previous School</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.previousSchool}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Target University</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.targetInstitution}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 text-[11px] block">Target Course</span>
                    <strong className="text-[#0b1a42]">{currentUser.biodata.targetCourse}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DRAWER TAB 3: MY APPLICATIONS
            ========================================================================= */}
        {dashboardTab === 'applications' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="font-serif text-lg font-bold text-[#0b1a42]">
                    My Cohort Registrations
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage and review your active cohort registration files and examination streams.
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{currentUser.application?.status.replace(/_/g, " ") || "No application"}</span>
              </div>

              {currentUser.application ? (
                <div className="mt-6 rounded-2xl border border-slate-200 p-6 bg-slate-50/50 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center font-bold">
                        <FileCheck size={24} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                          Reference: {currentUser.application.referenceNumber}
                        </span>
                        <h4 className="font-serif text-base font-bold text-[#0b1a42]">
                          {currentUser.application.programme}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs pt-4 border-t border-slate-200">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Academic Session</span>
                      <p className="font-bold text-[#0b1a42] mt-0.5">{currentUser.application.session}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Study Center</span>
                      <p className="font-bold text-[#0b1a42] mt-0.5">{currentUser.application.studyCenter}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">Submission Date</span>
                      <p className="font-bold text-[#0b1a42] mt-0.5">{currentUser.application.submittedAt}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px]">CBT Enrolment</span>
                      <p className="font-bold text-[#0b1a42] mt-0.5">{currentUser.application.cbtEnrolled ? "Enrolled" : "Not yet confirmed"}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-slate-400 font-bold uppercase text-[10px] block mb-1">
                        Registered Subjects:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentUser.application.chosenSubjects.map((s) => (
                          <span
                            key={s}
                            className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-[#0b1a42] font-semibold text-xs"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDashboardTab('documents')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0b1a42] shadow-xs cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>View Official Slip</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-7" onSubmit={async (event) => {
                  event.preventDefault();
                  setApplicationSaving(true);
                  setApplicationMessage(null);
                  try {
                    const reference = await submitApplication({
                      programme: applicationProgramme,
                      session: applicationSession,
                      chosenSubjects: applicationSubjects.split(',').map(subject => subject.trim()).filter(Boolean).slice(0, 3),
                    });
                    setApplicationMessage('Application submitted successfully. Reference: ' + reference);
                  } catch (error) {
                    setApplicationMessage(error instanceof Error ? error.message : 'Unable to submit application.');
                  } finally {
                    setApplicationSaving(false);
                  }
                }}>
                  <h3 className="font-serif text-lg font-bold text-[#0b1a42]">Start your application</h3>
                  <p className="text-sm text-slate-600">Complete your biodata before applying. Your application will be reviewed by the admissions team.</p>
                  <label className="block text-sm font-semibold text-[#0b1a42]">Programme
                    <select required value={applicationProgramme} onChange={event => setApplicationProgramme(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3">
                      <option>JAMB / UTME</option><option>WAEC / NECO</option><option>JUPEB / A-Level</option><option>International Examinations</option>
                    </select>
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1a42]">Academic session
                    <input required value={applicationSession} onChange={event => setApplicationSession(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3" placeholder="2026/2027" />
                  </label>
                  <label className="block text-sm font-semibold text-[#0b1a42]">Optional subject choices (separate with commas)
                    <input value={applicationSubjects} onChange={event => setApplicationSubjects(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3" placeholder="Mathematics, Physics, Chemistry" />
                  </label>
                  {applicationMessage && <p role="status" className="rounded-xl bg-white p-3 text-sm text-[#0b1a42]">{applicationMessage}</p>}
                  <button type="submit" disabled={!currentUser.profileCompleted || applicationSaving} className="rounded-xl bg-[#c62839] px-6 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
                    {applicationSaving ? 'Submitting...' : 'Submit application'}
                  </button>
                  {!currentUser.profileCompleted && <p className="text-sm text-amber-800">Complete your profile in the Biodata tab to enable submission.</p>}
                </form>
                <div className="mt-8 text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText size={36} className="text-slate-300 mx-auto mb-3" />
                  <h4 className="font-serif text-base font-bold text-[#0b1a42]">
                    No application submitted
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Once your application is submitted, its reference number and review status will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            DRAWER TAB 4: DOCUMENTS & SLIPS
            ========================================================================= */}
        {dashboardTab === 'documents' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-[#0b1a42]">
                  Official Documents &amp; Clearance Slips
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Download or print your institutional registration verification slip for classroom and CBT lab admission.
                </p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
              >
                <Printer size={15} />
                <span>Print Registration Slip</span>
              </button>
            </div>

            {/* Official Registration Slip Preview */}
            <div className="bg-white rounded-3xl border-2 border-slate-200 p-8 shadow-md print:shadow-none print:border-none print:p-0">
              {/* Slip Header */}
              <div className="border-b-2 border-[#0b1a42] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-[#0b1a42] text-white flex items-center justify-center font-bold shrink-0">
                    <GraduationCap size={28} className="text-[#f0bb5b]" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c62839] block">
                      OFFICIAL ADMISSION CLEARANCE SLIP
                    </span>
                    <h3 className="font-serif text-xl sm:text-2xl font-black text-[#0b1a42]">
                      University Pathway Educational Consult
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State • 09133903600
                    </p>
                  </div>
                </div>

                <div className="text-right sm:border-l border-slate-200 sm:pl-6 text-xs">
                  <p className="font-mono text-slate-400 text-[10px]">SLIP REFERENCE</p>
                  <p className="font-mono font-bold text-sm text-[#0b1a42]">
                    {currentUser.regNumber}
                  </p>
                  <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    VALID 2024/2025
                  </span>
                </div>
              </div>

              {/* Slip Body Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-slate-200">
                <div className="md:col-span-2 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Full Name</span>
                      <p className="font-bold text-[#0b1a42] text-sm">{currentUser.fullName}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Registration Number</span>
                      <p className="font-mono font-bold text-[#0b1a42]">{currentUser.regNumber}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Enrolled Programme</span>
                      <p className="font-bold text-[#0b1a42]">JAMB (UTME) Intensive Coaching</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Study Cohort</span>
                      <p className="font-bold text-[#0b1a42]">Batch A — Morning Sessions</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Study Centre</span>
                      <p className="font-bold text-[#0b1a42]">Sawmill Main Campus, Hall A</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400">Primary Contact</span>
                      <p className="font-bold text-[#0b1a42]">{currentUser.phone}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Registered Examination Subjects
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {['Use of English', 'Biology', 'Chemistry', 'Physics'].map((subj) => (
                        <span
                          key={subj}
                          className="px-3 py-1 rounded-lg bg-slate-100 font-bold text-[#0b1a42] text-xs"
                        >
                          {subj}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Candidate Photo / Verification box */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-slate-50/50">
                  <div className="w-24 h-24 rounded-2xl bg-[#0b1a42] text-white flex items-center justify-center font-serif text-3xl font-black mb-3 shadow-md">
                    {currentUser.biodata.firstName[0]}
                    {currentUser.biodata.surname[0]}
                  </div>
                  <p className="text-xs font-bold text-[#0b1a42]">{currentUser.fullName}</p>
                  <p className="text-[10px] font-mono text-slate-500 mt-0.5">{currentUser.regNumber}</p>
                  <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-emerald-700">
                    <ShieldCheck size={14} />
                    <span>Clearance Verified</span>
                  </div>
                </div>
              </div>

              {/* Slip Notice & Instructions */}
              <div className="pt-6 text-[11px] text-slate-500 space-y-2">
                <p className="font-bold text-[#0b1a42] uppercase text-[10px]">
                  Institutional Regulations &amp; Attendance Notice:
                </p>
                <p>
                  1. Candidates must present this signed slip alongside valid identification when accessing lecture halls and Saturday computerized mock examinations.
                </p>
                <p>
                  2. Attendance is checked electronically at the entrance; 80% minimum attendance is required for institution-backed mock certification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            DRAWER TAB 5: CBT PRACTICE SIMULATOR
            ========================================================================= */}
        {dashboardTab === 'cbt' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#0b1a42]">
                  Computer-Based Test (CBT) Practice Simulator
                </h2>
                <p className="text-xs text-slate-500">
                  Authentic UTME question bank, subject selector, and timed practice test engine.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#c62839] border border-red-200 text-xs font-bold self-start sm:self-auto">
                Official Candidate Simulator
              </span>
            </div>

            <CbtExamWizard />
          </div>
        )}

        {/* =========================================================================
            DRAWER TAB 6: NOTIFICATIONS
            ========================================================================= */}
        {dashboardTab === 'notices' && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-bold text-[#0b1a42]">Notifications</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">No official announcements are available in your account yet. Updates will appear here when the institution publishes them.</p>
          </section>
        )}

        {/* =========================================================================
            DRAWER TAB 7: SETTINGS
            ========================================================================= */}
        {dashboardTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="font-serif text-lg font-bold text-[#0b1a42]">
                  Candidate Account Security &amp; Settings
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your portal credentials and contact notification preferences.
                </p>
              </div>

              {passwordNotice && (
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-blue-600 shrink-0" />
                  <span>{passwordNotice}</span>
                </div>
              )}

              {/* Password update form */}
              <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
                <h3 className="text-xs font-bold text-[#0b1a42] uppercase tracking-wider">
                  Update Account Password
                </h3>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordState.current}
                    onChange={(e) =>
                      setPasswordState({ ...passwordState, current: e.target.value })
                    }
                    placeholder="Enter current password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordState.newPass}
                    onChange={(e) =>
                      setPasswordState({ ...passwordState, newPass: e.target.value })
                    }
                    placeholder="Min. 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordState.confirmPass}
                    onChange={(e) =>
                      setPasswordState({ ...passwordState, confirmPass: e.target.value })
                    }
                    placeholder="Re-type new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#132a63] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Save New Password
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
      {/* =========================================================================
          COMPREHENSIVE STUDENT BIODATA FORM MODAL
          ========================================================================= */}
      {isEditingBiodata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-4 sm:p-8 my-auto max-h-[95vh] overflow-y-auto">
            <StudentBiodataForm
              onCancel={() => setIsEditingBiodata(false)}
              onSuccess={() => {
                setIsEditingBiodata(false);
                setEditSuccessMsg('Candidate biodata updated successfully.');
                setTimeout(() => setEditSuccessMsg(null), 4000);
              }}
            />
          </div>
        </div>
      )}
    </StudentPortalLayout>
  );
}
