import {useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
type Message={id:string;author_role:string;body:string;created_at:string};
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentSupportChat(){
 const [messages,setMessages]=useState<Message[]>([]),[draft,setDraft]=useState(''),[error,setError]=useState(''),[sending,setSending]=useState(false);
 const request=async(body?:string)=>{const token=getStudentToken();if(!token)throw Error('Sign in again to use support chat.');const response=await fetch(base+'/api/student/support/messages',{method:body===undefined?'GET':'POST',headers:{Authorization:'Bearer '+token,...(body===undefined?{}:{'Content-Type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify({body})})});const data=await response.json();if(!response.ok)throw Error(data.error||'Chat unavailable.');return data;};
 const refresh=async()=>{try{const data=await request();setMessages(data.messages||[]);}catch(e){setError(e instanceof Error?e.message:'Unable to load messages.');}};
 useEffect(()=>{void refresh();},[]);
 const send=async(e:React.FormEvent)=>{e.preventDefault();if(!draft.trim()||sending)return;setSending(true);setError('');try{await request(draft.trim());setDraft('');await refresh();}catch(e){setError(e instanceof Error?e.message:'Message not sent.');}finally{setSending(false);}};
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7" aria-label="Student support conversation">
  <h2 className="text-xl font-bold text-[#111A43]">Message Student Support</h2><p className="mt-1 text-sm text-slate-500">Private messages between you and the educational consult team.</p>
  <div className="mt-5 max-h-[420px] min-h-36 space-y-3 overflow-y-auto rounded-xl bg-[#f7f8fc] p-4" aria-live="polite">{messages.length===0?<p className="text-sm text-slate-500">No messages yet. Send a question to begin.</p>:messages.map(m=><div key={m.id} className={'max-w-[85%] rounded-xl p-3 text-sm '+(m.author_role==='student'?'ml-auto bg-[#111A43] text-white':'mr-auto border border-slate-200 bg-white text-slate-800')}><p className="whitespace-pre-wrap">{m.body}</p><time className="mt-2 block text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</time></div>)}</div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  <form className="mt-4 flex items-end gap-2" onSubmit={send}><label className="flex-1 text-xs font-bold text-[#111A43]">Your message<textarea maxLength={3000} rows={2} value={draft} onChange={e=>setDraft(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm" placeholder="How can we help you?"/></label><button type="submit" disabled={sending||!draft.trim()} className="rounded-xl bg-[#c62839] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{sending?'Sending…':'Send'}</button></form><button type="button" onClick={()=>void refresh()} className="mt-2 text-xs font-semibold text-[#111A43] underline">Refresh replies</button>
 </section>;
}
