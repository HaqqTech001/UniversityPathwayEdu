import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  Download,
  Trash2,
  ShieldCheck,
  Eye,
  RefreshCw,
  X,
  Image as ImageIcon,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import { getStudentToken } from '../../context/AuthContext';

interface DocumentsTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

interface DocumentItem {
  id: string;
  name: string;
  category: 'Academic' | 'Identification' | 'Institutional';
  type: string;
  required: boolean;
  status: 'verified' | 'under_review' | 'rejected' | 'not_uploaded';
  filename?: string;
  filesize?: string;
  uploadedAt?: string;
}

export default function DocumentsTabView({
  currentUser,
  onNavigateTab,
}: DocumentsTabViewProps) {
  const [activeFilterTab, setActiveFilterTab] = useState<'required' | 'uploaded' | 'all'>('required');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedKind, setSelectedKind] = useState('academic_result');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState('');
  const [uploadError, setUploadError] = useState('');

  // Document requirements are labels, never fabricated uploaded records.
  const requirements: Array<Pick<DocumentItem,'id'|'name'|'category'|'type'|'required'>> = [
    {id:'academic',name:"O'Level Result (WAEC / NECO / NABTEB)",category:'Academic',type:'academic_result',required:true},
    {id:'birth',name:'Birth Certificate / Age Declaration',category:'Identification',type:'identification',required:true},
    {id:'testimonial',name:'Secondary School Testimonial',category:'Academic',type:'certificate',required:true},
    {id:'other',name:'Other Supporting Document',category:'Institutional',type:'other',required:false},
  ];
  const [records,setRecords]=useState<Array<{id:string;document_type:string;original_filename:string;review_status:string;review_note?:string;created_at:string}>>([]);
  const [loading,setLoading]=useState(false);
  const [loadError,setLoadError]=useState('');
  const applicationId=currentUser.application?.id;
  const api=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/student';
  const authenticatedHeaders=()=>{const token=getStudentToken();if(!token)throw Error('Please sign in again.');return {Authorization:'Bearer '+token};};
  const request=async(url:string,options:RequestInit={})=>{
    const response=await fetch(url,{...options,headers:{...authenticatedHeaders(),...(options.headers||{})}});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw Error(data.error||'The server could not complete your request.');
    return data;
  };
  const refreshDocuments=async():Promise<boolean>=>{
    if(!applicationId){setRecords([]);setLoadError('');setLoading(false);return true;}
    setLoading(true);setLoadError('');
    try{const data=await request(api+'/applications/'+encodeURIComponent(applicationId)+'/documents');setRecords(data.documents||[]);return true;}
    catch(error){setLoadError(error instanceof Error?error.message:'Could not load documents.');setRecords([]);return false;}
    finally{setLoading(false);}
  };
  useEffect(()=>{void refreshDocuments();},[applicationId]);
  const documents:DocumentItem[]=requirements.map(item=>{
    const match=records.filter(record=>record.document_type===item.type).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];
    return {...item,status:!match?'not_uploaded':match.review_status==='verified'?'verified':match.review_status==='rejected'?'rejected':'under_review',
      filename:match?.original_filename,uploadedAt:match?.created_at?new Date(match.created_at).toLocaleDateString():undefined};
  });
  const handleFileSelect=(f?:File)=>{
    if(!f)return;
    setUploadError('');setUploadNotice('');
    if(!['application/pdf','image/jpeg','image/png'].includes(f.type)||f.size>5*1024*1024||f.size===0){
      setUploadError('Select a PDF, JPG or PNG file up to 5 MB.');return;
    }
    setSelectedFile(f);
  };
  const handleUploadSubmit=async()=>{
    if(!selectedFile||uploading)return;
    if(!applicationId){setUploadError('Submit a programme application before uploading documents.');return;}
    setUploading(true);setUploadError('');setUploadNotice('');
    try{
      const route=api+'/applications/'+encodeURIComponent(applicationId)+'/documents';
      const signed=await request(route+'/upload-url',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mimeType:selectedFile.type,sizeBytes:selectedFile.size})});
      if(typeof signed.signedUrl!=='string'||!signed.signedUrl.startsWith('https://')||typeof signed.path!=='string'||!signed.path)throw Error('The server did not provide a valid secure document upload destination.');
      const upload=await fetch(signed.signedUrl,{method:'PUT',headers:{'Content-Type':selectedFile.type},body:selectedFile});
      if(!upload.ok)throw Error('Storage upload failed ('+upload.status+'). Nothing was confirmed.');
      const confirmed=await request(route+'/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:signed.path,mimeType:selectedFile.type,documentType:selectedKind,filename:selectedFile.name})});
      if(!confirmed?.document?.id)throw Error('The server did not confirm a document record. Please refresh before trying again.');
      const refreshed=await refreshDocuments();
      setUploadNotice(refreshed?'Document uploaded and recorded for review.':'Document confirmed by the server, but the document list could not be refreshed. Please reload this page to check its review status before uploading again.');
      setSelectedFile(null);if(fileInputRef.current)fileInputRef.current.value='';
    }catch(error){setUploadError(error instanceof Error?error.message:'Document upload failed.');}
    finally{setUploading(false);}
  };
  const viewDocument=async(type:string)=>{
    const record=records.filter(entry=>entry.document_type===type).sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];
    if(!record)return;
    try{
      const result=await request(api+'/documents/'+encodeURIComponent(record.id)+'/view');
      if(typeof result.url!=='string'||!/^https:\/\//i.test(result.url))throw Error('A secure document preview link was not returned.');
      window.open(result.url,'_blank','noopener,noreferrer');
    }catch(error){setUploadError(error instanceof Error?error.message:'Unable to open document.');}
  };

  // Filter items
  const filteredDocuments = documents.filter((doc) => {
    if (activeFilterTab === 'required') return doc.required;
    if (activeFilterTab === 'uploaded') return doc.status !== 'not_uploaded';
    return true;
  });

  const uploadedCount = documents.filter((d) => d.status !== 'not_uploaded').length;
  const verifiedCount = documents.filter((d) => d.status === 'verified').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Document Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload, verify and track academic certificates, exam slips and identity documents
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#111A43] text-xs font-bold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>{verifiedCount} Verified · {uploadedCount}/{documents.length} Submitted</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
          >
            <UploadCloud size={14} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Left (Tabs & Documents List), Right (Upload Zone & Guidelines) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN: Filter Tabs, Documents List, Recently Uploaded Cards */}
        <div className="space-y-6">
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#dce5f0] pb-2">
            {[
              { id: 'required', label: `Required Documents (${documents.filter((d) => d.required).length})` },
              { id: 'uploaded', label: `Uploaded (${uploadedCount})` },
              { id: 'all', label: `All Documents (${documents.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilterTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeFilterTab === tab.id
                    ? 'bg-[#111A43] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading && <p role="status" className="text-sm text-slate-600">Loading documents from server…</p>}
          {loadError && <p role="alert" className="text-sm text-red-700">{loadError}</p>}
          {/* Documents Table / List */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#111A43]">
                Academic &amp; Verification Credentials
              </h2>
              <span className="text-xs text-slate-400">
                Sorted by institutional priority
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#111A43] flex items-center justify-center shrink-0">
                      <FileText size={20} className="text-[#2456a0]" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-sm font-bold text-[#111A43] truncate">
                          {doc.name}
                        </strong>
                        {doc.required && (
                          <span className="text-[10px] uppercase font-bold text-[#c62839] bg-red-50 px-2 py-0.5 rounded">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {doc.filename ? (
                          <span className="font-mono text-slate-700">{doc.filename} · {doc.uploadedAt || '—'}</span>
                        ) : (
                          'PDF, JPG or PNG up to 5 MB'
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                    {/* Status Badge */}
                    {doc.status === 'verified' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        <CheckCircle2 size={13} />
                        <span>Verified</span>
                      </span>
                    )}
                    {doc.status === 'under_review' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200">
                        <Clock size={13} />
                        <span>Under Review</span>
                      </span>
                    )}
                    {doc.status === 'not_uploaded' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                        <AlertCircle size={13} />
                        <span>Not Uploaded</span>
                      </span>
                    )}

                    {doc.filename && <button type="button" onClick={()=>void viewDocument(doc.type)} className="px-3 py-1.5 text-xs font-bold text-[#2456a0] hover:underline">View</button>}
                    {doc.status === 'rejected' && <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">Rejected</span>}
                    {/* Action Button */}
                    {doc.status === 'not_uploaded' ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKind(doc.type);
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        Upload
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedKind(doc.type);
                          fileInputRef.current?.click();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#111A43] text-xs font-bold cursor-pointer"
                      >
                        Replace
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recently Uploaded Documents Cards Grid */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Recently Uploaded Documents
            </h3>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {documents.filter((d) => d.status !== 'not_uploaded').map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-lg bg-white shadow-xs text-[#c62839]">
                      <FileCheck size={18} />
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      item.status === 'verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {item.status === 'verified' ? 'Verified' : item.status === 'rejected' ? 'Rejected' : 'In Review'}
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-[#111A43] block truncate">
                    {item.name}
                  </strong>
                  <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                    {item.filename || 'No filename'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.filesize || '—'}</span>
                    <span>{item.uploadedAt || '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Drag-and-drop Card & Guidelines */}
        <div className="space-y-6">
          {/* Drag & Drop Upload Card */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <UploadCloud size={18} className="text-[#c62839]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Upload New Document
              </h3>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#111A43] mb-1.5">
                  Document Category
                </label>
                <select
                  value={selectedKind}
                  onChange={(e) => setSelectedKind(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#111A43]"
                >
                  <option value="academic_result">O'Level Result Slip (WAEC/NECO)</option>
                  <option value="identification">Birth Certificate / ID</option>
                  <option value="certificate">Secondary Testimonial</option>
                  <option value="other">Other Supporting Document</option>
                </select>
              </div>

              {/* Dropzone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#c62839] hover:bg-red-50/20 rounded-2xl p-6 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                />
                <div className="w-12 h-12 rounded-full bg-slate-100 text-[#c62839] flex items-center justify-center mx-auto mb-2">
                  <UploadCloud size={24} />
                </div>
                <strong className="text-xs font-bold text-[#111A43] block">
                  Click to upload or drag &amp; drop
                </strong>
                <p className="text-[11px] text-slate-500 mt-1">
                  PDF, JPG or PNG (Maximum 5MB)
                </p>
              </div>

              {selectedFile && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-[#111A43] truncate">{selectedFile.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="text-slate-400 hover:text-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {uploadError}
                </p>
              )}
              {uploadNotice && (
                <p className="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  {uploadNotice}
                </p>
              )}

              <button
                type="button"
                disabled={!selectedFile || uploading}
                onClick={handleUploadSubmit}
                className="w-full py-2.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {uploading ? 'Uploading securely...' : 'Submit Document'}
              </button>
            </div>
          </div>

          {/* Document Guidelines */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <ShieldCheck size={18} className="text-[#2456a0]" />
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Verification Guidelines
              </h3>
            </div>
            <ul className="mt-3 space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Documents must be clear, uncropped and completely legible.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Candidate name on all documents must match portal biodata.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                <span>Verification typically completes within 24 to 48 hours.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
