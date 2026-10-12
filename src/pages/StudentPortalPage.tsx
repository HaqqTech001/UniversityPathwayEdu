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
  const { currentUser, isAuthenticated, updateBiodata } = useAuth();

  // Navigation tab state controlled by the Left Navigation Drawer
  const [dashboardTab, setDashboardTab] = useState<string>('overview');

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
    setPasswordNotice('Password updated successfully.');
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
              {currentUser.biodata.firstName[0] || 'U'}
              {currentUser.biodata.surname[0] || 'P'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg sm:text-xl font-serif font-black text-[#0b1a42]">
                  {currentUser.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  Verified Candidate
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
                  Target: <strong>{currentUser.biodata.targetExam || 'JAMB (UTME) 2025'}</strong>
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
          <div className="space-y-6">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CBT Simulator Average
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-black text-[#0b1a42] mt-1">
                  294 / 400
                </p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                  <TrendingUp size={12} />
                  Top 5% in Science Cohort
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Lecture Attendance
                </span>
                <p className="font-serif text-2xl sm:text-3xl font-black text-[#0b1a42] mt-1">
                  96%
                </p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  24 of 25 Lectures Attended
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Upcoming Mock Test
                </span>
                <p className="font-serif text-lg sm:text-xl font-black text-[#c62839] mt-1">
                  Saturday 8:00 AM
                </p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Computerized Mock #13
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Cohort Clearance
                </span>
                <p className="font-serif text-lg sm:text-xl font-black text-emerald-700 mt-1">
                  Cleared &amp; Active
                </p>
                <span className="text-[10px] text-slate-500 font-medium block mt-1">
                  Batch A (Morning Session)
                </span>
              </div>
            </div>

            {/* Split: Schedule & CBT Practice launcher */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Cols: Schedule */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-[#c62839]" />
                    <h2 className="font-serif text-base font-bold text-[#0b1a42]">
                      Today's Coaching Schedule
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">Sawmill Campus Hall A</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0b1a42]">09:00 AM – 11:30 AM: Chemistry</p>
                      <p className="text-[11px] text-slate-500">
                        Instructor: Mr. Balogun • Topics: Periodic Table &amp; Gas Laws
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Completed
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-red-50/60 border border-red-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0b1a42]">11:45 AM – 01:45 PM: Mathematics</p>
                      <p className="text-[11px] text-slate-500">
                        Instructor: Engr. Salami • Topics: Differential Calculus
                      </p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#c62839]">
                      In Session
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#0b1a42]">02:15 PM – 04:00 PM: Consultation Clinic</p>
                      <p className="text-[11px] text-slate-500">One-on-one difficult topic reviews</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700">
                      Upcoming
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Quick Notice & Practice button */}
              <div className="bg-[#08163b] text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={18} className="text-[#f0bb5b]" />
                    <h3 className="font-serif text-base font-bold">UTME CBT Practice</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Test your speed and accuracy in English, Mathematics, Biology, Chemistry, and Physics. Review instant solution rationales after each attempt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDashboardTab('cbt')}
                  className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen size={15} />
                  <span>Open CBT Practice Simulator</span>
                </button>
              </div>
            </div>
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
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold self-start sm:self-auto flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>Approved &amp; Active</span>
                </span>
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
                    Your current registration is cleared. To enquire about additional cohorts, contact the centre desk.
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
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#0b1a42]">
                Official Institutional Notices &amp; Announcements
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Updates directly from the University Pathway Academic Board and Center Administration.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <article className="p-5 rounded-2xl bg-red-50/50 border border-red-200/60">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#c62839] mb-1.5">
                  <span className="uppercase tracking-wider">MOCK EXAM REMINDER</span>
                  <span>Posted Oct 9, 2024</span>
                </div>
                <h4 className="font-bold text-sm text-[#0b1a42]">
                  Saturday Computerized Mock #13 Attendance Mandatory
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  All Batch A candidates are required to arrive by 7:45 AM for biometric attendance and desk allocation. Bring your scientific calculators. Computer terminals will be assigned by registration sequence.
                </p>
              </article>

              <article className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1.5">
                  <span className="uppercase tracking-wider">ACADEMIC WORKSHOP</span>
                  <span>Posted Oct 5, 2024</span>
                </div>
                <h4 className="font-bold text-sm text-[#0b1a42]">
                  Compulsory JAMB English Literature Prescribed Text Review
                </h4>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Special Friday interactive seminar on the compulsory English text will hold in Main Hall A from 9:00 AM to 11:30 AM. Handouts will be distributed.
                </p>
              </article>
            </div>
          </div>
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
