import React,{useEffect,useState} from 'react';
import {opsRequest} from './api';
export default function NoticeBoard({role}){
 const canPublish=['admin','super_admin'].includes(role);
 const [notices,setNotices]=useState([]),[form,setForm]=useState({title:'',body:'',audience:'students'});
 const [error,setError]=useState(''),[notice,setNotice]=useState('');
 const load=async()=>{try{const r=await opsRequest('/academic/notices');setNotices(r.notices||[]);}catch(e){setError(e.message);}};
 useEffect(()=>{void load();},[]);
 const save=async e=>{e.preventDefault();setError('');try{await opsRequest('/academic/notices',{method:'POST',body:JSON.stringify(form)});setForm({title:'',body:'',audience:'students'});await load();setNotice('Notice saved as draft.');}catch(e){setError(e.message);}};
 const change=async(item)=>{setError('');try{await opsRequest('/academic/notices/'+encodeURIComponent(item.id)+'/status',{method:'PATCH',body:JSON.stringify({status:item.status==='published'?'draft':'published'})});await load();setNotice('Publication updated.');}catch(e){setError(e.message);}};
 return <section className="academic-catalogue"><span className="eyebrow">COMMUNICATIONS</span><h2>Notice Board</h2><p>Compose and review announcements before they appear in the student portal.</p>{error&&<p role="alert" className="form-error">{error}</p>}{notice&&<p role="status" className="academic-success">{notice}</p>}
 <form className="academic-question-form" onSubmit={save}><label>Title<input required minLength={5} maxLength={180} value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></label><label>Notice<textarea rows={5} required minLength={10} maxLength={6000} value={form.body} onChange={e=>setForm({...form,body:e.target.value})}/></label><button type="submit">Save draft</button></form><div className="academic-programmes">{notices.map(n=><article key={n.id}><span className="academic-code">{n.status}</span><h3>{n.title}</h3><p style={{whiteSpace:'pre-wrap'}}>{n.body}</p>{canPublish&&<button type="button" className="details-button" onClick={()=>void change(n)}>{n.status==='published'?'Unpublish':'Approve & publish'}</button>}</article>)}</div></section>;
}
