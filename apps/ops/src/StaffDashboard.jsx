import React,{useEffect,useMemo,useState} from 'react';
import {opsRequest,clearOpsToken} from './api';
export default function StaffDashboard({profile,onLogout}){
 const [applications,setApplications]=useState([]);
 const [members,setMembers]=useState([]);
 const [metrics,setMetrics]=useState(null);
 const [directoryLoading,setDirectoryLoading]=useState(false);
 const [error,setError]=useState('');
 const [loading,setLoading]=useState(true);
 const [updating,setUpdating]=useState(null);
 const [search,setSearch]=useState('');
 const [statusFilter,setStatusFilter]=useState('all');
 const [review,setReview]=useState(null);
 const [reviewNote,setReviewNote]=useState('');
 const canRead=profile.permissions?.includes('applications.read');
 const canManageStaff=profile.role==='super_admin'&&profile.permissions?.includes('staff.manage');
 const canReview=profile.permissions?.includes('applications.review');
 const filtered=useMemo(()=>applications.filter(a=>{
  const matchesStatus=statusFilter==='all'||a.status===statusFilter;
  const q=search.trim().toLowerCase();
  return matchesStatus&&(!q||[a.reference_number,a.programme,a.academic_session].some(v=>String(v||'').toLowerCase().includes(q)));
 }),[applications,search,statusFilter]);
 const load=async()=>{
  setLoading(true);setError('');
  try{
   if(!canRead){setApplications([]);setMetrics(null);return;}
   const [data,summary]=await Promise.all([opsRequest('/applications'),opsRequest('/applications/metrics')]);
   setApplications(data.applications||[]);
   setMetrics(summary);
  }
  catch(err){setMetrics(null);setError(err.message);}
  finally{setLoading(false);}
 };
 useEffect(()=>{void load();},[canRead]);
 useEffect(()=>{if(!canManageStaff)return;setDirectoryLoading(true);opsRequest('/members').then(data=>setMembers(data.members||[])).catch(err=>setError(err.message)).finally(()=>setDirectoryLoading(false));},[canManageStaff]);
 const update=async()=>{
  if(!review||!canReview)return;
  const note=reviewNote.trim();
  if(['rejected','action_required'].includes(review.status)&&note.length<5){setError('Please provide a meaningful review reason of at least five characters.');return;}
  if(note.length>2000){setError('Review note must be 2,000 characters or fewer.');return;}
  setError('');setUpdating(review.id);
  try{
   await opsRequest('/applications/'+encodeURIComponent(review.id)+'/status',{method:'PATCH',body:JSON.stringify({status:review.status,note})});
   setReview(null);setReviewNote('');await load();
  }catch(err){setError(err.message);}
  finally{setUpdating(null);}
 };
 const openReview=(item,status)=>{setReview({...item,status});setReviewNote('');setError('');};
 return <main className="workspace">
  <header className="workspace-header"><div><span className="eyebrow">UPEC · OPERATIONS</span><h1>Staff Desk</h1><p>Role: {profile.role?.replaceAll('_',' ')}</p></div><button onClick={()=>{clearOpsToken();onLogout();}}>Sign out</button></header>
  <section className="workspace-content">
   {canRead&&!loading&&!error&&metrics&&<div className="ops-metrics"><article><span>Total applications</span><strong>{metrics.total}</strong></article><article><span>Submitted</span><strong>{metrics.submitted}</strong></article><article><span>Under review</span><strong>{metrics.under_review}</strong></article><article><span>Approved</span><strong>{metrics.approved}</strong></article></div>}
   <h2>Applications</h2>
   {!canRead?<p className="notice">Your role does not have permission to view applications.</p>:<>
    <p>Dashboard figures reflect all applications in the database. The review table displays up to 100 recent applications.</p>
    {error&&<p role="alert" className="form-error">{error}</p>}
    <div className="admissions-filters"><label>Search recent applications<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Reference, programme or session"/></label><label>Filter status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{['submitted','under_review','approved','action_required','rejected'].map(status=><option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label><button type="button" onClick={()=>void load()} disabled={loading}>Refresh</button></div>
    {loading?<p>Loading applications...</p>:applications.length===0?<p>No applications available.</p>:filtered.length===0?<p>No matching applications in the 100 most recent records.</p>:
    <div className="table-scroll"><table><thead><tr><th>Reference</th><th>Programme</th><th>Session</th><th>Status</th>{canReview&&<th>Review</th>}</tr></thead>
    <tbody>{filtered.map(a=><tr key={a.id}><td>{a.reference_number}</td><td>{a.programme}</td><td>{a.academic_session}</td><td><span className={'status-pill status-'+a.status}>{a.status?.replaceAll('_',' ')}</span></td>{canReview&&<td><select disabled={updating===a.id} aria-label={'Update '+a.reference_number} value="" onChange={e=>{if(e.target.value)openReview(a,e.target.value);}}><option value="" disabled>Choose action</option><option value="under_review">Under review</option><option value="approved">Approve</option><option value="action_required">Action required</option><option value="rejected">Reject</option></select></td>}</tr>)}</tbody></table></div>}
   </>}
   {review&&<div className="review-backdrop" role="presentation"><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><h2 id="review-title">Confirm admissions decision</h2><p><strong>{review.reference_number}</strong> — {review.programme}</p><p>Change status to <strong>{review.status.replaceAll('_',' ')}</strong>?</p><label>Review note {['rejected','action_required'].includes(review.status)?'(required)':'(optional)'}<textarea maxLength={2000} rows={4} value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Explain the decision for the applicant and audit record"/></label>{error&&<p role="alert" className="form-error">{error}</p>}<div className="review-actions"><button type="button" className="secondary-button" disabled={Boolean(updating)} onClick={()=>{setReview(null);setError('');}}>Cancel</button><button type="button" disabled={Boolean(updating)} onClick={()=>void update()}>{updating?'Saving...':'Confirm decision'}</button></div></section></div>}
   {canManageStaff&&<section className="staff-directory"><h2>Staff Directory</h2><p>Memberships are read-only until the secure Super Admin management workflow is completed.</p>{directoryLoading?<p>Loading staff records...</p>:members.length===0?<p>No staff memberships available.</p>:<div className="table-scroll"><table><thead><tr><th>Account ID</th><th>Role</th><th>Access</th></tr></thead><tbody>{members.map(m=><tr key={m.account_id}><td>{m.account_id}</td><td>{m.role?.replaceAll('_',' ')}</td><td>{m.active?'Active':'Disabled'}</td></tr>)}</tbody></table></div>}</section>}
  </section>
 </main>;
}
