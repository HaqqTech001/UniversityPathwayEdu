import React,{useState} from 'react';
import {opsRequest} from './api';
export default function StudentEditPermissions(){
 const [studentId,setStudentId]=useState('');
 const [permissions,setPermissions]=useState(null);
 const [loading,setLoading]=useState(false),[saving,setSaving]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const valid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(studentId.trim());
 const load=async(e)=>{e.preventDefault();setError('');setNotice('');setPermissions(null);setLoading(true);
  try{const result=await opsRequest('/students/'+encodeURIComponent(studentId.trim())+'/edit-permissions');setPermissions(result.permissions);}
  catch(err){setError(err.message);}finally{setLoading(false);}
 };
 const save=async(e)=>{e.preventDefault();setSaving(true);setError('');setNotice('');
  try{const result=await opsRequest('/students/'+encodeURIComponent(studentId.trim())+'/edit-permissions',{method:'PUT',body:JSON.stringify({biodataEditAllowed:permissions.biodata_edit_allowed,programmeChangeAllowed:permissions.programme_change_allowed})});setPermissions(result.permissions);setNotice('Permissions saved successfully. The student will see changes after refreshing their dashboard.');}
  catch(err){setError(err.message);}finally{setSaving(false);}
 };
 return <section className="academic-catalogue" aria-labelledby="student-permissions-heading">
  <div className="academic-heading"><div><span className="eyebrow">STUDENT RECORD SECURITY</span><h2 id="student-permissions-heading">Student Edit Permissions</h2><p>Completed biodata remains read-only unless an administrator grants access. Programme editing is controlled separately.</p></div></div>
  <form onSubmit={load}><label>Student account ID (UUID)<input required value={studentId} onChange={e=>{setStudentId(e.target.value);setPermissions(null);setNotice('');}} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" aria-describedby="student-permissions-help"/></label><p id="student-permissions-help">Find the account ID in the student record. Permission changes are restricted to authorized administrators.</p><button disabled={!valid||loading}>{loading?'Loading…':'Look up permissions'}</button></form>
  {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
  {permissions&&<form onSubmit={save}><h3>Permissions for {studentId}</h3><label><input type="checkbox" checked={!!permissions.biodata_edit_allowed} onChange={e=>setPermissions({...permissions,biodata_edit_allowed:e.target.checked})}/> Allow biodata editing</label><label><input type="checkbox" checked={!!permissions.programme_change_allowed} onChange={e=>setPermissions({...permissions,programme_change_allowed:e.target.checked})}/> Allow programme changes</label><p>Only grant temporary access when the student's request has been verified. Revoke permission after the correction is made.</p><button disabled={saving}>{saving?'Saving…':'Save student permissions'}</button></form>}
 </section>;
}
