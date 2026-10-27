import {notifyPortal} from '../components/PortalToasts';
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

import ProfileTabView from '../portal/views/ProfileTabView';
import ApplicationsTabView from '../portal/views/ApplicationsTabView';
import DocumentsTabView from '../portal/views/DocumentsTabView';
import CbtTabView from '../portal/views/CbtTabView';
import LearningResourcesTabView from '../portal/views/LearningResourcesTabView';
import NoticeBoardTabView from '../portal/views/NoticeBoardTabView';
import MessagesTabView from '../portal/views/MessagesTabView';
import PaymentsTabView from '../portal/views/PaymentsTabView';
import SettingsTabView from '../portal/views/SettingsTabView';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StudentPortalPage({ onNavigate }: PageProps) {
  const { currentUser, isAuthenticated, updateBiodata, refreshStudent, logout } = useAuth();

  // Navigation tab state controlled by the Left Navigation Drawer
  const portalTabs = [
    'overview',
    'profile',
    'applications',
    'documents',
    'cbt',
    'resources',
    'notices',
    'messages',
    'payments',
    'settings',
  ];
  const tabFromHash = () => {
    const hash = window.location.hash.slice(1);
    return portalTabs.includes(hash) ? hash : 'overview';
  };
  const [dashboardTab, setDashboardTab] = useState<string>(() =>
    typeof window === 'undefined' ? 'overview' : tabFromHash()
  );

  const [dashboardPhoto,setDashboardPhoto] = useState<string | null>(null);
  React.useEffect(()=>{
    if (!currentUser?.id || dashboardTab !== 'overview') return;
    const controller=new AbortController();
    const token=getStudentToken();
    if (!token) return;
    const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
    fetch(base+'/api/student/profile/photo',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(r=>r.ok?r.json():null)
      .then(data=>{if(!controller.signal.aborted)setDashboardPhoto(typeof data?.url==='string'?data.url:null);})
      .catch(()=>{});
    return ()=>controller.abort();
  },[currentUser?.id,dashboardTab]);

  const [dashboardNotices,setDashboardNotices]=useState<Array<{key:string;title:string;body:string;createdAt:string;read:boolean}>>([]);
  const [noticesLoading,setNoticesLoading]=useState(false);
  React.useEffect(()=>{
    if(dashboardTab!=='overview'||!isAuthenticated)return;
    const token=getStudentToken();if(!token)return;
    let active=true;setNoticesLoading(true);
    upecAuthApi.studentNotifications(token).then(result=>{
      if(active)setDashboardNotices((result.notifications||[]).slice(0,3));
    }).catch(()=>{if(active)setDashboardNotices([]);}).finally(()=>{if(active)setNoticesLoading(false);});
    return()=>{active=false;};
  },[dashboardTab,isAuthenticated]);

  React.useEffect(() => {
    const onHashChange = () => setDashboardTab(tabFromHash());
    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('popstate', onHashChange);
    return () => {
      window.removeEventListener('hashchange', onHashChange);
      window.removeEventListener('popstate', onHashChange);
    };
  }, []);

  const selectPortalTab = (tab: string) => {
    if (!portalTabs.includes(tab)) return;
    setDashboardTab(tab);
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search + '#' + tab);
  };

  const [correctionOpen,setCorrectionOpen]=useState(false);
  const [correctionForm,setCorrectionForm]=useState<Record<string,unknown>>({});
  const [correctionBusy,setCorrectionBusy]=useState(false);
  const [correctionMessage,setCorrectionMessage]=useState('');
  const [applicationHistory,setApplicationHistory]=useState<Array<{id:string;new_status:string;created_at:string}>>([]);
  const [historyLoading,setHistoryLoading]=useState(false);
  const [historyError,setHistoryError]=useState('');
  const applicationId=currentUser?.application?.id;
  const isAdmitted=currentUser?.application?.status==='approved';
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
  React.useEffect(() => {
    if (!isEditingBiodata) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEditingBiodata(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isEditingBiodata]);

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
    notifyPortal('success','Your biodata was saved successfully.');
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
      onTabChange={selectPortalTab}
      onNavigate={onNavigate}
    >
      <div className="mx-auto w-full max-w-[1250px] min-w-0 space-y-4 sm:space-y-5 site-page-enter">
        {/* Success Alert */}
        {editSuccessMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{editSuccessMsg}</span>
          </div>
        )}

        {/* Dashboard-only welcome / identity card — no duplicate on module screens. */}
        {dashboardTab === 'overview' && (
          <div className="space-y-4 sm:space-y-5">
            <section className="relative overflow-hidden rounded-[22px] border border-[#dbe5f3] bg-gradient-to-r from-[#edf3ff] via-[#f0f6ff] to-[#dbe8fa] shadow-sm">
              <div className="absolute inset-y-0 right-0 hidden w-[38%] lg:block">
                <img src="/images/campus_atmosphere.jpg" alt="" className="h-full w-full object-cover opacity-30"/>
              </div>
              <div className="relative flex min-h-[184px] flex-col justify-between gap-5 px-5 py-6 sm:px-7 lg:min-h-[205px] lg:flex-row lg:items-center lg:gap-8 lg:px-8">
                <div className="flex min-w-0 items-start gap-4 sm:items-center sm:gap-5">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-white bg-[#14285e] text-xl font-black text-white shadow-md sm:h-24 sm:w-24">
                    {dashboardPhoto ? <img src={dashboardPhoto} alt="Student passport photograph" className="h-full w-full object-cover"/> : <span>{currentUser.biodata.firstName?.[0] || 'S'}{currentUser.biodata.surname?.[0] || ''}</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#52658b] sm:text-sm">Welcome back,</p>
                    <h1 className="mt-1 break-words text-xl font-black tracking-tight text-[#111A43] sm:text-[28px]">{currentUser.fullName}</h1>
                    <p className="mt-2 text-xs font-medium text-[#435779] sm:text-sm">{currentUser.biodata.targetExam || 'Programme not selected'}</p>
                    <span className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${isAdmitted?'bg-emerald-100 text-emerald-800':currentUser.application?'bg-amber-100 text-amber-800':'bg-white/90 text-[#244274]'}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current"/>{currentUser.application?.status?.replace(/_/g,' ') || 'Application not started'}
                    </span>
                  </div>
                </div>
                <button type="button" onClick={()=>selectPortalTab('profile')} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-[#C62839] px-5 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#a51b2b] lg:self-center">View My Profile <ArrowRight size={16}/></button>
              </div>
            </section>

            <section aria-label="Student overview" className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <article className="min-w-0 rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><span className="rounded-xl bg-[#eaf3ff] p-2.5 text-[#2456a0]"><User size={22}/></span><span className="text-xs font-semibold text-slate-500">Profile status</span></div>
                <h2 className="mt-3 text-[19px] font-black text-[#111A43]">{currentUser.profileCompleted?'Completed':'Incomplete'}</h2>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#edf1f7]"><div className={`h-full rounded-full ${currentUser.profileCompleted?'w-full bg-emerald-500':'w-0'}`}/></div>
                <button type="button" onClick={()=>selectPortalTab('profile')} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#C62839]">View profile <ArrowRight size={15}/></button>
              </article>
              <article className="min-w-0 rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between"><span className="rounded-xl bg-[#fff1df] p-2.5 text-[#bf791d]"><FileText size={22}/></span><span className="text-xs font-semibold text-slate-500">Application status</span></div>
                <h2 className="mt-3 break-words text-[19px] font-black capitalize text-[#111A43]">{currentUser.application?.status?.replace(/_/g,' ')||'Not started'}</h2>
                <p className="mt-2 text-xs text-slate-500">Reference: {currentUser.application?.referenceNumber||'Not issued'}</p>
                <button type="button" onClick={()=>selectPortalTab('applications')} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#C62839]">View application <ArrowRight size={15}/></button>
              </article>
              <article className="min-w-0 rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-1">
                <div className="flex items-center justify-between"><span className="rounded-xl bg-[#e9f7ec] p-2.5 text-emerald-700"><ShieldCheck size={22}/></span><span className="text-xs font-semibold text-slate-500">Account verification</span></div>
                <h2 className="mt-3 text-[19px] font-black text-[#111A43]">{currentUser.isEmailVerified?'Verified':'Pending'}</h2>
                <p className="mt-2 break-all text-xs text-slate-500">{currentUser.email}</p>
                <button type="button" onClick={()=>selectPortalTab('settings')} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#C62839]">Account settings <ArrowRight size={15}/></button>
              </article>
            </section>

            <div className="grid min-w-0 grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,1fr)]">
              <div className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div><h2 className="text-[17px] font-extrabold text-[#111A43]">Application Journey</h2><p className="mt-1 text-xs text-slate-500">Track your progress step by step</p></div>
                    <button type="button" onClick={()=>selectPortalTab('applications')} className="rounded-lg bg-[#111A43] px-4 py-2 text-xs font-bold text-white">Continue</button>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    {[
                      {label:'Account',done:true},
                      {label:'Profile',done:currentUser.profileCompleted},
                      {label:'Application',done:!!currentUser.application},
                      {label:'Review & Status',done:isAdmitted}
                    ].map((step,index)=><div key={step.label} className="flex min-w-0 flex-col items-center text-center">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${step.done?'bg-[#14a376] text-white':'bg-[#eef1f7] text-[#69738a]'}`}>{step.done?<Check size={18}/>:index+1}</span>
                      <span className="mt-3 text-xs font-bold text-[#111A43]">{step.label}</span>
                      <span className={`mt-1 text-[10px] font-semibold ${step.done?'text-emerald-700':'text-slate-500'}`}>{step.done?'Completed':'Pending'}</span>
                    </div>)}
                  </div>
                </section>
                <section className="rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-[17px] font-extrabold text-[#111A43]">Quick Access</h2>
                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      {label:'My Profile',tab:'profile',Icon:User,tone:'bg-[#eef3ff] text-[#3359a5]'},
                      {label:'Applications',tab:'applications',Icon:FileText,tone:'bg-[#fff1e5] text-[#ab651a]'},
                      {label:'CBT Practice',tab:'cbt',Icon:BookOpen,tone:'bg-[#f3ecff] text-[#754cb2]'},
                      {label:'Documents',tab:'documents',Icon:Download,tone:'bg-[#e9f6ee] text-[#237e52]'}
                    ].map(item=><button type="button" key={item.tab} onClick={()=>selectPortalTab(item.tab)} className={`flex min-h-[100px] min-w-0 flex-col items-center justify-center gap-2.5 rounded-xl p-3 text-center text-xs font-bold transition-transform hover:-translate-y-0.5 ${item.tone}`}><item.Icon size={24}/>{item.label}</button>)}
                  </div>
                </section>
              </div>
              <aside className="min-w-0 space-y-4">
                <section className="rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-[17px] font-extrabold text-[#111A43]">Notifications</h2><button type="button" onClick={()=>selectPortalTab('notices')} className="text-xs font-bold text-[#C62839]">View All</button></div>
                  <div className="mt-4 space-y-2">{noticesLoading?<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Loading notifications…</p>:dashboardNotices.length?dashboardNotices.map(item=><button type="button" key={item.key} onClick={()=>selectPortalTab('notices')} className="block w-full rounded-xl bg-slate-50 p-3 text-left"><span className="block text-sm font-semibold text-[#111A43]">{item.title}</span><span className="mt-1 block text-xs text-slate-500">{item.body}</span></button>):<p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">No new notifications</p>}</div>
                </section>
                <section className="rounded-2xl border border-[#dce5f0] bg-white p-5 shadow-sm sm:p-6">
                  <h2 className="text-[17px] font-extrabold text-[#111A43]">Important Dates</h2>
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No official dates have been published.</div>
                </section>
              </aside>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 2: MY PROFILE (Dedicated Photo & Particulars — NO Welcome Banner)
            ========================================================================= */}
        {dashboardTab === 'profile' && (
          <ProfileTabView
            currentUser={currentUser}
            onEditBiodata={startEditing}
            dashboardPhoto={dashboardPhoto}
          />
        )}

        {/* =========================================================================
            TAB 3: APPLICATIONS (Stages Stepper, Radial Donut, History & Deadlines)
            ========================================================================= */}
        {dashboardTab === 'applications' && (
          <ApplicationsTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
            correctionOpen={correctionOpen}
            setCorrectionOpen={setCorrectionOpen}
            correctionForm={correctionForm}
            setCorrectionForm={setCorrectionForm}
            correctionBusy={correctionBusy}
            correctionMessage={correctionMessage}
            submitCorrection={submitCorrection}
            applicationHistory={applicationHistory}
            historyLoading={historyLoading}
            historyError={historyError}
          />
        )}

        {/* =========================================================================
            TAB 4: DOCUMENTS & SLIPS (Filter Tabs, Upload Zone, Guidelines)
            ========================================================================= */}
        {dashboardTab === 'documents' && (
          <DocumentsTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 5: CBT PRACTICE SIMULATOR (Subjects Grid, Active Practice Timer, Palette)
            ========================================================================= */}
        {dashboardTab === 'cbt' && (
          <CbtTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 6: LEARNING RESOURCES (Search, Featured Masterclasses, Subject Grid)
            ========================================================================= */}
        {dashboardTab === 'resources' && (
          <LearningResourcesTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 7: NOTICE BOARD (Category Pills, Pinned Cards, Feed & Important Dates)
            ========================================================================= */}
        {dashboardTab === 'notices' && (
          <NoticeBoardTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 8: MESSAGES (Two-Column Chat, Department Threads, Active Composer)
            ========================================================================= */}
        {dashboardTab === 'messages' && (
          <MessagesTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 9: PAYMENTS (4 Metric Cards, Subtabs, Approved Accounts & Upload Evidence)
            ========================================================================= */}
        {dashboardTab === 'payments' && (
          <PaymentsTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
          />
        )}

        {/* =========================================================================
            TAB 10: SETTINGS (2x3 Grid, Password Form, Toggles, Quick Actions)
            ========================================================================= */}
        {dashboardTab === 'settings' && (
          <SettingsTabView
            currentUser={currentUser}
            onNavigateTab={selectPortalTab}
            onSignOut={() => {
              logout();
              onNavigate('/student/login');
            }}
          />
        )}
      </div>

      {/* =========================================================================
          COMPREHENSIVE STUDENT BIODATA FORM MODAL
          ========================================================================= */}
      {isEditingBiodata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto site-modal-backdrop" role="dialog" aria-modal="true" aria-label="Edit student biodata" onClick={() => setIsEditingBiodata(false)}>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full p-4 sm:p-8 my-auto max-h-[95vh] overflow-y-auto site-modal-panel" onClick={(event) => event.stopPropagation()}>
            <StudentBiodataForm
              onCancel={() => setIsEditingBiodata(false)}
              onSuccess={() => {
                setIsEditingBiodata(false);
                notifyPortal('success','Your biodata was saved successfully.');
                setTimeout(() => setEditSuccessMsg(null), 4000);
              }}
            />
          </div>
        </div>
      )}
    </StudentPortalLayout>
  );
}
