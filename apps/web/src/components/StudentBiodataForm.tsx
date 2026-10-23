import React, { useState } from 'react';
import {notifyPortal} from './PortalToasts';
import {
  User,
  Users,
  GraduationCap,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface StudentBiodataFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export default function StudentBiodataForm({
  onCancel,
  onSuccess,
}: StudentBiodataFormProps) {
  const { currentUser, updateBiodata } = useAuth();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successToast, setSuccessToast] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  // Initialize form state directly from authenticated student's record
  const [formData, setFormData] = useState({
    // Step 1: Student Biodata & Contact
    surname: currentUser?.biodata.surname || '',
    firstName: currentUser?.biodata.firstName || '',
    middleName: currentUser?.biodata.otherNames || '',
    dateOfBirth: currentUser?.biodata.dateOfBirth || '',
    placeOfBirth: '',
    gender: currentUser?.biodata.gender || 'Female',
    stateOfOrigin: currentUser?.biodata.stateOfOrigin || '',
    lga: currentUser?.biodata.lga || '',
    nationality: 'Nigerian',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    alternatePhone: '',
    currentAddress: currentUser?.biodata.address || '',
    permanentAddress: currentUser?.biodata.address || '',

    // Step 2: Guardian & Emergency Contact
    guardianRelationship: currentUser?.biodata.guardianRelationship || 'Father',
    guardianName: currentUser?.biodata.guardianName || '',
    guardianOccupation: '',
    guardianWorkplace: '',
    guardianEmail: '',
    guardianPhone: currentUser?.biodata.guardianPhone || '',
    guardianAlternatePhone: '',
    guardianAddress: currentUser?.biodata.guardianAddress || currentUser?.biodata.address || '',
    emergencyName: currentUser?.biodata.guardianName || '',
    emergencyRelationship: 'Father',
    emergencyPhone: currentUser?.biodata.guardianPhone || '',
    emergencyAddress: currentUser?.biodata.address || '',

    // Step 3: Education & Programme
    currentSchool: currentUser?.biodata.previousSchool || '',
    currentClass: '',
    schoolAddress: '',
    programmeCategory: currentUser?.biodata.targetExam || '',
    preferredSession: 'Morning',
    department: 'Science',
    duration: '6 months',
    utmeSubject1: 'Use of English (Compulsory)',
    utmeSubject2: '',
    utmeSubject3: '',
    utmeSubject4: '',
    targetInstitution: currentUser?.biodata.targetInstitution || '',
    targetCourse: currentUser?.biodata.targetCourse || '',

    // Step 4: Declaration
    declarationConfirmed: false,
  });

  const isUtme = formData.programmeCategory === 'UTME (JAMB)';

  const cleanText = (value: string) => value.normalize('NFC').trim().replace(/\s+/gu,' ');
  const normalized = (field: string) => cleanText(String(formData[field as keyof typeof formData] ?? ''));

  const handleChange = (
    field: string,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Validate Step 1
  const validateStep1 = () => {
    const err: Record<string, string> = {};
    if (!formData.surname.trim()) err.surname = 'Surname is required';
    if (!formData.firstName.trim()) err.firstName = 'First name is required';
    if (!formData.dateOfBirth.trim()) err.dateOfBirth = 'Date of birth is required';
    if (!formData.phone.trim()) err.phone = 'Primary phone number is required';
    if (!formData.currentAddress.trim()) err.currentAddress = 'Current residential address is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Validate Step 2
  const validateStep2 = () => {
    const err: Record<string, string> = {};
    if (!formData.guardianName.trim()) err.guardianName = 'Parent / guardian name is required';
    if (!formData.guardianPhone.trim()) err.guardianPhone = 'Guardian phone number is required';
    if (!formData.emergencyName.trim()) err.emergencyName = 'Emergency contact name is required';
    if (!formData.emergencyPhone.trim()) err.emergencyPhone = 'Emergency phone is required';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // Validate Step 3
  const validateStep3 = () => {
    const err: Record<string, string> = {};
    if (!formData.programmeCategory) err.programmeCategory = 'Please select a programme category';
    if (!formData.preferredSession) err.preferredSession = 'Please select preferred session';
    if (isUtme) {
      if (!formData.targetInstitution.trim()) err.targetInstitution = 'Target institution is required for UTME';
      if (!formData.targetCourse.trim()) err.targetCourse = 'Preferred course is required for UTME';
      const subjects = [formData.utmeSubject2, formData.utmeSubject3, formData.utmeSubject4].map(value => value.trim().toLowerCase());
      if (subjects.some(value => !value)) err.utmeSubject4 = 'Enter all three elective UTME subjects';
      else if (new Set(subjects).size !== 3) err.utmeSubject4 = 'UTME subjects must be different';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    if (!formData.declarationConfirmed) {
      setErrors({ declarationConfirmed: 'You must check the confirmation declaration to proceed.' });
      return;
    }

    // Wait for the backend to confirm persistence before showing success.
    setSaving(true);
    setSaveError('');
    try {
    await updateBiodata({
      surname: normalized('surname'),
      firstName: normalized('firstName'),
      otherNames: normalized('middleName'),
      gender: formData.gender as 'Male' | 'Female',
      dateOfBirth: formData.dateOfBirth,
      phone: formData.phone,
      email: formData.email,
      address: normalized('currentAddress'),
      stateOfOrigin: normalized('stateOfOrigin'),
      lga: normalized('lga'),
      guardianName: normalized('guardianName'),
      guardianPhone: formData.guardianPhone,
      guardianRelationship: formData.guardianRelationship,
      guardianAddress: normalized('guardianAddress'),
      previousSchool: normalized('currentSchool'),
      targetInstitution: isUtme ? formData.targetInstitution : '',
      targetCourse: isUtme ? formData.targetCourse : '',
      targetExam: formData.programmeCategory,
    });

    setSuccessToast(true);
    notifyPortal('success','Student profile saved successfully.');
    if (onSuccess) onSuccess();
    } catch (error) {
      const message=error instanceof Error ? error.message : 'Could not save biodata. Please retry.';
      setSaveError(message);
      notifyPortal('error',message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-5 sm:p-8 lg:p-10 font-sans">
      {/* Form Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c62839] block">
            OFFICIAL STUDENT REGISTRATION RECORD
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-[#0b1a42] mt-1">
            Complete Candidate Biodata Form
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record ID: <strong className="text-[#0b1a42] font-mono">{currentUser?.id.slice(0,8).toUpperCase() || 'Pending'}</strong> • Application reference: <span className="font-mono text-slate-600">{currentUser?.application?.referenceNumber || 'Not yet issued'}</span>
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 self-start sm:self-auto cursor-pointer"
          >
            Exit Form
          </button>
        )}
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="my-8">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4 text-center">
          {[
            { step: 1, title: 'Personal Biodata', icon: User },
            { step: 2, title: 'Guardian & Emergency', icon: Users },
            { step: 3, title: 'Education & Programme', icon: GraduationCap },
            { step: 4, title: 'Review & Declaration', icon: FileCheck },
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;

            return (
              <div
                key={item.step}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
                className={`min-w-0 p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-[#0b1a42] bg-[#0b1a42] text-white shadow-md'
                    : isDone
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-100 bg-slate-50 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  {isDone ? (
                    <Check size={14} className="text-emerald-600" />
                  ) : (
                    <Icon size={14} className={isCurrent ? 'text-[#f0bb5b]' : 'text-slate-400'} />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider">
                    Step {item.step}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs font-bold leading-snug break-words">
                  {item.title}
                </p>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-[#c62839] h-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {saveError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{saveError}</p>}
      {/* Success Notification */}
      {successToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>Candidate biodata records updated and securely saved!</span>
        </div>
      )}

      {/* Form Steps */}
      <form onSubmit={handleFinalSubmit} className="space-y-6">
        {/* =====================================================================
            STEP 1: STUDENT BIODATA & CONTACT DETAILS
            ===================================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#0b1a42]">
                  Section 1: Student Biodata &amp; Contact Particulars
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fields marked with an asterisk (<span className="text-[#c62839]">*</span>) are mandatory.
                </p>
              </div>
              <User size={20} className="text-[#c62839]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Surname <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.surname}
                  onChange={(e) => handleChange('surname', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.surname ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.surname && <p className="text-[10px] text-red-600 mt-1">{errors.surname}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  First Name <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.firstName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.firstName && <p className="text-[10px] text-red-600 mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Middle / Other Name
                </label>
                <input
                  type="text"
                  value={formData.middleName}
                  onChange={(e) => handleChange('middleName', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Date of Birth <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.dateOfBirth ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.dateOfBirth && <p className="text-[10px] text-red-600 mt-1">{errors.dateOfBirth}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Place of Birth</label>
                <input
                  type="text"
                  value={formData.placeOfBirth}
                  onChange={(e) => handleChange('placeOfBirth', e.target.value)}
                  placeholder="e.g. Ilorin"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">State of Origin</label>
                <input
                  type="text"
                  value={formData.stateOfOrigin}
                  onChange={(e) => handleChange('stateOfOrigin', e.target.value)}
                  placeholder="e.g. Kwara State"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Local Government Area (LGA)</label>
                <input
                  type="text"
                  value={formData.lga}
                  onChange={(e) => handleChange('lga', e.target.value)}
                  placeholder="e.g. Ilorin South"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Nationality</label>
                <input
                  type="text"
                  value={formData.nationality}
                  onChange={(e) => handleChange('nationality', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Primary Phone <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.phone ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.phone && <p className="text-[10px] text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Alternative Phone</label>
                <input
                  type="tel"
                  value={formData.alternatePhone}
                  onChange={(e) => handleChange('alternatePhone', e.target.value)}
                  placeholder="Optional"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Current Residential Address <span className="text-[#c62839]">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={formData.currentAddress}
                  onChange={(e) => handleChange('currentAddress', e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.currentAddress ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.currentAddress && <p className="text-[10px] text-red-600 mt-1">{errors.currentAddress}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Permanent Home Address</label>
                <textarea
                  rows={2}
                  value={formData.permanentAddress}
                  onChange={(e) => handleChange('permanentAddress', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 2: GUARDIAN & EMERGENCY INFORMATION
            ===================================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#0b1a42]">
                  Section 2: Parent / Guardian &amp; Emergency Support Details
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional contact line for notices, attendance verification, and emergency care.
                </p>
              </div>
              <Users size={20} className="text-[#c62839]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Guardian Relationship</label>
                <select
                  value={formData.guardianRelationship}
                  onChange={(e) => handleChange('guardianRelationship', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                >
                  <option value="Father">Father</option>
                  <option value="Mother">Mother</option>
                  <option value="Step-father">Step-father</option>
                  <option value="Step-mother">Step-mother</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Foster parent">Foster parent</option>
                  <option value="Legal guardian">Legal guardian</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Parent / Guardian Full Name <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.guardianName}
                  onChange={(e) => handleChange('guardianName', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.guardianName ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.guardianName && <p className="text-[10px] text-red-600 mt-1">{errors.guardianName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Guardian Occupation</label>
                <input
                  type="text"
                  value={formData.guardianOccupation}
                  onChange={(e) => handleChange('guardianOccupation', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Guardian Workplace</label>
                <input
                  type="text"
                  value={formData.guardianWorkplace}
                  onChange={(e) => handleChange('guardianWorkplace', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Guardian Phone <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.guardianPhone}
                  onChange={(e) => handleChange('guardianPhone', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none ${
                    errors.guardianPhone ? 'border-red-400 bg-red-50/50' : 'border-slate-200'
                  }`}
                />
                {errors.guardianPhone && <p className="text-[10px] text-red-600 mt-1">{errors.guardianPhone}</p>}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0b1a42] mb-1">Guardian Residential Address</label>
              <textarea
                rows={2}
                value={formData.guardianAddress}
                onChange={(e) => handleChange('guardianAddress', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-[#0b1a42] uppercase tracking-wider mb-3">
                Emergency Contact (If Different)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    Emergency Name <span className="text-[#c62839]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyName}
                    onChange={(e) => handleChange('emergencyName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    Relationship <span className="text-[#c62839]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.emergencyRelationship}
                    onChange={(e) => handleChange('emergencyRelationship', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                    Emergency Phone <span className="text-[#c62839]">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            STEP 3: EDUCATION & PROGRAMME SELECTION
            ===================================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#0b1a42]">
                  Section 3: Education History &amp; Preferred Learning Pathway
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Examination registration category, study cohort session, and subject selections.
                </p>
              </div>
              <GraduationCap size={20} className="text-[#c62839]" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Current / Most Recent Secondary School
                </label>
                <input
                  type="text"
                  value={formData.currentSchool}
                  onChange={(e) => handleChange('currentSchool', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Current Class / Level</label>
                <input
                  type="text"
                  value={formData.currentClass}
                  onChange={(e) => handleChange('currentClass', e.target.value)}
                  placeholder="e.g. SS 3 Completed"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Programme Category <span className="text-[#c62839]">*</span>
                </label>
                <select
                  value={formData.programmeCategory}
                  onChange={(e) => handleChange('programmeCategory', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                >
                  <option value="">Select a programme</option>
                  <option value="UTME (JAMB)">UTME (JAMB) Intensive Coaching</option>
                  <option value="SSCE">SSCE (WAEC / NECO / NABTEB)</option>
                  <option value="A-Level">A'Level (JUPEB / IJMB)</option>
                  <option value="International">International Examination Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Preferred Session <span className="text-[#c62839]">*</span>
                </label>
                <select
                  value={formData.preferredSession}
                  onChange={(e) => handleChange('preferredSession', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                >
                  <option value="Morning">Morning Cohort (8:00 AM - 1:30 PM)</option>
                  <option value="Afternoon">Afternoon Cohort (2:00 PM - 6:00 PM)</option>
                  <option value="Evening">Evening / Weekend Cohort</option>
                  <option value="Any available">Any Available Batch</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                >
                  <option value="Science">Pure Science</option>
                  <option value="Commercial">Commercial / Management Science</option>
                  <option value="Arts">Humanities / Arts</option>
                </select>
              </div>
            </div>

            {isUtme && <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-[#0b1a42] uppercase tracking-wider">
                Target UTME 4-Subject Combination (English Compulsory)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Subject 1</span>
                  <input
                    type="text"
                    disabled
                    value={formData.utmeSubject1}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0b1a42]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Subject 2</span>
                  <input
                    type="text"
                    value={formData.utmeSubject2}
                    onChange={(e) => handleChange('utmeSubject2', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1a42]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Subject 3</span>
                  <input
                    type="text"
                    value={formData.utmeSubject3}
                    onChange={(e) => handleChange('utmeSubject3', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1a42]"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block mb-1">Subject 4</span>
                  <input
                    type="text"
                    value={formData.utmeSubject4}
                    onChange={(e) => handleChange('utmeSubject4', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-[#0b1a42]"
                  />
                </div>
              </div>
            </div>}

            {isUtme && <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Target Tertiary Institution <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetInstitution}
                  onChange={(e) => handleChange('targetInstitution', e.target.value)}
                  placeholder="e.g. University of Ilorin (UNILORIN)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                  Target Degree Course <span className="text-[#c62839]">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.targetCourse}
                  onChange={(e) => handleChange('targetCourse', e.target.value)}
                  placeholder="e.g. Medicine and Surgery (MBBS)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                />
              </div>
            </div>}
          </div>
        )}

        {/* =====================================================================
            STEP 4: REVIEW & FORMAL DECLARATION
            ===================================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-bold text-[#0b1a42]">
                  Section 4: Comprehensive Record Summary &amp; Formal Declaration
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Confirm the details below before saving your updated candidate registration file.
                </p>
              </div>
              <FileCheck size={20} className="text-[#c62839]" />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Card 1 */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#0b1a42] border-b border-slate-200 pb-2">
                  <span>Student Particulars</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    className="text-[#c62839] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <p><strong>Name:</strong> {formData.surname} {formData.firstName} {formData.middleName}</p>
                <p><strong>DOB:</strong> {formData.dateOfBirth} ({formData.gender})</p>
                <p><strong>Origin:</strong> {formData.stateOfOrigin} ({formData.lga})</p>
                <p><strong>Phone:</strong> {formData.phone}</p>
                <p><strong>Address:</strong> {formData.currentAddress}</p>
              </div>

              {/* Card 2 */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#0b1a42] border-b border-slate-200 pb-2">
                  <span>Guardian &amp; Emergency</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="text-[#c62839] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <p><strong>Guardian:</strong> {formData.guardianName} ({formData.guardianRelationship})</p>
                <p><strong>Guardian Phone:</strong> {formData.guardianPhone}</p>
                <p><strong>Occupation:</strong> {formData.guardianOccupation}</p>
                <p><strong>Emergency Contact:</strong> {formData.emergencyName} ({formData.emergencyPhone})</p>
              </div>

              {/* Card 3 */}
              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between font-bold text-[#0b1a42] border-b border-slate-200 pb-2">
                  <span>Pathway Selection</span>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="text-[#c62839] hover:underline flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 size={11} /> Edit
                  </button>
                </div>
                <p><strong>Programme:</strong> {formData.programmeCategory}</p>
                <p><strong>Session:</strong> {formData.preferredSession} Cohort</p>
                {isUtme && <><p><strong>Subjects:</strong> {formData.utmeSubject1}, {formData.utmeSubject2}, {formData.utmeSubject3}, {formData.utmeSubject4}</p><p><strong>Preferred course:</strong> {formData.targetCourse} @ {formData.targetInstitution}</p></>}
              </div>
            </div>

            {/* Formal Declaration Box */}
            <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={formData.declarationConfirmed}
                  onChange={(e) => handleChange('declarationConfirmed', e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#c62839] rounded"
                />
                <span className="text-xs text-amber-950 leading-relaxed">
                  <strong>Candidate Declaration:</strong> I hereby certify that the information entered in this comprehensive biodata registration form is accurate, authentic, and complete. I confirm my commitment to the academic schedule and institutional rules of University Pathway Educational Consult, Ilorin.
                </span>
              </label>
              {errors.declarationConfirmed && (
                <p className="text-xs text-red-600 font-bold">{errors.declarationConfirmed}</p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0b1a42] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#132a63] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-lg shadow-[#c62839]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Save size={15} />
              <span>{saving ? "Saving biodata…" : "Save Biodata"}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
