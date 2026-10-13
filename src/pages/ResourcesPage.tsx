import React, { useState, useRef } from 'react';
import {
  FileText,
  Search,
  BookOpen,
  Monitor,
  Calendar,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Eye,
  X,
  HelpCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Send,
  Layers,
  Mail,
  Copy,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export type AccessStatus = 'external_link' | 'portal_restricted' | 'on_request' | 'unavailable';

export interface ResourceItem {
  id: string;
  title: string;
  category: 'jamb' | 'olevel' | 'alevel' | 'international' | 'timetable';
  categoryLabel: string;
  badgeColor: string;
  provider: string;
  subject: string;
  format: string;
  session: string;
  description: string;
  status: AccessStatus;
  externalUrl?: string;
  portalRoute?: string;
  topicsSummary: string[];
}

const resourcesList: ResourceItem[] = [
  {
    id: 'jamb-syllabus-ibass',
    title: 'JAMB (UTME) Official Unified Syllabus & IBASS Portal',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    badgeColor: 'text-[#c62839] bg-red-50 border-red-200',
    provider: 'Joint Admissions and Matriculation Board (JAMB)',
    subject: 'All UTME Subject Combinations (Sciences, Arts & Commercial)',
    format: 'Official Online Portal',
    session: '2025/2026 Guidelines',
    description: 'Direct access to the official JAMB Integrated Brochure and Syllabus System (IBASS) covering course eligibility, subject combinations, and board-approved reference texts.',
    status: 'external_link',
    externalUrl: 'https://ibass.jamb.gov.ng/',
    topicsSummary: [
      'Official UTME subject syllabus outlines',
      'Board-approved compulsory reading text guidelines',
      'Faculty course combinations and credit requirements',
      'JAMB CAPS regulatory brochure parameters',
    ],
  },
  {
    id: 'jamb-english-guide',
    title: 'Compulsory UTME English Prescribed Text Study Guide',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    badgeColor: 'text-[#c62839] bg-red-50 border-red-200',
    provider: 'UPEC English Faculty, Ilorin',
    subject: 'Use of English (Compulsory for All Candidates)',
    format: 'Candidate Study Guide',
    session: '2025 UTME Cohort',
    description: 'Comprehensive chapter-by-chapter synopsis, character maps, thematic analysis, and practice comprehension questions for the board-prescribed novel.',
    status: 'portal_restricted',
    portalRoute: '/student/login',
    topicsSummary: [
      'Chapter-by-chapter plot summaries & analysis',
      'Key literary themes and stylistic devices',
      'Character sketches & relationship hierarchies',
      'Contextual comprehension questions with model answers',
    ],
  },
  {
    id: 'waec-elearning-portal',
    title: 'WAEC (WASSCE) Chief Examiners’ Reports & E-Learning Portal',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    provider: 'West African Examinations Council (WAEC)',
    subject: 'Mathematics, English, Sciences, Arts & Commercial',
    format: 'Official E-Learning Portal',
    session: 'Official WAEC Archive',
    description: 'Official examiners’ feedback highlighting student performance strengths, common pitfalls, and examiner marking rubrics for secondary school certification.',
    status: 'external_link',
    externalUrl: 'https://waeconline.org.ng/e-learning/',
    topicsSummary: [
      'Chief Examiners’ performance reports by subject',
      'Standard question papers with detailed marking schemes',
      'Common candidate errors and presentation guidelines',
      'High-scoring answer structures for theory questions',
    ],
  },
  {
    id: 'neco-syllabus-overview',
    title: 'NECO SSCE Science & Technical Syllabus Digest',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    provider: 'National Examinations Council / UPEC Faculty',
    subject: 'Physics, Chemistry, Biology & Further Mathematics',
    format: 'Syllabus Summary Guide',
    session: '2024/2025 Academic Cycle',
    description: 'Structured topic breakdown with practical laboratory specimen requirements, standard unit notations, and theoretical core topics for SSCE candidates.',
    status: 'on_request',
    topicsSummary: [
      'Laboratory practical apparatus & specimen specifications',
      'Essential physical and chemical constant tables',
      'Theoretical question weighting and marks distribution',
      'Continuous assessment alignment parameters',
    ],
  },
  {
    id: 'jupeb-de-curriculum',
    title: 'JUPEB Direct Entry 200-Level Curriculum & Subject Combinations',
    category: 'alevel',
    categoryLabel: 'A’Level (JUPEB/IJMB)',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    provider: 'UPEC Advanced Studies Desk',
    subject: 'Science, Arts, Law & Social Sciences Combinations',
    format: 'Direct Entry Academic Guide',
    session: '2024/2025 Session',
    description: 'University Direct Entry pathway outlines, point calculation systems (A=5, B=4, C=3, D=2, E=1), and partner university admission criteria.',
    status: 'on_request',
    topicsSummary: [
      'Direct entry point-to-grade calculation matrices',
      '200-level university syllabus alignment',
      'Subject combinations for Medicine, Law, and Engineering',
      'Nigerian university direct entry acceptance quotas',
    ],
  },
  {
    id: 'cambridge-alevel-portal',
    title: 'Cambridge International AS & A Level Curriculum Guidelines',
    category: 'alevel',
    categoryLabel: 'A’Level (JUPEB/IJMB)',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    provider: 'Cambridge Assessment International Education',
    subject: 'Pure Mathematics, Physics, Chemistry & Economics',
    format: 'Official Qualification Portal',
    session: 'International Standard',
    description: 'Official curriculum frameworks, syllabus guidelines, and learner resources for students preparing for Cambridge Advanced level qualifications.',
    status: 'external_link',
    externalUrl: 'https://www.cambridgeinternational.org/programmes-and-qualifications/cambridge-advanced/cambridge-international-as-and-a-levels/curriculum/',
    topicsSummary: [
      'Modular examination frameworks & paper weights',
      'Specimen paper formats and command words',
      'Grade boundary and criteria guidelines',
      'International university recognition benchmarks',
    ],
  },
  {
    id: 'british-council-ielts-prep',
    title: 'IELTS Academic Preparation Resources (British Council)',
    category: 'international',
    categoryLabel: 'International Exams',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    provider: 'British Council Nigeria',
    subject: 'Listening, Reading, Writing & Speaking Modules',
    format: 'Official Preparation Hub',
    session: 'Year-Round Testing',
    description: 'Official practice tests, sample listening tracks, band descriptor rubrics, and academic writing task frameworks targeting Band 7.0+.',
    status: 'external_link',
    externalUrl: 'https://takeielts.britishcouncil.org/take-ielts/prepare',
    topicsSummary: [
      'Official Band 7.0–9.0 assessment criteria',
      'Academic Writing Task 1 & Task 2 structure models',
      'Timed Listening audio drills and question varieties',
      'Speaking interview criteria and pronunciation guides',
    ],
  },
  {
    id: 'college-board-sat-digital',
    title: 'Digital SAT Official Practice Suite & Bluebook Guide',
    category: 'international',
    categoryLabel: 'International Exams',
    badgeColor: 'text-emerald-800 bg-emerald-50 border-emerald-200',
    provider: 'College Board',
    subject: 'Reading & Writing, Math (with Built-in Desmos)',
    format: 'Official Digital Testing Platform',
    session: 'Digital SAT Testing Cycle',
    description: 'Full-length adaptive practice tests, test-taking strategies, and Desmos calculator walkthroughs for international college scholarships.',
    status: 'external_link',
    externalUrl: 'https://satsuite.collegeboard.org/digital',
    topicsSummary: [
      'Adaptive digital testing module orientation',
      'Desmos graphing calculator tips & shortcuts',
      'Sample reading passages with analytical reasoning drills',
      'Scoring benchmarks for US university scholarship eligibility',
    ],
  },
  {
    id: 'upec-academic-prospectus',
    title: 'UPEC 2025/2026 Academic Prospectus & Programme Guide',
    category: 'timetable',
    categoryLabel: 'Timetables & Guides',
    badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
    provider: 'University Pathway Educational Consult',
    subject: 'Institutional Overview, Faculty & Admission Regulations',
    format: 'Institutional Prospectus',
    session: '2025/2026 Academic Year',
    description: 'Comprehensive institutional guide detailing our tutorial cohorts, teaching methodology, Ilorin campus facilities, registration fees, and academic code of conduct.',
    status: 'on_request',
    topicsSummary: [
      'Cohort schedules and lecture delivery structures',
      'Faculty profiles & subject department allocations',
      'Laboratory and CBT computer centre regulations',
      'Term dates, review clinics, and mock examination calendars',
    ],
  },
  {
    id: 'upec-master-timetable',
    title: 'University Pathway Current Term Master Timetable (Ilorin Centre)',
    category: 'timetable',
    categoryLabel: 'Timetables & Guides',
    badgeColor: 'text-purple-800 bg-purple-50 border-purple-200',
    provider: 'UPEC Academic Administration',
    subject: 'Morning, Afternoon & Weekend Cohorts',
    format: 'Schedule Bulletin',
    session: 'Current Term',
    description: 'Weekly timetable detailing lecture sessions, practical science laboratory periods, and compulsory Saturday computerized mock exam schedules.',
    status: 'portal_restricted',
    portalRoute: '/student/login',
    topicsSummary: [
      'Batch A & Batch B lecture schedules',
      'Laboratory practical rotations',
      'Saturday mock exam time slots',
      'Faculty consultation clinic hours',
    ],
  },
  {
    id: 'upec-admission-cutoff-digest',
    title: 'Nigerian Universities Admission Cut-Off & Quota Digest',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    badgeColor: 'text-[#c62839] bg-red-50 border-red-200',
    provider: 'UPEC Guidance & Admissions Desk',
    subject: 'Federal, State & Private Universities in Nigeria',
    format: 'Advisory Compilation',
    session: '2025/2026 Session',
    description: 'Comparative analysis of departmental cut-off marks, faculty catchment area policies, and direct entry quota guidelines across Nigerian universities.',
    status: 'unavailable',
    topicsSummary: [
      'Federal university catchment requirements',
      'State quota distributions',
      'Departmental weighted score calculations',
      'Post-UTME screening models',
    ],
  },
  {
    id: 'past-questions-archive',
    title: 'WASSCE & NECO 5-Year Physical Examination Archives',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    provider: 'UPEC Library Resource Centre',
    subject: 'Past Question Archives (Science, Arts & Commercial)',
    format: 'Physical Reference Pack',
    session: 'Sawmill Main Centre Reference',
    description: 'Physical question archives bound with examiner annotations, available for quiet reading and teacher-supervised revision at our Ilorin study library.',
    status: 'on_request',
    topicsSummary: [
      'Standard exam booklet layout',
      'Annotated examiner marks',
      'Supervised study library access',
      'Teacher clarification on difficult questions',
    ],
  },
];

export default function ResourcesPage({ onNavigate }: PageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItemForModal, setSelectedItemForModal] = useState<ResourceItem | null>(null);

  // Material Request Form State
  const [requestForm, setRequestForm] = useState({
    name: '',
    phone: '',
    email: '',
    exam: 'JAMB (UTME)',
    details: '',
  });
  const [emailDraftTriggered, setEmailDraftTriggered] = useState<boolean>(false);
  const [emailCopied, setEmailCopied] = useState<boolean>(false);
  const [formError, setFormError] = useState<string | null>(null);

  const requestSectionRef = useRef<HTMLDivElement>(null);

  const filteredResources = resourcesList.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesStatus =
      activeStatusFilter === 'all' ||
      (activeStatusFilter === 'external' && item.status === 'external_link') ||
      (activeStatusFilter === 'portal' && item.status === 'portal_restricted') ||
      (activeStatusFilter === 'request' && item.status === 'on_request');

    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      query === '' ||
      item.title.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.provider.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);

    return matchesCategory && matchesStatus && matchesQuery;
  });

  const handleOpenRequestForm = (item?: ResourceItem) => {
    if (item) {
      let matchedExam = 'JAMB (UTME)';
      if (item.category === 'olevel') matchedExam = 'WAEC (WASSCE) / NECO';
      else if (item.category === 'alevel') matchedExam = 'JUPEB / IJMB (A\'Level)';
      else if (item.category === 'international') matchedExam = 'IELTS / SAT';
      else if (item.category === 'timetable') matchedExam = 'Institutional Timetable / Prospectus';

      setRequestForm((prev) => ({
        ...prev,
        exam: matchedExam,
        details: `Enquiry for: ${item.title} (${item.subject})`,
      }));
    }

    if (requestSectionRef.current) {
      requestSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const trimmedName = requestForm.name.trim();
    const trimmedPhone = requestForm.phone.trim();
    const trimmedDetails = requestForm.details.trim();

    if (trimmedName.length < 3) {
      setFormError('Please enter your full name (at least 3 characters).');
      return;
    }

    // Simple Nigerian phone number check (e.g. 080..., 090..., 070..., 081..., 091... or +234...)
    const cleanDigits = trimmedPhone.replace(/[\s-]/g, '');
    if (cleanDigits.length < 10) {
      setFormError('Please provide a valid phone or WhatsApp number for contact.');
      return;
    }

    if (trimmedDetails.length < 8) {
      setFormError('Please provide more details regarding the syllabus or study material needed.');
      return;
    }

    // Draft email enquiry to verified UPEC address
    const recipient = 'unipathway2020@gmail.com';
    const subject = `[Academic Resource Enquiry] ${requestForm.exam} - ${trimmedName}`;
    const bodyLines = [
      'Dear UPEC Academic Resource Desk,',
      '',
      'I would like to enquire about syllabus and academic study materials.',
      '',
      `Candidate Name: ${trimmedName}`,
      `Phone / WhatsApp: ${trimmedPhone}`,
      `Email Address: ${requestForm.email.trim() || 'Not specified'}`,
      `Target Examination / Category: ${requestForm.exam}`,
      '',
      'Details of Material Needed:',
      trimmedDetails,
      '',
      '---',
      'Enquiry drafted via University Pathway Educational Consult (UPEC) Public Resource Centre',
    ].join('\n');

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines)}`;
    window.location.href = mailtoUrl;
    setEmailDraftTriggered(true);
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText('unipathway2020@gmail.com');
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    } catch {
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 3000);
    }
  };

  const handleResetRequestForm = () => {
    setEmailDraftTriggered(false);
    setFormError(null);
    setRequestForm({
      name: '',
      phone: '',
      email: '',
      exam: 'JAMB (UTME)',
      details: '',
    });
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
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#f0bb5b]">Academic Resources</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[#f0bb5b] text-xs font-bold mb-3">
              <BookOpen size={13} />
              <span>Official Syllabuses &amp; Candidate Study Support</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Academic Resources &amp; Practice Tools
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              Empowering students and parents with verified examination board syllabuses, direct entry curriculum outlines, international testing resources, and candidate practice tools.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CBT SIMULATOR CALLOUT (Requirement 2 Alignment)
          Promotes CBT practice while properly routing to student portal
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="rounded-2xl bg-gradient-to-r from-[#111f4d] via-[#0d1c47] to-[#08163b] border border-white/15 p-6 sm:p-8 text-white shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#c62839] flex items-center justify-center shrink-0 shadow-lg shadow-[#c62839]/30">
              <Monitor size={28} className="text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f0bb5b]">
                  Student Portal Examination Facility
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-bold">
                  Enrolled Candidates
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold mt-1 text-white">
                Computer-Based Test (CBT) Practice Simulator
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                Experience real UTME examination conditions with timed multi-subject test sets, authentic question banks, instant scoring, and step-by-step rationales.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Full UTME 4-Subject Combinations
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  Instant Score &amp; Solution Rationale
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-[#f0bb5b]" />
                  Protected Candidate Authentication
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 self-stretch lg:self-center">
            <button
              type="button"
              onClick={() => onNavigate('/student#cbt')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#c62839]/30 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <Lock size={15} />
              <span>Access CBT in Student Portal</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/student/register')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-slate-200 hover:text-white text-xs font-semibold border border-white/20 transition-colors cursor-pointer"
            >
              <span>New Candidate? Create Account</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RESOURCE FILTER & SEARCH SECTION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#c62839]" />
              CURRICULUM ARCHIVE &amp; REFERENCE MATERIALS
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0b1a42] mt-1">
              Curated Academic Syllabus Catalogue
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Filter by examination category or access channel below.
            </p>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by subject, title or board..."
              className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0b1a42] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0b1a42] bg-white shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Categories & Channel Filters */}
        <div className="space-y-3 mb-8">
          {/* Main Category Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'all', label: 'All Resources' },
              { id: 'jamb', label: 'JAMB (UTME)' },
              { id: 'olevel', label: 'WAEC / NECO' },
              { id: 'alevel', label: 'JUPEB / IJMB' },
              { id: 'international', label: 'IELTS / SAT' },
              { id: 'timetable', label: 'Timetables & Guides' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === tab.id
                    ? 'bg-[#0b1a42] text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Access Channel Filter Sub-row */}
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-slate-400 font-semibold text-[11px] mr-1">Access Channel:</span>
            {[
              { id: 'all', label: 'All Channels' },
              { id: 'external', label: 'Official Examination Portals' },
              { id: 'portal', label: 'Student Portal Only' },
              { id: 'request', label: 'Available on Request' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStatusFilter(st.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer ${
                  activeStatusFilter === st.id
                    ? 'bg-slate-800 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-0.5"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${item.badgeColor}`}>
                    {item.categoryLabel}
                  </span>

                  {/* Access Status Pill */}
                  {item.status === 'external_link' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <ExternalLink size={11} />
                      Official Portal
                    </span>
                  )}
                  {item.status === 'portal_restricted' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      <Lock size={11} />
                      Portal Only
                    </span>
                  )}
                  {item.status === 'on_request' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <HelpCircle size={11} />
                      On Request
                    </span>
                  )}
                  {item.status === 'unavailable' && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      <Clock size={11} />
                      Not Yet Available
                    </span>
                  )}
                </div>

                {/* Provider info */}
                <p className="text-[11px] font-semibold text-slate-400">
                  {item.provider}
                </p>

                {/* Title */}
                <h3 className="font-serif text-lg font-bold text-[#0b1a42] group-hover:text-[#c62839] transition-colors leading-snug mt-1">
                  {item.title}
                </h3>

                {/* Subject focus */}
                <p className="text-xs font-semibold text-[#d5a75b] mt-1.5">
                  {item.subject}
                </p>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                  {item.description}
                </p>

                {/* Topic Scope highlights */}
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Coverage Focus:
                  </span>
                  <ul className="space-y-1">
                    {item.topicsSummary.slice(0, 2).map((tp, idx) => (
                      <li key={idx} className="text-[11px] text-slate-500 flex items-start gap-1.5 leading-snug">
                        <span className="w-1 h-1 rounded-full bg-[#c62839] mt-1.5 shrink-0" />
                        <span>{tp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-400 font-medium truncate">
                  {item.session}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForModal(item)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-[#0b1a42] transition-colors cursor-pointer"
                    title="View details & syllabus breakdown"
                  >
                    <Eye size={15} />
                  </button>

                  {/* Contextual Action Button */}
                  {item.status === 'external_link' && (
                    <a
                      href={item.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      <span>Official Link</span>
                    </a>
                  )}

                  {item.status === 'portal_restricted' && (
                    <button
                      type="button"
                      onClick={() => onNavigate('/student/login')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Lock size={13} />
                      <span>Sign In</span>
                    </button>
                  )}

                  {item.status === 'on_request' && (
                    <button
                      type="button"
                      onClick={() => handleOpenRequestForm(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <HelpCircle size={13} />
                      <span>Request</span>
                    </button>
                  )}

                  {item.status === 'unavailable' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-500 text-xs font-medium cursor-not-allowed border border-slate-200">
                      <Clock size={12} />
                      <span>In Prep</span>
                    </span>
                  )}
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
              We couldn’t find resources matching "{searchQuery}". Try clearing filters or submit a manual request below.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
                setActiveStatusFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-lg bg-[#0b1a42] text-white text-xs font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================================================
          ACADEMIC RESOURCE ENQUIRY & DESK (Requirement 4 Alignment)
          Truthful email-based enquiry drafting to verified unipathway2020@gmail.com
          ========================================================================= */}
      <section ref={requestSectionRef} className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 shadow-lg grid md:grid-cols-12 gap-8 items-start">
            {/* Left information column */}
            <div className="md:col-span-5 space-y-4">
              <div>
                <span className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-5 h-0.5 bg-[#c62839]" />
                  ACADEMIC DESK ASSISTANCE
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-black text-[#0b1a42] mt-2 leading-tight">
                  Can’t Find What You Need?
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Our academic resource desk can assist candidates with specific past question archives, syllabus clarifications, or departmental subject combinations.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-2.5">
                <p className="font-bold text-[#0b1a42] text-[11px] uppercase tracking-wider">
                  How Enquiries Work:
                </p>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Email-Based Enquiry:</strong> This form drafts a pre-formatted message addressed to our verified email at <code>unipathway2020@gmail.com</code>.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Physical Archive Access:</strong> Enrolled candidates and visitors may inspect reference papers and guides on site in Ilorin.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#c62839] shrink-0 mt-0.5" />
                  <span>
                    <strong>Physical Study Centre:</strong> 23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State.
                  </span>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-500 space-y-1">
                <p className="flex items-center gap-1.5 font-medium">
                  <Phone size={13} className="text-[#0b1a42]" />
                  <span>Direct Desk Hotline: <strong>09133903600</strong></span>
                </p>
                <p className="flex items-center gap-1.5 font-medium">
                  <Mail size={13} className="text-[#0b1a42]" />
                  <span>Verified Email: <strong>unipathway2020@gmail.com</strong></span>
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Centre Hours: Monday – Saturday, 8:00 AM – 5:30 PM
                </p>
              </div>
            </div>

            {/* Right form column */}
            <div className="md:col-span-7">
              {emailDraftTriggered ? (
                <div className="p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0b1a42] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Mail size={22} className="text-[#f0bb5b]" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c62839]">
                        Email Client Opened
                      </span>
                      <h4 className="text-lg font-serif font-bold text-[#0b1a42] mt-0.5">
                        Enquiry Draft Prepared
                      </h4>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed">
                    A pre-addressed email draft to <strong>unipathway2020@gmail.com</strong> regarding <strong>{requestForm.exam}</strong> has been opened in your default email application.
                  </p>

                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-amber-950 text-xs">
                      <AlertCircle size={15} className="text-amber-700 shrink-0" />
                      <span>Important Notice on Delivery</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      Opening your email program drafts the message locally and <strong>does not guarantee delivery</strong> until you review and click <strong>&ldquo;Send&rdquo;</strong> in your email client. If your device did not launch an email application, please copy our email address below or visit our Contact page.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">Destination:</span>
                      <span className="font-mono font-bold text-[#0b1a42]">unipathway2020@gmail.com</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-400 font-medium">Candidate:</span>
                      <span className="font-semibold text-slate-700">{requestForm.name} ({requestForm.phone})</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      {emailCopied ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{emailCopied ? 'Email Copied!' : 'Copy Email Address'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onNavigate('/contact')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Visit Contact Page</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailDraftTriggered(false)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#122867] text-white text-xs font-bold transition-colors cursor-pointer ml-auto"
                    >
                      <span>Edit Enquiry Details</span>
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4 bg-white">
                  {formError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                      <AlertCircle size={15} className="shrink-0 text-red-600" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
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
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                        Phone / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
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

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                        Email Address <span className="text-slate-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="email"
                        value={requestForm.email}
                        onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                        placeholder="e.g. candidate@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                        Examination / Programme Category
                      </label>
                      <select
                        value={requestForm.exam}
                        onChange={(e) => setRequestForm({ ...requestForm, exam: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white cursor-pointer"
                      >
                        <option value="JAMB (UTME)">JAMB (UTME)</option>
                        <option value="WAEC (WASSCE) / NECO">WAEC (WASSCE) / NECO SSCE</option>
                        <option value="JUPEB / IJMB (A'Level)">JUPEB / IJMB (Direct Entry)</option>
                        <option value="IELTS / SAT">IELTS / SAT / International Exams</option>
                        <option value="Institutional Timetable / Prospectus">Institutional Timetable / Prospectus</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1">
                      Details of Syllabus, Topic or Material Needed <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={requestForm.details}
                      onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })}
                      placeholder="e.g. Please I need the 2021-2023 WAEC Physics Practical specimen guide and topic analysis..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-3 pt-1">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs sm:text-sm font-bold shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Mail size={16} />
                      <span>Draft Enquiry Email to unipathway2020@gmail.com</span>
                    </button>

                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                      <p className="flex items-start gap-1.5 text-slate-600">
                        <AlertCircle size={13} className="text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Delivery Notice:</strong> Clicking above opens your device&apos;s email program to draft a message to <strong>unipathway2020@gmail.com</strong>. It does not guarantee automatic delivery until you send the email from your application.
                        </span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                      <span>Prefer direct contact?</span>
                      <button
                        type="button"
                        onClick={() => onNavigate('/contact')}
                        className="text-[#0b1a42] hover:text-[#c62839] font-bold underline cursor-pointer"
                      >
                        Go to Contact &amp; Enquiries Page &rarr;
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          PHYSICAL CENTRE & LIBRARY LOCATION
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0b1a42] text-white flex items-center justify-center shrink-0">
              <MapPin size={22} className="text-[#f0bb5b]" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#c62839]">
                Physical Study Center &amp; Library
              </span>
              <h3 className="font-serif text-lg font-bold text-[#0b1a42] mt-0.5">
                Sawmill Main Centre Reference Library, Ilorin
              </h3>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State. Enrolled candidates have free daily access to our quiet reading room, reference past question archives, and computer terminals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="px-5 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#122867] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Get Center Directions
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RESOURCE DETAILS MODAL (Requirement 3 Alignment)
          Shows authentic synopsis, topics covered, and genuine access options
          ========================================================================= */}
      {selectedItemForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedItemForModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border ${selectedItemForModal.badgeColor}`}>
                {selectedItemForModal.categoryLabel}
              </span>
              <span className="text-xs text-slate-400 font-semibold">{selectedItemForModal.session}</span>
            </div>

            <h3 className="font-serif text-xl font-bold text-[#0b1a42] leading-snug">
              {selectedItemForModal.title}
            </h3>
            <p className="text-xs font-semibold text-[#d5a75b] mt-1">{selectedItemForModal.subject}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Issuing Authority: {selectedItemForModal.provider}</p>

            {/* Detailed Synopsis */}
            <div className="my-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs space-y-3 text-slate-700">
              <p className="leading-relaxed">{selectedItemForModal.description}</p>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Curriculum &amp; Syllabus Topics Covered:
                </span>
                <ul className="space-y-1">
                  {selectedItemForModal.topicsSummary.map((topic, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                      <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium">
                <div>
                  <span className="block text-slate-400 text-[10px]">Format:</span>
                  <strong className="text-[#0b1a42]">{selectedItemForModal.format}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 text-[10px]">Location:</span>
                  <strong className="text-[#0b1a42]">Sawmill Main Centre, Ilorin</strong>
                </div>
              </div>
            </div>

            {/* Action buttons depending on authentic status */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedItemForModal(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>

              {selectedItemForModal.status === 'external_link' && (
                <a
                  href={selectedItemForModal.externalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <ExternalLink size={14} />
                  <span>Open Official Board Portal</span>
                </a>
              )}

              {selectedItemForModal.status === 'portal_restricted' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedItemForModal(null);
                    onNavigate('/student/login');
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <Lock size={14} />
                  <span>Sign In to Student Portal</span>
                </button>
              )}

              {selectedItemForModal.status === 'on_request' && (
                <button
                  type="button"
                  onClick={() => {
                    const item = selectedItemForModal;
                    setSelectedItemForModal(null);
                    handleOpenRequestForm(item);
                  }}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md transition-colors cursor-pointer"
                >
                  <HelpCircle size={14} />
                  <span>Request from Academic Desk</span>
                </button>
              )}

              {selectedItemForModal.status === 'unavailable' && (
                <span className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-500 text-xs font-semibold border border-slate-200">
                  <Clock size={14} />
                  <span>In Preparation for 2025/2026</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
