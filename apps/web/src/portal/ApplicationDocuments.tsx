import React,{useEffect,useState} from 'react';
import {getStudentToken} from '../context/AuthContext';
const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student';
type Doc={id:string;document_type:string;original_filename:string;review_status:string;review_note:string|null};
export default function ApplicationDocuments({applicationId}:{applicationId:string}){
 const [docs,setDocs]=useState<Doc[]>([]),[file,setFile]=useState<File|null>(null),[type,setType]=useState('academic_result'),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const api=async(path:string,body?:object)=>{const token=getStudentToken();if(!token)throw Error('Please sign in.');const r=await fetch(base+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});const data=await r.json();if(!r.ok)throw Error(data.error||'Request failed');return data;};
 const refresh=async()=>{try{const data=await api('/applications/'+applicationId+'/documents');setDocs(data.documents||[]);}catch(e){setError((e as Error).message);}};
 useEffect(()=>{void refresh();},[applicationId]);
 const upload=async()=>{if(!file)return;setBusy(true);setError('');setNotice('');try{if(!['application/pdf','image/jpeg','image/png'].includes(file.type)||file.size>5242880||!file.size)throw Error('Use PDF, JPG or PNG up to 5 MB.');
 const path='/applications/'+applicationId+'/documents';
 const signed=await api(path+'/upload-url',{mimeType:file.type,sizeBytes:file.size});
 const res=await fetch(signed.signedUrl,{method:'PUT',headers:{'Content-Type':file.type},body:file});
 if(!res.ok)throw Error('File transfer failed.');
 await api(path+'/confirm',{path:signed.path,mimeType:file.type,documentType:type,filename:file.name});
 setFile(null);setNotice('Document sent for admissions review.');await refresh();
 }catch(e){setError((e as Error).message);}finally{setBusy(false);}};
 return <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4"><h3 className="font-semibold text-[#111A43]">Supporting academic documents</h3><p className="text-xs text-slate-600">Upload clear results, certificates or other requested credentials. PDF, JPG or PNG; 5 MB maximum per file. Files remain private.</p><div className="mt-3 flex flex-wrap gap-2"><select aria-label="Document type" value={type} onChange={e=>setType(e.target.value)} className="rounded-lg border p-2"><option value="academic_result">Academic result</option><option value="certificate">Certificate</option><option value="identification">Identification</option><option value="other">Other supporting document</option></select><input aria-label="Select academic document" type="file" accept="application/pdf,image/jpeg,image/png" onChange={e=>setFile(e.target.files?.[0]||null)}/><button type="button" disabled={!file||busy} onClick={()=>void upload()} className="rounded-lg bg-[#111A43] px-3 py-2 font-semibold text-white disabled:opacity-50">{busy?'Uploading…':'Upload'}</button></div>{error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{notice&&<p role="status" className="text-sm text-green-800">{notice}</p>}<ul className="mt-3 space-y-1">{docs.map(d=><li key={d.id} className="text-sm">{d.original_filename} — <strong>{d.review_status}</strong>{d.review_note?' · '+d.review_note:''}</li>)}</ul></div>;
}
