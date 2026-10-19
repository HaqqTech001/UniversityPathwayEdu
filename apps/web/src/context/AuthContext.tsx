import React, { createContext, useContext, useState, useEffect } from 'react';
import { upecAuthApi } from '../lib/upecAuthApi';
const TOKEN_KEY='upec_student_token';
export const getStudentToken=()=>sessionStorage.getItem(TOKEN_KEY);

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
  verifyEmail: (code: string, email?: string) => Promise<boolean>;
  logout: () => void;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  changePassword: (password: string, email?: string, code?: string) => Promise<{ success: boolean; error?: string }>;
  updateBiodata: (data: Partial<Biodata>) => Promise<void>;
  saveApplicationDraft: (draft: Partial<ApplicationRecord>) => void;
  submitApplication: (appData: Partial<ApplicationRecord>) => Promise<string>;
}


const emptyBiodata = (email: string, fullName: string, phone: string): Biodata => {
  const parts = fullName.trim().split(/\s+/);
  return {
    surname: parts[parts.length - 1] || '', firstName: parts[0] || '',
    gender: 'Male', dateOfBirth: '', phone, email, address: '',
    stateOfOrigin: '', lga: '', guardianName: '', guardianPhone: '',
    guardianRelationship: '', guardianAddress: '', previousSchool: '',
    targetExam: '', targetCourse: '', targetInstitution: '',
  };
};
const mapApplication = (row: any): ApplicationRecord | null => row ? ({
  referenceNumber: row.reference_number, programme: row.programme,
  session: row.academic_session || '', studyCenter: row.study_centre || '',
  chosenSubjects: row.subjects || [], submittedAt: row.submitted_at || '',
  status: row.status, cbtEnrolled: false, paymentStatus: 'pending',
}) : null;
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(null);
  const [ready, setReady] = useState(false);
  const fromDashboard=(result:any):StudentUser=>{
    const a=result.user,b=result.biodata,app=result.application;
    return {id:a.id,regNumber:'UPEC/'+a.id.slice(0,8).toUpperCase(),fullName:a.full_name,email:a.email,phone:a.phone,isEmailVerified:!!a.verified_at,profileCompleted:!!b?.completed_at,biodata:{...emptyBiodata(a.email,a.full_name,a.phone),...(b?.details||{})},application:mapApplication(app)};
  };
  const refresh=async()=>{const token=getStudentToken();if(!token){setCurrentUser(null);return;}try{setCurrentUser(fromDashboard(await upecAuthApi.dashboard(token)));}catch{sessionStorage.removeItem(TOKEN_KEY);setCurrentUser(null);}};
  useEffect(()=>{void refresh().finally(()=>setReady(true));},[]);
  const login=async(identifier:string,pass:string)=>{
    try{const result=await upecAuthApi.login(identifier.trim(),pass);sessionStorage.setItem(TOKEN_KEY,result.token);await refresh();if(!getStudentToken())return {success:false,error:'Unable to verify your session. Please try again.'};return {success:true};}
    catch(error){return {success:false,error:error instanceof Error?error.message:'Sign in failed'};}
  };
  const registerAccount=async(fullName:string,email:string,phone:string,pass:string)=>{
    try{await upecAuthApi.register(fullName,email,phone,pass);return {success:true};}
    catch(error){return {success:false,error:error instanceof Error?error.message:'Registration failed'};}
  };
  const verifyEmail=async(code:string,email?:string)=>{
    if(!email)return false;
    try{await upecAuthApi.verify(email,code);return true;}catch{return false;}
  };
  const resetPassword=async(email:string)=>{
    try{await upecAuthApi.recover(email);return {success:true};}
    catch(error){return {success:false,error:error instanceof Error?error.message:'Recovery failed'};}
  };
  const changePassword=async(password:string,email?:string,code?:string)=>{
    if(!email||!code)return {success:false,error:'Enter your recovery email and code.'};
    try{await upecAuthApi.reset(email,code,password);return {success:true};}
    catch(error){return {success:false,error:error instanceof Error?error.message:'Password reset failed'};}
  };
  const logout=()=>{sessionStorage.removeItem(TOKEN_KEY);setCurrentUser(null);};
  const updateBiodata=async(data:Partial<Biodata>):Promise<void>=>{
    if(!currentUser)throw new Error('Sign in to update your profile.');
    const biodata={...currentUser.biodata,...data};
    const token=getStudentToken();if(!token)throw new Error('Session expired. Sign in again.');
    await upecAuthApi.saveBiodata(token,biodata);
    await refresh();
  };
  const saveApplicationDraft=(draft:Partial<ApplicationRecord>)=>{
    if(!currentUser)return;
    const app:ApplicationRecord={referenceNumber:currentUser.application?.referenceNumber||'',
      programme:draft.programme||currentUser.application?.programme||'',
      session:draft.session||currentUser.application?.session||'',
      studyCenter:draft.studyCenter||currentUser.application?.studyCenter||'',
      chosenSubjects:draft.chosenSubjects||currentUser.application?.chosenSubjects||[],
      submittedAt:currentUser.application?.submittedAt||'',status:'draft',
      cbtEnrolled:false,paymentStatus:'pending'};
    setCurrentUser({...currentUser,application:app});
    // Drafts remain local until application submission is migrated to server-side API.
  };
  const submitApplication=async(appData:Partial<ApplicationRecord>):Promise<string>=>{
    if(!currentUser?.profileCompleted)throw new Error('Complete your biodata before applying.');
    const token=getStudentToken();
    if(!token)throw new Error('Please sign in again.');
    const response=await upecAuthApi.submitApplication(token,{
      programmeCategory:appData.programme,
      preferredSession:appData.session,
      studyCentre:appData.studyCenter,
      utmeSubject2:appData.chosenSubjects?.[0]||'',
      utmeSubject3:appData.chosenSubjects?.[1]||'',
      utmeSubject4:appData.chosenSubjects?.[2]||'',
    });
    await refresh();
    return response.application.reference_number;
  };
  const loginAsDemoStudent=()=>{console.warn('Demo authentication is disabled.');};
  return <AuthContext.Provider value={{
    currentUser:ready?currentUser:null,isAuthenticated:ready&&!!currentUser&&currentUser.isEmailVerified,
    login,registerAccount,verifyEmail,logout,resetPassword,changePassword,
    loginAsDemoStudent,updateBiodata,saveApplicationDraft,submitApplication,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{
  const context=useContext(AuthContext);
  if(!context)throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
