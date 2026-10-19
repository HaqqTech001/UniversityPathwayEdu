import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function AcademicCatalogue({role}){
 const canEdit=['admin','super_admin'].includes(role);
 const [programmes,setProgrammes]=useState([]),[subjects,setSubjects]=useState([]);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true);
 const [programmeForm,setProgrammeForm]=useState({code:'',name:''});
 const [subjectForm,setSubjectForm]=useState({programmeId:'',code:'',name:''});
 const [saving,setSaving]=useState(false);
 const refresh=async()=>{
  setLoading(true);setError('');
  try{const result=await opsRequest('/academic/catalogue');setProgrammes(result.programmes||[]);setSubjects(result.subjects||[]);}
  catch(err){setError(err.message);}
  finally{setLoading(false);}
 };
 useEffect(()=>{void refresh();},[]);
 const create=async(type,event)=>{
  event.preventDefault();setSaving(true);setError('');setNotice('');
  try{
   const payload=type==='programme'?programmeForm:subjectForm;
   await opsRequest('/academic/'+(type==='programme'?'programmes':'subjects'),{method:'POST',body:JSON.stringify(payload)});
   if(type==='programme')setProgrammeForm({code:'',name:''});else setSubjectForm({...subjectForm,code:'',name:''});
   await refresh();setNotice(type==='programme'?'Programme created.':'Subject created.');
  }catch(err){setError(err.message);}finally{setSaving(false);}
 };
 return <section className="academic-catalogue" aria-labelledby="academic-title">
  <div className="academic-heading"><div><span className="eyebrow">ACADEMIC OPERATIONS</span><h2 id="academic-title">Programmes &amp; Subjects</h2><p>Manage the shared academic catalogue for teaching resources and CBT.</p></div><button type="button" className="details-button" onClick={()=>void refresh()} disabled={loading}>Refresh catalogue</button></div>
  {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
  {canEdit&&<div className="academic-forms">
    <form onSubmit={e=>void create('programme',e)}><h3>Add programme</h3><label>Code<input required maxLength={32} pattern="[A-Z0-9_-]{2,32}" placeholder="JAMB" value={programmeForm.code} onChange={e=>setProgrammeForm({...programmeForm,code:e.target.value.toUpperCase()})}/></label><label>Name<input required minLength={3} maxLength={160} value={programmeForm.name} onChange={e=>setProgrammeForm({...programmeForm,name:e.target.value})}/></label><button disabled={saving}>Create programme</button></form>
    <form onSubmit={e=>void create('subject',e)}><h3>Add subject</h3><label>Programme<select required value={subjectForm.programmeId} onChange={e=>setSubjectForm({...subjectForm,programmeId:e.target.value})}><option value="">Select programme</option>{programmes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label>Subject code<input required maxLength={32} pattern="[A-Z0-9_-]{2,32}" placeholder="ENG" value={subjectForm.code} onChange={e=>setSubjectForm({...subjectForm,code:e.target.value.toUpperCase()})}/></label><label>Subject name<input required maxLength={160} value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm,name:e.target.value})}/></label><button disabled={saving||!programmes.length}>Create subject</button></form>
  </div>}
  {loading?<p>Loading academic catalogue...</p>:programmes.length===0?<p className="notice">No programmes have been created yet.</p>:<div className="academic-programmes">{programmes.map(p=><article key={p.id}><div><h3>{p.name}</h3><span className="academic-code">{p.code}</span></div><p>{subjects.filter(s=>s.programme_id===p.id).length} subjects</p><ul>{subjects.filter(s=>s.programme_id===p.id).map(s=><li key={s.id}>{s.name} <small>({s.code})</small></li>)}</ul></article>)}</div>}
 </section>;
}
