import React, { useState } from 'react';
import {
  User,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Users,
  Camera,
  Edit3,
  AlertCircle,
  FileCheck,
  Award,
  Check,
  Trash2,
  Lock,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import StudentPhotoUpload from '../StudentPhotoUpload';

interface ProfileTabViewProps {
  currentUser: StudentUser;
  onEditBiodata: () => void;
  dashboardPhoto: string | null;
}

export default function ProfileTabView({
  currentUser,
  onEditBiodata,
  dashboardPhoto,
}: ProfileTabViewProps) {
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            My Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your personal particulars, academic records, and institutional verification status
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Profile {currentUser.profileCompleted ? '100% Complete' : 'In Progress'}</span>
          </span>
          <button
            type="button"
            onClick={onEditBiodata}
            disabled={!currentUser.biodataEditAllowed}
            title={!currentUser.biodataEditAllowed ? 'Contact administration to request biodata editing permission' : 'Update profile details'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
          >
            <Edit3 size={14} />
            <span>Update Biodata</span>
          </button>
        </div>
      </div>

      {/* Main Profile Grid: Left column (Identity & Verification), Right column (Details Cards) */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* LEFT COLUMN: Photo, Identity summary & Verification Checklist */}
        <div className="space-y-6">
          {/* Profile Photo & Quick Identity Card */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 text-center shadow-xs">
            <div className="relative mx-auto w-28 h-28">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#14285e] flex items-center justify-center text-white text-2xl font-black">
                {dashboardPhoto ? (
                  <img
                    src={dashboardPhoto}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>
                    {currentUser.biodata.firstName?.[0] || 'S'}
                    {currentUser.biodata.surname?.[0] || 'U'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="absolute bottom-0 right-0 p-2 rounded-full bg-[#c62839] hover:bg-[#a51b2b] text-white shadow-md transition-colors cursor-pointer"
                title="Change passport photograph"
                aria-label="Change photo"
              >
                <Camera size={15} />
              </button>
            </div>

            <h2 className="mt-4 text-lg font-black text-[#111A43] truncate">
              {currentUser.fullName}
            </h2>
            <p className="text-xs font-mono font-bold text-slate-500 mt-0.5">
              ID: {currentUser.regNumber || currentUser.application?.referenceNumber || 'Not issued'}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#eef3ff] text-[#2456a0] text-xs font-bold">
              {currentUser.biodata.targetExam || currentUser.application?.programme || 'Not selected'}
            </span>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#111A43] transition-colors cursor-pointer"
              >
                Change Photo
              </button>
            </div>
            <p className="mt-2 text-[10px] text-slate-400">
              Passport photograph · JPG or PNG, max 2MB
            </p>
          </div>

          {/* Account Verification Checklist */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-[#c62839]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Account Verification
              </h3>
            </div>

            <div className="mt-4 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">Email Address</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {currentUser.isEmailVerified ? 'Verified' : 'Not verified'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">Phone Contact</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Not confirmed
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center ${currentUser.application ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {currentUser.application ? <Check size={12} strokeWidth={3} /> : <Clock size={12} />}
                  </span>
                  <span className="text-xs font-semibold text-slate-700">Identity Documents</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${currentUser.application ? 'text-emerald-700 bg-emerald-50' : 'text-amber-700 bg-amber-50'}`}>
                  {currentUser.application ? 'Submitted' : 'Not submitted'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <span className="text-xs font-semibold text-slate-700">Student Biodata</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {currentUser.profileCompleted ? 'Completed' : 'Incomplete'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Particulars Cards */}
        <div className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-50 text-[#c62839]">
                  <User size={18} />
                </span>
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Personal Particulars
                </h3>
              </div>
              <button
                type="button"
                onClick={onEditBiodata}
                disabled={!currentUser.biodataEditAllowed}
                className="text-xs font-bold text-[#c62839] hover:underline disabled:opacity-40"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Full Name</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.fullName}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Date of Birth</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.dateOfBirth || '14 May 2006'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Gender</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.gender || 'Female'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Nationality</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  Nigerian
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">State of Origin</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.stateOfOrigin || 'Lagos State'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Local Government Area</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.lga || 'Ikeja'}
                </strong>
              </div>
              <div className="sm:col-span-2 lg:col-span-3">
                <span className="text-slate-400 font-medium block">Residential Address</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.address || '14 Adewale Street, off Allen Avenue, Ikeja, Lagos'}
                </strong>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-[#2456a0]">
                  <Mail size={18} />
                </span>
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Contact Information
                </h3>
              </div>
              <button
                type="button"
                onClick={onEditBiodata}
                disabled={!currentUser.biodataEditAllowed}
                className="text-xs font-bold text-[#c62839] hover:underline disabled:opacity-40"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Primary Email</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.email}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Mobile Phone Number</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.phone || '+234 812 345 6789'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">WhatsApp Contact</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.phone || '+234 812 345 6789'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Emergency Contact Phone</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.guardianPhone || '+234 803 987 6543'}
                </strong>
              </div>
            </div>
          </div>

          {/* Educational Background & Target Pathway */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <GraduationCap size={18} />
                </span>
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Educational Pathway & Goals
                </h3>
              </div>
              <button
                type="button"
                onClick={onEditBiodata}
                disabled={!currentUser.biodataEditAllowed}
                className="text-xs font-bold text-[#c62839] hover:underline disabled:opacity-40"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Previous Secondary School</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.previousSchool || 'Government College, Lagos'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Enrolled Programme</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.targetExam || currentUser.application?.programme || 'IJMB Advanced Level'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Target Higher Institution</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.targetInstitution || 'University of Ibadan'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Target Course of Study</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.targetCourse || 'Medicine & Surgery (MBBS)'}
                </strong>
              </div>
            </div>
          </div>

          {/* Guardian / Sponsor Information */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <Users size={18} />
                </span>
                <h3 className="text-sm font-extrabold text-[#111A43]">
                  Guardian & Sponsor Details
                </h3>
              </div>
              <button
                type="button"
                onClick={onEditBiodata}
                disabled={!currentUser.biodataEditAllowed}
                className="text-xs font-bold text-[#c62839] hover:underline disabled:opacity-40"
              >
                Edit
              </button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Guardian Full Name</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.guardianName || 'Dr. Ibrahim Yusuf'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Relationship</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.guardianRelationship || 'Father / Sponsor'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Guardian Contact Phone</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.guardianPhone || '+234 803 987 6543'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Guardian Residential Address</span>
                <strong className="text-[#111A43] font-bold text-sm block mt-0.5">
                  {currentUser.biodata.address || 'Same as Student'}
                </strong>
              </div>
            </div>
          </div>

          {/* Security & Verification Tip Banner */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 sm:p-5 flex items-start gap-3.5">
            <ShieldCheck size={20} className="text-[#2456a0] shrink-0 mt-0.5" />
            <div className="text-xs text-[#1e3a6a] leading-relaxed">
              <strong className="font-bold block mb-0.5">Official Verification Notice</strong>
              All particulars are verified against your original educational certificates during physical clearance. Ensure your names correspond strictly with your O'Level certificates and National Identity records.
            </div>
          </div>
        </div>
      </div>

      {/* Photo Upload Modal */}
      {photoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setPhotoModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              ✕
            </button>
            <StudentPhotoUpload
              fullName={currentUser.fullName}
              email={currentUser.email}
            />
            <div className="mt-4 pt-3 border-t text-right">
              <button
                type="button"
                onClick={() => setPhotoModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
