/**
 * Official University Pathway Educational Consult
 * Student Application & Profile Data Contracts
 * Derived strictly from the official four-page application document.
 */

export interface StudentProfileData {
  // === PAGE 1: STUDENT INFORMATION ===
  surname: string;
  firstName: string;
  middleName: string;
  gender: 'Male' | 'Female' | '';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed' | '';
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  age: number | '';
  stateOfOrigin: string;
  lga: string;
  nationality: string;
  religion: 'Christianity' | 'Islam' | 'Others' | '';
  homeLanguages: string;
  email: string;
  nin: string; // 11-digit National Identification Number
  phone1: string;
  phone2: string;
  currentAddress: string;
  permanentAddress: string;
  passportPhoto: string; // Base64 data URL or photo asset

  // === PAGE 2: PARENT / GUARDIAN INFORMATION ===
  guardianRelationship:
    | 'Father'
    | 'Mother'
    | 'Step-Father'
    | 'Step-Mother'
    | 'Uncle'
    | 'Aunt'
    | 'Foster Parents'
    | 'Legal Guardian'
    | 'Others'
    | '';
  guardianFullName: string;
  guardianOccupation: string;
  guardianWorkplace: string;
  guardianEmail: string;
  guardianPhone1: string;
  guardianPhone2: string;
  guardianAddress: string;

  // Parent/Guardian Consent Statement & Signature (Page 2)
  guardianConsentGiven: boolean;
  guardianSignatureName: string;
  guardianSignatureDate: string;

  // === PAGE 2: EMERGENCY CONTACT ===
  emergencyFullName: string;
  emergencyRelationship: string;
  emergencyPhone1: string;
  emergencyPhone2: string;
  emergencyWorkplace: string;
  emergencyAddress: string;

  // === PAGES 2–3: EDUCATION INFORMATION ===
  currentSchool: string;
  currentClass: string;
  currentSchoolAddress: string;
  hasGraduatedSecondary: boolean;
  previousSchools: PreviousSchoolRecord[];

  // Profile Lifecycle
  profileCompleted: boolean;
  completedAt?: string;
  lastUpdatedAt?: string;
}

export interface PreviousSchoolRecord {
  id: string;
  schoolName: string;
  yearOfCompletion: string;
  qualification: string; // e.g. WAEC SSCE, NECO SSCE, NABTEB
  gradeOrPassFail: string; // Summary or grades breakdown
}

export interface ProgrammeApplicationData {
  id: string;
  studentId: string;
  applicationReference: string; // e.g. UPEC/APP/2026/0149
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'action_required';

  // === PAGE 3: PROGRAMME CATEGORY ===
  programmeCategory: 'UTME (JAMB)' | 'SSCE' | 'JSSCE' | 'Private Tutor' | '';

  // === PAGES 3–4: PROGRAMME-SPECIFIC DETAILS ===
  // For UTME (JAMB):
  utmeLectureSession:
    | 'Morning Session (8:00 AM – 1:00 PM)'
    | 'Afternoon Session (1:00 PM – 5:00 PM)'
    | 'Evening Session (4:00 PM – 7:00 PM)'
    | '';
  utmeDepartment: 'Science' | 'Arts' | 'Social Science' | '';
  utmeSubject1: string; // Use of English (Compulsory)
  utmeSubject2: string;
  utmeSubject3: string;
  utmeSubject4: string;
  utmeDuration: '1 Month' | '2 Months' | '3 Months' | '4 Months' | '';

  // For SSCE:
  ssceLectureSession: 'Morning Session' | 'Afternoon Session' | 'Evening Session' | '';
  ssceDuration: '1 Month' | '3 Months' | '6 Months' | '1 Year' | '1 Year Plus' | '';
  ssceSubjects: string[];
  ssceTargetExam: string;

  // For JSSCE:
  jssceSubjects: string[];
  jssceNotes: string;

  // For Private Tutor:
  tutorFocusSubjects: string[];
  tutorPreferredLocation: 'Centre Private Suite' | 'Home Tutoring (Ilorin Environs)' | 'Online / Hybrid' | '';
  tutorWeeklyHours: string;
  tutorSpecialGoals: string;

