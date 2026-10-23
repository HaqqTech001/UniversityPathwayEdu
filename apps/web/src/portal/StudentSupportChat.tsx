import {useEffect,useRef,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';

type Message={id:string;author_role:string;body:string;created_at:string};
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentSupportChat(){
 const [messages,setMessages]=useState<Message[]>([]);
 const [draft,setDraft]=useState('');
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const endRef=useRef<HTMLDivElement|null>(null);
 const mounted=useRef(true);
 const request=async(body?:string)=>{
  const token=getStudentToken();
  if(!token)throw Error('Sign in again to use support chat.');
  const response=await fetch(base+'/api/student/support/messages',{
   method:body===undefined?'GET':'POST',
   headers:{Authorization:'Bearer '+token,...(body===undefined?{}:{'Content-Type':'application/json'})},
   ...(body===undefined?{}:{body:JSON.stringify({body})})
  });
  const data=await response.json().catch(()=>({error:'Support service returned an invalid response.'}));
  if(!response.ok)throw Error(data.error||'Chat unavailable.');
  return data;
 };
 const refresh=async(silent=false)=>{
  if(!silent)setRefreshing(true);
  try{
   const data=await request();
   if(mounted.current){setMessages(data.messages||[]);setError('');}
  }catch(e){
   if(mounted.current)setError(e instanceof Error?e.message:'Unable to load messages.');
  }finally{
   if(mounted.current){setLoading(false);if(!silent)setRefreshing(false);}
  }
 };
 useEffect(()=>{
  mounted.current=true;
  void refresh();
  const timer=window.setInterval(()=>{
   if(document.visibilityState==='visible')void refresh(true);
  },10000);
  return ()=>{mounted.current=false;window.clearInterval(timer);};
 },[]);
 useEffect(()=>{endRef.current?.scrollIntoView({behavior:'smooth',block:'nearest'});},[messages.length]);
 const send=async(e:React.FormEvent)=>{
  e.preventDefault();
  const message=draft.trim();
  if(!message||sending)return;
  setSending(true);setError('');
  try{
   await request(message);
   if(mounted.current){setDraft('');await refresh(true);}
  }catch(e){
   if(mounted.current)setError(e instanceof Error?e.message:'Message not sent. Please retry.');
  }finally{if(mounted.current)setSending(false);}
 };
 return <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-7" aria-label="Student support conversation">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-xl font-bold text-[#111A43]">Message Student Support</h2><p className="mt-1 text-sm text-slate-500">Private conversation with the University Pathway support team. Replies update automatically.</p></div>
   <button type="button" disabled={refreshing} onClick={()=>void refresh()} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">{refreshing?'Checking…':'Refresh messages'}</button>
  </div>
  <div className="mt-5 max-h-[min(55vh,480px)] min-h-48 space-y-3 overflow-y-auto rounded-xl bg-[#f7f8fc] p-3 sm:p-4" role="log" aria-label="Support messages" aria-live="polite" aria-relevant="additions text">
   {loading?<p className="text-sm text-slate-500">Loading conversation…</p>:messages.length===0?<p className="text-sm text-slate-500">No messages yet. Send a question to begin.</p>:messages.map(m=><div key={m.id} className={'w-fit max-w-[92%] break-words rounded-xl p-3 text-sm sm:max-w-[80%] '+(m.author_role==='student'?'ml-auto bg-[#111A43] text-white':'mr-auto border border-slate-200 bg-white text-slate-800')}><p className="whitespace-pre-wrap">{m.body}</p><time className="mt-2 block text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</time></div>)}
   <div ref={endRef}/>
  </div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={send}>
   <label className="min-w-0 flex-1 text-xs font-bold text-[#111A43]">Your message
    <textarea maxLength={3000} rows={2} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} className="mt-1 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#111A43] focus:outline-none focus:ring-2 focus:ring-[#111A43]/20" placeholder="How can we help you?" aria-label="Your support message"/>
   </label>
   <button type="submit" disabled={sending||!draft.trim()} className="min-h-11 rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{sending?'Sending…':'Send message'}</button>
  </form>
  <p className="mt-2 text-xs text-slate-500">Enter to send · Shift + Enter for a new line</p>
 </section>;
}
