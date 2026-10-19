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
