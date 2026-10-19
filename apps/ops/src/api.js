const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '');
const TOKEN_KEY = 'upec_ops_session';
export function getOpsToken(){return sessionStorage.getItem(TOKEN_KEY);}
export function clearOpsToken(){sessionStorage.removeItem(TOKEN_KEY);}
export async function opsRequest(path,options={}){
 const token=getOpsToken();
 const response=await fetch(API_BASE+'/api/staff'+path,{
  ...options,
  headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers},
 });
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||'Unable to complete request');
 return data;
}
export async function staffSignIn(email,password){
 const response=await fetch(API_BASE+'/api/staff/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||!data.token)throw new Error(data.error||'Staff sign-in is not available');
 sessionStorage.setItem(TOKEN_KEY,data.token);
 return data;
}
