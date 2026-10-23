import {notifyPortal} from './PortalToasts';
import PaymentLedger from './PaymentLedger';
import RegistrationBilling from './RegistrationBilling';
import FinanceSummary from './FinanceSummary';
import BankAccounts from './BankAccounts';
import ExamRegistrations from './ExamRegistrations';
import SupportInbox from './SupportInbox';
import BlogManager from './BlogManager';
import ServiceRequests from './ServiceRequests';
import ServiceFees from './ServiceFees';
import HostelRequests from './HostelRequests';
import HostelBeds from './HostelBeds';
import ProgrammeFees from './ProgrammeFees';
import FeeBilling from './FeeBilling';
import StudentEditPermissions from './StudentEditPermissions';
import NoticeBoard from './NoticeBoard';
import LearningResources from './LearningResources';
import AssessmentBuilder from './AssessmentBuilder';
import TeacherQuestionBank from './TeacherQuestionBank';
import AcademicCatalogue from './AcademicCatalogue';
import SubjectCombinations from './SubjectCombinations';
import React,{useEffect,useMemo,useState} from 'react';
import DocumentReview from './DocumentReview';
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
 const [details,setDetails]=useState(null);
 const [detailsLoading,setDetailsLoading]=useState(false);
 const [detailsError,setDetailsError]=useState('');
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
   setReview(null);setReviewNote('');await load();notifyPortal('success','Application review saved successfully.');
  }catch(err){setError(err.message);notifyPortal('error',err.message||'Operation failed.');}
  finally{setUpdating(null);}
 };
 const viewDetails=async id=>{
  setDetailsLoading(true);setDetailsError('');setDetails({application:null,reviews:[]});
  try{setDetails(await opsRequest('/applications/'+encodeURIComponent(id)));}
  catch(err){setDetailsError(err.message);}
  finally{setDetailsLoading(false);}
 };
 const openReview=(item,status)=>{setReview({...item,status});setReviewNote('');setError('');};
 return <main className="workspace">
  <header className="workspace-header"><div><span className="eyebrow">UNIVERSITY PATHWAY · OPERATIONS</span><h1>Staff Desk</h1><p>Role: {profile.role?.replaceAll('_',' ')}</p></div><button onClick={()=>{clearOpsToken();onLogout();}}>Sign out</button></header>
  <section className="workspace-content">
   {canRead&&!loading&&!error&&metrics&&<div className="ops-metrics"><article><span>Total applications</span><strong>{metrics.total}</strong></article><article><span>Submitted</span><strong>{metrics.submitted}</strong></article><article><span>Under review</span><strong>{metrics.under_review}</strong></article><article><span>Approved</span><strong>{metrics.approved}</strong></article></div>}
   <h2>Applications</h2>
   {!canRead?<p className="notice">Your role does not have permission to view applications.</p>:<>
    <p>Dashboard figures reflect all applications in the database. The review table displays up to 100 recent applications.</p>
    {error&&<p role="alert" className="form-error">{error}</p>}
    <div className="admissions-filters"><label>Search recent applications<input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Reference, programme or session"/></label><label>Filter status<select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">All statuses</option>{['submitted','under_review','approved','action_required','rejected'].map(status=><option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label><button type="button" onClick={()=>void load()} disabled={loading}>Refresh</button></div>
    {loading?<p>Loading applications...</p>:applications.length===0?<p>No applications available.</p>:filtered.length===0?<p>No matching applications in the 100 most recent records.</p>:
    <div className="table-scroll"><table><thead><tr><th>Reference</th><th>Programme</th><th>Session</th><th>Status</th><th>Details</th>{canReview&&<th>Review</th>}</tr></thead>
    <tbody>{filtered.map(a=><tr key={a.id}><td>{a.reference_number}</td><td>{a.programme}</td><td>{a.academic_session}</td><td><span className={'status-pill status-'+a.status}>{a.status?.replaceAll('_',' ')}</span></td><td><button className="details-button" type="button" onClick={()=>void viewDetails(a.id)}>View details</button></td>{canReview&&<td><select disabled={updating===a.id} aria-label={'Update '+a.reference_number} value="" onChange={e=>{if(e.target.value)openReview(a,e.target.value);}}><option value="" disabled>Choose action</option><option value="under_review">Under review</option><option value="approved">Approve</option><option value="action_required">Action required</option><option value="rejected">Reject</option></select></td>}</tr>)}</tbody></table></div>}
   </>}
   {details&&<div className="review-backdrop" role="presentation"><section className="review-dialog application-details" role="dialog" aria-modal="true" aria-labelledby="details-title"><h2 id="details-title">Application details</h2>{detailsLoading?<p>Loading application...</p>:detailsError?<p role="alert" className="form-error">{detailsError}</p>:<><p><strong>{details.application?.reference_number}</strong> · {details.application?.programme} · {details.application?.academic_session}</p><p><span className={'status-pill status-'+details.application?.status}>{details.application?.status?.replaceAll('_',' ')}</span></p><h3>Submitted information</h3><dl className="details-grid">{Object.entries(details.application?.form_data||{}).filter(([,value])=>value!==null&&value!==undefined&&typeof value!=='object').map(([key,value])=><div key={key}><dt>{key.replace(/([A-Z])/g,' $1').replaceAll('_',' ')}</dt><dd>{String(value)}</dd></div>)}</dl>{details.application?.id&&<DocumentReview applicationId={details.application.id}/>}<h3>Student resubmissions</h3>{!details.resubmissions?.length?<p>No corrections have been resubmitted.</p>:<ol className="review-timeline">{details.resubmissions.map(item=><li key={item.id}><strong>Application corrected and returned for review</strong><time dateTime={item.submitted_at}>{new Date(item.submitted_at).toLocaleString()}</time></li>)}</ol>}<h3>Review history</h3>{!details.reviews?.length?<p>No review decisions have been recorded yet.</p>:<ol className="review-timeline">{details.reviews.map(item=><li key={item.id}><strong>{item.previous_status?.replaceAll('_',' ')} → {item.new_status?.replaceAll('_',' ')}</strong><time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>{item.note&&<p>{item.note}</p>}</li>)}</ol>}</>}<div className="review-actions"><button type="button" className="secondary-button" onClick={()=>{setDetails(null);setDetailsError('');}}>Close</button></div></section></div>}
   {review&&<div className="review-backdrop" role="presentation"><section className="review-dialog" role="dialog" aria-modal="true" aria-labelledby="review-title"><h2 id="review-title">Confirm admissions decision</h2><p><strong>{review.reference_number}</strong> — {review.programme}</p><p>Change status to <strong>{review.status.replaceAll('_',' ')}</strong>?</p><label>Review note {['rejected','action_required'].includes(review.status)?'(required)':'(optional)'}<textarea maxLength={2000} rows={4} value={reviewNote} onChange={e=>setReviewNote(e.target.value)} placeholder="Explain the decision for the applicant and audit record"/></label>{error&&<p role="alert" className="form-error">{error}</p>}<div className="review-actions"><button type="button" className="secondary-button" disabled={Boolean(updating)} onClick={()=>{setReview(null);setError('');}}>Cancel</button><button type="button" disabled={Boolean(updating)} onClick={()=>void update()}>{updating?'Saving...':'Confirm decision'}</button></div></section></div>}
   {['admin','super_admin','teacher','cbt_manager','admissions_officer'].includes(profile.role)&&<AcademicCatalogue role={profile.role}/>}
   {canReview&&<ExamRegistrations/>}
   {['admin','super_admin'].includes(profile.role)&&<SubjectCombinations/>}
   {['admin','super_admin','teacher','cbt_manager'].includes(profile.role)&&<TeacherQuestionBank role={profile.role}/>}
   {['admin','super_admin','teacher','cbt_manager'].includes(profile.role)&&<AssessmentBuilder role={profile.role}/>}
   {['admin','super_admin','teacher','cbt_manager'].includes(profile.role)&&<LearningResources role={profile.role}/>}
   {['admin','super_admin','content_editor'].includes(profile.role)&&<NoticeBoard role={profile.role}/>}
   {['super_admin','admin','content_editor'].includes(profile.role)&&<BlogManager role={profile.role}/>}
   {profile.permissions?.includes('students.manage')&&<StudentEditPermissions/>}
   {profile.permissions?.includes('finance.manage')&&<><FinanceSummary/><PaymentLedger/><BankAccounts/><ProgrammeFees/><RegistrationBilling/><FeeBilling/></>}
   {canRead&&<ServiceRequests/>}
   {canRead&&<HostelRequests/>}
   {canReview&&<HostelBeds/>}
   {profile.permissions?.includes('finance.manage')&&<ServiceFees/>}
   {['super_admin','admin','admissions_officer','teacher','content_editor'].includes(profile.role)&&<SupportInbox/>}
   {canManageStaff&&<section className="staff-directory"><h2>Staff Directory</h2><p>Memberships are read-only until the secure Super Admin management workflow is completed.</p>{directoryLoading?<p>Loading staff records...</p>:members.length===0?<p>No staff memberships available.</p>:<div className="table-scroll"><table><thead><tr><th>Account ID</th><th>Role</th><th>Access</th></tr></thead><tbody>{members.map(m=><tr key={m.account_id}><td>{m.account_id}</td><td>{m.role?.replaceAll('_',' ')}</td><td>{m.active?'Active':'Disabled'}</td></tr>)}</tbody></table></div>}</section>}
  </section>
 </main>;
}
