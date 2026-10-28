import React, { useEffect, useState } from 'react';
import {
  Users,
  FileText,
  GraduationCap,
  FolderCheck,
  UserX,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  RotateCcw,
  MoreVertical,
  MoreHorizontal,
  Edit2,
  Eye,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  appId: string;
  programme: 'IJMB' | 'JAMB' | 'WAEC';
  status: 'Admitted' | 'Pending' | 'Awaiting Docs' | 'Suspended' | 'Rejected';
  year: string;
  phone: string;
  email: string;
  dob: string;
  gender: string;
  address: string;
  nationality: string;
  guardian: string;
  guardianPhone: string;
  class: string;
  mode: string;
  admissionDate: string;
  studentId: string;
  expectedCompletion: string;
  avatar: string;
}

const subTabs = ['All Students', 'Applications', 'Admitted Students', 'Document Verification', 'Suspended'] as const;

export default function AdminStudentsPage() {
  const [activeSubTab, setActiveSubTab] = useState('All Students');
  const [selectedProgramme, setSelectedProgramme] = useState('All Programmes');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [selectedYear, setSelectedYear] = useState('All Years');
  const [searchFilter, setSearchFilter] = useState('');
  const [students,setStudents]=useState<Student[]>([]);
  const [apiLoading,setApiLoading]=useState(true);
  const [apiError,setApiError]=useState('');
  const [reload,setReload]=useState(0);
  useEffect(()=>{
    const controller=new AbortController();
    const token=sessionStorage.getItem('upec_staff_token');
    if(!token){setApiError('Staff sign-in required.');setApiLoading(false);return;}
    setApiLoading(true);setApiError('');
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/applications',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load applications.');return data;})
      .then(data=>{if(!controller.signal.aborted)setStudents((data.applications||[]).map((item:{id:string;reference_number:string;programme:string;academic_session:string;status:string;submitted_at:string},index:number)=>({
        id:index+1,name:'Applicant',appId:item.reference_number||item.id,
        programme:item.programme as Student['programme'],
        status:item.status==='approved'?'Admitted':item.status==='action_required'?'Awaiting Docs':item.status==='rejected'?'Rejected':'Pending',
        year:item.academic_session||'',phone:'',email:'',dob:'',gender:'',address:'',nationality:'',guardian:'',guardianPhone:'',class:'',mode:'',
        admissionDate:item.submitted_at||'',studentId:item.id,expectedCompletion:'',avatar:''
      })));})
      .catch(error=>{if(!controller.signal.aborted)setApiError(error instanceof Error?error.message:'Unable to load applications.');})
      .finally(()=>{if(!controller.signal.aborted)setApiLoading(false);});
    return()=>controller.abort();
  },[reload]);

  const [applicationDetail,setApplicationDetail]=useState<{application:{status:string;form_data:Record<string,unknown>|null;subjects:unknown};reviews:{id:string;new_status:string;note:string;created_at:string}[]}|null>(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [detailError,setDetailError]=useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [detailReload,setDetailReload]=useState(0);
  useEffect(()=>{
    setApplicationDetail(null);setDetailError('');
    if(!selectedStudent)return;
    const controller=new AbortController();
    setDetailLoading(true);
    const token=sessionStorage.getItem('upec_staff_token');
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/applications/'+encodeURIComponent(selectedStudent.studentId),{
      headers:{Authorization:'Bearer '+token},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load application details.');return data;})
      .then(data=>{if(!controller.signal.aborted)setApplicationDetail(data);})
      .catch(error=>{if(!controller.signal.aborted)setDetailError(error instanceof Error?error.message:'Unable to load details.');})
      .finally(()=>{if(!controller.signal.aborted)setDetailLoading(false);});
    return()=>controller.abort();
  },[selectedStudent,detailReload]);
  const [reviewStatus,setReviewStatus]=useState('under_review');
  const [reviewNote,setReviewNote]=useState('');
  const [reviewSaving,setReviewSaving]=useState(false);
  const [reviewFeedback,setReviewFeedback]=useState('');
  const submitReview=async()=>{
    if(!selectedStudent||reviewSaving)return;
    const note=reviewNote.trim();
    if(['rejected','action_required'].includes(reviewStatus)&&note.length<5){
      setReviewFeedback('Provide a reason of at least five characters.');return;
    }
    if(!window.confirm('Confirm application status change to '+reviewStatus.replace(/_/g,' ')+'?'))return;
    setReviewSaving(true);setReviewFeedback('');
    try{
      const token=sessionStorage.getItem('upec_staff_token');
      const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/applications/'+encodeURIComponent(selectedStudent.studentId)+'/status',{
        method:'PATCH',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({status:reviewStatus,note})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Could not save review.');
      setReviewNote('');setReviewFeedback('Review saved successfully.');
      setDetailReload(n=>n+1);setReload(n=>n+1);
    }catch(error){setReviewFeedback(error instanceof Error?error.message:'Could not save review.');}
    finally{setReviewSaving(false);}
  };
  type ApplicationDocument={id:string;document_type:string;original_filename:string;review_status:string;review_note:string|null;created_at:string};
  const [documents,setDocuments]=useState<ApplicationDocument[]>([]);
  const [documentsLoading,setDocumentsLoading]=useState(false);
  const [documentError,setDocumentError]=useState('');
  const [documentNote,setDocumentNote]=useState<Record<string,string>>({});
  const [documentSaving,setDocumentSaving]=useState<string|null>(null);
  const [documentReload,setDocumentReload]=useState(0);
  const apiBase=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');
  useEffect(()=>{
    setDocuments([]);setDocumentError('');
    if(!selectedStudent)return;
    const controller=new AbortController();
    setDocumentsLoading(true);
    fetch(apiBase+'/api/staff/applications/'+encodeURIComponent(selectedStudent.studentId)+'/documents',{
      headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load documents.');return data;})
      .then(data=>{if(!controller.signal.aborted)setDocuments(data.documents||[]);})
      .catch(error=>{if(!controller.signal.aborted)setDocumentError(error instanceof Error?error.message:'Unable to load documents.');})
      .finally(()=>{if(!controller.signal.aborted)setDocumentsLoading(false);});
    return()=>controller.abort();
  },[selectedStudent,documentReload]);
  const viewDocument=async(id:string)=>{
    try{
      setDocumentError('');
      const response=await fetch(apiBase+'/api/staff/documents/'+encodeURIComponent(id)+'/view',{headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')}});
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Document unavailable.');
      if(typeof data.url!=='string')throw Error('Document link unavailable.');
      window.open(data.url,'_blank','noopener,noreferrer');
    }catch(error){setDocumentError(error instanceof Error?error.message:'Could not open document.');}
  };
  const reviewDocument=async(id:string,status:'verified'|'rejected')=>{
    const note=(documentNote[id]||'').trim();
    if(status==='rejected'&&note.length<5){setDocumentError('Provide a rejection reason of at least five characters.');return;}
    if(!window.confirm('Confirm document '+status+'?'))return;
    setDocumentSaving(id);setDocumentError('');
    try{
      const response=await fetch(apiBase+'/api/staff/documents/'+encodeURIComponent(id)+'/review',{
        method:'PATCH',headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token'),'Content-Type':'application/json'},
        body:JSON.stringify({status,note})
      });
      const data=await response.json();
      if(!response.ok)throw Error(data.error||'Could not review document.');
      setDocumentReload(n=>n+1);
    }catch(error){setDocumentError(error instanceof Error?error.message:'Could not review document.');}
    finally{setDocumentSaving(null);}
  };
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'Profile' | 'Documents' | 'Applications' | 'Payments'>('Profile');

  const toggleCheck = (id: number) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleCheckAll = () => {
    if (checkedIds.length === students.length) {
      setCheckedIds([]);
    } else {
      setCheckedIds(students.map((s) => s.id));
    }
  };

  const filteredStudents = students.filter((s) => {
    if (activeSubTab === 'Applications' && s.status !== 'Pending') return false;
    if (activeSubTab === 'Admitted Students' && s.status !== 'Admitted') return false;
    if (activeSubTab === 'Document Verification' && s.status !== 'Awaiting Docs') return false;
    if (activeSubTab === 'Suspended' && s.status !== 'Suspended') return false;
    if (selectedProgramme !== 'All Programmes' && s.programme !== selectedProgramme) return false;
    if (selectedStatus !== 'All Status' && s.status !== selectedStatus) return false;
    if (selectedYear !== 'All Years' && s.year !== selectedYear) return false;
    if (
      searchFilter &&
      !s.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.appId.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.phone.includes(searchFilter)
    ) {
      return false;
    }
    return true;
  });

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleStudents = filteredStudents.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => setPage(1), [activeSubTab, selectedProgramme, selectedStatus, selectedYear, searchFilter, pageSize]);

  const exportApplications = () => {
    const rows = [['Application Reference','Programme','Academic Session','Application Status','Submitted At'],
      ...filteredStudents.map(s=>[s.appId,s.programme,s.year,s.status,s.admissionDate])];
    const csv = rows.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='applications.csv';anchor.click();
    URL.revokeObjectURL(url);
  };
  const getStatusBadge = (status: Student['status']) => {
    switch (status) {
      case 'Rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejected</span>;
      case 'Admitted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Admitted</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>;
      case 'Awaiting Docs':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Awaiting Docs</span>;
      case 'Suspended':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">Suspended</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-0 flex-col gap-3 lg:h-full lg:overflow-hidden">
      <div role="status" className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{apiLoading?"Loading live applications…":apiError||`${students.length} application records loaded. Only the records list is connected; other figures and actions are design placeholders.`}<button type="button" disabled={apiLoading} onClick={()=>setReload(value=>value+1)} className="ml-3 rounded-lg border px-3 py-1 disabled:opacity-50">Refresh</button></div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Student Management</h1>
          <p className="text-sm text-slate-500 mt-1">Manage all students, admissions, applications, documents and guardians.</p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button type="button" onClick={exportApplications} disabled={apiLoading || Boolean(apiError) || filteredStudents.length===0} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            <Upload size={14} className="text-slate-500" />
            Import Students
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            <Download size={14} className="text-slate-500" />
            Export
          </button>
          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-all">
            <Plus size={15} />
            Add Student
          </button>
        </div>
      </div>

      <div className="grid shrink-0 grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Loaded application summary">
        {[{label:'Applications',value:students.length},{label:'Admitted',value:students.filter(s=>s.status==='Admitted').length},{label:'Pending review',value:students.filter(s=>s.status==='Pending').length},{label:'Awaiting documents',value:students.filter(s=>s.status==='Awaiting Docs').length}].map(item=>(
          <div key={item.label} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <p className="text-lg font-bold leading-none text-[#111A43]">{apiLoading?'—':item.value}</p>
            <p className="mt-1 truncate text-[11px] font-medium text-slate-600" title={item.label}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-200 bg-white px-2 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {subTabs.map((tab) => {
            const isActive = activeSubTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-3.5 whitespace-nowrap transition-colors relative ${
                  isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-800'
                }`}
              >
                {tab}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62839] rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, application ID, phone, email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#111A43]/20"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="text-xs font-medium text-slate-600">
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Programmes">Programme: All Programmes</option>
              <option value="IJMB">IJMB</option>
              <option value="JAMB">JAMB</option>
              <option value="WAEC">WAEC</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Status">Status: All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Pending">Pending</option>
              <option value="Awaiting Docs">Awaiting Docs</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Years">Year: All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e] transition-colors">
            <Filter size={13} />
            Filter
          </button>

          <button
            onClick={() => {
              setSelectedProgramme('All Programmes');
              setSelectedStatus('All Status');
              setSelectedYear('All Years');
              setSearchFilter('');
            }}
            className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-3 xl:grid-cols-12 lg:overflow-hidden">
        {/* Left Column: Student Directory Table */}
        <div className={`min-w-0 min-h-[360px] lg:min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${drawerOpen ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <div className="min-h-0 flex-1 overflow-auto overscroll-contain">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={checkedIds.length === students.length}
                      onChange={toggleCheckAll}
                      className="rounded border-slate-300 text-[#C62839] focus:ring-[#C62839]"
                    />
                  </th>
                  <th className="py-3 px-2 w-8 text-center">#</th>
                  <th className="py-3 px-2 w-10 text-center">Photo</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Application ID</th>
                  <th className="py-3 px-3">Programme</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-2">Year</th>
                  <th className="py-3 px-3">Phone</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {visibleStudents.map((s, index) => {
                  const isChecked = checkedIds.includes(s.id);
                  const isSelected = selectedStudent?.id === s.id;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => {
                        setSelectedStudent(s);
                        setDrawerOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheck(s.id)}
                          className="rounded border-slate-300 text-[#C62839] focus:ring-[#C62839]"
                        />
                      </td>
                      <td className="py-3 px-2 text-center text-slate-400 font-medium">{(safePage - 1) * pageSize + index + 1}</td>
                      <td className="py-3 px-2 text-center">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover mx-auto ring-1 ring-slate-200"
                        />
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#111A43] whitespace-nowrap">{s.name}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.appId}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.programme}</td>
                      <td className="py-3 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-3 px-2 text-slate-500">{s.year}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{s.phone}</td>
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                          <MoreVertical size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-slate-100 p-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
            <span>Showing {filteredStudents.length ? (safePage-1)*pageSize+1 : 0}–{Math.min(safePage*pageSize,filteredStudents.length)} of {filteredStudents.length}</span>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={safePage===1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded-lg border px-2 py-1 disabled:opacity-40">Previous</button>
              <span>Page {safePage} of {pageCount}</span>
              <button type="button" disabled={safePage===pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))} className="rounded-lg border px-2 py-1 disabled:opacity-40">Next</button>
              <select aria-label="Records per page" value={pageSize} onChange={e=>setPageSize(Number(e.target.value))} className="rounded-lg border px-2 py-1"><option value={10}>10 per page</option><option value={25}>25 per page</option><option value={50}>50 per page</option></select>
            </div>
          </div>
        </div>

        {/* Right Column: Student Profile Details Drawer */}
        {drawerOpen && selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-white p-4 sm:p-6 xl:relative xl:inset-auto xl:z-auto xl:col-span-5 xl:min-h-0 xl:overflow-y-auto xl:rounded-2xl xl:border xl:border-slate-200 xl:shadow-sm">
            <button
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label="Live application details">
              <h4 className="text-sm font-bold text-[#111A43]">Application details (live)</h4>
              {detailLoading?<p className="mt-2 text-xs">Loading application…</p>:detailError?<p role="alert" className="mt-2 text-xs text-red-700">{detailError}</p>:applicationDetail?(
                <div className="mt-2 space-y-3 text-xs">
                  <p><strong>Backend status:</strong> {applicationDetail.application.status}</p>
                  <div><strong>Submitted fields:</strong><dl className="mt-2 grid gap-2">{Object.entries(applicationDetail.application.form_data||{}).filter(([,value])=>['string','number','boolean'].includes(typeof value)).map(([key,value])=><div key={key} className="break-words"><dt className="font-semibold text-slate-500">{key.replace(/_/g,' ')}</dt><dd>{String(value)}</dd></div>)}</dl></div>
                  <div><strong>Review history:</strong>{applicationDetail.reviews.length===0?<p className="mt-1">No reviews recorded.</p>:applicationDetail.reviews.map(review=><p key={review.id} className="mt-2 border-t pt-2">{review.new_status} · {new Date(review.created_at).toLocaleDateString('en-NG')}<br/>{review.note}</p>)}</div>
                </div>
              ):null}
            </section>
            <section className="mb-4 rounded-xl border border-slate-200 p-4 space-y-3" aria-label="Review application">
              <h4 className="text-sm font-bold text-[#111A43]">Review application</h4>
              <label className="block text-xs font-semibold text-slate-700">Decision
                <select value={reviewStatus} onChange={event=>setReviewStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2">
                  <option value="under_review">Under review</option>
                  <option value="approved">Approve</option>
                  <option value="action_required">Request corrections</option>
                  <option value="rejected">Reject</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-slate-700">Review note
                <textarea value={reviewNote} onChange={event=>setReviewNote(event.target.value)} maxLength={2000} rows={3} placeholder="Explain your decision" className="mt-1 w-full rounded-lg border border-slate-300 p-2" />
              </label>
              {reviewFeedback&&<p role="status" className="text-xs text-slate-700">{reviewFeedback}</p>}
              <button type="button" onClick={submitReview} disabled={reviewSaving||detailLoading||Boolean(detailError)||!applicationDetail} className="rounded-lg bg-[#111A43] px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">{reviewSaving?'Saving…':'Save review decision'}</button>
            </section>
            <section className="mb-4 rounded-xl border border-slate-200 p-4 space-y-3" aria-label="Application documents">
              <h4 className="text-sm font-bold text-[#111A43]">Submitted documents</h4>
              {documentsLoading?<p className="text-xs">Loading documents…</p>:documents.length===0&&!documentError?<p className="text-xs text-slate-500">No documents submitted.</p>:null}
              {documentError&&<p role="alert" className="text-xs text-rose-700">{documentError}</p>}
              {documents.map(doc=><div key={doc.id} className="rounded-lg border border-slate-200 p-3 text-xs space-y-2">
                <p className="font-semibold break-all">{doc.original_filename||doc.document_type}</p>
                <p className="text-slate-500">{doc.document_type} · {doc.review_status}</p>
                {doc.review_note&&<p className="text-slate-600">Previous note: {doc.review_note}</p>}
                <button type="button" onClick={()=>viewDocument(doc.id)} className="text-[#111A43] underline font-semibold">View document</button>
                <textarea aria-label={'Review note for '+doc.original_filename} value={documentNote[doc.id]||''} onChange={event=>setDocumentNote(previous=>({...previous,[doc.id]:event.target.value}))} maxLength={1000} rows={2} placeholder="Review note (required when rejecting)" className="w-full rounded-lg border border-slate-300 p-2" />
                <div className="flex gap-2">
                  <button type="button" disabled={documentSaving!==null} onClick={()=>reviewDocument(doc.id,'verified')} className="rounded-lg bg-emerald-700 px-3 py-2 font-semibold text-white disabled:opacity-50">Verify</button>
                  <button type="button" disabled={documentSaving!==null} onClick={()=>reviewDocument(doc.id,'rejected')} className="rounded-lg bg-[#C62839] px-3 py-2 font-semibold text-white disabled:opacity-50">Reject</button>
                </div>
              </div>)}
            </section>
            {/* Profile Header */}
            <div className="flex items-start gap-4">
              <img
                src={selectedStudent.avatar}
                alt={selectedStudent.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold text-[#111A43] truncate">{selectedStudent.name}</h3>
                  {getStatusBadge(selectedStudent.status)}
                </div>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{selectedStudent.appId}</p>
                <p className="text-xs text-slate-600 font-medium mt-0.5">B.Sc. Computer Science ({selectedStudent.programme})</p>
                <p className="text-[11px] text-slate-400">2025 Academic Session</p>
              </div>
            </div>

            {/* Profile Action Buttons */}
            <div className="flex items-center gap-2 mt-4 pt-2">
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors">
                <Edit2 size={13} />
                Edit
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                <Eye size={13} />
                View Profile
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                <Mail size={13} />
                Send Message
              </button>
              <button className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 border border-slate-200">
                <MoreHorizontal size={14} />
              </button>
            </div>

            {/* Profile Subtabs */}
            <div className="border-b border-slate-200 mt-5">
              <div className="flex items-center gap-5 text-xs font-semibold text-slate-500">
                {(['Profile', 'Documents', 'Applications', 'Payments'] as const).map((tab) => {
                  const isActive = activeProfileTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveProfileTab(tab)}
                      className={`pb-2.5 transition-colors relative ${
                        isActive ? 'text-[#C62839] font-bold' : 'hover:text-slate-700'
                      }`}
                    >
                      {tab}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C62839] rounded-full" />
                      )}
                    </button>
                  );
                })}
                <button className="pb-2.5 text-slate-400 hover:text-slate-600 flex items-center gap-1">
                  More <ChevronRight size={12} className="rotate-90" />
                </button>
              </div>
            </div>

            {/* Profile Info Sections */}
            <div className="mt-5 space-y-5 text-xs">
              {/* Personal Information */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-[#111A43]">
                    <span className="text-slate-400 font-normal">👤</span>
                    Personal Information
                  </div>
                  <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    <Edit2 size={11} />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mt-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">Full Name</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.name}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Email</span>
                    <p className="font-semibold text-slate-700 mt-0.5 truncate">{selectedStudent.email}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Date of Birth</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.dob}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Phone</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.phone}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Gender</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.gender}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Address</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.address}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Nationality</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.nationality}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Guardian</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.guardian}</p>
                    <p className="text-slate-400 text-[10px]">{selectedStudent.guardianPhone}</p>
                  </div>
                </div>
              </div>

              {/* Programme Information */}
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2 font-bold text-[#111A43]">
                    <span className="text-slate-400 font-normal">🎓</span>
                    Programme Information
                  </div>
                  <button className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700">
                    <Edit2 size={11} />
                    Edit
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mt-3">
                  <div>
                    <span className="text-slate-400 text-[11px]">Programme</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.programme} Programme</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Class</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.class}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Mode</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.mode}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Status</span>
                    <div className="mt-0.5">{getStatusBadge(selectedStudent.status)}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Admission Date</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.admissionDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Student ID</span>
                    <p className="font-semibold text-slate-700 font-mono mt-0.5">{selectedStudent.studentId}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Expected Completion</span>
                    <p className="font-semibold text-slate-700 mt-0.5">{selectedStudent.expectedCompletion}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Application ID</span>
                    <p className="font-semibold text-slate-700 font-mono mt-0.5">{selectedStudent.appId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
