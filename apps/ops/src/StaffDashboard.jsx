import React,{useEffect,useState} from 'react';
import {opsRequest,clearOpsToken} from './api';
export default function StaffDashboard({profile,onLogout}){
 const [applications,setApplications]=useState([]);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [updating,setUpdating]=useState(null);
 const canRead=profile.permissions?.includes('applications.read');
 const canReview=profile.permissions?.includes('applications.review');
 const load=async()=>{
  setLoading(true);setError('');
  try{const data=canRead?await opsRequest('/applications'):{applications:[]};setApplications(data.applications||[]);}
  catch(err){setError(err.message);}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[canRead]);
 const update=async(id,status)=>{
  if(!canReview)return;
  try{
   const note=['rejected','action_required'].includes(status)?window.prompt('Enter a reason for this decision (required):'):'';
   if(note===null||(['rejected','action_required'].includes(status)&&(!note||note.trim().length<5))){setError('Please provide a meaningful review reason.');return;}
   if(!window.confirm('Confirm application status change to '+status.replaceAll('_',' ')+'?'))return;
   setUpdating(id);
   await opsRequest('/applications/'+encodeURIComponent(id)+'/status',{method:'PATCH',body:JSON.stringify({status,note:note||''})});await load();}
  catch(err){setError(err.message);}
  finally{setUpdating(null);}
 };
 return <main className="workspace">
  <header className="workspace-header"><div><span className="eyebrow">UPEC · OPERATIONS</span><h1>Staff Desk</h1><p>Role: {profile.role?.replaceAll('_',' ')}</p></div><button onClick={()=>{clearOpsToken();onLogout();}}>Sign out</button></header>
  <section className="workspace-content">
   <h2>Applications</h2>
   {!canRead?<p className="notice">Your role does not have permission to view applications.</p>:<>
    <p>Applications are loaded from the staff API, subject to your assigned permissions.</p>
    {error&&<p role="alert" className="form-error">{error}</p>}
    {loading?<p>Loading applications...</p>:applications.length===0?<p>No applications available.</p>:
    <div className="table-scroll"><table><thead><tr><th>Reference</th><th>Programme</th><th>Session</th><th>Status</th>{canReview&&<th>Review</th>}</tr></thead>
    <tbody>{applications.map(a=><tr key={a.id}><td>{a.reference_number}</td><td>{a.programme}</td><td>{a.academic_session}</td><td>{a.status?.replaceAll('_',' ')}</td>{canReview&&<td><select disabled={updating===a.id} aria-label={'Update '+a.reference_number} value="" onChange={e=>{if(e.target.value)void update(a.id,e.target.value);}}><option value="" disabled>Choose action</option><option value="under_review">Under review</option><option value="approved">Approve</option><option value="action_required">Action required</option><option value="rejected">Reject</option></select></td>}</tr>)}</tbody></table></div>}
   </>}
  </section>
 </main>;
}
