import React,{useState} from 'react';
import {staffSignIn} from './api';
export default function StaffLogin({onSuccess}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const submit=async(event)=>{
  event.preventDefault();setBusy(true);setError('');
  try{await staffSignIn(email,password);await onSuccess();}
  catch(err){setError(err instanceof Error?err.message:'Unable to sign in');}
  finally{setBusy(false);}
 };
 return <main className="shell"><section className="panel">
  <span className="eyebrow">UPEC · STAFF OPERATIONS</span>
  <h1>Staff Sign In</h1>
  <p>Authorized staff only. Your access is determined by permissions assigned by UPEC administration.</p>
  <form onSubmit={submit} className="staff-form">
   <label>Work email<input required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
   <label>Password<input required type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>
   {error&&<p role="alert" className="form-error">{error}</p>}
   <button disabled={busy} type="submit">{busy?'Verifying...':'Sign in to Staff Desk'}</button>
  </form>
  <p className="notice">Staff sign-in requires the separate staff authentication API. Student credentials do not grant access.</p>
 </section></main>;
}
