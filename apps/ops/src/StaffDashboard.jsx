import React,{useEffect,useState} from 'react';
import {opsRequest,clearOpsToken} from './api';
export default function StaffDashboard({profile,onLogout}){
 const [applications,setApplications]=useState([]);
 const [members,setMembers]=useState([]);
 const [directoryLoading,setDirectoryLoading]=useState(false);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [updating,setUpdating]=useState(null);
 const canRead=profile.permissions?.includes('applications.read');
 const canManageStaff=profile.role==='super_admin'&&profile.permissions?.includes('staff.manage');
 const canReview=profile.permissions?.includes('applications.review');
 const submittedCount=applications.filter(item=>item.status==='submitted').length;
 const load=async()=>{
  setLoading(true);setError('');
  try{const data=canRead?await opsRequest('/applications'):{applications:[]};setApplications(data.applications||[]);}
  catch(err){setError(err.message);}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[canRead]);
 useEffect(()=>{if(!canManageStaff)return;setDirectoryLoading(true);opsRequest('/members').then(data=>setMembers(data.members||[])).catch(err=>setError(err.message)).finally(()=>setDirectoryLoading(false));},[canManageStaff]);
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
   {canManageStaff&&<section className="staff-directory"><h2>Staff Directory</h2><p>Memberships are read-only until the secure Super Admin management workflow is completed.</p>{directoryLoading?<p>Loading staff records...</p>:members.length===0?<p>No staff memberships available.</p>:<div className="table-scroll"><table><thead><tr><th>Account ID</th><th>Role</th><th>Access</th></tr></thead><tbody>{members.map(m=><tr key={m.account_id}><td>{m.account_id}</td><td>{m.role?.replaceAll('_',' ')}</td><td>{m.active?'Active':'Disabled'}</td></tr>)}</tbody></table></div>}</section>}
  </section>
 </main>;
}
