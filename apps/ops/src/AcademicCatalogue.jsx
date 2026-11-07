import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';

const emptyProgramme={name:'',description:''};
const emptySubject={programmeId:'',code:'',name:'',description:''};
const emptyNeco={subjectCode:'',subjectName:'',subjectCategory:'science_mathematics',fieldOfStudy:'science',selectionType:'departmental_core',sourceReference:'NECO SSCE Internal 2027',sourceVerified:false};
const isIjmb=programme=>/IJMB/i.test((programme?.name||'')+' '+(programme?.code||''));
const fields=[['general','General / Cross-cutting'],['science','Science & Mathematics'],['humanities','Humanities / Arts'],['technology','Technology'],['business','Business / Commercial'],['trade','Trade / Entrepreneurship']];
const categories=[['cross_cutting','Cross-cutting'],['science_mathematics','Science & Mathematics'],['technology','Technology'],['humanities','Humanities'],['business_studies','Business Studies'],['trade_entrepreneurship','Trade / Entrepreneurship']];
const selections=[['cross_cutting_compulsory','Cross-cutting compulsory'],['departmental_core','Departmental core'],['departmental_optional','Departmental optional'],['outside_field_elective','Elective outside field']];

export default function AcademicCatalogue({role}){
 const canEdit=['admin','super_admin'].includes(role);
 const [programmes,setProgrammes]=useState([]),[subjects,setSubjects]=useState([]),[necoSubjects,setNecoSubjects]=useState([]);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true),[necoLoading,setNecoLoading]=useState(true);
 const [programmeForm,setProgrammeForm]=useState(emptyProgramme);
 const [subjectForm,setSubjectForm]=useState(emptySubject);
 const [necoForm,setNecoForm]=useState(emptyNeco);
 const [saving,setSaving]=useState(false);
 const selectedProgramme=programmes.find(p=>p.id===subjectForm.programmeId);
 const requiresSubjectCode=isIjmb(selectedProgramme);
 const refresh=async()=>{
  setLoading(true);setError('');
  try{const result=await opsRequest('/academic/catalogue');setProgrammes(result.programmes||[]);setSubjects(result.subjects||[]);}
  catch(err){setError(err.message);}
  finally{setLoading(false);}
 };
 const refreshNeco=async()=>{
  setNecoLoading(true);
  try{const result=await opsRequest('/academic/neco/subjects?year=2027');setNecoSubjects(result.subjects||[]);}
  catch(err){setError(err.message);}
  finally{setNecoLoading(false);}
 };
 useEffect(()=>{void refresh();void refreshNeco();},[]);
 const create=async(type,event)=>{
  event.preventDefault();setSaving(true);setError('');setNotice('');
  try{
   const payload=type==='programme'?programmeForm:{...subjectForm,code:requiresSubjectCode?subjectForm.code:null};
   await opsRequest('/academic/'+(type==='programme'?'programmes':'subjects'),{method:'POST',body:JSON.stringify(payload)});
   if(type==='programme')setProgrammeForm(emptyProgramme);else setSubjectForm(emptySubject);
   await refresh();setNotice(type==='programme'?'Programme created.':'Subject created.');
  }catch(err){setError(err.message);}
  finally{setSaving(false);}
 };
 const createNeco=async event=>{
  event.preventDefault();setSaving(true);setError('');setNotice('');
  try{
   await opsRequest('/academic/neco/subjects',{method:'POST',body:JSON.stringify({catalogueYear:2027,...necoForm})});
   setNecoForm(emptyNeco);await refreshNeco();setNotice('NECO subject added to the 2027 catalogue.');
  }catch(err){setError(err.message);}
  finally{setSaving(false);}
 };
 return <section className="academic-catalogue" aria-labelledby="academic-title">
  <div className="academic-heading"><div><span className="eyebrow">ACADEMIC OPERATIONS</span><h2 id="academic-title">Programmes &amp; Subjects</h2><p>Manage the shared academic catalogue for teaching resources and CBT.</p></div><button type="button" className="details-button" onClick={()=>{void refresh();void refreshNeco();}} disabled={loading||necoLoading}>Refresh catalogue</button></div>
  {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
  {canEdit&&<div className="academic-forms">
   <form onSubmit={e=>void create('programme',e)}>
    <h3>Add programme</h3>
    <label>Programme name<input required minLength={3} maxLength={160} value={programmeForm.name} onChange={e=>setProgrammeForm({...programmeForm,name:e.target.value})}/></label>
    <label>Description<textarea required minLength={5} maxLength={2000} value={programmeForm.description} onChange={e=>setProgrammeForm({...programmeForm,description:e.target.value})}/></label>
    <button disabled={saving}>Create programme</button>
   </form>
   <form onSubmit={e=>void create('subject',e)}>
    <h3>Add programme subject</h3>
    <label>Programme<select required value={subjectForm.programmeId} onChange={e=>setSubjectForm({...subjectForm,programmeId:e.target.value,code:''})}><option value="">Select programme</option>{programmes.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    {requiresSubjectCode&&<label>Subject / course code<input required maxLength={32} pattern="[A-Z0-9_-]{2,32}" placeholder="IJMB course code" value={subjectForm.code} onChange={e=>setSubjectForm({...subjectForm,code:e.target.value.toUpperCase()})}/></label>}
    <label>Subject name<input required minLength={2} maxLength={160} value={subjectForm.name} onChange={e=>setSubjectForm({...subjectForm,name:e.target.value})}/></label>
    <label>Description<textarea required minLength={5} maxLength={2000} value={subjectForm.description} onChange={e=>setSubjectForm({...subjectForm,description:e.target.value})}/></label>
    <button disabled={saving||!programmes.length||(requiresSubjectCode&&!subjectForm.code.trim())}>Create subject</button>
   </form>
  </div>}
  {loading?<p>Loading academic catalogue...</p>:programmes.length===0?<p className="notice">No programmes have been created yet.</p>:<div className="academic-programmes">{programmes.map(p=><article key={p.id}><div><h3>{p.name}</h3>{p.code&&<span className="academic-code">{p.code}</span>}</div><p>{subjects.filter(s=>s.programme_id===p.id).length} subjects</p><ul>{subjects.filter(s=>s.programme_id===p.id).map(s=><li key={s.id}>{s.name} {s.code&&<small>({s.code})</small>}</li>)}</ul></article>)}</div>}
  <section className="academic-neco-catalogue" aria-labelledby="neco-catalogue-title">
   <div className="academic-heading"><div><span className="eyebrow">EXAMINATION SUBJECTS</span><h2 id="neco-catalogue-title">NECO 2027 Subject Catalogue</h2><p>Classify each subject by field and selection role. Keep general, core, optional and outside-field subjects distinct.</p></div></div>
   {canEdit&&<form className="academic-neco-form" onSubmit={e=>void createNeco(e)}>
    <h3>Add NECO subject</h3>
    <label>Subject name<input required minLength={2} maxLength={160} value={necoForm.subjectName} onChange={e=>setNecoForm({...necoForm,subjectName:e.target.value})}/></label>
    <label>NECO subject code<input required maxLength={16} pattern="[A-Za-z0-9_-]{2,16}" value={necoForm.subjectCode} onChange={e=>setNecoForm({...necoForm,subjectCode:e.target.value.toUpperCase()})}/></label>
    <label>Field of study<select value={necoForm.fieldOfStudy} onChange={e=>setNecoForm({...necoForm,fieldOfStudy:e.target.value,selectionType:e.target.value==='general'?'cross_cutting_compulsory':necoForm.selectionType})}>{fields.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label>Subject category<select value={necoForm.subjectCategory} onChange={e=>setNecoForm({...necoForm,subjectCategory:e.target.value})}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label>Selection role<select value={necoForm.selectionType} onChange={e=>setNecoForm({...necoForm,selectionType:e.target.value})}>{selections.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
    <label>Source reference<input required maxLength={300} value={necoForm.sourceReference} onChange={e=>setNecoForm({...necoForm,sourceReference:e.target.value})}/></label>
    <label className="academic-checkbox"><input type="checkbox" checked={necoForm.sourceVerified} onChange={e=>setNecoForm({...necoForm,sourceVerified:e.target.checked})}/> Source independently verified</label>
    <button disabled={saving||!necoForm.subjectCode.trim()||!necoForm.subjectName.trim()}>Add to NECO 2027 catalogue</button>
   </form>}
   {necoLoading?<p>Loading NECO subjects...</p>:necoSubjects.length===0?<p className="notice">No NECO subjects have been entered yet. Add subjects only after checking their official source and classification.</p>:<div className="academic-programmes">{fields.map(([field,label])=>{const rows=necoSubjects.filter(s=>s.field_of_study===field);return rows.length?<article key={field}><div><h3>{label}</h3><span className="academic-code">{rows.length} subjects</span></div><ul>{rows.map(s=><li key={s.id}>{s.subject_name} <small>({s.subject_code}) · {selections.find(x=>x[0]===s.selection_type)?.[1]||s.selection_type} · {s.source_verified?'Verified source':'Unverified source'}</small></li>)}</ul></article>:null;})}</div>}
  </section>
 </section>;
}
