import React, { useState } from 'react';
import {
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  Download,
  Calendar,
  Building,
  GraduationCap,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  FileText,
  Printer,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import StudentApplicationRegister from '../StudentApplicationRegister';
import StudentHostelRequests from '../StudentHostelRequests';
import ProgrammeEnrollment from '../ProgrammeEnrollment';

interface ApplicationsTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
  correctionOpen: boolean;
  setCorrectionOpen: (open: boolean) => void;
  correctionForm: Record<string, unknown>;
  setCorrectionForm: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  correctionBusy: boolean;
  correctionMessage: string;
  submitCorrection: (e: React.FormEvent) => Promise<void>;
  applicationHistory: Array<{ id: string; new_status: string; created_at: string }>;
  historyLoading: boolean;
  historyError: string;
}

export default function ApplicationsTabView({
  currentUser,
  onNavigateTab,
  correctionOpen,
  setCorrectionOpen,
  correctionForm,
  setCorrectionForm,
  correctionBusy,
  correctionMessage,
  submitCorrection,
  applicationHistory,
  historyLoading,
  historyError,
}: ApplicationsTabViewProps) {
  const [showRegisterNew, setShowRegisterNew] = useState(false);
  const application = currentUser.application;
  const isAdmitted = application?.status === 'approved';
  const hasApplication=Boolean(application?.id);
  const hasDecision=isAdmitted||application?.status==='rejected';
  const isUnderReview=hasApplication&&(hasDecision||application?.status==='under_review'||application?.status==='action_required');
  const applicationStage = !hasApplication ? 0 : hasDecision ? 4 : isUnderReview ? 3 : 2;
  const stageProgress=applicationStage*25;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            My Applications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track and manage your academic programme applications and admission decisions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRegisterNew(!showRegisterNew)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <FileText size={14} />
            <span>{showRegisterNew ? 'Close Application Form' : '+ New Application'}</span>
          </button>
        </div>
      </div>

      {showRegisterNew && <ProgrammeEnrollment onClose={()=>setShowRegisterNew(false)} />}

      {/* Main Grid: Left (Current application & details), Right (Deadlines, Actions & Updates) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN: Current Application Card, Stages, Details */}
        <div className="space-y-6">
          {/* Correction Alert if needed */}
          {application?.status === 'action_required' && (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-xs">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-[#111A43]">
                    Application Correction Required
                  </h3>
                  <p className="mt-1 text-xs text-slate-700 leading-relaxed">
                    Your application was reviewed by the admissions team and requires corrections before approval. Please update your details below.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCorrectionForm({ ...application?.formData });
                      setCorrectionOpen(true);
                    }}
                    className="mt-3 px-4 py-2 rounded-xl bg-[#c62839] text-white text-xs font-bold hover:bg-[#a51b2b] cursor-pointer"
                  >
                    Open Correction Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Inline Correction Form Modal */}
          {correctionOpen && application && (
            <div className="rounded-2xl border-2 border-[#d5a75b] bg-white p-6 shadow-md">
              <h3 className="font-bold text-base text-[#111A43]">
                Review &amp; Correct Application Information
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Programme and session cannot be changed. Update other fields and submit for re-review.
              </p>
              <form onSubmit={submitCorrection} className="mt-4 space-y-3.5">
                {Object.entries(correctionForm)
                  .filter(([k, v]) => typeof v === 'string' && !['programmeCategory', 'preferredSession'].includes(k))
                  .map(([k, v]) => (
                    <label key={k} className="block text-xs font-bold text-[#111A43]">
                      <span className="capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <input
                        value={String(v)}
                        maxLength={500}
                        onChange={(e) => setCorrectionForm((prev) => ({ ...prev, [k]: e.target.value }))}
                        className="mt-1 block w-full rounded-xl border border-slate-300 p-2.5 font-normal text-xs"
                      />
                    </label>
                  ))}
                {correctionMessage && (
                  <p className="text-xs text-red-600 font-semibold">{correctionMessage}</p>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setCorrectionOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-[#111A43]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={correctionBusy}
                    className="px-4 py-2 rounded-xl bg-[#c62839] text-xs font-bold text-white disabled:opacity-50"
                  >
                    {correctionBusy ? 'Submitting...' : 'Resubmit for Review'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Application Hero Card (Matching Mockup) */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#111A43] to-[#1c3275] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <GraduationCap size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                      Reference: {application?.referenceNumber || 'Not issued'}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isAdmitted
                        ? 'bg-emerald-100 text-emerald-800'
                        : application
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {application?.status ? application.status.replace(/_/g, ' ') : 'No application'}
                    </span>
                  </div>
                  <h2 className="mt-1 text-lg font-black text-[#111A43]">
                    {application?.programme || 'No programme application submitted'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Session: {application?.session || 'Not assigned'}{application?.studyCenter ? ' · Centre: '+application.studyCenter : ''}
                  </p>
                </div>
              </div>

              {/* Progress Donut / Indicator */}
              <div className="flex items-center gap-3.5 bg-slate-50 border border-slate-100 rounded-2xl p-3 self-start">
                <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200"
                      strokeWidth="3.5"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={isAdmitted ? 'text-emerald-500' : 'text-[#c62839]'}
                      strokeDasharray={`${stageProgress}, 100`}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-black text-[#111A43]">
                    {stageProgress+'%'}
                  </span>
                </div>
                <div className="text-left text-xs leading-tight">
                  <strong className="block font-bold text-[#111A43]">Application</strong>
                  <span className="text-[11px] text-slate-500">
                    {!hasApplication ? 'Not started' : isAdmitted ? 'Approved' : 'Stage '+applicationStage+' of 4'}
                  </span>
                </div>
              </div>
            </div>

            {/* 4 Application Stages Stepper (Faithful Mockup Reproduction) */}
            <div className="pt-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                Application Stages &amp; Approval Stepper
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
                {/* Step 1 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-full ${Boolean(currentUser.biodata.surname && currentUser.biodata.firstName && currentUser.biodata.dateOfBirth && currentUser.biodata.address) ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'} flex items-center justify-center text-xs font-bold shadow-xs`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#111A43]">1. Biodata</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{Boolean(currentUser.biodata.surname && currentUser.biodata.firstName && currentUser.biodata.dateOfBirth && currentUser.biodata.address) ? 'Completed' : 'Not completed'}</span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-full ${hasApplication?'bg-emerald-500 text-white':'bg-slate-200 text-slate-500'} flex items-center justify-center text-xs font-bold shadow-xs` }>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#111A43]">2. Application</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">{hasApplication ? 'Submitted' : 'Not submitted'}</span>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                    hasDecision ? 'bg-emerald-500 text-white' : isUnderReview ? 'bg-[#c62839] text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {hasDecision ? <CheckCircle2 size={16} /> : isUnderReview ? <Clock size={16} /> : 3}
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#111A43]">3. Review</span>
                  <span className={`text-[10px] font-semibold ${isAdmitted ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {hasDecision ? 'Reviewed' : isUnderReview ? 'In review' : 'Not started'}
                  </span>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col items-center text-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isAdmitted ? 'bg-emerald-500 text-white' : application?.status==='rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {isAdmitted ? <CheckCircle2 size={16} /> : 4}
                  </div>
                  <span className="mt-2 text-xs font-bold text-[#111A43]">4. Decision</span>
                  <span className={`text-[10px] font-semibold ${isAdmitted ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {isAdmitted ? 'Admitted' : application?.status==='rejected' ? 'Not admitted' : hasApplication ? 'Pending' : 'Not started'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-500">Registered Subjects:</span>
                {(application?.chosenSubjects || []).map((subj: string) => (
                  <span
                    key={subj}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#111A43] font-semibold text-xs border border-slate-200"
                  >
                    {subj}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateTab('documents')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#111A43] hover:bg-[#1c3275] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  <FileText size={14} />
                  <span>Upload Documents</span>
                </button>
              </div>
            </div>
          </div>

          {/* If admitted, Hostel Requests module */}
          {isAdmitted && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <StudentHostelRequests />
            </div>
          )}

          {/* Application Status History Table */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Application Status History &amp; Audits
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logged timeline of admissions committee updates
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-400">
                {application?.referenceNumber || 'Not issued'}
              </span>
            </div>

            {historyLoading ? (
              <p className="text-xs text-slate-500 py-6 text-center">Loading status logs...</p>
            ) : historyError ? (
              <p className="text-xs text-red-600 py-4">{historyError}</p>
            ) : applicationHistory.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                <p>{hasApplication ? 'No recorded status changes yet.' : 'No application has been submitted yet.'}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Further status updates will appear here as your credentials are verified.
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-3">
                {applicationHistory.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <strong className="block font-bold text-[#111A43] capitalize">
                        {item.new_status.replace(/_/g, ' ')}
                      </strong>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Deadlines, Next Actions, Admission Updates */}
        <div className="space-y-6">
          {/* Application Deadlines Card */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar size={18} className="text-[#c62839]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Application Deadlines
              </h3>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-600">No programme-specific deadline has been published to your application record. Check official notices for approved dates.</p>
          </div>

          {/* Required Next Actions */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <AlertCircle size={18} className="text-[#c62839]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Required Next Actions
              </h3>
            </div>
            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-700">{!hasApplication ? 'Start a new programme application to see your admission tasks.' : application?.status==='action_required' ? 'Your application requires correction. Open the correction form to review the requested changes.' : isAdmitted ? 'Your application has been approved. Check your documents and official notices for next steps.' : 'Check your status history and official notices for updates from admissions.'}</div>
          </div>

          {/* Need Assistance */}
          <div className="bg-gradient-to-br from-[#111A43] to-[#1c3275] rounded-2xl p-6 text-white shadow-md">
            <h3 className="text-sm font-extrabold flex items-center gap-2">
              <HelpCircle size={18} className="text-[#d5a75b]" />
              <span>Admissions Support</span>
            </h3>
            <p className="mt-2 text-xs text-slate-200 leading-relaxed">
              Have questions regarding programme eligibility, study centers, or document clearance?
            </p>
            <button
              type="button"
              onClick={() => onNavigateTab('messages')}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Message Admissions Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
