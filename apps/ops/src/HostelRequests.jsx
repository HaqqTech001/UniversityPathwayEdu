import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function HostelRequests(){
 const [rows,setRows]=useState([]),[error,setError]=useState(''),[editing,setEditing]=useState({});
 const load=async()=>{try{const r=await opsRequest('/hostel/requests');setRows(r.requests||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void load();},[]);
 const save=async id=>{try{await opsRequest('/hostel/requests/'+id,{method:'PATCH',body:JSON.stringify(editing[id])});await load();}catch(e){setError(e.message);}};
 return <section className="staff-directory"><h2>Accommodation Requests</h2><p>Review hostel interest. An offer is not an allocated room until capacity is verified.</p>{error&&<p role="alert">{error}</p>}<div className="table-scroll"><table><thead><tr><th>Application</th><th>Status</th><th>Decision</th></tr></thead><tbody>{rows.map(r=><tr key={r.id}><td>{r.application_id}</td><td>{r.status}</td><td><select value={editing[r.id]?.status||r.status} onChange={e=>setEditing(old=>({...old,[r.id]:{status:e.target.value,note:r.staff_note||'',accommodationDetail:r.accommodation_detail||''}}))}>{['pending','reviewing','waitlisted','offered','declined'].map(s=><option key={s}>{s}</option>)}</select><textarea aria-label="Review note" placeholder="Review note" onChange={e=>setEditing(old=>({...old,[r.id]:{status:r.status,accommodationDetail:'',...old[r.id],note:e.target.value}}))}/><button type="button" disabled={!editing[r.id]||editing[r.id].status==='pending'} onClick={()=>void save(r.id)}>Save</button></td></tr>)}</tbody></table></div></section>;
}
