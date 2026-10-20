// Backend-managed authentication and student portal API client.
const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

type AuthUser = { id: string; email: string; fullName: string; phone: string; isEmailVerified: boolean };
type LoginResult = { token: string; user: AuthUser };

async function post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  const response = await fetch(baseUrl + '/api/auth' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Unable to complete request');
  return result as T;
}

export const upecAuthApi = {
  learningResources:(token:string)=>authorized<{resources:Array<{id:string;title:string;description:string;resource_url:string;resource_type:string;subject_id:string}>}>('/api/student/learning/resources',token),
  assessmentResults:(token:string)=>authorized<{results:Array<{id:string;assessment_id:string;submitted_at:string;score:number;total_questions:number}>}>('/api/student/assessment-results',token),
  studentAssessments:(token:string)=>authorized<{assessments:Array<{id:string;title:string;duration_minutes:number}>}>('/api/student/assessments',token),
  startAssessment:(token:string,id:string)=>authorized<{attemptId:string}>('/api/student/assessments/'+encodeURIComponent(id)+'/start',token,'POST',{}),
  assessmentAttempt:(token:string,id:string)=>authorized<{attempt:{id:string;expiresAt?:string;submittedAt?:string;score?:number;totalQuestions?:number};questions?:Array<{id:string;prompt:string;options:Record<string,string>}>}>('/api/student/assessments/attempts/'+encodeURIComponent(id),token),
  submitAssessment:(token:string,id:string,answers:Record<string,string>)=>authorized<{result:{score:number;totalQuestions:number;submittedAt:string}}>('/api/student/assessments/attempts/'+encodeURIComponent(id)+'/submit',token,'POST',{answers}),
  utmePracticeQuestions: (token:string,subject:string,year:number,cursor?:string) => authorized<{provider:string;questions:any[];pagination:any}>('/api/student/practice/utme/questions?subject='+encodeURIComponent(subject)+'&year='+year+(cursor?'&cursor='+encodeURIComponent(cursor):''),token),
  utmeProviderStatus: (token:string) => authorized<{provider:string;configured:boolean;officialJambApi:boolean}>('/api/student/practice/utme/provider-status',token),
  correctApplication: (token:string,applicationId:string,formData:Record<string,unknown>) => authorized<{application:{id:string;status:string}}>('/api/student/applications/'+encodeURIComponent(applicationId)+'/correction',token,'PUT',{formData}),
  applicationHistory: (token: string, applicationId: string) => authorized<{application:{id:string;status:string;reference_number:string};reviews:Array<{id:string;new_status:string;created_at:string}>}>('/api/student/applications/'+encodeURIComponent(applicationId)+'/history',token),
  dashboard: (token: string) => authorized<{user:any;biodata:any;application:any}>('/api/student/dashboard',token),
  saveBiodata: (token: string, details: Record<string,unknown>) => authorized<{biodata:any}>('/api/student/biodata',token,'PUT',{details}),
  submitApplication: (token: string, formData: Record<string,unknown>) => authorized<{application:{reference_number:string}}>('/api/student/applications',token,'POST',{formData}),
  register: (fullName: string, email: string, phone: string, password: string) =>
    post<{message:string}>('/register', { fullName, email, phone, password }),
  verify: (email: string, code: string) =>
    post<{message:string}>('/verify', { email, code, purpose: 'signup' }),
  resend: (email: string, purpose: 'signup' | 'recovery') =>
    post<{message:string}>('/resend', { email, purpose }),
  login: (email: string, password: string) =>
    post<LoginResult>('/login', { email, password }),
  recover: (email: string) =>
    post<{message:string}>('/recover', { email }),
  reset: (email: string, code: string, password: string) =>
    post<{message:string}>('/reset', { email, code, password }),
};

async function authorized<T>(path:string,token:string,method='GET',body?:unknown):Promise<T>{
 const response=await fetch(baseUrl+path,{method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw Error(data.error||'Request failed');
 return data as T;
}
