import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

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
  changePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  updateBiodata: (data: Partial<Biodata>) => void;
  saveApplicationDraft: (draft: Partial<ApplicationRecord>) => void;
  submitApplication: (appData: Partial<ApplicationRecord>) => string; // returns ref number
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
  const loadUser = async (authUser: {id:string;email?:string;email_confirmed_at?:string|null;user_metadata?:any} | null) => {
    if (!authUser) { setCurrentUser(null); return; }
    const [profileResult, bioResult, appResult] = await Promise.all([
      supabase.from('profiles').select('full_name,phone,role').eq('id',authUser.id).maybeSingle(),
      supabase.from('student_biodata').select('details,completed_at').eq('user_id',authUser.id).maybeSingle(),
      supabase.from('applications').select('*').eq('student_id',authUser.id).order('created_at',{ascending:false}).limit(1).maybeSingle(),
    ]);
    if (profileResult.error || bioResult.error || appResult.error) {
      console.error('Could not load student profile',profileResult.error||bioResult.error||appResult.error);
      setCurrentUser(null); return;
    }
    const profile=profileResult.data;
    if (profile?.role && profile.role !== 'student') { setCurrentUser(null); return; }
    const fullName=profile?.full_name || authUser.user_metadata?.full_name || '';
    const email=authUser.email || '';
    const phone=profile?.phone || authUser.user_metadata?.phone || '';
    setCurrentUser({
      id:authUser.id, regNumber:'UPEC/'+authUser.id.slice(0,8).toUpperCase(),
      fullName,email,phone,isEmailVerified:!!authUser.email_confirmed_at,
      profileCompleted:!!bioResult.data?.completed_at,
      biodata:{...emptyBiodata(email,fullName,phone),...(bioResult.data?.details||{})},
      application:mapApplication(appResult.data),
    });
  };
  useEffect(()=>{
    let active=true;
    supabase.auth.getUser().then(async({data,error})=>{
      if(!active)return;
      if(!error)await loadUser(data.user);
      if(active)setReady(true);
    }).catch(()=>{if(active)setReady(true);});
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
      // Avoid awaiting Supabase queries inside auth callback.
      setTimeout(()=>{if(active)void loadUser(session?.user||null);},0);
    });
    return ()=>{active=false;subscription.unsubscribe();};
  },[]);
  const login=async(identifier:string,pass:string)=>{
    if(!identifier.includes('@'))return {success:false,error:'Sign in with your registered email address.'};
    const {data,error}=await supabase.auth.signInWithPassword({email:identifier.trim(),password:pass});
    if(error)return {success:false,error:error.message};
    await loadUser(data.user);
    return {success:true};
  };
  const registerAccount=async(fullName:string,email:string,phone:string,pass:string)=>{
    if(!fullName.trim()||!email.trim()||!phone.trim()||pass.length<8)return {success:false,error:'Enter your name, email, phone and a password of at least 8 characters.'};
    const {data,error}=await supabase.auth.signUp({email:email.trim(),password:pass,options:{data:{full_name:fullName.trim(),phone:phone.trim()}}});
    if(error)return {success:false,error:error.message};
    if(data.session && data.user)await loadUser(data.user);
    return {success:true};
  };
  const verifyEmail=async(code:string,email?:string)=>{
    if(!email)return false;
    const {error}=await supabase.auth.verifyOtp({email,token:code,type:'email'});
    if(error)return false;
    const {data}=await supabase.auth.getUser();await loadUser(data.user);
    return true;
  };
  const resetPassword=async(email:string)=>{
    const {error}=await supabase.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+'/reset-password'});
    return {success:!error,error:error?.message};
  };
  const changePassword=async(password:string)=>{
    const {error}=await supabase.auth.updateUser({password});
    return {success:!error,error:error?.message};
  };
  const logout=()=>{void supabase.auth.signOut();setCurrentUser(null);};
  const updateBiodata=(data:Partial<Biodata>)=>{
    if(!currentUser)return;
    const biodata={...currentUser.biodata,...data};
    const completed=!!(biodata.surname&&biodata.firstName&&biodata.guardianName&&biodata.guardianPhone);
    void supabase.from('student_biodata').upsert({
      user_id:currentUser.id,details:biodata,completed_at:completed?new Date().toISOString():null,
    }).then(({error})=>{if(error)console.error('Biodata save failed',error);});
    setCurrentUser({...currentUser,biodata,profileCompleted:completed});
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
  const submitApplication=(_appData:Partial<ApplicationRecord>):string=>{
    // Prevent false success: application submission requires the secure backend workflow.
    throw new Error('Online application submission is being connected. No application has been submitted.');
  };
  const loginAsDemoStudent=()=>{console.warn('Demo authentication is disabled.');};
  return <AuthContext.Provider value={{
    currentUser:ready?currentUser:null,isAuthenticated:ready&&!!currentUser,
    login,registerAccount,verifyEmail,logout,resetPassword,changePassword,
    loginAsDemoStudent,updateBiodata,saveApplicationDraft,submitApplication,
  }}>{children}</AuthContext.Provider>;
};
export const useAuth=()=>{
  const context=useContext(AuthContext);
  if(!context)throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
