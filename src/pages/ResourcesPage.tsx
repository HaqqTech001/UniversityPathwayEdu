import React, { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  BookOpen,
  Monitor,
  GraduationCap,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  FileCheck,
  Eye,
  X,
  HelpCircle,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

interface ResourceItem {
  id: string;
  title: string;
  category: 'jamb' | 'olevel' | 'alevel' | 'international' | 'timetable';
  categoryLabel: string;
  badgeColor: string;
  subject: string;
  fileFormat: 'PDF' | 'Interactive' | 'Document';
  fileSize: string;
  year: string;
  description: string;
  downloadsCount: number;
}

const resourcesList: ResourceItem[] = [
  {
    id: 'jamb-syllabus-2025',
    title: 'JAMB (UTME) Official Unified Syllabus & Book of Guidelines',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    badgeColor: 'text-[#c62839] bg-red-50 border-red-200',
    subject: 'All Subjects (Sciences, Arts & Commercial)',
    fileFormat: 'PDF',
    fileSize: '4.8 MB',
    year: '2025/2026',
    description: 'Comprehensive subject-by-subject topic outlines, compulsory text guides, and recommended reference textbooks approved by the board.',
    downloadsCount: 1420,
  },
  {
    id: 'jamb-english-compulsory',
    title: 'Compulsory JAMB English Novel Revision Notes & Chapter Questions',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    badgeColor: 'text-[#c62839] bg-red-50 border-red-200',
    subject: 'Use of English',
    fileFormat: 'PDF',
    fileSize: '2.1 MB',
    year: '2025/2026',
    description: 'Summary, key themes, character sketches, and 200 practice comprehension multiple-choice questions for the prescribed novel.',
    downloadsCount: 1890,
  },
  {
    id: 'waec-past-questions-sciences',
    title: 'WAEC (WASSCE) 5-Year Past Questions with Step-by-Step Marking Guides',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    subject: 'Mathematics, English, Physics, Chemistry & Biology',
    fileFormat: 'PDF',
    fileSize: '8.4 MB',
    year: '2020 – 2024',
    description: 'Theory and objective questions with detailed examiner marking rubrics, common student errors, and top-mark answer formulations.',
    downloadsCount: 2310,
  },
  {
    id: 'neco-formula-revision-sheet',
    title: 'NECO SSCE Comprehensive Science & Technical Formula Sheet',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    subject: 'Physics, Chemistry, Further Maths',
    fileFormat: 'PDF',
    fileSize: '1.9 MB',
    year: '2024/2025',
    description: 'A handy quick-reference compilation of all formulas, constants, chemical equations, and units essential for science examinations.',
    downloadsCount: 1140,
  },
  {
    id: 'jupeb-model-answers-science',
    title: 'JUPEB Direct Entry Model Examination Questions & Solutions',
    category: 'alevel',
    categoryLabel: 'A’Level (JUPEB/IJMB)',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    subject: 'Physics, Chemistry, Biology (PCB Subject Combo)',
    fileFormat: 'PDF',
    fileSize: '5.2 MB',
    year: '2023/2024',
    description: 'A-Level revision papers specifically aligned with the 200-level direct entry university curriculum in Nigerian federal universities.',
    downloadsCount: 890,
  },
  {
    id: 'cambridge-alevel-maths',
    title: 'Cambridge International A-Level Pure Mathematics Practice Papers',
    category: 'alevel',
    categoryLabel: 'A’Level (JUPEB/IJMB)',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    subject: 'Pure Mathematics 1 & Mechanics',
    fileFormat: 'PDF',
    fileSize: '3.7 MB',
    year: '2024',
    description: 'Past papers with structured step-by-step working, calculus proofs, and kinematics applications for overseas university entry.',
    downloadsCount: 650,
  },
  {
    id: 'ielts-band-8-study-kit',
    title: 'IELTS Academic Reading & Writing Task 1 & 2 Blueprint',
    category: 'international',
    categoryLabel: 'International Exams',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    subject: 'IELTS Academic Preparation',
    fileFormat: 'PDF',
    fileSize: '3.2 MB',
    year: '2025',
    description: 'Vocabulary bank, high-scoring essay structures, complex sentence templates, and graph analysis strategies targeting Band 7.5+.',
    downloadsCount: 975,
  },
  {
    id: 'sat-digital-math-blueprint',
    title: 'Digital SAT Math Diagnostic Drills & Desmos Calculator Strategies',
    category: 'international',
    categoryLabel: 'International Exams',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    subject: 'SAT Mathematics & Problem Solving',
    fileFormat: 'PDF',
    fileSize: '4.1 MB',
    year: '2024/2025',
    description: 'Adaptive testing techniques, Desmos graphing shortcuts, and algebra drill problem sets for university candidates targeting US colleges.',
    downloadsCount: 520,
  },
  {
    id: 'timetable-ilorin-cohort-q1',
    title: 'University Pathway 2025 Academic Master Timetable (Ilorin Center)',
    category: 'timetable',
    categoryLabel: 'Timetables & Guides',
    badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
    subject: 'Morning, Afternoon & Evening Batches',
    fileFormat: 'PDF',
    fileSize: '1.2 MB',
    year: 'Current Term',
    description: 'Official schedule for all physical coaching batches, Saturday intensive mock testing, and teacher consultation hours.',
    downloadsCount: 3100,
  },
];

export default function ResourcesPage({ onNavigate }: PageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewItem, setPreviewItem] = useState<ResourceItem | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [requestForm, setRequestForm] = useState({
    name: '',
    phone: '',
    exam: 'JAMB (UTME)',
    details: '',
  });

  const filteredResources = resourcesList.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleDownloadSimulation = (item: ResourceItem) => {
    setDownloadSuccessMessage(`Preparing "${item.title}" for download... Saved to your device downloads.`);
    setTimeout(() => {
      setDownloadSuccessMessage(null);
    }, 4500);
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestForm.name || !requestForm.phone || !requestForm.details) return;
    setRequestSent(true);
    setTimeout(() => {
      setRequestSent(false);
      setRequestForm({ name: '', phone: '', exam: 'JAMB (UTME)', details: '' });
    }, 4000);
  };

  return (
    <main className="w-full bg-white text-[#0b1a42]">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/resources_hero.jpg"
            alt="University Pathway Library and Study Resource Centre"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#f0bb5b]">Resources</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Academic Resources &amp; Practice Tools
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Empowering students with verified examination syllabuses, model past papers, formula blueprints, and computerized CBT mock simulators.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED CBT SIMULATOR CARD
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#111f4d] to-[#08163b] border border-white/10 p-6 sm:p-8 text-white shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#c62839] flex items-center justify-center shrink-0 shadow-lg shadow-[#c62839]/30">
              <Monitor size={28} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f0bb5b]">
                  Interactive CBT Platform
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold mt-1 text-white">
                Practice With Our Computer-Based Test Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                Experience real UTME exam conditions with timed 60-question sets, instant grading, answer explanations, and subject combination tracking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/student')}
            className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg shadow-[#c62839]/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch CBT Simulator</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Download toast notification */}
      {downloadSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-[#0b1a42] text-white border border-[#d5a75b] p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <p className="text-xs leading-relaxed font-medium">{downloadSuccessMessage}</p>
        </div>
      )}

      {/* =========================================================================
          RESOURCE FILTER & SEARCH SECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {[
              { id: 'all', label: 'All Resources' },
              { id: 'jamb', label: 'JAMB (UTME)' },
              { id: 'olevel', label: 'WAEC / NECO' },
              { id: 'alevel', label: 'JUPEB / IJMB' },
              { id: 'international', label: 'IELTS / SAT' },
              { id: 'timetable', label: 'Timetables' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === tab.id
                    ? 'bg-[#0b1a42] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject or keyword..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0b1a42] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b1a42] bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${item.badgeColor}`}>
                    {item.categoryLabel}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <FileText size={12} />
                    {item.fileFormat} • {item.fileSize}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-[#0b1a42] group-hover:text-[#c62839] transition-colors leading-snug">
                  {item.title}
                </h3>

                {/* Subject */}
                <p className="text-xs font-semibold text-[#d5a75b] mt-1.5">
                  {item.subject}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {item.description}
                </p>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">
                  {item.year} • {item.downloadsCount.toLocaleString()} downloads
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0b1a42] transition-colors"
                    title="Quick preview"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadSimulation(item)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <AlertCircle size={36} className="mx-auto text-slate-400 mb-3" />
            <h4 className="text-base font-bold text-[#0b1a42]">No matching resources found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              We couldn’t find resources matching "{searchQuery}". Try searching another subject or clear filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#0b1a42] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          REQUEST A SPECIFIC MATERIAL & CONSULTATION SECTION
          ========================================================================= */}
      <section className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="rounded-2xl bg-white border border-slate-200 p-8 sm:p-10 shadow-lg grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-5">
              <span className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                <span className="w-5 h-0.5 bg-[#c62839]" />
                LIBRARY ASSISTANCE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0b1a42] mt-2 leading-tight">
                Can’t Find What You Need?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                Our academic resource team in Ilorin can assist with specific past questions, syllabus clarifications, or university cut-off guidelines.
              </p>
              <div className="mt-6 space-y-2 text-xs text-slate-500">
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Free for all enrolled University Pathway students
                </p>
                <p className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Fast response within 24 operational hours
                </p>
              </div>
            </div>

            <div className="md:col-span-7">
              {requestSent ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                  <CheckCircle2 size={36} className="mx-auto text-emerald-600 mb-2" />
                  <h4 className="text-base font-bold text-emerald-900">Request Received!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Thank you, {requestForm.name}. Our academic officer will verify availability and contact you on {requestForm.phone}.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={requestForm.name}
                        onChange={(e) => setRequestForm({ ...requestForm, name: e.target.value })}
                        placeholder="e.g. Amina Bello"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">Phone Number</label>
                      <input
                        type="tel"
                        required
                        value={requestForm.phone}
                        onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                        placeholder="e.g. 09133903600"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1">Examination Category</label>
                    <select
                      value={requestForm.exam}
                      onChange={(e) => setRequestForm({ ...requestForm, exam: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                    >
                      <option value="JAMB (UTME)">JAMB (UTME)</option>
                      <option value="WAEC (WASSCE)">WAEC (WASSCE)</option>
                      <option value="NECO SSCE">NECO SSCE</option>
                      <option value="NABTEB">NABTEB</option>
                      <option value="JUPEB / IJMB">JUPEB / IJMB (A'Level)</option>
                      <option value="IELTS / TOEFL">IELTS / TOEFL</option>
                      <option value="SAT / GRE / GMAT">SAT / GRE / GMAT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1">Details of Material Needed</label>
                    <textarea
                      required
                      rows={3}
                      value={requestForm.details}
                      onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                      placeholder="e.g. Need 2021-2023 WAEC Physics Practical marking guide and specimen analysis..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors"
                  >
                    Submit Material Request
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PREVIEW MODAL
          ========================================================================= */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${previewItem.badgeColor}`}>
                {previewItem.categoryLabel}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{previewItem.year}</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#0b1a42] leading-snug">
              {previewItem.title}
            </h3>
            <p className="text-xs font-semibold text-[#d5a75b] mt-1">{previewItem.subject}</p>

            <div className="my-5 p-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-2 text-slate-700">
              <p className="leading-relaxed">{previewItem.description}</p>
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                <span>File Format: <strong>{previewItem.fileFormat}</strong></span>
                <span>File Size: <strong>{previewItem.fileSize}</strong></span>
                <span>Verified by: <strong>Academic Board</strong></span>
                <span>Center: <strong>Ilorin Kwara State</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDownloadSimulation(previewItem);
                  setPreviewItem(null);
                }}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors"
              >
                <Download size={14} />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
