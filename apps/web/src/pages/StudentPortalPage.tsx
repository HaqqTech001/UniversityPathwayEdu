import StudentPaymentHistory from '../portal/StudentPaymentHistory';
import StudentFeeStatement from '../portal/StudentFeeStatement';
import StudentRegistrationFees from '../portal/StudentRegistrationFees';
import StudentExamRegistrations from '../portal/StudentExamRegistrations';
import StudentSupportChat from '../portal/StudentSupportChat';
import StudentNotifications from '../portal/StudentNotifications';
import StudentPhotoUpload from '../portal/StudentPhotoUpload';
import AdditionalServices from '../portal/AdditionalServices';
import StudentApplicationRegister from '../portal/StudentApplicationRegister';
import StudentHostelRequests from '../portal/StudentHostelRequests';
import ExtraServices from '../portal/ExtraServices';
import CommonApplicationForm from '../portal/CommonApplicationForm';
import ConductAcknowledgement from '../portal/ConductAcknowledgement';
import StudentMonthlyFees from '../portal/StudentMonthlyFees';
import GuardianContact from '../portal/GuardianContact';
import StudentNotices from '../portal/StudentNotices';
import StudentLearningResources from '../portal/StudentLearningResources';
import InstitutionalAssessments from '../portal/InstitutionalAssessments';
import React, { useState } from 'react';
import {
  ArrowRight,
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
} from 'lucide-react';
import CbtExamWizard from '../portal/CbtExamWizard';
import JambPastQuestions from '../portal/JambPastQuestions';
import StudentBiodataForm from '../components/StudentBiodataForm';
import { useAuth, getStudentToken } from '../context/AuthContext';
import { upecAuthApi } from '../lib/upecAuthApi';
import StudentPortalLayout from '../layouts/StudentPortalLayout';
import AuthPage from './AuthPage';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StudentPortalPage({ onNavigate }: PageProps) {
  const { currentUser, isAuthenticated, updateBiodata, refreshStudent } = useAuth();

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

  const [correctionOpen,setCorrectionOpen]=useState(false);
  const [correctionForm,setCorrectionForm]=useState<Record<string,unknown>>({});
  const [correctionBusy,setCorrectionBusy]=useState(false);
  const [correctionMessage,setCorrectionMessage]=useState('');
  const [applicationHistory,setApplicationHistory]=useState<Array<{id:string;new_status:string;created_at:string}>>([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [historyError,setHistoryError]=useState('');
  const applicationId=currentUser?.application?.id;
  React.useEffect(()=>{
    if(!isAuthenticated||!applicationId){setApplicationHistory([]);setHistoryError('');return;}
    const token=getStudentToken();
    if(!token)return;
    let cancelled=false;
    setHistoryLoading(true);setHistoryError('');
    upecAuthApi.applicationHistory(token,applicationId).then(data=>{
      if(!cancelled)setApplicationHistory(data.reviews);
    }).catch(error=>{if(!cancelled)setHistoryError(error instanceof Error?error.message:'Unable to load status history.');})
      .finally(()=>{if(!cancelled)setHistoryLoading(false);});
    return()=>{cancelled=true;};
  },[isAuthenticated,applicationId,dashboardTab]);

  const submitCorrection=async(e:React.FormEvent)=>{
    e.preventDefault();
    const id=currentUser?.application?.id,token=getStudentToken();
    if(!id||!token)return;
    setCorrectionBusy(true);setCorrectionMessage('');
    try{
      await upecAuthApi.correctApplication(token,id,correctionForm);
      setCorrectionOpen(false);
      setCorrectionMessage('Corrections submitted successfully. The admissions team will review your application again.');
      await refreshStudent();
    }catch(error){setCorrectionMessage(error instanceof Error?error.message:'Unable to resubmit correction.');}
    finally{setCorrectionBusy(false);}
  };

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
    if (!currentUser.biodataEditAllowed) return;
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

  const handleSaveBiodata = (e: React.FormEvent) => {
    e.preventDefault();
    updateBiodata({
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
  };

  // Password changes require a verified backend session. Do not simulate success.
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotice('Password changes are unavailable while secure account services are being configured. Your password has not been changed.');
    setPasswordState({ current: '', newPass: '', confirmPass: '' });
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
                  Application ID: <strong className="text-[#0b1a42]">{currentUser.application?.referenceNumber || 'Not issued'}</strong>
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
              disabled={!currentUser.biodataEditAllowed}
              title={!currentUser.biodataEditAllowed ? 'Contact administration to request biodata editing permission' : 'Edit biodata'}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0b1a42] transition-colors cursor-pointer"
            >
              <Edit3 size={13} />
              <span>{currentUser.biodataEditAllowed ? 'Edit Biodata' : 'Biodata Locked'}</span>
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
            <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-950">Frontend preview only: account and application statuses are not yet verified by a backend. Sample results, notices and deadlines are intentionally not shown.</p>
          </div>
        )}

                {/* =========================================================================
            DRAWER TAB 2: MY PROFILE / BIODATA
            ========================================================================= */}
        {dashboardTab === 'profile' && (
          <div className="space-y-6">
            <StudentPhotoUpload/>
            <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div>
                <h2 className="font-serif text-base font-bold text-[#0b1a42]">
                  Candidate Biodata Record
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Application ID: <strong className="text-[#0b1a42]">{currentUser.application?.referenceNumber || 'Not issued'}</strong>
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
            <StudentApplicationRegister/>
            <StudentHostelRequests/>
            <AdditionalServices/>
            <ExtraServices/>
            <CommonApplicationForm/>
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
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>{currentUser.application ? currentUser.application.status.replace(/_/g,' ') : 'No application submitted'}</span>
                </span>
              </div>

              {currentUser.application?.status==='action_required'&&<section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"><h3 className="text-base font-bold text-[#0b1a42]">Application correction required</h3><p className="mt-2 text-sm leading-6 text-slate-700">Your application has been returned for correction. Review your submitted details before sending it back to admissions. Programme and session cannot be changed here.</p><button type="button" className="mt-4 rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white" onClick={()=>{setCorrectionForm({...currentUser.application?.formData});setCorrectionMessage('');setCorrectionOpen(true);}}>Correct application</button></section>}
              {correctionOpen&&currentUser.application&&<section className="mt-5 rounded-2xl border border-[#d5a75b] bg-white p-5 sm:p-6"><h3 className="font-bold text-[#0b1a42]">Review and correct submitted information</h3><form onSubmit={submitCorrection} className="mt-4 space-y-4"><p className="text-xs text-slate-500">Only text fields can be edited here. Programme and academic session are fixed.</p>{Object.entries(correctionForm).filter(([key,value])=>typeof value==='string'&&!['programmeCategory','preferredSession'].includes(key)).map(([key,value])=><label key={key} className="block text-sm font-semibold capitalize text-[#0b1a42]">{key.replace(/([A-Z])/g,' $1')}<input value={String(value)} maxLength={500} onChange={e=>setCorrectionForm(prev=>({...prev,[key]:e.target.value}))} className="mt-2 block w-full rounded-xl border border-slate-300 p-3 font-normal"/></label>)}{correctionMessage&&<p role="alert" className="text-sm text-red-700">{correctionMessage}</p>}<div className="flex flex-wrap gap-3"><button type="button" onClick={()=>setCorrectionOpen(false)} className="rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-[#0b1a42]">Cancel</button><button type="submit" disabled={correctionBusy} className="rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{correctionBusy?'Submitting...':'Resubmit for review'}</button></div></form></section>}
              {!correctionOpen&&correctionMessage&&<p role="status" className="mt-4 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">{correctionMessage}</p>}

              {currentUser.application && <section aria-label="Application status history" className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
                <h3 className="text-base font-bold text-[#0b1a42]">Application status history</h3>
                <p className="mt-1 text-xs text-slate-500">Updates recorded by the admissions office for your application.</p>
                {historyLoading ? <p className="mt-4 text-sm text-slate-600">Loading status updates...</p> : historyError ? <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{historyError}</p> : applicationHistory.length===0 ? <p className="mt-4 text-sm text-slate-600">No review decisions have been recorded yet.</p> : <ol className="mt-5 space-y-4 border-l-2 border-[#d5a75b] pl-5">{applicationHistory.map(event=><li key={event.id}><strong className="block text-sm capitalize text-[#0b1a42]">{event.new_status.replace(/_/g,' ')}</strong><time className="text-xs text-slate-500" dateTime={event.created_at}>{new Date(event.created_at).toLocaleString()}</time></li>)}</ol>}
              </section>}

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
                      <p className="font-bold text-emerald-700 mt-0.5">Active Candidate</p>
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
                <div className="mt-8 text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText size={36} className="text-slate-300 mx-auto mb-3" />
                  <h4 className="font-serif text-base font-bold text-[#0b1a42]">
                    No Additional Applications
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    You have not submitted an application yet. Complete your profile and use the application journey to get started.
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
            <StudentLearningResources />
            <StudentExamRegistrations />
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="application-slip-heading">
              <h2 id="application-slip-heading" className="font-serif text-xl font-bold text-[#111A43]">Application Documents</h2>
              <p className="mt-2 text-sm text-slate-600">Documents are linked to your actual application ID. Unverified registration or clearance slips are not issued.</p>
              {currentUser.application?.id ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase text-slate-500">Application ID</p>
                  <p className="mt-1 break-all font-mono text-sm font-bold text-[#111A43]">{currentUser.application.referenceNumber || currentUser.application.id}</p>
                  <p className="mt-3 text-sm text-slate-700">Programme: {currentUser.application.programme}</p>
                  <p className="mt-1 text-sm text-slate-700">Status: {currentUser.application.status.replaceAll('_',' ')}</p>
                  <p className="mt-3 text-sm text-amber-800">An official registration or clearance slip becomes available only when application requirements, payment evidence and institutional verification are complete. No clearance has been issued yet.</p>
                </div>
              ) : (
                <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Complete and submit your application to obtain an Application ID before requesting an official document.</p>
              )}
            </section>
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
                  UTME-style practice simulator, plus a separate licensed historical question browser when configured.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-red-50 text-[#c62839] border border-red-200 text-xs font-bold self-start sm:self-auto">
                UTME-style Practice Simulator
              </span>
            </div>

            <CbtExamWizard />
            <JambPastQuestions />
            <InstitutionalAssessments />
          </div>
        )}

        {/* =========================================================================
            DRAWER TAB 6: NOTIFICATIONS
            ========================================================================= */}
        {dashboardTab === 'profile' && <><GuardianContact/><StudentFeeStatement/><StudentPaymentHistory/><StudentRegistrationFees/><StudentMonthlyFees/><ConductAcknowledgement/></>}
        {dashboardTab === 'notices' && <div className="space-y-6"><StudentNotifications/><StudentNotices/><StudentSupportChat/></div>}

        {/* Account settings */}
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
