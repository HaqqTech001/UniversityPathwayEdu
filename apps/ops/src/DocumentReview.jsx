import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function DocumentReview({applicationId}){
 const [docs,setDocs]=useState([]),[notes,setNotes]=useState({}),[error,setError]=useState(''),[busy,setBusy]=useState('');
 const reload=async()=>{try{const d=await opsRequest('/applications/'+applicationId+'/documents');setDocs(d.documents||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void reload();},[applicationId]);
 const view=async id=>{try{const {url}=await opsRequest('/documents/'+id+'/view');window.open(url,'_blank','noopener,noreferrer');}catch(e){setError(e.message);}};
 const review=async(id,status)=>{setBusy(id);setError('');try{await opsRequest('/documents/'+id+'/review',{method:'PATCH',body:JSON.stringify({status,note:notes[id]||''})});await reload();}catch(e){setError(e.message);}finally{setBusy('');}};
 return <div className="staff-directory"><h3>Supporting documents</h3>{error&&<p role="alert">{error}</p>}{docs.length===0?<p>No documents submitted.</p>:<div className="table-scroll"><table><thead><tr><th>File</th><th>Type</th><th>Review</th><th>Action</th></tr></thead><tbody>{docs.map(d=><tr key={d.id}><td>{d.original_filename}</td><td>{d.document_type}</td><td>{d.review_status}{d.review_note&&<p>{d.review_note}</p>}</td><td><button type="button" onClick={()=>void view(d.id)}>View</button><textarea aria-label={'Review note for '+d.original_filename} placeholder="Review note (required for rejection)" maxLength={1000} value={notes[d.id]||''} onChange={e=>setNotes(old=>({...old,[d.id]:e.target.value}))}/><button type="button" disabled={busy===d.id} onClick={()=>void review(d.id,'verified')}>Verify</button><button type="button" disabled={busy===d.id||(notes[d.id]||'').trim().length<5} onClick={()=>void review(d.id,'rejected')}>Reject with reason</button></td></tr>)}</tbody></table></div>}</div>;
}
