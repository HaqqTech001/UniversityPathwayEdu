import React,{useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
import ConductAcknowledgement from './ConductAcknowledgement';
export default function CommonApplicationForm(){
 const [programme,setProgramme]=useState(''),[session,setSession]=useState('');
 const [guardianName,setGuardianName]=useState(''),[guardianPhone,setGuardianPhone]=useState('');
 const [emergencyContactName,setEmergencyContactName]=useState(''),[emergencyContactPhone,setEmergencyContactPhone]=useState('');
 const [sponsorName,setSponsorName]=useState(''),[sponsorPhone,setSponsorPhone]=useState('');
 const [school,setSchool]=useState(''),[qualification,setQualification]=useState('');
 const [hostelInterest,setHostelInterest]=useState(''),[declarationAccepted,setDeclarationAccepted]=useState(false);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[reference,setReference]=useState('');
 const submit=async(e:React.FormEvent)=>{e.preventDefault();setBusy(true);setError('');
 try{const token=getStudentToken();if(!token)throw Error('Sign in to continue.');
 const formData={programmeCategory:programme.trim(),preferredSession:session.trim(),guardianName,guardianPhone,emergencyContactName,emergencyContactPhone,sponsorName,sponsorPhone,hostelInterest,educationHistory:[{school,qualification}],declarationAccepted};
 const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student/applications',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({formData})});
 const json=await response.json();if(!response.ok)throw Error(json.error||'Unable to submit application');setReference(json.application.reference_number);
 }catch(e){setError(e instanceof Error?e.message:'Submission failed');}finally{setBusy(false);}};
 return <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6" aria-labelledby="application-form-title"><div><h2 id="application-form-title" className="text-xl font-bold text-[#111A43]">Apply for Another Programme</h2><p className="mt-1 text-sm text-slate-600">One student account can apply to multiple programmes. Supply complete, accurate details for each new application.</p></div>
 {reference?<p className="rounded-xl bg-emerald-50 p-4 text-emerald-900" role="status">Application submitted. Reference: <strong>{reference}</strong>. Your programme registration number will be issued only if admission is approved.</p>:<form className="grid gap-4" onSubmit={submit}>
 <label>Programme<input className="mt-1 w-full rounded-lg border p-3" required maxLength={100} placeholder="e.g. IJMB" value={programme} onChange={e=>setProgramme(e.target.value)}/></label>
 <label>Academic session<input className="mt-1 w-full rounded-lg border p-3" required maxLength={50} placeholder="e.g. 2026/2027" value={session} onChange={e=>setSession(e.target.value)}/></label>
 <div className="grid gap-4 sm:grid-cols-2"><label>Parent/guardian full name<input className="mt-1 w-full rounded-lg border p-3" required value={guardianName} onChange={e=>setGuardianName(e.target.value)}/></label><label>Parent/guardian phone<input className="mt-1 w-full rounded-lg border p-3" required value={guardianPhone} onChange={e=>setGuardianPhone(e.target.value)}/></label>
 <label>Emergency contact full name<input className="mt-1 w-full rounded-lg border p-3" required value={emergencyContactName} onChange={e=>setEmergencyContactName(e.target.value)}/></label><label>Emergency contact phone<input className="mt-1 w-full rounded-lg border p-3" required value={emergencyContactPhone} onChange={e=>setEmergencyContactPhone(e.target.value)}/></label>
 <label>Financial sponsor full name<input className="mt-1 w-full rounded-lg border p-3" required value={sponsorName} onChange={e=>setSponsorName(e.target.value)}/></label><label>Sponsor phone<input className="mt-1 w-full rounded-lg border p-3" required value={sponsorPhone} onChange={e=>setSponsorPhone(e.target.value)}/></label>
 <label>Most recent school<input className="mt-1 w-full rounded-lg border p-3" required value={school} onChange={e=>setSchool(e.target.value)}/></label><label>Qualification / result<input className="mt-1 w-full rounded-lg border p-3" required value={qualification} onChange={e=>setQualification(e.target.value)}/></label></div>
 <label>Interested in hostel accommodation?<select className="mt-1 w-full rounded-lg border p-3" required value={hostelInterest} onChange={e=>setHostelInterest(e.target.value)}><option value="">Select an option</option><option value="yes">Yes</option><option value="no">No</option></select></label>
 <p className="text-sm text-slate-600">Accommodation requests are expressions of interest, not confirmed room reservations.</p>
 <details className="rounded-xl border border-slate-200 p-4"><summary className="cursor-pointer font-semibold">Read the official Students’ Code of Conduct</summary><ConductAcknowledgement/></details>
 <label className="flex items-start gap-2 text-sm"><input className="mt-1" type="checkbox" checked={declarationAccepted} onChange={e=>setDeclarationAccepted(e.target.checked)}/> I confirm the application information is accurate, and understand that submitting false information may result in rejection.</label>
 {error&&<p className="text-sm text-red-700" role="alert">{error}</p>}<button disabled={busy||!declarationAccepted} type="submit" className="rounded-xl bg-[#C62839] px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Submitting…':'Submit application for review'}</button></form>}</section>;
}
