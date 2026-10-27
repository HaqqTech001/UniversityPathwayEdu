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
  useEffect(()=>{
    setApplicationDetail(null);setDetailError('');
    if(!selectedStudent)return;
    const controller=new AbortController();
    setDetailLoading(true);
    const token=sessionStorage.getItem('upec_staff_token');
    fetch((import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\\/$/,'')+'/api/staff/applications/'+encodeURIComponent(selectedStudent.studentId),{
      headers:{Authorization:'Bearer '+token},signal:controller.signal
    }).then(async response=>{const data=await response.json();if(!response.ok)throw Error(data.error||'Unable to load application details.');return data;})
      .then(data=>{if(!controller.signal.aborted)setApplicationDetail(data);})
      .catch(error=>{if(!controller.signal.aborted)setDetailError(error instanceof Error?error.message:'Unable to load details.');})
      .finally(()=>{if(!controller.signal.aborted)setDetailLoading(false);});
    return()=>controller.abort();
  },[selectedStudent]);
  const [checkedIds, setCheckedIds] = useState<number[]>([]);
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
    <div className="space-y-6">
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

      {/* 5 KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <Users size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-[#111A43] leading-none">1,248</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Students</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">vs last session</span></p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0 shadow-sm">
            <FileText size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-[#111A43] leading-none">86</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">New Applications</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">↑ 8% <span className="font-normal text-slate-400">Pending Review: 28</span></p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-sm">
            <GraduationCap size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-[#111A43] leading-none">1,142</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Admitted Students</p>
            <p className="text-[11px] font-bold text-emerald-600 mt-0.5">91.5% <span className="font-normal text-slate-400">Acceptance Rate</span></p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <FolderCheck size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-[#111A43] leading-none">48</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Pending Documents</p>
            <p className="text-[11px] font-bold text-amber-600 mt-0.5">Needs Review</p>
          </div>
        </div>

        {/* Card 5 */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm">
            <UserX size={22} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-black text-[#111A43] leading-none">12</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Suspended Students</p>
            <p className="text-[11px] font-bold text-rose-600 mt-0.5">0.9% <span className="font-normal text-slate-400">of total</span></p>
          </div>
        </div>
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Student Directory Table */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${drawerOpen ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
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
                {filteredStudents.map((s, index) => {
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
                      <td className="py-3 px-2 text-center text-slate-400 font-medium">{index + 1}</td>
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

          {/* Table Pagination */}
          <div className="p-3.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">1 - 10</span> of <span className="font-semibold text-slate-700">1,248</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-[#111A43] text-white font-bold text-xs flex items-center justify-center shadow-sm">1</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">5</button>
              <span className="text-slate-400">...</span>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">125</button>
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600">
                <option>10 per page</option>
                <option>25 per page</option>
                <option>50 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Student Profile Details Drawer */}
        {drawerOpen && selectedStudent && (
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 relative">
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
