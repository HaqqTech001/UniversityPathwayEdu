import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function LearningResources({role}){
 const [subjects,setSubjects]=useState([]),[resources,setResources]=useState([]),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [form,setForm]=useState({subjectId:'',title:'',description:'',resourceUrl:'',resourceType:'document'});
 const canReview=['admin','super_admin','cbt_manager'].includes(role);
 const refresh=async()=>{try{const [a,b]=await Promise.all([opsRequest('/academic/catalogue'),opsRequest('/academic/resources')]);setSubjects(a.subjects||[]);setResources(b.resources||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void refresh();},[]);
 const create=async e=>{e.preventDefault();setError('');try{await opsRequest('/academic/resources',{method:'POST',body:JSON.stringify(form)});setForm({...form,title:'',description:'',resourceUrl:''});await refresh();setNotice('Learning resource saved for review.');}catch(err){setError(err.message);}};
 const publish=async(r,status)=>{setError('');try{await opsRequest('/academic/resources/'+r.id+'/status',{method:'PATCH',body:JSON.stringify({status})});await refresh();}catch(e){setError(e.message);}};
 return <section className="academic-catalogue"><span className="eyebrow">TEACHING RESOURCES</span><h2>Learning Materials</h2><p>Add secure HTTPS links to notes, videos, exercises and reading materials. Drafts are hidden from students.</p>
 {error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
 <form className="academic-question-form" onSubmit={create}><label>Subject<select required value={form.subjectId} onChange={e=>setForm({...form,subjectId:e.target.value})}><option value="">Choose subject</option>{subjects.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Title<input required minLength={5} maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Type<select value={form.resourceType} onChange={e=>setForm({...form,resourceType:e.target.value})}>{['document','video','website','exercise'].map(x=><option key={x}>{x}</option>)}</select></label><label>HTTPS resource link<input type="url" required placeholder="https://" value={form.resourceUrl} onChange={e=>setForm({...form,resourceUrl:e.target.value})}/></label><label>Description<textarea rows={3} maxLength={3000} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label><button type="submit">Save resource draft</button></form>
 <div className="academic-programmes">{resources.map(r=><article key={r.id}><span className="academic-code">{r.status} · {r.resource_type}</span><h3>{r.title}</h3><p>{r.description}</p><a href={r.resource_url} target="_blank" rel="noopener noreferrer">Open resource</a>{canReview&&<p><button className="details-button" type="button" onClick={()=>void publish(r,r.status==='published'?'draft':'published')}>{r.status==='published'?'Unpublish':'Approve & publish'}</button></p>}</article>)}</div>
 </section>;
}
