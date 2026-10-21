// Backend-managed authentication and student portal API client.
const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');

type AuthUser = { id: string; email: string; fullName: string; phone: string; isEmailVerified: boolean };
type LoginResult = { token: string; user: AuthUser };

export class UpecApiError extends Error {constructor(message:string,public status:number){super(message);this.name='UpecApiError';}}
function statusError(status:number,message?:string){const fallback:Record<number,string>={401:'Your session has expired. Please sign in again.',403:'You do not have permission to perform this action.',404:'The requested information could not be found.',429:'Too many requests. Please wait before trying again.',500:'The server encountered a problem. Please try again.',503:'The service is temporarily unavailable.'};return new UpecApiError(message||fallback[status]||'Unable to complete your request.',status);}
function requestFailure(error:unknown):Error {
 if(error instanceof DOMException&&(error.name==='TimeoutError'||error.name==='AbortError'))return new Error('The server is taking too long to respond. Please check your connection and try again.');
 if(error instanceof TypeError)return new Error('Cannot connect to UPEC right now. Check your internet connection and try again.');
 return error instanceof Error?error:new Error('Something went wrong. Please try again.');
}
async function post<T>(path: string, payload: Record<string, unknown>): Promise<T> {
  try {
  const response = await fetch(baseUrl + '/api/auth' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(path==='/register'?25000:18000),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw statusError(response.status,result.error);
  return result as T;
  } catch(error) { throw requestFailure(error); }
}

export const upecAuthApi = {
  studentNotifications:(token:string)=>authorized<{notifications:Array<{key:string;title:string;body:string;createdAt:string;type:string;read:boolean}>}>('/api/student/notifications',token),
  markNotificationRead:(token:string,key:string)=>authorized<{read:boolean}>('/api/student/notifications/read',token,'POST',{key}),
  openLearningResource:(token:string,id:string)=>authorized<{url:string}>('/api/student/learning/resources/'+encodeURIComponent(id)+'/open',token),
  studentNotices:(token:string)=>authorized<{notices:Array<{id:string;title:string;body:string;published_at:string}>}>('/api/student/learning/notices',token),
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
 try {
 const response=await fetch(baseUrl+path,{signal:AbortSignal.timeout(20000),method,headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw statusError(response.status,data.error);
 return data as T;
 }catch(error){throw requestFailure(error);}
}
