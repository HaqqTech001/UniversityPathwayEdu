import React,{useState} from 'react';
import {staffSignIn} from './api';
export default function StaffLogin({onSuccess}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const submit=async(event)=>{
  event.preventDefault();if(busy)return;setBusy(true);setError('');
  try{await staffSignIn(email.trim(),password);await onSuccess();}
  catch(err){setError(err instanceof Error?err.message:'Unable to sign in');}
  finally{setBusy(false);}
 };
 return <main className="ops-login-screen">
  <div className="ops-login-layout">
   <aside className="ops-login-feature" aria-label="Staff operations overview">
    <div className="ops-login-feature-content">
     <span className="ops-login-overline">ADMIN DESK</span>
     <h1>Manage.<br/>Support.<br/>Empower.</h1>
     <p>Admissions. Students. Programmes. Finance. Support. All in one place.</p>
     <div className="ops-login-feature-grid">
      <div><span aria-hidden="true">♙</span>Student<br/>Management</div>
      <div><span aria-hidden="true">▣</span>Programme<br/>Publishing</div>
      <div><span aria-hidden="true">▤</span>Application<br/>Processing</div>
      <div><span aria-hidden="true">▥</span>Reports &amp;<br/>Analytics</div>
     </div>
    </div>
    <div className="ops-login-feature-footer">UNIVERSITY PATHWAY EDUCATIONAL CONSULT <small>EDUCATION · GUIDANCE · OPPORTUNITY</small></div>
   </aside>
   <section className="ops-login-card" aria-labelledby="ops-login-title">
    <div className="ops-login-logo"><img src="/pathway-logos/pathway-header.png" alt="University Pathway Educational Consult" /></div>
    <h2 id="ops-login-title">Staff Sign In</h2>
    <p className="ops-login-intro">Access the University Pathway Admin Desk to manage admissions, programmes, students and more.</p>
    <form onSubmit={submit} className="ops-login-form">
     <label htmlFor="ops-login-email">Email address</label><input id="ops-login-email" required type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/>
     <label htmlFor="ops-login-password">Password</label>
     <div className="ops-login-password"><input id="ops-login-password" required type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} /><button type="button" aria-label={showPassword?'Hide password':'Show password'} aria-pressed={showPassword} onClick={()=>setShowPassword(v=>!v)}>{showPassword?'Hide':'Show'}</button></div>
     {error&&<p role="alert" className="ops-login-error">{error}</p>}
     <button className="ops-login-submit" disabled={busy} type="submit">{busy?'Verifying credentials…':'Sign In →'}</button>
    </form>
    <div className="ops-login-security"><strong>◇ Secure Staff Access</strong><p>For authorised UPEC staff only. Permissions are validated by the administration service.</p></div>
   </section>
  </div>
 </main>;
}
