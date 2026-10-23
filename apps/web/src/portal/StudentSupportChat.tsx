import {useEffect,useRef,useState} from 'react';
import EmojiPicker from 'emoji-picker-react';
import {getStudentToken} from '../context/AuthContext';

type ChatFile={id:string;file_name:string;mime_type:string;size_bytes:number};
type Message={attachments?:ChatFile[];id:string;author_role:string;body:string;created_at:string;attachment_path?:string;attachment_name?:string;attachment_mime?:string;attachment_size?:number};
type Upload={path:string;name:string;mime:string;size:number};
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentSupportChat(){
 const [messages,setMessages]=useState<Message[]>([]);
 const [previews,setPreviews]=useState<Record<string,string>>({});
 const [previewGeneration,setPreviewGeneration]=useState(0);
 const [groupPreviews,setGroupPreviews]=useState<Record<string,string>>({});
 const previewRequests=useRef(new Set<string>());
 const [draft,setDraft]=useState('');
 const [files,setFiles]=useState<File[]>([]);
 const [localPreviews,setLocalPreviews]=useState<Record<string,string>>({});
 const [uploadedFiles,setUploadedFiles]=useState<Map<File,Upload>>(new Map());
 const [dragging,setDragging]=useState(false);
 const fileRef=useRef<HTMLInputElement|null>(null);
 const [emojiOpen,setEmojiOpen]=useState(false);
 const emojiRef=useRef<HTMLDivElement|null>(null);
 const inputRef=useRef<HTMLTextAreaElement|null>(null);
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [uploadedCount,setUploadedCount]=useState(0);
 const [failedFile,setFailedFile]=useState('');
 const [uploadProgress,setUploadProgress]=useState<'idle'|'uploading'|'sending'>('idle');
 const [loading,setLoading]=useState(true);
 const [refreshing,setRefreshing]=useState(false);
 const historyRef=useRef<HTMLDivElement|null>(null);
 const mounted=useRef(true);
 useEffect(()=>{if(!emojiOpen)return;const close=(event:PointerEvent)=>{if(emojiRef.current&&!emojiRef.current.contains(event.target as Node))setEmojiOpen(false);};const escape=(event:KeyboardEvent)=>{if(event.key==='Escape')setEmojiOpen(false);};document.addEventListener('pointerdown',close);document.addEventListener('keydown',escape);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',escape);};},[emojiOpen]);
 const shouldStickToBottom=useRef(true);
 const request=async(payload?:{body:string;attachmentPath?:string;attachmentName?:string;attachmentMime?:string;attachmentSize?:number;attachments?:{path:string;name:string;mime:string;size:number}[]})=>{
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
 useEffect(()=>{const el=historyRef.current;if(el&&shouldStickToBottom.current)el.scrollTop=el.scrollHeight;},[messages.length]);
 useEffect(()=>{
  const previews:Record<string,string>={};
  for(const item of files)if(item.type.startsWith('image/')||item.type.startsWith('video/'))previews[item.name+'|'+item.size+'|'+item.lastModified]=URL.createObjectURL(item);
  setLocalPreviews(previews);
  return()=>Object.values(previews).forEach(url=>URL.revokeObjectURL(url));
 },[files]);
 const selectFiles=(selected:File[])=>{
  if(sending)return;
  setError('');const next=[...files];for(const f of selected){if(next.length>=10){setError('Maximum 10 files per message.');break;}if(!['image/jpeg','image/png','image/webp','application/pdf','video/mp4'].includes(f.type)||f.size<1||f.size>20971520||f.name.length>180){setError('Files must be JPG, PNG, WebP, PDF or MP4, up to 20 MB each.');continue;}if(!next.some(x=>x.name===f.name&&x.size===f.size&&x.lastModified===f.lastModified))next.push(f);}setFiles(next);
 };
 const upload=async(selected:File):Promise<Upload>=>{
  const token=getStudentToken();if(!token)throw Error('Sign in again.');
  const signed=await fetch(base+'/api/student/support/attachments/upload-url',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({name:selected.name,mimeType:selected.type,sizeBytes:selected.size})});
  const info=await signed.json().catch(()=>({}));if(!signed.ok)throw Error(info.error||'Unable to prepare attachment.');
  if(typeof info.uploadUrl!=='string'||!info.uploadUrl.startsWith('https://')||typeof info.path!=='string'||!info.path)throw Error('The server did not provide a valid secure attachment upload destination.');
  const sent=await fetch(info.uploadUrl,{method:'PUT',headers:{'Content-Type':selected.type,'x-upsert':'false'},body:selected});
  if(!sent.ok)throw Error('Attachment upload failed.');
  return {path:info.path,name:selected.name,mime:selected.type,size:selected.size};
 };
 const openAttachment=async(id:string,grouped=false)=>{
  try{const token=getStudentToken();if(!token)throw Error('Sign in again to open attachments.');const response=await fetch(base+'/api/student/support/'+(grouped?'files/':'attachments/')+encodeURIComponent(id),{headers:{Authorization:'Bearer '+token}});const result=await response.json();if(!response.ok)throw Error(result.error||'Unable to open attachment.');if(typeof result.url!=='string'||!result.url.startsWith('https://'))throw Error('A secure attachment link was not returned.');window.open(result.url,'_blank','noopener,noreferrer');}
  catch(e){setError(e instanceof Error?e.message:'Unable to open attachment.');}
 };
 useEffect(()=>{
  let active=true;
  const media=messages.filter(m=>m.attachment_path&&(m.attachment_mime?.startsWith('image/')||m.attachment_mime?.startsWith('video/'))&&!previews[m.id]&&!previewRequests.current.has(m.id));
  media.forEach(m=>previewRequests.current.add(m.id));
  Promise.all(media.map(async m=>{try{const token=getStudentToken();const r=await fetch(base+'/api/student/support/attachments/'+encodeURIComponent(m.id),{headers:{Authorization:'Bearer '+token}});if(!r.ok)return null;const data=await r.json();return {id:m.id,url:data.url as string};}catch{return null;}})).then(results=>{if(active)setPreviews(p=>({...p,...Object.fromEntries(results.filter((x):x is {id:string;url:string}=>x!==null).map(x=>[x.id,x.url]))}));});
  return()=>{active=false;};
 },[messages,previewGeneration]);
 useEffect(()=>{const timer=window.setInterval(()=>{previewRequests.current.clear();setPreviews({});setGroupPreviews({});setPreviewGeneration(n=>n+1);},45000);return()=>window.clearInterval(timer);},[]);
 useEffect(()=>{
  let active=true;
  const media=messages.flatMap(m=>(m.attachments||[]).filter(a=>a.mime_type.startsWith('image/')||a.mime_type.startsWith('video/'))).filter(a=>!groupPreviews[a.id]&&!previewRequests.current.has(a.id));
  media.forEach(a=>previewRequests.current.add(a.id));
  Promise.all(media.map(async a=>{try{const token=getStudentToken();const r=await fetch(base+'/api/student/support/files/'+encodeURIComponent(a.id),{headers:{Authorization:'Bearer '+token}});if(!r.ok)return null;const data=await r.json();return {id:a.id,url:data.url as string};}catch{return null;}})).then(results=>{if(active)setGroupPreviews(p=>({...p,...Object.fromEntries(results.filter((x):x is {id:string;url:string}=>x!==null).map(x=>[x.id,x.url]))}));});
  return()=>{active=false;};
 },[messages,previewGeneration]);
 const send=async(e:React.FormEvent)=>{
  e.preventDefault();
  const message=draft.trim();
  if((!message&&!files.length)||sending)return;
  setSending(true);setError('');setFailedFile('');
  let failedUploadName='';
  let messageSubmitted=false;
  try{
   if(files.length){setUploadProgress('uploading');setUploadedCount(0);}
   const attachments:Upload[]=[];
   for(const item of files){let uploaded=uploadedFiles.get(item);if(!uploaded){failedUploadName=item.name;setFailedFile(item.name);uploaded=await upload(item);setUploadedFiles(previous=>new Map(previous).set(item,uploaded!));uploadedFiles.set(item,uploaded);}attachments.push(uploaded);setUploadedCount(attachments.length);failedUploadName='';setFailedFile('');}
   setUploadProgress('sending');
   await request({body:message,attachments:attachments.map(a=>({path:a.path,name:a.name,mime:a.mime,size:a.size}))});
   messageSubmitted=true;
   if(mounted.current){setDraft('');setFiles([]);setUploadedFiles(new Map());if(fileRef.current)fileRef.current.value='';}
   await refresh(true);
  }catch(e){
   if(mounted.current)setError(messageSubmitted?'Your message was sent, but the conversation could not be refreshed. Use Refresh messages to see it.':(failedUploadName?'File upload failed ('+failedUploadName+'). ':'')+(e instanceof Error?e.message:'Message not sent. Please retry.')+' You can retry without re-uploading completed files.');
  }finally{if(mounted.current){setSending(false);setUploadProgress('idle');setUploadedCount(0);}}
 };
 return <section className="flex h-[min(75dvh,720px)] min-h-[360px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 sm:p-7" aria-label="Student support conversation">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 className="text-xl font-bold text-[#111A43]">Message Student Support</h2><p className="mt-1 text-sm text-slate-500">Private conversation with the University Pathway support team. Replies update automatically.</p></div>
   <button type="button" disabled={refreshing} onClick={()=>void refresh()} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-[#111A43] disabled:opacity-50">{refreshing?'Checking…':'Refresh messages'}</button>
  </div>
  <div ref={historyRef} onScroll={e=>{const el=e.currentTarget;shouldStickToBottom.current=el.scrollHeight-el.scrollTop-el.clientHeight<100;}} className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain rounded-xl bg-[#f7f8fc] p-3 sm:p-4" role="log" aria-label="Support messages" aria-live="polite" aria-relevant="additions text">
   {loading?<p className="text-sm text-slate-500">Loading conversation…</p>:messages.length===0?<p className="text-sm text-slate-500">No messages yet. Send a question to begin.</p>:messages.map(m=><div key={m.id} className={'w-fit max-w-[92%] break-words rounded-xl p-3 text-sm sm:max-w-[80%] '+(m.author_role==='student'?'ml-auto bg-[#111A43] text-white':'mr-auto border border-slate-200 bg-white text-slate-800')}>{m.body&&<p className="whitespace-pre-wrap break-words leading-6">{m.body.split(/(https?:\/\/\S+)/g).map((part,i)=>part.startsWith("https://")||part.startsWith("http://")?<a key={i} href={part} target="_blank" rel="noopener noreferrer" className="break-all underline">{part}</a>:part)}</p>}{m.attachments&&m.attachments.length>0&&<div className="mt-2 grid grid-cols-2 gap-2" aria-label="Shared files">{m.attachments.map(a=><button key={a.id} type="button" onClick={()=>void openAttachment(a.id,true)} className="flex min-w-0 flex-col items-center gap-2 rounded-xl border border-current/20 bg-white/10 p-3 text-center">{a.mime_type.startsWith('image/')&&groupPreviews[a.id]?<img src={groupPreviews[a.id]} alt={a.file_name} loading="lazy" className="h-28 w-full rounded-lg object-cover"/>:a.mime_type.startsWith('video/')&&groupPreviews[a.id]?<span className="relative block w-full"><video src={groupPreviews[a.id]} preload="metadata" muted playsInline className="h-28 w-full rounded-lg object-cover"/><span className="absolute inset-0 flex items-center justify-center text-3xl text-white drop-shadow">▶</span></span>:<span className="text-2xl">{a.mime_type.startsWith('image/')?'🖼️':a.mime_type.startsWith('video/')?'▶️':'📄'}</span>}<span className="w-full truncate text-xs font-semibold" title={a.file_name}>{a.file_name}</span><span className="text-[10px] opacity-75">{(a.size_bytes/1048576).toFixed(1)} MB</span></button>)}</div>}{m.attachment_path&&previews[m.id]&&m.attachment_mime?.startsWith('image/')&&<button type="button" onClick={()=>void openAttachment(m.id)} className="mt-2 block w-full" aria-label="Open image"><img src={previews[m.id]} alt={m.attachment_name||'Shared image'} loading="lazy" className="max-h-72 w-full rounded-lg object-contain"/></button>}{m.attachment_path&&previews[m.id]&&m.attachment_mime?.startsWith('video/')&&<video src={previews[m.id]} controls preload="metadata" playsInline className="mt-2 max-h-72 w-full rounded-lg" aria-label={m.attachment_name||'Shared video'}/>}{m.attachment_path&&<button type="button" onClick={()=>void openAttachment(m.id)} className="mt-2 flex w-full items-center gap-3 rounded-lg border border-current/20 bg-white/10 p-3 text-left hover:ring-2 hover:ring-current/30"><span aria-hidden="true" className="text-2xl">{m.attachment_mime?.startsWith('image/')?'🖼️':m.attachment_mime?.startsWith('video/')?'▶️':'📄'}</span><span className="min-w-0"><span className="block truncate font-semibold">{m.attachment_name||'Attachment'}</span><span className="block text-xs opacity-75">{m.attachment_mime?.split('/')[1]?.toUpperCase()} · {((m.attachment_size||0)/1024/1024).toFixed(1)} MB · Open</span></span></button>}<time className="mt-2 block text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</time></div>)}
  </div>
  {error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
  {files.length>0&&<div className="mt-2 shrink-0 rounded-xl border border-slate-200 bg-[#f7f8fc] p-2"><p className="mb-2 text-xs font-bold text-[#111A43]">{files.length}/10 files selected</p><div className="grid max-h-32 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3">{files.map((item,i)=><div key={i} className="flex min-w-0 items-center gap-2 rounded-lg bg-white p-2 text-xs">{localPreviews[item.name+'|'+item.size+'|'+item.lastModified]?<span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">{item.type.startsWith('image/')?<img src={localPreviews[item.name+'|'+item.size+'|'+item.lastModified]} alt="" className="h-full w-full object-cover"/>:<><video src={localPreviews[item.name+'|'+item.size+'|'+item.lastModified]} muted preload="metadata" className="h-full w-full object-cover"/><span className="absolute inset-0 flex items-center justify-center text-white">▶</span></>}</span>:<span aria-hidden="true">📄</span>}<span className="min-w-0 flex-1 truncate" title={item.name}>{item.name}</span><button type="button" aria-label={'Remove '+item.name} className="font-bold text-[#c62839]" disabled={sending} onClick={()=>{setFiles(v=>v.filter(f=>f!==item));setUploadedFiles(v=>{const n=new Map(v);n.delete(item);return n;});}}>×</button></div>)}</div></div>}
  <form onDragOver={e=>{e.preventDefault();setDragging(true);}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);selectFiles(Array.from(e.dataTransfer.files));}} className={'mt-4 shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end '+(dragging?'rounded-xl ring-2 ring-[#c62839]':'')} onSubmit={send}>
   <label className="min-w-0 flex-1 text-xs font-bold text-[#111A43]">Your message
    <textarea ref={inputRef} maxLength={3000} rows={2} value={draft} onChange={e=>setDraft(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.nativeEvent.isComposing){e.preventDefault();e.currentTarget.form?.requestSubmit();}}} className="mt-1 w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 focus:border-[#111A43] focus:outline-none focus:ring-2 focus:ring-[#111A43]/20" placeholder="How can we help you?" aria-label="Your support message"/>
   </label>
   <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4" className="hidden" multiple onChange={e=>{selectFiles(Array.from(e.target.files||[]));e.target.value='';}}/><button type="button" disabled={sending||files.length>=10} onClick={()=>fileRef.current?.click()} className="min-h-11 self-end rounded-xl border border-slate-300 px-3 text-sm font-bold" aria-label="Attach file">📎 Attach</button>
   <div ref={emojiRef} className="relative shrink-0 self-end"><button type="button" aria-label="Choose emoji" aria-expanded={emojiOpen} onClick={()=>setEmojiOpen(v=>!v)} className="min-h-11 rounded-xl border border-slate-300 px-3 text-xl" title="Choose emoji">😀</button>{emojiOpen&&<div className="absolute bottom-full right-0 z-30 mb-2 max-w-[calc(100vw-3rem)] overflow-hidden rounded-xl shadow-xl"><EmojiPicker width="min(320px, calc(100vw - 3rem))" height={360} lazyLoadEmojis onEmojiClick={emoji=>{const el=inputRef.current;const start=el?.selectionStart??draft.length;const end=el?.selectionEnd??start;const next=draft.slice(0,start)+emoji.emoji+draft.slice(end);if(next.length<=3000){setDraft(next);requestAnimationFrame(()=>{el?.focus();el?.setSelectionRange(start+emoji.emoji.length,start+emoji.emoji.length);});}}}/></div>}</div>
   <button type="submit" disabled={sending||(!draft.trim()&&!files.length)} className="min-h-11 rounded-xl bg-[#c62839] px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{uploadProgress==='uploading'?'Uploading '+uploadedCount+'/'+files.length+'…':sending?'Sending…':'Send message'}</button>
  </form>
  <p className="mt-2 text-xs text-slate-500">Enter to send · Shift + Enter for a new line</p>
 </section>;
}
