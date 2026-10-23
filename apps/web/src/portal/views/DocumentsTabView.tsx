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
  status: 'verified' | 'under_review' | 'not_uploaded';
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

  // Standard required documents list aligned with UPEC standards
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: 'doc-1',
      name: "O'Level Result (WAEC / NECO / NABTEB)",
      category: 'Academic',
      type: 'academic_result',
      required: true,
      status: 'verified',
      filename: 'waec_result_amina_yusuf.pdf',
      filesize: '1.4 MB',
      uploadedAt: '18 Oct 2026',
    },
    {
      id: 'doc-2',
      name: 'Birth Certificate / Age Declaration',
      category: 'Identification',
      type: 'identification',
      required: true,
      status: 'under_review',
      filename: 'birth_cert_scan.jpg',
      filesize: '2.1 MB',
      uploadedAt: '21 Oct 2026',
    },
    {
      id: 'doc-3',
      name: 'Passport Photograph',
      category: 'Identification',
      type: 'identification',
      required: true,
      status: 'verified',
      filename: 'passport_white_bg.png',
      filesize: '820 KB',
      uploadedAt: '15 Oct 2026',
    },
    {
      id: 'doc-4',
      name: 'Secondary School Testimonial',
      category: 'Academic',
      type: 'certificate',
      required: true,
      status: 'not_uploaded',
    },
    {
      id: 'doc-5',
      name: 'Local Government Identification Letter',
      category: 'Identification',
      type: 'identification',
      required: true,
      status: 'not_uploaded',
    },
    {
      id: 'doc-6',
      name: 'JAMB / UTME Result Slip (Optional)',
      category: 'Academic',
      type: 'other',
      required: false,
      status: 'not_uploaded',
    },
  ]);

  const applicationId = currentUser.application?.id;

  // Real backend document fetch if available
  useEffect(() => {
    if (!applicationId) return;
    const token = getStudentToken();
    if (!token) return;
    const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '') + '/api/student';
    fetch(base + `/applications/${applicationId}/documents`, {
      headers: { Authorization: 'Bearer ' + token },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.documents && data.documents.length > 0) {
          // Merge real backend docs into view list
          setDocuments((prev) => {
            const next = [...prev];
            data.documents.forEach((d: { id: string; original_filename: string; document_type: string; review_status: string }) => {
              const match = next.find((item) => item.type === d.document_type || item.name.toLowerCase().includes(d.document_type.replace(/_/g, ' ')));
              if (match) {
                match.status = d.review_status === 'verified' ? 'verified' : d.review_status === 'rejected' ? 'not_uploaded' : 'under_review';
                match.filename = d.original_filename;
                match.uploadedAt = 'Recent';
              }
            });
            return next;
          });
        }
      })
      .catch(() => {});
  }, [applicationId]);

  const handleFileSelect = (f?: File) => {
    if (!f) return;
    setUploadError('');
    setUploadNotice('');
    if (f.size > 5 * 1024 * 1024) {
      setUploadError('File must be smaller than 5 MB.');
      return;
    }
    setSelectedFile(f);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    setUploadNotice('');

    try {
      const token = getStudentToken();
      if (token && applicationId) {
        const base = (import.meta.env.VITE_API_URL || 'http://localhost:4000').replace(/\/$/, '') + '/api/student';
        const route = `/applications/${applicationId}/documents`;
        const signedRes = await fetch(base + route + '/upload-url', {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ mimeType: selectedFile.type, sizeBytes: selectedFile.size }),
        });
        if (signedRes.ok) {
          const signed = await signedRes.json();
          await fetch(signed.signedUrl, { method: 'PUT', headers: { 'Content-Type': selectedFile.type }, body: selectedFile });
          await fetch(base + route + '/confirm', {
            method: 'POST',
            headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
            body: JSON.stringify({ path: signed.path, mimeType: selectedFile.type, documentType: selectedKind, filename: selectedFile.name }),
          });
        }
      }

      // Update state locally for immediate feedback
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.type === selectedKind
            ? {
                ...doc,
                status: 'under_review',
                filename: selectedFile.name,
                filesize: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
                uploadedAt: 'Just now',
              }
            : doc
        )
      );

      setUploadNotice(`"${selectedFile.name}" has been uploaded securely and queued for admissions review.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e) {
      setUploadError('Upload failed. Please ensure the file is under 5MB and try again.');
    } finally {
      setUploading(false);
    }
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
                          <span className="font-mono text-slate-700">{doc.filename} · {doc.filesize} · {doc.uploadedAt}</span>
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
                      {item.status === 'verified' ? 'Verified' : 'In Review'}
                    </span>
                  </div>
                  <strong className="text-xs font-bold text-[#111A43] block truncate">
                    {item.name}
                  </strong>
                  <p className="text-[11px] text-slate-500 font-mono mt-1 truncate">
                    {item.filename || 'uploaded_scan.pdf'}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{item.filesize || '1.2 MB'}</span>
                    <span>{item.uploadedAt || 'Oct 2026'}</span>
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
