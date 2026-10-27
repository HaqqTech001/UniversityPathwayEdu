import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Users,
  HardDrive,
  Plus,
  Upload,
  Search,
  Filter,
  RotateCcw,
  MoreVertical,
  MoreHorizontal,
  Eye,
  Edit2,
  X,
  FileCode,
  Image as ImageIcon,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

interface ResourceItem {
  id: number;
  title: string;
  subject: string;
  programme: 'JAMB' | 'IJMB' | 'WAEC';
  type: 'PDF' | 'Video' | 'Document' | 'Image';
  uploadedBy: string;
  date: string;
  downloads: string;
  status: 'Published' | 'Draft';
  fileSize: string;
  pages?: number;
}

const mockResources: ResourceItem[] = [
  {
    id: 1,
    title: 'JAMB 2024 Mathematics Past Questions',
    subject: 'Mathematics',
    programme: 'JAMB',
    type: 'PDF',
    uploadedBy: 'Dr. Ahmed',
    date: '12 Jul 2025',
    downloads: '1,245',
    status: 'Published',
    fileSize: '8.4 MB',
    pages: 124,
  },
  {
    id: 2,
    title: 'IJMB Economics Lecture Notes',
    subject: 'Economics',
    programme: 'IJMB',
    type: 'PDF',
    uploadedBy: 'Mrs. Bello',
    date: '10 Jul 2025',
    downloads: '892',
    status: 'Published',
    fileSize: '5.2 MB',
    pages: 64,
  },
  {
    id: 3,
    title: 'WAEC English Language Past Questions',
    subject: 'English',
    programme: 'WAEC',
    type: 'PDF',
    uploadedBy: 'Mr. Yusuf',
    date: '08 Jul 2025',
    downloads: '1,632',
    status: 'Published',
    fileSize: '11.0 MB',
    pages: 140,
  },
  {
    id: 4,
    title: 'Introduction to Physics (Full Lecture)',
    subject: 'Physics',
    programme: 'IJMB',
    type: 'Video',
    uploadedBy: 'Dr. Salim',
    date: '06 Jul 2025',
    downloads: '980',
    status: 'Published',
    fileSize: '185 MB',
  },
  {
    id: 5,
    title: 'Chemical Reactions Summary Notes',
    subject: 'Chemistry',
    programme: 'JAMB',
    type: 'PDF',
    uploadedBy: 'Dr. Ibrahim',
    date: '05 Jul 2025',
    downloads: '756',
    status: 'Published',
    fileSize: '4.1 MB',
    pages: 38,
  },
  {
    id: 6,
    title: 'Biology Practical Guide',
    subject: 'Biology',
    programme: 'WAEC',
    type: 'Document',
    uploadedBy: 'Mrs. Ahmed',
    date: '03 Jul 2025',
    downloads: '621',
    status: 'Published',
    fileSize: '3.6 MB',
    pages: 45,
  },
  {
    id: 7,
    title: 'Economics Charts & Diagrams',
    subject: 'Economics',
    programme: 'JAMB',
    type: 'Image',
    uploadedBy: 'Mr. Lawal',
    date: '01 Jul 2025',
    downloads: '435',
    status: 'Published',
    fileSize: '2.8 MB',
  },
];