  // Session Preference Warning Acknowledgement
  sessionAvailabilityAcknowledged: boolean;

  // === PAGE 4: DECLARATIONS ===
  declaration1Accepted: boolean;
  declaration2Accepted: boolean;
  declaration3Accepted: boolean;
  declaration4Accepted: boolean;
  declaration5Accepted: boolean; // ₦2,000 non-refundable fee acknowledgement

  // Applicant Signature & Date
  applicantSignature: string;
  applicantSignatureDate: string;

  // Office-Only Attached Record (Staff Workflow)
  officeOnly?: OfficeOnlyRecord;

  createdAt: string;
  submittedAt?: string;
  lastSavedAt?: string;
}

export interface OfficeOnlyRecord {
  applicationNumber: string;
  dateReceived: string;
  registrationDate: string;
  applicationReceivedBy: string;
  classAdmittedTo: string;
  subjectCombinationOffered: string[];
  paymentRecord: {
    applicationFeePaid: boolean;
    feeAmount: number; // 2000
    receiptNumber: string;
    paymentDate: string;
    receivedByStaff: string;
    paymentMode: 'Cash at Desk' | 'Bank Transfer to Centre Account' | 'POS Terminal';
  };
  commentsOnResults: string;
  admissionNumber: string;
  directorSignature: string;
  directorApprovalDate: string;
  hostelAllocation: {
    allocated: boolean;
    hostelName: string;
    flatNumber: string;
    bedNumber: string;
    checkInDate: string;
    checkOutDate: string;
  };
  staffDecision: 'pending' | 'approved' | 'conditional' | 'declined';
  staffDecisionNotes: string;
}

export const INITIAL_STUDENT_PROFILE: StudentProfileData = {
  surname: '',
  firstName: '',
  middleName: '',
  gender: '',
  maritalStatus: '',
  dateOfBirth: '',
  placeOfBirth: '',
  age: '',
  stateOfOrigin: '',
  lga: '',
  nationality: 'Nigerian',
  religion: '',
  homeLanguages: '',
  email: '',
  nin: '',
  phone1: '',
  phone2: '',
  currentAddress: '',
  permanentAddress: '',
  passportPhoto: '',
  guardianRelationship: '',
  guardianFullName: '',
  guardianOccupation: '',
  guardianWorkplace: '',
  guardianEmail: '',
  guardianPhone1: '',
  guardianPhone2: '',
  guardianAddress: '',
  guardianConsentGiven: false,
  guardianSignatureName: '',
  guardianSignatureDate: '',
  emergencyFullName: '',
  emergencyRelationship: '',
  emergencyPhone1: '',
  emergencyPhone2: '',
  emergencyWorkplace: '',
  emergencyAddress: '',
  currentSchool: '',
  currentClass: '',
  currentSchoolAddress: '',
  hasGraduatedSecondary: false,
  previousSchools: [],
  profileCompleted: false,
};

export const INITIAL_PROGRAMME_APPLICATION: ProgrammeApplicationData = {
  id: '',
  studentId: '',
  applicationReference: '',
  status: 'draft',
  programmeCategory: '',
  utmeLectureSession: '',
  utmeDepartment: '',
  utmeSubject1: 'Use of English (Compulsory)',
  utmeSubject2: '',
  utmeSubject3: '',
  utmeSubject4: '',
  utmeDuration: '',
  ssceLectureSession: '',
  ssceDuration: '',
  ssceSubjects: [],
  ssceTargetExam: 'WAEC / NECO Combined',
  jssceSubjects: [],
  jssceNotes: '',
  tutorFocusSubjects: [],
  tutorPreferredLocation: '',
  tutorWeeklyHours: '',
  tutorSpecialGoals: '',
  sessionAvailabilityAcknowledged: false,
  declaration1Accepted: false,
  declaration2Accepted: false,
  declaration3Accepted: false,
  declaration4Accepted: false,
  declaration5Accepted: false,
  applicantSignature: '',
  applicantSignatureDate: '',
  createdAt: new Date().toISOString(),
};
