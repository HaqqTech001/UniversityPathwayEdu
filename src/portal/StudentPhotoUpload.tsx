import React,{useEffect,useRef,useState} from 'react';
import {Camera,ImagePlus,UserRound,Check,X,RotateCcw} from 'lucide-react';
import {getStudentToken} from '../context/AuthContext';
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
export default function StudentPhotoUpload({fullName,email}:{fullName?:string;email?:string}){
 const camera=useRef<HTMLInputElement>(null),gallery=useRef<HTMLInputElement>(null);
 const [file,setFile]=useState<File|null>(null),[photo,setPhoto]=useState<string|null>(null),[preview,setPreview]=useState<string|null>(null);
 const [chooser,setChooser]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const api=async(path:string,body?:object)=>{
  const token=getStudentToken();if(!token)throw Error('Please sign in again.');
  const res=await fetch(base+'/api/student/profile/photo'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
  const data=await res.json();if(!res.ok)throw Error(data.error||'Photo request failed.');return data;
 };
 useEffect(()=>{void api('').then(r=>setPhoto(r.url)).catch(e=>setError(e.message));},[]);
 useEffect(()=>{if(!file){setPreview(null);return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
 const select=(next?:File)=>{setError('');if(!next)return;if(!['image/png','image/jpeg'].includes(next.type)||next.size===0||next.size>5242880){setError('Select a JPG or PNG photo smaller than 5 MB.');return;}setFile(next);setChooser(false);};
 const save=async()=>{if(!file)return;setSaving(true);setError('');try{
  const signed=await api('/upload-url',{mimeType:file.type,sizeBytes:file.size});
  const uploaded=await fetch(signed.signedUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});if(!uploaded.ok)throw Error('Photo transfer failed. Please retry.');
  await api('/confirm',{path:signed.path,mimeType:file.type});const updated=await api('');
  setPhoto(updated.url);setFile(null);setNotice('Profile photograph updated.');
 }catch(e){setError(e instanceof Error?e.message:'Unable to save photo.');}finally{setSaving(false);}};
 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="passport-heading">
  <div className="mb-5"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#c62839]">My profile</p><h3 id="passport-heading" className="mt-1 text-lg font-bold text-[#111A43]">Personal identity</h3><p className="mt-1 text-sm text-slate-500">Your photograph and account details.</p></div>
  <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
   <button type="button" aria-label="Change passport photograph" onClick={()=>setChooser(v=>!v)} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();select(e.dataTransfer.files[0]);}} className="group relative flex h-40 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#c3cee2] bg-slate-50 outline-none transition duration-300 hover:border-[#c62839] focus-visible:ring-4 focus-visible:ring-red-200">
    {preview||photo?<img src={preview||photo||''} alt="Passport photograph" className="h-full w-full object-cover"/>:<UserRound size={46} className="text-slate-400"/>}
    <span className="absolute bottom-2 right-2 rounded-full bg-[#c62839] p-2 text-white shadow"><Camera size={15}/></span>
   </button>
   <div className="min-w-0 w-full space-y-3 sm:flex-1"><div><p className="break-words text-lg font-extrabold text-[#111A43]">{fullName || "Profile photograph"}</p>{email&&<p className="mt-1 break-all text-sm text-slate-600">{email}</p>}<p className="mt-2 text-xs leading-5 text-slate-500">Select your photograph to use the camera or gallery. JPG or PNG, up to 5 MB.</p></div>
    {chooser&&<div className="flex flex-wrap gap-3">
      <button type="button" onClick={()=>camera.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#111A43] hover:bg-slate-50"><Camera size={18}/>Take photo</button>
      <button type="button" onClick={()=>gallery.current?.click()} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-[#111A43] hover:bg-slate-50"><ImagePlus size={18}/>Choose from gallery</button>
    </div>}
    {file&&<div className="space-y-3"><p className="text-sm font-semibold text-[#111A43]">Preview your selected photo before saving.</p><div className="flex flex-wrap gap-2">
      <button type="button" disabled={saving} onClick={()=>void save()} className="inline-flex items-center gap-2 rounded-xl bg-[#c62839] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50"><Check size={16}/>{saving?'Saving...':'Use this photo'}</button>
      <button type="button" onClick={()=>{setFile(null);setChooser(true);}} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold"><RotateCcw size={16}/>Retake / change</button>
      <button type="button" aria-label="Cancel photo change" onClick={()=>{setFile(null);setChooser(false);}} className="rounded-xl p-2 text-slate-500"><X size={18}/></button>
    </div></div>}
    {!file&&!chooser&&<button type="button" onClick={()=>setChooser(true)} className="text-sm font-bold text-[#c62839] underline">Change passport photograph</button>}
   </div>
  </div>
  <input ref={camera} type="file" capture="user" accept="image/*" className="sr-only" onChange={e=>select(e.target.files?.[0])}/>
  <input ref={gallery} type="file" accept="image/png,image/jpeg" className="sr-only" onChange={e=>select(e.target.files?.[0])}/>
  {error&&<p className="mt-4 text-sm text-red-700" role="alert">{error}</p>}{notice&&<p className="mt-4 text-sm text-emerald-700" role="status">{notice}</p>}
 </section>;
}
