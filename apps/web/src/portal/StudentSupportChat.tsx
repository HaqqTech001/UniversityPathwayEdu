import {useEffect,useRef,useState} from 'react';
import EmojiPicker from 'emoji-picker-react';
import {getStudentToken} from '../context/AuthContext';

type Message={id:string;author_role:string;body:string;created_at:string;attachment_path?:string;attachment_name?:string;attachment_mime?:string;attachment_size?:number};
type Upload={path:string;name:string;mime:string;size:number};
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentSupportChat(){
 const [messages,setMessages]=useState<Message[]>([]);
 const [draft,setDraft]=useState('');
 const [file,setFile]=useState<File|null>(null);
 const [dragging,setDragging]=useState(false);
 const fileRef=useRef<HTMLInputElement|null>(null);
 const [emojiOpen,setEmojiOpen]=useState(false);
 const inputRef=useRef<HTMLTextAreaElement|null>(null);
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const endRef=useRef<HTMLDivElement|null>(null);
 const mounted=useRef(true);
 const request=async(payload?:{body:string;attachmentPath?:string;attachmentName?:string;attachmentMime?:string;attachmentSize?:number})=>{
  const token=getStudentToken();
  if(!token)throw Error('Sign in again to use support chat.');
  const response=await fetch(base+'/api/student/support/messages',{
   method:payload===undefined?'GET':'POST',
   headers:{Authorization:'Bearer '+token,...(payload===undefined?{}:{'Content-Type':'application/json'})},
   ...(payload===undefined?{}:{body:JSON.stringify(payload)})
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
 const selectFile=(selected?:File)=>{
  if(!selected)return;
  if(!['image/jpeg','image/png','image/webp','application/pdf','video/mp4'].includes(selected.type)||selected.size>20971520||selected.size<1||selected.name.length>180){setError('Select a JPG, PNG, WebP, PDF or MP4 file up to 20 MB.');return;}
  setFile(selected);setError('');
 };
 const upload=async(selected:File):Promise<Upload>=>{
  const token=getStudentToken();if(!token)throw Error('Sign in again.');
  const signed=await fetch(base+'/api/student/support/attachments/upload-url',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({name:selected.name,mimeType:selected.type,sizeBytes:selected.size})});
  const info=await signed.json();if(!signed.ok)throw Error(info.error||'Unable to prepare attachment.');
  const sent=await fetch(info.uploadUrl,{method:'PUT',headers:{'Content-Type':selected.type},body:selected});
  if(!sent.ok)throw Error('Attachment upload failed.');
  return {path:info.path,name:selected.name,mime:selected.type,size:selected.size};
 };
 const openAttachment=async(id:string)=>{
  try{const token=getStudentToken();const response=await fetch(base+'/api/student/support/attachments/'+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token}});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to open attachment.');window.open(result.url,'_blank','noopener,noreferrer');}
  catch(e){setError(e instanceof Error?e.message:'Unable to open attachment.');}
 };
 const send=async(e:React.FormEvent)=>{
  e.preventDefault();
  const message=draft.trim();
  if((!message&&!file)||sending)return;
  setSending(true);setError('');
  try{
   const attachment=file?await upload(file):null;
   await request({body:message,...(attachment?{attachmentPath:attachment.path,attachmentName:attachment.name,attachmentMime:attachment.mime,attachmentSize:attachment.size}:{})});
   if(mounted.current){setDraft('');setFile(null);if(fileRef.current)fileRef.current.value='';await refresh(true);}
  }catch(e){
   if(mounted.current)setError(e instanceof Error?e.message:'Message not sent. Please retry.');
  }finally{if(mounted.current)setSending(false);}
 };
 return <section className="flex h-[min(75dvh,720px)] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-7" aria-label="Student support conversation">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-xl font-bold text-[#111A43]">Message Student Support</h2><p className="mt-1 text-sm text-slate-500">Private conversation with the University Pathway support team. Replies update automatically.</p></div>
   <button type="button" disabled={refreshing} onClick={()=>void refresh()} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">{refreshing?'Checking…':'Refresh messages'}</button>
  </div>
  <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain rounded-xl bg-[#f7f8fc] p-3 sm:p-4" role="log" aria-label="Support messages" aria-live="polite" aria-relevant="additions text">
   {loading?<p className="text-sm text-slate-500">Loading conversation…</p>:messages.length===0?<p className="text-sm text-slate-500">No messages yet. Send a question to begin.</p>:messages.map(m=><div key={m.id} className={'w-fit max-w-[92%] break-words rounded-xl p-3 text-sm sm:max-w-[80%] '+(m.author_role==='student'?'ml-auto bg-[#111A43] text-white':'mr-auto border border-slate-200 bg-white text-slate-800')}>{m.body&&<p className="whitespace-pre-wrap break-words leading-6">{m.body}</p>}{m.attachment_path&&<button type="button" onClick={()=>void openAttachment(m.id)} className="mt-2 flex w-full items-center gap-3 rounded-lg border border-current/20 bg-white/10 p-3 text-left hover:ring-2 hover:ring-current/30"><span aria-hidden="true" className="text-2xl">{m.attachment_mime?.startsWith('image/')?'🖼️':m.attachment_mime?.startsWith('video/')?'▶️':'📄'}</span><span className="min-w-0"><span className="block truncate font-semibold">{m.attachment_name||'Attachment'}</span><span className="block text-xs opacity-75">{m.attachment_mime?.split('/')[1]?.toUpperCase()} · {((m.attachment_size||0)/1024/1024).toFixed(1)} MB · Open</span></span></button>}<time className="mt-2 block text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</time></div>)}
   <div ref={endRef}/>
  </div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {file&&<div className="mt-2 flex shrink-0 items-center justify-between gap-2 rounded-lg bg-[#f7f8fc] p-2 text-xs"><span className="truncate">📎 {file.name} ({(file.size/1048576).toFixed(1)} MB)</span><button type="button" onClick={()=>setFile(null)} aria-label="Remove attachment" className="font-bold text-[#c62839]">Remove</button></div>}
  <form onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);selectFile(e.dataTransfer.files[0]);}} className={'mt-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end '+(dragging?'rounded-xl ring-2 ring-[#c62839]':'')} onSubmit={send}>
   <label className="min-w-0 flex-1 text-xs font-bold text-[#111A43]">Your message
    <textarea ref={inputRef} maxLength={3000} rows={2} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} className="mt-1 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#111A43] focus:outline-none focus:ring-2 focus:ring-[#111A43]/20" placeholder="How can we help you?" aria-label="Your support message"/>
   </label>
   <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" className="hidden" onChange={e=>selectFile(e.target.files?.[0])}/><button type="button" onClick={()=>fileRef.current?.click()} className="min-h-11 self-end rounded-xl border border-slate-300 px-3 text-sm font-bold" aria-label="Attach file">📎 Attach</button>
   <div className="relative shrink-0 self-end"><button type="button" aria-label="Choose emoji" aria-expanded={emojiOpen} onClick={()=>setEmojiOpen(v=>!v)} className="min-h-11 rounded-xl border border-slate-300 px-3 text-xl" title="Choose emoji">😀</button>{emojiOpen&&<div className="absolute bottom-full right-0 z-30 mb-2 max-w-[calc(100vw-3rem)] shadow-xl"><EmojiPicker width={320} height={360} lazyLoadEmojis onEmojiClick={emoji=>{const el=inputRef.current;const start=el?.selectionStart??draft.length;const end=el?.selectionEnd??start;const next=draft.slice(0,start)+emoji.emoji+draft.slice(end);if(next.length<=3000){setDraft(next);requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(start+emoji.emoji.length,start+emoji.emoji.length);});}}}/></div>}</div>
   <button type="submit" disabled={sending||(!draft.trim()&&!file)} className="min-h-11 rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{sending?'Sending…':'Send message'}</button>
  </form>
  <p className="mt-2 text-xs text-slate-500">Enter to send · Shift + Enter for a new line</p>
 </section>;
}
