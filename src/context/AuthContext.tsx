import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Biodata {
  surname: string;
  firstName: string;
  otherNames?: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  stateOfOrigin: string;
  lga: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelationship: string;
  guardianAddress: string;
  previousSchool: string;
  targetExam: string;
  targetCourse: string;
  targetInstitution: string;
}

export interface ApplicationRecord {
  referenceNumber: string;
  programme: string;
  session: string;
  studyCenter: string;
  chosenSubjects: string[];
  submittedAt: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'action_required';
  cbtEnrolled: boolean;
  paymentReference?: string;
  paymentStatus: 'pending' | 'verified';
}

export interface StudentUser {
  id: string;
  regNumber: string; // e.g. UPEC/2025/0842
  fullName: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  profileCompleted: boolean;
  biodata: Biodata;
  application: ApplicationRecord | null;
}

interface AuthContextType {
  currentUser: StudentUser | null;
  isAuthenticated: boolean;
  login: (identifier: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginAsDemoStudent: () => void;
  registerAccount: (fullName: string, email: string, phone: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  verifyEmail: (code: string) => boolean;
  logout: () => void;
  updateBiodata: (data: Partial<Biodata>) => void;
  saveApplicationDraft: (draft: Partial<ApplicationRecord>) => void;
  submitApplication: (appData: Partial<ApplicationRecord>) => string; // returns ref number
}

const STORAGE_KEY = 'upec_student_auth_session';

const DEFAULT_DEMO_STUDENT: StudentUser = {
  id: 'upec-std-842',
  regNumber: 'UPEC/2025/0842',
  fullName: 'Amina Bello',
  email: 'amina.bello@example.com',
  phone: '09133903600',
  isEmailVerified: true,
  profileCompleted: true,
  biodata: {
    surname: 'Bello',
    firstName: 'Amina',
    otherNames: 'Zainab',
    gender: 'Female',
    dateOfBirth: '2007-04-14',
    phone: '09133903600',
    email: 'amina.bello@example.com',
    address: '14, Taiwo Isale Road, Ilorin, Kwara State',
    stateOfOrigin: 'Kwara State',
    lga: 'Ilorin South',
    guardianName: 'Alhaji M. K. Bello',
    guardianPhone: '08033001122',
    guardianRelationship: 'Father',
    guardianAddress: '14, Taiwo Isale Road, Ilorin, Kwara State',
    previousSchool: 'Government Secondary School, Ilorin',
    targetExam: 'JAMB (UTME) 2025',
    targetCourse: 'Medicine and Surgery (MBBS)',
    targetInstitution: 'University of Ilorin (UNILORIN)',
  },
  application: {
    referenceNumber: 'UPEC/APP/2025/0842',
    programme: 'JAMB (UTME) Intensive Coaching',
    session: '2024/2025 Academic Cohort A',
    studyCenter: 'Sawmill Main Center, Ilorin',
    chosenSubjects: ['Use of English', 'Biology', 'Chemistry', 'Physics'],
    submittedAt: 'October 12, 2024',
    status: 'approved',
    cbtEnrolled: true,
    paymentReference: 'TXN-UPEC-992144',
    paymentStatus: 'verified',
  },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback to null
    }
    // Default to null for realistic authentication guard, but with demo student available
    return null;
  });

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [currentUser]);

  const login = async (identifier: string, _pass: string) => {
    const trimmed = identifier.trim().toLowerCase();
    // Check if matches demo student
    if (
      trimmed === 'upec/2025/0842'.toLowerCase() ||
      trimmed === 'amina.bello@example.com'.toLowerCase() ||
      trimmed === '09133903600' ||
      trimmed.includes('amina')
    ) {
      setCurrentUser(DEFAULT_DEMO_STUDENT);
      return { success: true };
    }

    // Try finding user in saved accounts
    try {
      const savedAccounts = localStorage.getItem('upec_registered_accounts');
      if (savedAccounts) {
        const list: StudentUser[] = JSON.parse(savedAccounts);
        const found = list.find(
          (u) =>
            u.email.toLowerCase() === trimmed ||
            u.regNumber.toLowerCase() === trimmed ||
            u.phone === trimmed
        );
        if (found) {
          setCurrentUser(found);
          return { success: true };
        }
      }
    } catch {
      // ignore
    }

    // If identifier is provided with anything reasonable, create dynamic active student
    if (identifier.length >= 3) {
      const isReg = identifier.startsWith('UPEC/');
      const user: StudentUser = {
        id: `upec-std-${Math.floor(100 + Math.random() * 900)}`,
        regNumber: isReg ? identifier.toUpperCase() : `UPEC/2025/0${Math.floor(800 + Math.random() * 199)}`,
        fullName: isReg ? 'Enrolled Student' : identifier.split('@')[0].replace('.', ' '),
        email: identifier.includes('@') ? identifier : `${identifier.replace(/\//g, '').toLowerCase()}@student.pathway.edu.ng`,
        phone: '09133903600',
        isEmailVerified: true,
        profileCompleted: true,
        biodata: {
          ...DEFAULT_DEMO_STUDENT.biodata,
          surname: identifier.split('@')[0] || 'Applicant',
          firstName: 'Student',
        },
        application: DEFAULT_DEMO_STUDENT.application,
      };
      setCurrentUser(user);
      return { success: true };
    }

    return { success: false, error: 'Invalid Registration Number, Email, or Password' };
  };

  const loginAsDemoStudent = () => {
    setCurrentUser(DEFAULT_DEMO_STUDENT);
  };

  const registerAccount = async (
    fullName: string,
    email: string,
    phone: string,
    _pass: string
  ) => {
    if (!fullName || !email || !phone) {
      return { success: false, error: 'Please fill in all required fields' };
    }

    const regNo = `UPEC/2025/0${Math.floor(850 + Math.random() * 140)}`;
    const names = fullName.trim().split(' ');
    const surname = names[names.length - 1] || 'Candidate';
    const firstName = names[0] || 'Student';

    const newUser: StudentUser = {
      id: `upec-std-${Date.now()}`,
      regNumber: regNo,
      fullName,
      email,
      phone,
      isEmailVerified: true, // Mark verified after creation per directive
      profileCompleted: false, // Profile incomplete, will prompt structured biodata
      biodata: {
        surname,
        firstName,
        otherNames: names.slice(1, -1).join(' '),
        gender: 'Male',
        dateOfBirth: '2007-01-01',
        phone,
        email,
        address: 'Ilorin, Kwara State',
        stateOfOrigin: 'Kwara State',
        lga: 'Ilorin West',
        guardianName: '',
        guardianPhone: '',
        guardianRelationship: 'Parent',
        guardianAddress: '',
        previousSchool: '',
        targetExam: 'JAMB (UTME)',
        targetCourse: '',
        targetInstitution: '',
      },
      application: null, // No application yet
    };

    try {
      const savedAccounts = localStorage.getItem('upec_registered_accounts');
      const list: StudentUser[] = savedAccounts ? JSON.parse(savedAccounts) : [];
      list.push(newUser);
      localStorage.setItem('upec_registered_accounts', JSON.stringify(list));
    } catch {
      // ignore
    }

    setCurrentUser(newUser);
    return { success: true };
  };

  const verifyEmail = (_code: string) => {
    if (currentUser) {
      const updated = { ...currentUser, isEmailVerified: true };
      setCurrentUser(updated);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const updateBiodata = (data: Partial<Biodata>) => {
    if (!currentUser) return;
    const updatedBiodata: Biodata = {
      ...currentUser.biodata,
      ...data,
    };
    const updatedUser: StudentUser = {
      ...currentUser,
      biodata: updatedBiodata,
      profileCompleted: Boolean(
        updatedBiodata.surname &&
        updatedBiodata.firstName &&
        updatedBiodata.guardianName &&
        updatedBiodata.guardianPhone
      ),
    };
    setCurrentUser(updatedUser);
  };

  const saveApplicationDraft = (draft: Partial<ApplicationRecord>) => {
    if (!currentUser) return;
    const existing = currentUser.application;
    const app: ApplicationRecord = {
      referenceNumber: existing?.referenceNumber || `UPEC/APP/2025/${Math.floor(1000 + Math.random() * 9000)}`,
      programme: draft.programme || existing?.programme || 'JAMB (UTME) Intensive Coaching',
      session: draft.session || existing?.session || '2024/2025 Academic Cohort A',
      studyCenter: draft.studyCenter || existing?.studyCenter || 'Sawmill Main Center, Ilorin',
      chosenSubjects: draft.chosenSubjects || existing?.chosenSubjects || ['Use of English', 'Mathematics', 'Physics', 'Chemistry'],
      submittedAt: existing?.submittedAt || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'draft',
      cbtEnrolled: draft.cbtEnrolled ?? (existing?.cbtEnrolled || true),
      paymentReference: draft.paymentReference || existing?.paymentReference,
      paymentStatus: draft.paymentStatus || existing?.paymentStatus || 'pending',
    };

    setCurrentUser({
      ...currentUser,
      application: app,
    });
  };

  const submitApplication = (appData: Partial<ApplicationRecord>): string => {
    if (!currentUser) return '';
    const refNum = `UPEC/APP/2025/${Math.floor(1000 + Math.random() * 9000)}`;
    const app: ApplicationRecord = {
      referenceNumber: currentUser.application?.referenceNumber || refNum,
      programme: appData.programme || currentUser.application?.programme || 'JAMB (UTME) Intensive Coaching',
      session: appData.session || currentUser.application?.session || '2024/2025 Academic Cohort A',
      studyCenter: appData.studyCenter || currentUser.application?.studyCenter || 'Sawmill Main Center, Ilorin',
      chosenSubjects: appData.chosenSubjects || currentUser.application?.chosenSubjects || ['Use of English', 'Mathematics', 'Physics', 'Chemistry'],
      submittedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'submitted',
      cbtEnrolled: appData.cbtEnrolled ?? true,
      paymentReference: appData.paymentReference || `TXN-UPEC-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentStatus: 'pending',
    };

    setCurrentUser({
      ...currentUser,
      profileCompleted: true,
      application: app,
    });
    return app.referenceNumber;
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        loginAsDemoStudent,
        registerAccount,
        verifyEmail,
        logout,
        updateBiodata,
        saveApplicationDraft,
        submitApplication,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
