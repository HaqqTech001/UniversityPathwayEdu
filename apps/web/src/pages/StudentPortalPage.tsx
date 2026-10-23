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

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StudentPortalPage({ onNavigate }: PageProps) {
  const { currentUser, isAuthenticated, updateBiodata, refreshStudent } = useAuth();

  // Navigation tab state controlled by the Left Navigation Drawer
  const portalTabs = ['overview','profile','applications','documents','cbt','notices','settings'];
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
      <div className="mx-auto w-full max-w-[1250px] min-w-0 space-y-4 sm:space-y-5">
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
            DRAWER TAB 2: MY PROFILE / BIODATA
            ========================================================================= */}
        {dashboardTab === 'profile' && (
          <div className="space-y-6">
            <StudentPhotoUpload fullName={currentUser.fullName} email={currentUser.email}/>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
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
                disabled={!currentUser.biodataEditAllowed}
                title={!currentUser.biodataEditAllowed ? 'Contact administration to request biodata editing permission' : 'Update biodata'}
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
            {isAdmitted&&<StudentHostelRequests/>}
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
                      <span>View Application Documents</span>
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
            {isAdmitted?<StudentLearningResources />:<section className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">Learning resources unlock after your application has been approved.</section>}
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
        {dashboardTab === 'cbt' && !isAdmitted && <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="text-lg font-bold text-[#111A43]">Admission approval required</h2><p className="mt-2 text-sm">You can complete and track your application now. CBT becomes available once your admission is approved.</p><button type="button" onClick={()=>setDashboardTab('applications')} className="mt-4 rounded-lg bg-[#111A43] px-4 py-2 font-bold text-white">View my application</button></section>}
        {dashboardTab === 'cbt' && isAdmitted && (
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
        {dashboardTab === 'profile' && <GuardianContact/>}
        {dashboardTab === 'documents' && <div className="space-y-6"><StudentFeeStatement/><StudentPaymentHistory/><StudentRegistrationFees/><StudentMonthlyFees/><ConductAcknowledgement/></div>}
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
