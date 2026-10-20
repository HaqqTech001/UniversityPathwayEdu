import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function AssessmentBuilder(){
 const [subjects,setSubjects]=useState([]),[questions,setQuestions]=useState([]),[assessments,setAssessments]=useState([]);
 const [subjectId,setSubjectId]=useState(''),[title,setTitle]=useState(''),[duration,setDuration]=useState(60),[selected,setSelected]=useState([]);
 const [saving,setSaving]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState('');
 const reload=async()=>{try{const [catalogue,bank,exams]=await Promise.all([opsRequest('/academic/catalogue'),opsRequest('/academic/questions'),opsRequest('/academic/assessments')]);setSubjects(catalogue.subjects||[]);setQuestions(bank.questions||[]);setAssessments(exams.assessments||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void reload();},[]);
 const eligible=questions.filter(q=>q.status==='published'&&q.subject_id===subjectId);
 const submit=async e=>{e.preventDefault();setSaving(true);setError('');setMessage('');try{
 await opsRequest('/academic/assessments',{method:'POST',body:JSON.stringify({subjectId,title,durationMinutes:Number(duration),questionIds:selected})});
 setTitle('');setSelected([]);await reload();setMessage('Assessment saved as a draft.');
 }catch(e){setError(e.message);}finally{setSaving(false);}};
 return <section className="academic-catalogue"><span className="eyebrow">INSTITUTIONAL CBT</span><h2>Assessment Builder</h2><p>Create draft tests using approved UPEC questions. Drafts are not visible to students.</p>
 {error&&<p className="form-error" role="alert">{error}</p>}{message&&<p className="academic-success" role="status">{message}</p>}
 <form onSubmit={submit} className="academic-question-form">
 <label>Assessment title<input required minLength={5} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)} placeholder="SS2 Physics — First Term Test"/></label>
 <label>Subject<select required value={subjectId} onChange={e=>{setSubjectId(e.target.value);setSelected([]);}}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
 <label>Duration (minutes)<input required type="number" min={5} max={240} value={duration} onChange={e=>setDuration(Number(e.target.value))}/></label>
 <fieldset className="assessment-questions"><legend>Choose approved questions ({selected.length} selected)</legend>{subjectId&&!eligible.length&&<p>No approved questions are available for this subject.</p>}{eligible.map(q=><label key={q.id} className="assessment-question-row"><input type="checkbox" checked={selected.includes(q.id)} onChange={e=>setSelected(a=>e.target.checked?[...a,q.id]:a.filter(id=>id!==q.id))}/><span>{q.prompt}</span></label>)}</fieldset>
 <button type="submit" disabled={saving||!selected.length}>{saving?'Saving...':'Create assessment draft'}</button></form>
 <h3>Recent assessments</h3>{!assessments.length?<p>No assessments created yet.</p>:<div className="academic-programmes">{assessments.map(a=><article key={a.id}><strong>{a.title}</strong><p>{a.duration_minutes} minutes · {a.status}</p></article>)}</div>}
 </section>;
}
