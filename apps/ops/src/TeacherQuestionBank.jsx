import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function TeacherQuestionBank(){
 const [subjects,setSubjects]=useState([]),[questions,setQuestions]=useState([]),[error,setError]=useState(''),[notice,setNotice]=useState(''),[saving,setSaving]=useState(false);
 const [form,setForm]=useState({subjectId:'',prompt:'',A:'',B:'',C:'',D:'',correctOption:'A',explanation:''});
 const refresh=async()=>{try{const [catalogue,bank]=await Promise.all([opsRequest('/academic/catalogue'),opsRequest('/academic/questions')]);setSubjects(catalogue.subjects||[]);setQuestions(bank.questions||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void refresh();},[]);
 const submit=async e=>{e.preventDefault();setSaving(true);setError('');setNotice('');try{
 await opsRequest('/academic/questions',{method:'POST',body:JSON.stringify({subjectId:form.subjectId,prompt:form.prompt,options:{A:form.A,B:form.B,C:form.C,D:form.D},correctOption:form.correctOption,explanation:form.explanation,status:'draft'})});
 setForm(f=>({...f,prompt:'',A:'',B:'',C:'',D:'',explanation:''}));await refresh();setNotice('Question saved as a draft.');
 }catch(err){setError(err.message);}finally{setSaving(false);}};
 return <section className="academic-catalogue" aria-labelledby="questions-heading"><span className="eyebrow">TEACHING &amp; ASSESSMENTS</span><h2 id="questions-heading">Institutional Question Bank</h2><p>Author UPEC questions separately from licensed historical JAMB questions. New questions are drafts and are not automatically added to student examinations.</p>
 {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
 <form className="academic-question-form" onSubmit={submit}>
 <label>Subject<select required value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Select subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}</select></label>
 <label>Question<textarea required minLength={10} maxLength={5000} rows={3} value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})}/></label>
 <div className="academic-option-grid">{['A','B','C','D'].map(k=><label key={k}>Option {k}<input required maxLength={1000} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}</div>
 <label>Correct option<select value={form.correctOption} onChange={e=>setForm({...form,correctOption:e.target.value})}>{['A','B','C','D'].map(k=><option key={k}>{k}</option>)}</select></label>
 <label>Explanation<textarea rows={3} maxLength={5000} value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})}/></label><button disabled={saving||!subjects.length} type="submit">{saving?'Saving...':'Save question draft'}</button>
 </form>
 <h3>Recent questions</h3>{questions.length===0?<p>No questions created yet.</p>:<div className="academic-programmes">{questions.map(q=><article key={q.id}><span className="academic-code">{q.status}</span><p><strong>{q.prompt}</strong></p><small>Answer: {q.correct_option}</small></article>)}</div>}
 </section>;
}
