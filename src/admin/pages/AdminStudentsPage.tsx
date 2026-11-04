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
  ClipboardCheck,
  UserCheck,
  FolderOpen,
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  appId: string;
  programme: 'IJMB' | 'JAMB' | 'WAEC';
  status: 'Admitted' | 'Pending' | 'Awaiting Docs' | 'Suspended' | 'Rejected' | 'Not Applied';
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
  accountId: string;
  applicationId: string | null;
  expectedCompletion: string;
  avatar: string;
}

const notifyAdmin = (message:string,kind:'error'|'success'|'info'='info') => window.dispatchEvent(new CustomEvent('upec-admin-toast',{detail:{message,kind}}));

export default function AdminStudentsPage() {
  const [filterOpen, setFilterOpen] = useState(false);
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
    if(!token){setApiError('Please sign in to load application records.');setApiLoading(false);notifyAdmin('Please sign in to access student records.','error');return;}
    setApiLoading(true);setApiError('');
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/students',{headers:{Authorization:'Bearer '+token},signal:controller.signal})
      .then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load applications.');return data;})
      .then(data=>{if(!controller.signal.aborted){
        const records=Array.isArray(data.students)?data.students:[];
        setStudents(records.map((item:Record<string,any>,index:number)=>{
          const application=(item.application&&typeof item.application==='object'?item.application:null) as Record<string,any>|null;
          const details=(item.biodata?.details&&typeof item.biodata.details==='object'?item.biodata.details:{}) as Record<string,any>;
          const form=(application?.form_data&&typeof application.form_data==='object'?application.form_data:{}) as Record<string,any>;
          const profile={...form,...details};
          const rawStatus=String(application?.status||'');
          const name=String(item.full_name||[profile.firstName||profile.first_name,profile.otherNames||profile.other_names,profile.surname||profile.lastName||profile.last_name].filter(Boolean).join(' ')||'Name unavailable');
          return {
            id:index+1,name,appId:String(application?.reference_number||'Not applied'),
            programme:String(application?.programme||profile.programme||'') as Student['programme'],
            status:!application?'Not Applied':rawStatus==='approved'?'Admitted':rawStatus==='action_required'?'Awaiting Docs':rawStatus==='rejected'?'Rejected':rawStatus==='suspended'?'Suspended':'Pending',
            year:String(application?.academic_session||''),phone:String(item.phone||profile.phone||''),
            email:String(item.email||profile.email||''),dob:String(profile.dateOfBirth||profile.date_of_birth||profile.dob||''),gender:String(profile.gender||''),
            address:String(profile.address||profile.residentialAddress||profile.residential_address||''),nationality:String(profile.nationality||profile.stateOfOrigin||profile.state_of_origin||''),guardian:String(profile.guardianName||profile.guardian_name||''),
            guardianPhone:String(profile.guardianPhone||profile.guardian_phone||''),class:String(profile.class||profile.className||profile.class_name||''),mode:String(profile.coachingMode||profile.coaching_mode||''),admissionDate:String(application?.submitted_at||item.created_at||''),
            studentId:String(item.student_id||''),accountId:String(item.id||''),applicationId:application?.id?String(application.id):null,
            expectedCompletion:'',avatar:String(profile.avatar_url||'')
          };
        }));
      }})
      .catch(error=>{if(!controller.signal.aborted){const message=error instanceof Error?error.message:'Unable to load applications.';setApiError(message);notifyAdmin(message,'error');}})
      .finally(()=>{if(!controller.signal.aborted)setApiLoading(false);});
    return()=>controller.abort();
  },[reload]);

  const [applicationDetail,setApplicationDetail]=useState<{student:Record<string,any>|null;biodata:Record<string,any>|null;applications:Record<string,any>[];reviews:{id:string;application_id?:string;previous_status?:string;new_status:string;note:string|null;created_at:string}[]}|null>(null);
  const [studentPermissions,setStudentPermissions]=useState({biodata_edit_allowed:false,programme_change_allowed:false});
  const [permissionsSaving,setPermissionsSaving]=useState(false);
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
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/students/'+encodeURIComponent(selectedStudent.accountId),{
      headers:{Authorization:'Bearer '+token},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load application details.');return data;})
      .then(data=>{if(!controller.signal.aborted){
        const applications=Array.isArray(data.applications)?data.applications:[];
        const latestApplication=applications[0]||null;
        const details=(data.biodata?.details&&typeof data.biodata.details==='object'?data.biodata.details:{}) as Record<string,any>;
        const form=(latestApplication?.form_data&&typeof latestApplication.form_data==='object'?latestApplication.form_data:{}) as Record<string,any>;
        const merged={...form,...details};
        const pick=(...keys:string[])=>keys.map(key=>merged[key]).find(value=>value!==undefined&&value!==null&&String(value).trim()!=='');
        setSelectedStudent(current=>current?{
          ...current,
          name:String(data.student?.full_name||[pick('firstName','first_name'),pick('otherNames','other_names'),pick('surname','lastName','last_name')].filter(Boolean).join(' ')||current.name),
          email:String(data.student?.email||current.email||''),
          phone:String(data.student?.phone||pick('phone','mobileNumber','mobile_number')||''),
          dob:String(pick('dateOfBirth','date_of_birth','dob')||''),
          gender:String(pick('gender')||''),
          address:String(pick('address','residentialAddress','residential_address')||''),
          nationality:String(pick('nationality','stateOfOrigin','state_of_origin')||''),
          guardian:String(pick('guardianName','guardian_name')||''),
          guardianPhone:String(pick('guardianPhone','guardian_phone')||''),
          programme:String(latestApplication?.programme||current.programme||'') as Student['programme'],
          year:String(latestApplication?.academic_session||current.year||''),
          appId:String(latestApplication?.reference_number||current.appId||'Not applied'),
          applicationId:latestApplication?.id?String(latestApplication.id):null,
          studentId:String(data.student?.student_id||current.studentId||''),
          admissionDate:String(latestApplication?.submitted_at||data.student?.created_at||''),
          mode:String(pick('coachingMode','coaching_mode')||''),
          avatar:current.avatar
        }:current);
        setApplicationDetail({student:data.student||null,biodata:data.biodata||null,applications,reviews:data.reviews||[]});
      }})
      .catch(error=>{if(!controller.signal.aborted)setDetailError(error instanceof Error?error.message:'Unable to load details.');})
      .finally(()=>{if(!controller.signal.aborted)setDetailLoading(false);});
    return()=>controller.abort();
  },[selectedStudent?.accountId,detailReload]);
  useEffect(()=>{
    if(!selectedStudent)return;
    const controller=new AbortController();
    fetch(apiBase+'/api/staff/students/'+encodeURIComponent(selectedStudent.accountId)+'/edit-permissions',{
      headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load edit permissions.');return data;})
      .then(data=>{if(!controller.signal.aborted)setStudentPermissions(data.permissions||{biodata_edit_allowed:false,programme_change_allowed:false});})
      .catch(error=>{if(!controller.signal.aborted)notifyAdmin(error instanceof Error?error.message:'Unable to load edit permissions.','error');});
    return()=>controller.abort();
  },[selectedStudent]);
  const [reviewStatus,setReviewStatus]=useState('under_review');
  const [reviewNote,setReviewNote]=useState('');
  const [reviewSaving,setReviewSaving]=useState(false);
  const [reviewFeedback,setReviewFeedback]=useState('');
  const submitReview=async()=>{
    if(!selectedStudent||!selectedStudent.applicationId||reviewSaving)return;
    const note=reviewNote.trim();
    if(['rejected','action_required'].includes(reviewStatus)&&note.length<5){
      setReviewFeedback('Provide a reason of at least five characters.');return;
    }
    if(!window.confirm('Confirm application status change to '+reviewStatus.replace(/_/g,' ')+'?'))return;
    setReviewSaving(true);setReviewFeedback('');
    try{
      const token=sessionStorage.getItem('upec_staff_token');
      const response=await fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'')+'/api/staff/applications/'+encodeURIComponent(selectedStudent.applicationId)+'/status',{
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
    if(!selectedStudent?.applicationId)return;
    const controller=new AbortController();
    setDocumentsLoading(true);
    fetch(apiBase+'/api/staff/applications/'+encodeURIComponent(selectedStudent.applicationId)+'/documents',{
      headers:{Authorization:'Bearer '+sessionStorage.getItem('upec_staff_token')},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load documents.');return data;})
      .then(data=>{if(!controller.signal.aborted)setDocuments(data.documents||[]);})
      .catch(error=>{if(!controller.signal.aborted)setDocumentError(error instanceof Error?error.message:'Unable to load documents.');})
      .finally(()=>{if(!controller.signal.aborted)setDocumentsLoading(false);});
    return()=>controller.abort();
  },[selectedStudent?.accountId,selectedStudent?.applicationId,documentReload]);
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
  const [activeProfileTab, setActiveProfileTab] = useState<'Profile' | 'Documents' | 'Applications' | 'Payments'>('Profile');
  const openStudent=(student:Student)=>{setSelectedStudent(student);setActiveProfileTab('Profile');setApplicationDetail(null);setDetailError('');setDocuments([]);setDocumentError('');};
  const closeStudent=()=>{setSelectedStudent(null);setApplicationDetail(null);setDocuments([]);setDocumentError('');};
  const toggleStudentPermission=async(key:'biodata_edit_allowed'|'programme_change_allowed')=>{
    if(!selectedStudent||permissionsSaving)return;
    const next={...studentPermissions,[key]:!studentPermissions[key]};
    setPermissionsSaving(true);
    try{
      const token=sessionStorage.getItem('upec_staff_token');
      const response=await fetch(apiBase+'/api/staff/students/'+encodeURIComponent(selectedStudent.accountId)+'/edit-permissions',{
        method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
        body:JSON.stringify({biodataEditAllowed:next.biodata_edit_allowed,programmeChangeAllowed:next.programme_change_allowed})
      });
      const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to update student permissions.');
      setStudentPermissions(next);notifyAdmin('Student editing permissions updated.','success');
    }catch(error){notifyAdmin(error instanceof Error?error.message:'Unable to update permissions.','error');}
    finally{setPermissionsSaving(false);}
  };

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
    if (selectedProgramme !== 'All Programmes' && s.programme !== selectedProgramme) return false;
    if (selectedStatus !== 'All Status' && s.status !== selectedStatus) return false;
    if (selectedYear !== 'All Years' && s.year !== selectedYear) return false;
    if (
      searchFilter &&
      !s.name.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.appId.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.phone.includes(searchFilter) &&
      !s.email.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !s.studentId.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const applicationCount=students.filter(s=>s.applicationId).length;
  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleStudents = filteredStudents.slice((safePage - 1) * pageSize, safePage * pageSize);
  useEffect(() => setPage(1), [selectedProgramme, selectedStatus, selectedYear, searchFilter, pageSize]);

  const exportApplications = () => {
    const rows = [['Application Reference','Programme','Academic Session','Application Status','Submitted At'],
      ...filteredStudents.map(s=>[s.appId,s.programme,s.year,s.status,s.admissionDate])];
    const csv = rows.map(row=>row.map(value=>'"'+String(value??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const anchor=document.createElement('a');anchor.href=url;anchor.download='applications.csv';anchor.click();
    URL.revokeObjectURL(url);
  };
  const getStatusBadge = (status: Student['status']) => {
    const styles:Record<string,string>={
      'Rejected':'bg-rose-100 text-rose-900 border-rose-300',
      'Admitted':'bg-emerald-100 text-emerald-900 border-emerald-300',
      'Pending':'bg-amber-100 text-amber-950 border-amber-300',
      'Awaiting Docs':'bg-sky-100 text-sky-950 border-sky-300',
      'Not Applied':'bg-slate-200 text-slate-800 border-slate-300',
      'Suspended':'bg-red-100 text-red-900 border-red-300'
    };
    return <span className={'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold leading-none '+(styles[status]||'bg-slate-100 text-slate-800 border-slate-300')}>{status==='Not Applied'?'Not applied':status}</span>;
  };
  const displayValue=(value:unknown)=>{
    if(value===null||value===undefined||String(value).trim()==='')return 'Not provided yet';
    if(typeof value==='boolean')return value?'Yes':'No';
    if(Array.isArray(value))return value.length?value.map(item=>typeof item==='object'?JSON.stringify(item):String(item)).join(', '):'Not provided yet';
    if(typeof value==='object')return Object.entries(value as Record<string,unknown>).map(([key,val])=>key.replace(/([A-Z])/g,' $1').replace(/_/g,' ')+': '+String(val??'Not provided')).join(' · ');
    return String(value);
  };
  const detailApplications=applicationDetail?.applications||[];
  const currentApplication=detailApplications[0]||null;
  const profileDetails={...(currentApplication?.form_data||{}),...(applicationDetail?.biodata?.details||{})} as Record<string,any>;
  const detailFields=Object.entries(profileDetails).filter(([,value])=>value!==null&&value!==undefined&&value!=='');
  const applicationStatus=(raw:string)=>{
    const map:Record<string,Student['status']>={approved:'Admitted',submitted:'Pending',under_review:'Pending',action_required:'Awaiting Docs',rejected:'Rejected',suspended:'Suspended'};
    return map[raw]||'Pending';
  };

  if(selectedStudent){
    return (
      <div className="flex h-full min-h-0 flex-col gap-4 overflow-y-auto bg-slate-50 p-3 sm:p-5">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button type="button" onClick={closeStudent} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#111A43] hover:bg-slate-50"><ChevronLeft size={17}/> Back to students</button>
            <div><h1 className="text-xl font-extrabold text-[#111A43] sm:text-2xl">Student profile</h1><p className="text-xs text-slate-500">Complete account, biodata and application record</p></div>
          </div>
          <button type="button" onClick={()=>{setDetailReload(n=>n+1);setDocumentReload(n=>n+1);setReload(n=>n+1);}} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#111A43]"><RotateCcw size={15}/> Refresh record</button>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 text-2xl font-bold text-[#111A43]">
              {selectedStudent.avatar?<img src={selectedStudent.avatar} alt="" className="h-full w-full object-cover"/>:selectedStudent.name.trim().charAt(0).toUpperCase()||'?'}
            </div>
            <div className="min-w-0 flex-1"><h2 className="text-xl font-extrabold text-[#111A43]">{selectedStudent.name}</h2><p className="mt-1 font-mono text-sm text-slate-600">{selectedStudent.studentId||'Student ID not assigned'}</p><p className="mt-1 text-sm text-slate-600">{selectedStudent.email||'Email not provided'} · {selectedStudent.phone||'Phone not provided'}</p></div>
            {getStatusBadge(selectedStudent.status)}
          </div>
          {detailLoading&&<p className="mt-4 text-sm text-slate-500">Loading full student record…</p>}
          {detailError&&<p role="alert" className="mt-4 rounded-lg bg-rose-50 p-3 text-sm font-medium text-rose-800">{detailError}</p>}
        </section>
        <nav className="flex shrink-0 gap-2 overflow-x-auto rounded-xl border border-slate-200 bg-white p-2">
          {(['Profile','Documents','Applications','Payments'] as const).map(tab=><button key={tab} type="button" onClick={()=>setActiveProfileTab(tab)} className={'rounded-lg px-4 py-2 text-sm font-bold '+(activeProfileTab===tab?'bg-[#111A43] text-white':'text-slate-600 hover:bg-slate-100')}>{tab}</button>)}
        </nav>
        {activeProfileTab==='Profile'&&<div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="mb-4 text-base font-extrabold text-[#111A43]">Personal information</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['Full name',selectedStudent.name],['Email',selectedStudent.email],['Phone',selectedStudent.phone],['Date of birth',selectedStudent.dob],['Gender',selectedStudent.gender],['Address',selectedStudent.address],['Nationality / State of origin',selectedStudent.nationality],['Guardian name',selectedStudent.guardian],['Guardian phone',selectedStudent.guardianPhone],['Account verified',applicationDetail?.student?.verified_at?'Yes':'No'],['Account created',applicationDetail?.student?.created_at]
            ].map(([label,value])=><div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-800">{displayValue(value)}</dd></div>)}
          </dl></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="mb-4 text-base font-extrabold text-[#111A43]">Programme and registration</h3><dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              ['Student ID',selectedStudent.studentId],['Programme',currentApplication?.programme||selectedStudent.programme],['Academic session',currentApplication?.academic_session||selectedStudent.year],['Application reference',currentApplication?.reference_number||selectedStudent.appId],['Application status',currentApplication?.status],['Submitted at',currentApplication?.submitted_at],['Coaching mode',profileDetails.coachingMode||profileDetails.coaching_mode],['Preferred session',profileDetails.preferredSession||profileDetails.preferred_session],['Subjects',currentApplication?.subjects],['Biodata completed',applicationDetail?.biodata?.completed_at],['Last biodata update',applicationDetail?.biodata?.updated_at]
            ].map(([label,value])=><div key={label}><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm font-semibold text-slate-800">{displayValue(value)}</dd></div>)}
          </dl>
          <div className="mt-5 border-t border-slate-100 pt-4"><h4 className="mb-3 text-sm font-bold text-[#111A43]">Student editing permissions</h4>
            <label className="mb-2 flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={studentPermissions.biodata_edit_allowed} disabled={permissionsSaving} onChange={()=>toggleStudentPermission('biodata_edit_allowed')}/> Allow biodata editing</label>
            <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={studentPermissions.programme_change_allowed} disabled={permissionsSaving} onChange={()=>toggleStudentPermission('programme_change_allowed')}/> Allow programme change</label>
          </div></section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2"><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-extrabold text-[#111A43]">All submitted biodata fields</h3><span className="text-xs text-slate-500">{detailFields.length} fields</span></div>
            {detailFields.length?<dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{detailFields.map(([key,value])=><div key={key} className="min-w-0"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{key.replace(/([A-Z])/g,' $1').replace(/_/g,' ')}</dt><dd className="mt-1 break-words text-sm font-medium text-slate-800">{displayValue(value)}</dd></div>)}</dl>:<p className="text-sm text-slate-500">No biodata fields have been submitted yet.</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2"><h3 className="mb-3 text-base font-extrabold text-[#111A43]">Application review history</h3>
            {applicationDetail?.reviews?.length?<div className="space-y-3">{applicationDetail.reviews.map(review=><div key={review.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-[#111A43]">{review.new_status.replace(/_/g,' ')}</strong><span className="text-xs text-slate-500">{review.created_at?new Date(review.created_at).toLocaleString('en-NG'):'Date unavailable'}</span></div><p className="mt-1 text-sm text-slate-700">{displayValue(review.note)}</p></div>)}</div>:<p className="text-sm text-slate-500">No review history recorded.</p>}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 xl:col-span-2"><h3 className="mb-3 text-base font-extrabold text-[#111A43]">Application decision</h3>
            {currentApplication?<><div className="grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Decision<select value={reviewStatus} onChange={event=>setReviewStatus(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2"><option value="under_review">Under review</option><option value="approved">Approve</option><option value="action_required">Request corrections</option><option value="rejected">Reject</option></select></label><label className="text-sm font-semibold text-slate-700">Review note<textarea value={reviewNote} onChange={event=>setReviewNote(event.target.value)} maxLength={2000} rows={2} placeholder="Explain the decision (required for rejection or corrections)" className="mt-1 w-full rounded-lg border border-slate-300 p-2"/></label></div>{reviewFeedback&&<p role="status" className="mt-2 text-sm text-slate-700">{reviewFeedback}</p>}<button type="button" onClick={submitReview} disabled={reviewSaving||detailLoading||Boolean(detailError)} className="mt-3 rounded-lg bg-[#111A43] px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{reviewSaving?'Saving…':'Save application decision'}</button></>:<p className="text-sm text-slate-500">This student has not submitted an application. Application review is unavailable.</p>}
          </section>
        </div>}
        {activeProfileTab==='Documents'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-base font-extrabold text-[#111A43]">Submitted documents</h3><button type="button" onClick={()=>setDocumentReload(n=>n+1)} className="text-sm font-semibold text-[#111A43]">Refresh</button></div>{documentsLoading?<p className="text-sm text-slate-500">Loading documents…</p>:null}{documentError&&<p role="alert" className="mb-3 text-sm text-rose-700">{documentError}</p>}{documents.length===0&&!documentsLoading?<p className="text-sm text-slate-500">No submitted documents found for the latest application.</p>:null}<div className="grid gap-3 md:grid-cols-2">{documents.map(doc=><article key={doc.id} className="rounded-xl border border-slate-200 p-4"><h4 className="font-bold text-[#111A43]">{doc.original_filename||doc.document_type}</h4><p className="mt-1 text-xs text-slate-500">{doc.document_type} · {doc.review_status}</p>{doc.review_note&&<p className="mt-2 text-sm text-slate-600">Review note: {doc.review_note}</p>}<div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>viewDocument(doc.id)} className="rounded-lg border px-3 py-2 text-sm font-semibold">View document</button><button type="button" disabled={documentSaving!==null} onClick={()=>reviewDocument(doc.id,'verified')} className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Verify</button><button type="button" disabled={documentSaving!==null} onClick={()=>reviewDocument(doc.id,'rejected')} className="rounded-lg bg-rose-700 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">Reject</button></div><textarea aria-label={'Review note for '+doc.original_filename} value={documentNote[doc.id]||''} onChange={event=>setDocumentNote(previous=>({...previous,[doc.id]:event.target.value}))} rows={2} placeholder="Add a review note; required when rejecting" className="mt-3 w-full rounded-lg border border-slate-300 p-2 text-sm"/></article>)}</div></section>}
        {activeProfileTab==='Applications'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="mb-3 text-base font-extrabold text-[#111A43]">Programme applications</h3>{detailApplications.length?<div className="space-y-3">{detailApplications.map(app=><article key={app.id} className="rounded-xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><h4 className="font-bold text-[#111A43]">{app.programme||'Programme not specified'}</h4><p className="font-mono text-xs text-slate-500">{app.reference_number||'No reference assigned'} · {app.academic_session||'Session not specified'}</p></div>{getStatusBadge(applicationStatus(String(app.status||'')))}</div><p className="mt-2 text-xs text-slate-500">Submitted: {displayValue(app.submitted_at)}</p><div className="mt-3 grid gap-3 sm:grid-cols-2">{Object.entries(app.form_data||{}).map(([key,value])=><div key={key}><p className="text-xs font-semibold uppercase text-slate-500">{key.replace(/([A-Z])/g,' $1').replace(/_/g,' ')}</p><p className="mt-1 break-words text-sm text-slate-800">{displayValue(value)}</p></div>)}</div></article>)}</div>:<p className="text-sm text-slate-500">No programme applications have been submitted.</p>}</section>}
        {activeProfileTab==='Payments'&&<section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5"><h3 className="mb-2 text-base font-extrabold text-[#111A43]">Payment records</h3><p className="text-sm text-slate-600">Payment history is managed in the Finance module. This student profile does not currently have a dedicated student-payment detail endpoint, so no payment amounts are shown here rather than displaying incomplete or invented figures.</p></section>}
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-1.5 overflow-hidden">
      {/* Header */}
      <div className="flex shrink-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center justify-between gap-2"><h1 className="text-xl sm:text-2xl font-extrabold leading-tight text-[#111A43] tracking-tight">Student Management</h1><button type="button" aria-label="Refresh student records" title="Refresh student records" disabled={apiLoading} onClick={()=>setReload(n=>n+1)} className="shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-[#111A43] hover:bg-slate-50 disabled:opacity-50"><RotateCcw size={17} className={apiLoading?'animate-spin':''}/></button></div>
          <p className="truncate text-[10px] leading-tight text-slate-500 sm:text-xs">Manage students, admissions, applications and documents</p>
        </div>
        <div className="hidden items-center gap-2 sm:flex sm:flex-wrap">
          <span className="hidden" aria-hidden="true"/>
          <button type="button" onClick={exportApplications} disabled={apiLoading||Boolean(apiError)||filteredStudents.length===0} className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 shadow-sm transition-all disabled:opacity-40">
            <Download size={14} className="text-slate-500" />
            Export
          </button>
          <span className="text-xs text-slate-500">Select a student to open the full profile</span>
        </div>
      </div>

      <div className="grid max-h-[20dvh] shrink-0 grid-cols-2 gap-1.5 sm:grid-cols-5" aria-label="Live student directory summary">
        {[{label:'Registered students',value:students.length,icon:Users},{label:'Applications',value:applicationCount,icon:FileText},{label:'Admitted',value:students.filter(s=>s.status==='Admitted').length,icon:UserCheck},{label:'Pending review',value:students.filter(s=>s.status==='Pending').length,icon:ClipboardCheck},{label:'Awaiting documents',value:students.filter(s=>s.status==='Awaiting Docs').length,icon:FolderOpen}].map(item=>(
          <div key={item.label} className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5">
            <div className="flex items-center justify-between gap-1"><p className="text-base font-bold leading-none text-[#111A43]">{apiLoading?<span className="block h-4 w-9 animate-pulse rounded bg-slate-200" aria-label="Loading"/>:item.value}</p><item.icon size={16} className="shrink-0 text-[#C62839]"/></div>
            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-600" title={item.label}>{item.label}</p>
          </div>
        ))}
      </div>

      {/* Search and Filters Bar */}
      <div className="shrink-0 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm flex flex-row items-center gap-1.5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, application ID, phone, email..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#111A43]/20"
          />
        </div>

        <button type="button" aria-label="Open student filters" onClick={()=>setFilterOpen(true)} className="md:hidden shrink-0 rounded-xl border border-slate-200 p-2 text-[#111A43]"><Filter size={18}/></button>
        
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Programmes">Programme: All Programmes</option>
              <option value="IJMB">IJMB</option>
              <option value="JAMB">JAMB</option>
              <option value="WAEC">WAEC</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Status">Status: All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Pending">Pending</option>
              <option value="Awaiting Docs">Awaiting Docs</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
              <option value="Not Applied">Not Applied</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Years">Year: All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>


          <button type="button" onClick={()=>{setSelectedProgramme('All Programmes');setSelectedStatus('All Status');setSelectedYear('All Years');setSearchFilter('');}} className="rounded-lg border px-3 py-2 text-xs">Reset</button>
        </div>
      </div>

      {filterOpen&&<div className="fixed inset-0 z-[80] md:hidden"><button type="button" aria-label="Close filters" onClick={()=>setFilterOpen(false)} className="absolute inset-0 w-full bg-slate-900/50"/><section role="dialog" aria-modal="true" aria-label="Filter students" className="absolute bottom-0 left-0 right-0 rounded-t-2xl bg-white p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-[#111A43]">Filter students</h2><button type="button" onClick={()=>setFilterOpen(false)} aria-label="Close"><X size={20}/></button></div><div className="flex flex-col gap-3">          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedProgramme}
              onChange={(e) => setSelectedProgramme(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Programmes">Programme: All Programmes</option>
              <option value="IJMB">IJMB</option>
              <option value="JAMB">JAMB</option>
              <option value="WAEC">WAEC</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Status">Status: All Status</option>
              <option value="Admitted">Admitted</option>
              <option value="Pending">Pending</option>
              <option value="Awaiting Docs">Awaiting Docs</option>
              <option value="Suspended">Suspended</option>
              <option value="Rejected">Rejected</option>
              <option value="Not Applied">Not Applied</option>
            </select>
          </div>

          <div className="text-xs font-medium text-slate-600 flex-1 min-w-[120px]">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
            >
              <option value="All Years">Year: All Years</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
            </select>
          </div>

</div><div className="mt-5 flex gap-2"><button type="button" onClick={()=>{setSelectedProgramme('All Programmes');setSelectedStatus('All Status');setSelectedYear('All Years');}} className="flex-1 rounded-xl border px-4 py-3 text-sm">Reset</button><button type="button" onClick={()=>setFilterOpen(false)} className="flex-1 rounded-xl bg-[#111A43] px-4 py-3 text-sm font-bold text-white">Show {filteredStudents.length} results</button></div></section></div>}
      {/* Main Two-Column Layout */}
      <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 gap-2 overflow-hidden">
        {/* Left Column: Student Directory Table */}
        <div className="min-w-0 min-h-0 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto md:hidden divide-y divide-slate-100">
            {apiLoading&&Array.from({length:6},(_,i)=><div key={i} className="flex animate-pulse items-center gap-3 px-3 py-3" aria-label="Loading student"><div className="h-10 w-10 shrink-0 rounded-full bg-slate-200"/><div className="flex-1 space-y-2"><div className="h-3 w-2/3 rounded bg-slate-200"/><div className="h-2 w-1/2 rounded bg-slate-100"/></div></div>)}
            {visibleStudents.map(student=><div key={student.accountId} onClick={()=>{openStudent(student);}} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter'){openStudent(student);}}} className={`flex cursor-pointer items-center gap-3 border-l-4 px-3 py-3 ${selectedStudent?.accountId===student.accountId?'border-[#C62839] bg-rose-50':'border-transparent bg-white'}`}>
              {student.avatar?<img src={student.avatar} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover"/>:<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[#111A43]"><Users size={18}/></span>}
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#111A43]">{student.name}</p><button type="button" onClick={e=>{e.stopPropagation();navigator.clipboard.writeText(student.appId).then(()=>notifyAdmin('Application ID copied','success')).catch(()=>notifyAdmin('Unable to copy ID','error'));}} className="mt-1 block max-w-full truncate text-left font-mono text-[11px] text-slate-500" title="Tap to copy application ID">{student.appId} · Copy</button></div>
              <div className="shrink-0 text-right">{getStatusBadge(student.status)}<ChevronRight size={15} className="ml-auto mt-1 text-slate-400"/></div>
            </div>)}
            {!apiLoading&&visibleStudents.length===0&&<p className="p-6 text-center text-sm text-slate-500">No matching student records.</p>}
          </div>
          <div className="hidden min-h-0 flex-1 overflow-auto overscroll-contain md:block">
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
                {apiLoading&&Array.from({length:7},(_,i)=><tr key={`skeleton-${i}`} className="animate-pulse">{Array.from({length:8},(_,j)=><td key={j} className="px-3 py-4"><div className="h-3 rounded bg-slate-200"/></td>)}</tr>)}
                {visibleStudents.map((s, index) => {
                  const isChecked = checkedIds.includes(s.id);
                  const isSelected = false;
                  return (
                    <tr
                      key={s.id}
                      onClick={() => {
                        openStudent(s);
                      }}
                      className={`cursor-pointer border-l-4 transition-colors ${
                        isSelected ? 'border-[#C62839] bg-rose-50' : 'border-transparent hover:bg-slate-50'
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
                        {s.avatar?<img src={s.avatar} alt="" className="w-8 h-8 rounded-full object-cover mx-auto ring-1 ring-slate-200"/>:<span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"><Users size={15}/></span>}
                      </td>
                      <td className="py-3 px-3 font-semibold text-[#111A43] whitespace-nowrap">{s.name}</td>
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.appId}</td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{s.programme}</td>
                      <td className="py-3 px-3">{getStatusBadge(s.status)}</td>
                      <td className="py-3 px-2 text-slate-500">{s.year}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{s.phone}</td>
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button type="button" title="Open student profile" aria-label={'Open '+s.name+' profile'} onClick={()=>openStudent(s)} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-[#111A43]">
                          <Eye size={15} />
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

      </div>
    </div>
  );
}