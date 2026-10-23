import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Play,
  FileText,
  Video,
  Clock,
  Sparkles,
  ExternalLink,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { StudentUser } from '../../context/AuthContext';
import { getStudentToken } from '../../context/AuthContext';
import { upecAuthApi } from '../../lib/upecAuthApi';

interface LearningResourcesTabViewProps {
  currentUser: StudentUser;
  onNavigateTab: (tab: string) => void;
}

interface ResourceItem {
  id: string;
  title: string;
  subject: string;
  type: 'pdf' | 'video' | 'handbook' | 'past_questions';
  description: string;
  sizeOrDuration: string;
  downloads?: number;
  featured?: boolean;
  author: string;
}

export default function LearningResourcesTabView({
  currentUser,
  onNavigateTab,
}: LearningResourcesTabViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [levelFilter, setLevelFilter] = useState('all');
  const [remoteResources, setRemoteResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Load real backend learning resources if available
  useEffect(() => {
    const token = getStudentToken();
    if (!token) return;
    setLoading(true);
    upecAuthApi
      .learningResources(token)
      .then((data) => setRemoteResources(data.resources || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const resources: ResourceItem[] = [
    {
      id: 'res-1',
      title: 'Comprehensive Biology Revision Notes 2026 - Cell Biology & Genetics',
      subject: 'Biology',
      type: 'pdf',
      description: 'In-depth notes on cellular respiration, mitosis, meiosis and Mendelian inheritance patterns.',
      sizeOrDuration: '4.8 MB',
      downloads: 420,
      featured: true,
      author: 'Dr. E. O. Adebayo (Senior Biology Lecturer)',
    },
    {
      id: 'res-2',
      title: 'Organic Chemistry Hydrocarbons Video Masterclass',
      subject: 'Chemistry',
      type: 'video',
      description: 'Step-by-step breakdown of alkanes, alkenes, alkynes and functional group mechanisms.',
      sizeOrDuration: '42 mins',
      downloads: 310,
      featured: true,
      author: 'Prof. K. A. Adeleke',
    },
    {
      id: 'res-3',
      title: 'UTME Advanced Mathematics Formulae & Worked Solutions',
      subject: 'Mathematics',
      type: 'handbook',
      description: 'Handy formula compendium covering calculus, trigonometry, coordinate geometry and vectors.',
      sizeOrDuration: '3.2 MB',
      downloads: 580,
      featured: true,
      author: 'Engr. T. S. Ibrahim',
    },
    {
      id: 'res-4',
      title: 'Electromagnetism & Waves Lecture Slides & Problem Sets',
      subject: 'Physics',
      type: 'pdf',
      description: 'Coulombs law, electric field intensity, Faraday induction and harmonic wave motion.',
      sizeOrDuration: '5.4 MB',
      downloads: 290,
      author: 'Mr. O. M. Babatunde',
    },
    {
      id: 'res-5',
      title: 'Lexis & Structure Masterclass for UTME / IJMB',
      subject: 'Use of English',
      type: 'pdf',
      description: 'Idiomatic expressions, prepositional phrases, antonyms and sentence completion strategies.',
      sizeOrDuration: '2.1 MB',
      downloads: 640,
      author: 'Mrs. F. A. Johnson',
    },
    {
      id: 'res-6',
      title: 'Past IJMB 10-Year Compilation with Explanatory Notes',
      subject: 'General Studies',
      type: 'past_questions',
      description: 'Complete past question papers with officially approved model marking guides.',
      sizeOrDuration: '8.6 MB',
      downloads: 920,
      author: 'UPEC Academic Board',
    },
  ];

  const filteredResources = resources.filter((item) => {
    const matchesSubject = subjectFilter === 'all' || item.subject.toLowerCase().includes(subjectFilter.toLowerCase());
    const matchesType = typeFilter === 'all' || item.type === typeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesType && matchesSearch;
  });

  const handleOpenResource = (id: string) => {
    const token = getStudentToken();
    if (token) {
      upecAuthApi.openLearningResource(token, id).catch(() => {});
    }
    // Informational alert on mock preview
    alert('Opening academic resource in secure document viewer.');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs">
        <div>
          <h1 className="text-xl font-black text-[#111A43] tracking-tight">
            Learning Resources
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated syllabus notes, video masterclasses, revision guides and past examination packages
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-[#111A43] text-xs font-bold">
            <BookOpen size={14} className="text-[#c62839]" />
            <span>Over 140 Academic Resources</span>
          </span>
        </div>
      </div>

      {/* Search & Filter Bar (Matching Mockup) */}
      <div className="bg-white rounded-2xl border border-[#dce5f0] p-4 sm:p-5 shadow-xs space-y-3">
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study notes, video tutorials, revision modules, topics..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-xs font-semibold text-[#111A43] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#111A43]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Subject</label>
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#111A43] bg-slate-50"
            >
              <option value="all">All Subjects</option>
              <option value="English">Use of English</option>
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Material Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#111A43] bg-slate-50"
            >
              <option value="all">All Material Types</option>
              <option value="pdf">PDF Study Notes</option>
              <option value="video">Video Masterclasses</option>
              <option value="handbook">Formula Handbooks</option>
              <option value="past_questions">Past Questions</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Academic Level</label>
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#111A43] bg-slate-50"
            >
              <option value="all">All Programmes &amp; Levels</option>
              <option value="ijmb">IJMB 'A' Level</option>
              <option value="jupeb">JUPEB Foundation</option>
              <option value="utme">UTME / JAMB</option>
              <option value="remedial">O'Level Remedial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Left (Featured & Grid), Right (Sidebar Widgets) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Featured Study Materials Cards */}
          <div>
            <h2 className="text-sm font-extrabold text-[#111A43] mb-3">
              Featured Study Materials &amp; Masterclasses
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {resources.filter((r) => r.featured).map((feat) => (
                <div
                  key={feat.id}
                  className="bg-white rounded-2xl border border-[#dce5f0] p-5 shadow-xs flex flex-col justify-between hover:border-[#111A43] transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="p-2 rounded-xl bg-red-50 text-[#c62839]">
                        {feat.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#111A43] text-[10px] font-bold">
                        {feat.subject}
                      </span>
                    </div>
                    <strong className="text-xs font-black text-[#111A43] line-clamp-2">
                      {feat.title}
                    </strong>
                    <p className="mt-1.5 text-[11px] text-slate-500 line-clamp-2">
                      {feat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      {feat.sizeOrDuration}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenResource(feat.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#c62839] hover:bg-[#a51b2b] text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      {feat.type === 'video' ? <Play size={12} fill="white" /> : <Download size={12} />}
                      <span>{feat.type === 'video' ? 'Watch' : 'Download'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Subject Category Cards Grid */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              Browse by Subject Stream
            </h3>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Biology', count: '24 Materials', icon: '🧬' },
                { name: 'Mathematics', count: '32 Materials', icon: '📐' },
                { name: 'Physics', count: '28 Materials', icon: '⚡' },
                { name: 'Chemistry', count: '26 Materials', icon: '🧪' },
                { name: 'Use of English', count: '18 Materials', icon: '📖' },
                { name: 'General Studies', count: '12 Materials', icon: '🏛️' },
              ].map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSubjectFilter(cat.name)}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-[#111A43] hover:shadow-xs transition-all text-left cursor-pointer"
                >
                  <span className="text-xl block mb-1">{cat.icon}</span>
                  <strong className="text-xs font-bold text-[#111A43] block">{cat.name}</strong>
                  <span className="text-[10px] text-slate-400">{cat.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* All Curated Resources List */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-[#111A43]">
                Available Curriculum Materials ({filteredResources.length})
              </h3>
              <span className="text-xs text-slate-400">Official UPEC Library</span>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors px-2 rounded-xl"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="p-2.5 rounded-xl bg-slate-100 text-[#111A43] shrink-0">
                      {res.type === 'video' ? <Video size={18} /> : <FileText size={18} />}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <strong className="text-xs font-bold text-[#111A43]">
                          {res.title}
                        </strong>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#111A43] text-[9px] font-bold">
                          {res.subject}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                        {res.description}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">
                        By {res.author} · {res.sizeOrDuration}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenResource(res.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111A43] hover:bg-[#1c3275] text-white text-xs font-bold transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
                  >
                    <Download size={13} />
                    <span>Access</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Study Technique Tip */}
          <div className="bg-gradient-to-br from-[#111A43] to-[#1c3275] rounded-2xl p-6 text-white shadow-md">
            <div className="flex items-center gap-2 pb-2">
              <Sparkles size={18} className="text-[#d5a75b]" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#d5a75b]">
                Revision Technique
              </h3>
            </div>
            <strong className="text-sm font-bold block mt-1">
              Active Recall &amp; The Feynman Technique
            </strong>
            <p className="mt-2 text-xs leading-relaxed text-slate-200">
              After reading each syllabus topic, close your handbook and summarize the key principles in your own words. Practice with the CBT simulator immediately after.
            </p>
          </div>

          {/* Latest Uploads */}
          <div className="bg-white rounded-2xl border border-[#dce5f0] p-6 shadow-xs">
            <h3 className="text-sm font-extrabold text-[#111A43] pb-3 border-b border-slate-100">
              New Uploads This Week
            </h3>
            <div className="mt-3 space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-[#c62839] uppercase block">Mathematics</span>
                <strong className="text-xs font-bold text-[#111A43] block mt-0.5">Calculus Derivative Drills (PDF)</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">Uploaded 2 days ago</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-bold text-[#2456a0] uppercase block">Use of English</span>
                <strong className="text-xs font-bold text-[#111A43] block mt-0.5">Oral English &amp; Vowel Contrasts (Audio)</strong>
                <span className="text-[10px] text-slate-400 mt-1 block">Uploaded 4 days ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