export default function AdminResourcesPage() {
  const [activeTab, setActiveTab] = useState('All Resources');
  const [selectedProgramme, setSelectedProgramme] = useState('All Programmes');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [selectedType, setSelectedType] = useState('All Types');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceItem>(mockResources[0]);
  const [previewOpen, setPreviewOpen] = useState(true);

  const filteredResources = mockResources.filter((r) => {
    if (selectedProgramme !== 'All Programmes' && r.programme !== selectedProgramme) return false;
    if (selectedSubject !== 'All Subjects' && r.subject !== selectedSubject) return false;
    if (selectedType !== 'All Types' && r.type !== selectedType) return false;
    if (
      searchFilter &&
      !r.title.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !r.subject.toLowerCase().includes(searchFilter.toLowerCase()) &&
      !r.uploadedBy.toLowerCase().includes(searchFilter.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getTypeBadge = (type: ResourceItem['type']) => {
    switch (type) {
      case 'PDF':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">PDF</span>;
      case 'Video':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Video</span>;
      case 'Document':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">Document</span>;
      case 'Image':
        return <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Image</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111A43] tracking-tight">Learning Resources</h1>
          <p className="text-sm text-slate-500 mt-1">Manage study materials, past questions, lecture notes, videos and other learning resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-sm text-xs">
            <BookOpen size={15} className="text-[#111A43]" />
            <div>
              <p className="font-bold text-[#111A43]">All Programmes</p>
              <p className="text-[10px] text-slate-400">View Resources</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-[#C62839] hover:bg-[#b02232] text-white rounded-xl shadow-md transition-all">
            <Plus size={15} />
            Upload Resource &gt;
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#111A43] flex items-center justify-center text-white shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">1,842</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Resources</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 12% <span className="font-normal text-slate-400">All Programmes</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#C62839] flex items-center justify-center text-white shrink-0">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">256</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Past Questions</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 8% <span className="font-normal text-slate-400">Across Subjects</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-amber-500 flex items-center justify-center text-white shrink-0">
            <Video size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">348</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Lecture Videos</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 15% <span className="font-normal text-slate-400">Total Videos</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">782</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Notes &amp; PDFs</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 10% <span className="font-normal text-slate-400">Study Materials</span></p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">24</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Contributors</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Active Lecturers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
            <Download size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-[#111A43] leading-none">12.6K</p>
            <p className="text-xs font-bold text-slate-700 mt-1">Total Downloads</p>
            <p className="text-[10px] font-semibold text-emerald-600 mt-0.5">↑ 18% <span className="font-normal text-slate-400">This Session</span></p>
          </div>
        </div>
      </div>

      {/* Subtabs Bar */}
      <div className="border-b border-slate-200 bg-white px-3 rounded-t-2xl shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-slate-500 no-scrollbar">
          {['All Resources', 'Past Questions', 'Lecture Notes', 'Video Lectures', 'Assignments', 'Books & References'].map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
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

      {/* Search & Filters */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, subject, programme or uploader..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <select
            value={selectedProgramme}
            onChange={(e) => setSelectedProgramme(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Programmes">Programme: All Programmes</option>
            <option value="JAMB">JAMB</option>
            <option value="IJMB">IJMB</option>
            <option value="WAEC">WAEC</option>
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Subjects">Subject: All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="English">English</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Economics">Economics</option>
            <option value="Biology">Biology</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-600 focus:outline-none"
          >
            <option value="All Types">Resource Type: All Types</option>
            <option value="PDF">PDF</option>
            <option value="Video">Video</option>
            <option value="Document">Document</option>
            <option value="Image">Image</option>
          </select>

          <button className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-[#111A43] text-white rounded-xl hover:bg-[#1a275e]">
            <Filter size={13} />
            Filter
          </button>

          <button
            onClick={() => {
              setSelectedProgramme('All Programmes');
              setSelectedSubject('All Subjects');
              setSelectedType('All Types');
              setSearchFilter('');
            }}
            className="px-3 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Mid Section: Resources Table + Resource Preview Card */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Resources Table */}
        <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden ${previewOpen ? 'xl:col-span-7' : 'xl:col-span-12'}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3 px-3 w-8 text-center">#</th>
                  <th className="py-3 px-3">Title</th>
                  <th className="py-3 px-3">Subject</th>
                  <th className="py-3 px-2">Programme</th>
                  <th className="py-3 px-2 text-center">Type</th>
                  <th className="py-3 px-3">Uploaded By</th>
                  <th className="py-3 px-2">Date</th>
                  <th className="py-3 px-2 text-center">Downloads</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredResources.map((r, idx) => {
                  const isSelected = selectedResource.id === r.id;
                  return (
                    <tr
                      key={r.id}
                      onClick={() => {
                        setSelectedResource(r);
                        setPreviewOpen(true);
                      }}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-rose-50/40' : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                      <td className="py-3 px-3 font-semibold text-[#111A43] whitespace-nowrap">{r.title}</td>
                      <td className="py-3 px-3 text-slate-600">{r.subject}</td>
                      <td className="py-3 px-2 font-bold text-slate-700">{r.programme}</td>
                      <td className="py-3 px-2 text-center">{getTypeBadge(r.type)}</td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{r.uploadedBy}</td>
                      <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{r.date}</td>
                      <td className="py-3 px-2 text-center font-bold text-[#111A43]">{r.downloads}</td>
                      <td className="py-3 px-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center" onClick={(e) => e.stopPropagation()}>
                        <button className="p-1 text-slate-400 hover:text-slate-600 rounded">
                          <MoreVertical size={14} />
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
              Showing <span className="font-semibold text-slate-700">1 - 7</span> of <span className="font-semibold text-slate-700">1,842</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 rounded-lg bg-[#111A43] text-white font-bold text-xs flex items-center justify-center">1</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">2</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">3</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">4</button>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">5</button>
              <span className="text-slate-400">...</span>
              <button className="w-6 h-6 rounded-lg hover:bg-slate-100 text-slate-600 text-xs flex items-center justify-center">264</button>
              <button className="p-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600">
                <ChevronRight size={14} />
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              <select className="border border-slate-200 rounded-lg px-2 py-1 text-xs bg-white text-slate-600">
                <option>7 per page</option>
                <option>15 per page</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Resource Preview Card */}
        {previewOpen && selectedResource && (
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 relative space-y-4">
            <button
              onClick={() => setPreviewOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2">
              <BookOpen size={16} className="text-[#111A43]" />
              <h3 className="text-sm font-bold text-[#111A43]">Resource Preview</h3>
            </div>

            {/* Document Cover / Canvas Mockup */}
            <div className="relative bg-[#08163B] rounded-xl overflow-hidden p-6 text-white text-center shadow-inner flex flex-col items-center justify-between min-h-[220px]">
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
                PDF
              </div>
              <div className="text-center pt-2">
                <div className="w-10 h-10 mx-auto rounded-lg bg-white/10 flex items-center justify-center border border-white/20 mb-2">
                  <span className="font-serif font-black text-xs text-[#D5A75B]">UPEC</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">University Pathway Educational Consult</p>
                <h4 className="text-base font-black tracking-tight mt-2 text-white leading-tight uppercase max-w-xs">
                  {selectedResource.title}
                </h4>
                <p className="text-[10px] text-amber-300 font-semibold mt-1">WITH COMPLETE SOLUTIONS &amp; EXPLANATIONS</p>
              </div>

              {/* Bottom Viewer Toolbar */}
              <div className="w-full flex items-center justify-between pt-4 border-t border-white/10 text-xs text-slate-300">
                <span className="text-[11px] font-mono">1 / {selectedResource.pages || 124}</span>
                <div className="flex items-center gap-3">
                  <button className="hover:text-white"><ZoomOut size={14} /></button>
                  <button className="hover:text-white"><ZoomIn size={14} /></button>
                  <button className="hover:text-white"><Maximize2 size={14} /></button>
                </div>
              </div>
            </div>

            {/* Title and Badge */}
            <div className="flex items-start justify-between gap-3 pt-1">
              <div>
                <h4 className="text-sm font-bold text-[#111A43] leading-snug">{selectedResource.title}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{selectedResource.programme} Academic Resource</p>
              </div>
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {selectedResource.status}
              </span>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-[11px]">Subject</span>
                <p className="font-semibold text-slate-700">{selectedResource.subject}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Programme</span>
                <p className="font-semibold text-slate-700">{selectedResource.programme}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Resource Type</span>
                <p className="font-semibold text-slate-700">{selectedResource.type} Document</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Uploaded By</span>
                <p className="font-semibold text-slate-700">{selectedResource.uploadedBy}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Date Uploaded</span>
                <p className="font-semibold text-slate-700">{selectedResource.date}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">Downloads</span>
                <p className="font-bold text-[#111A43]">{selectedResource.downloads}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[11px]">File Size</span>
                <p className="font-semibold text-slate-700">{selectedResource.fileSize}</p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-colors">
                <Download size={13} />
                Download
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                <Eye size={13} />
                View
              </button>
              <button className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-colors">
                <Edit2 size={13} />
                Edit
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 rounded-xl border border-slate-200">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Row: Recent Uploads + Most Downloaded + Storage Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Recent Uploads */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Recent Uploads</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { title: 'Physics Problem Set', type: 'PDF', subject: 'Physics', date: '14 Jul 2025' },
              { title: 'English Essay Guide', type: 'Document', subject: 'English', date: '13 Jul 2025' },
              { title: 'Chemistry Video Lecture', type: 'Video', subject: 'Chemistry', date: '12 Jul 2025' },
              { title: 'Economics Notes', type: 'PDF', subject: 'Economics', date: '11 Jul 2025' },
              { title: 'Biology Diagrams', type: 'Image', subject: 'Biology', date: '10 Jul 2025' },
            ].map((u, i) => (
              <div key={i} className="flex items-center justify-between pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-[#111A43] truncate">{u.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{u.subject}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">{u.type}</span>
                  <span className="text-[10px] text-slate-400">{u.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Downloaded Resources */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3.5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#111A43]">Most Downloaded Resources</h3>
            <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-2 px-2 w-6">#</th>
                  <th className="py-2 px-3">Title</th>
                  <th className="py-2 px-3">Subject</th>
                  <th className="py-2 px-3 text-right">Downloads</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { title: 'JAMB 2024 Mathematics', subject: 'Mathematics', downloads: '1,245' },
                  { title: 'WAEC English Past Questions', subject: 'English', downloads: '1,632' },
                  { title: 'IJMB Chemistry Notes', subject: 'Chemistry', downloads: '1,102' },
                  { title: 'Physics Full Lecture', subject: 'Physics', downloads: '980' },
                  { title: 'Economics Summary', subject: 'Economics', downloads: '892' },
                ].map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2.5 px-2 text-slate-400">{i + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#111A43] whitespace-nowrap">{item.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.subject}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-[#111A43]">{item.downloads}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Storage Usage */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive size={16} className="text-[#111A43]" />
              <h3 className="text-sm font-bold text-[#111A43]">Storage Usage</h3>
            </div>
            <button className="text-[11px] font-semibold text-blue-600 hover:text-blue-700">Manage</button>
          </div>

          {/* Donut representation */}
          <div className="flex flex-col items-center justify-center pt-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="4"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="42, 100"
                  strokeWidth="4"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-base font-black text-[#111A43]">4.2 GB</span>
                <p className="text-[9px] text-slate-400">of 10 GB Used</p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-slate-600">PDF Documents</span>
              </div>
              <span className="font-semibold text-slate-700">1.8 GB (43%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="text-slate-600">Videos</span>
              </div>
              <span className="font-semibold text-slate-700">1.2 GB (29%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="text-slate-600">Images</span>
              </div>
              <span className="font-semibold text-slate-700">0.6 GB (14%)</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-slate-600">Other Files</span>
              </div>
              <span className="font-semibold text-slate-700">0.6 GB (14%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
