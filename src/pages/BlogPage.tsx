import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronRight,
  User,
  Share2,
  X,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

interface Article {
  id: string;
  title: string;
  category: 'jamb' | 'olevel' | 'alevel' | 'international' | 'counseling';
  categoryLabel: string;
  date: string;
  readTime: string;
  image: string;
  author: string;
  summary: string;
  content: string[];
  takeaways: string[];
}

const articlesData: Article[] = [
  {
    id: 'jamb-registration-guide',
    title: 'JAMB 2025/2026 Registration: Complete Guide to Subject Combinations & Cut-Off Marks',
    category: 'jamb',
    categoryLabel: 'JAMB (UTME)',
    date: 'October 10, 2024',
    readTime: '6 min read',
    image: '/images/blog_jamb.jpg',
    author: 'Academic Advisory Board',
    summary: 'Selecting incorrect subject combinations is the single largest cause of disqualification during university admissions. Here is the definitive breakdown for Nigerian federal and state universities.',
    content: [
      'Every year, tens of thousands of Nigerian candidates score above 250 in the Unified Tertiary Matriculation Examination (UTME) only to be disqualified during screening due to a mismatch between their chosen degree and their four examination subjects.',
      'For Medicine and Health Sciences, the non-negotiable four subjects remain English Language, Biology, Chemistry, and Physics. Candidates intending to study Computer Science or Engineering must ensure they do not substitute Physics or Mathematics with any non-science elective.',
      'At University Pathway Educational Consult, our counseling team verifies every candidate’s JAMB profile before final submission to avoid irreversible mistakes.',
    ],
    takeaways: [
      'Double-check your faculty guidelines in the official JAMB Brochure.',
      'Ensure your O’Level results match the specific grade requirements for your primary choice.',
      'Begin intensive CBT mock drills at least 12 weeks prior to your examination date.',
    ],
  },
  {
    id: 'waec-neco-combination-rules',
    title: 'WAEC & NECO Result Combination: What Nigerian Universities Actually Accept',
    category: 'olevel',
    categoryLabel: 'O’Level (WAEC/NECO)',
    date: 'September 28, 2024',
    readTime: '5 min read',
    image: '/images/blog_olevel.jpg',
    author: 'O’Level Coordination Team',
    summary: 'Can you combine WAEC and NECO for Medicine or Law? Learn which universities accept two sittings and how to prepare for deficiency makeup.',
    content: [
      'A frequent question from secondary school leavers is whether federal universities accept two sittings of O’Level examinations. While the general rule is that most faculties accept combinations, specific high-demand programmes like Medicine, Surgery, and Law in premier universities often prioritize single-sitting applicants.',
      'When combining two sittings, both must include credit passes (C6 or higher) in Mathematics, English Language, and three relevant subjects. NABTEB can also be combined for technical and vocational pathways.',
      'Our dedicated O’Level coaching classes at 23 Olaiya Street, Sawmill Garage, Ilorin, focus heavily on essay structuring and practical science questions to ensure candidates achieve clean single-sitting distinctions.',
    ],
    takeaways: [
      'Verify whether your chosen institution permits two sittings for competitive courses.',
      'Ensure credits in Mathematics and English Language are secured in at least one sitting.',
      'Target at least B3 in your core subjects to maximize your university aggregate score.',
    ],
  },
  {
    id: 'jupeb-vs-ijmb-direct-entry',
    title: 'JUPEB vs. IJMB: Which A’Level Pathway Offers Faster 200-Level Admission?',
    category: 'alevel',
    categoryLabel: 'A’Level & Direct Entry',
    date: 'September 15, 2024',
    readTime: '7 min read',
    image: '/images/blog_alevel.jpg',
    author: 'Direct Entry Directorate',
    summary: 'If you want to bypass 100-level university stress, both JUPEB and IJMB offer proven paths directly into Year 2. Understand the differences in acceptance, syllabus, and scoring.',
    content: [
      'The Joint Universities Preliminary Examinations Board (JUPEB) and the Interim Joint Matriculation Board (IJMB) are government-approved advanced-level programmes enabling candidates to secure Direct Entry (DE) admission into 200 Level in participating Nigerian and partner overseas universities.',
      'While IJMB is widely favoured across northern and central universities including Ahmadu Bello University, University of Ilorin, and Bayero University, JUPEB is predominantly recognized by universities like UNILAG, OAU, UNIBEN, and UNILORIN.',
      'University Pathway prepares candidates with seasoned lecturers who have marked both examination boards, giving our candidates an undeniable advantage.',
    ],
    takeaways: [
      'A’Level candidates gain direct admission into 200-Level without taking UTME again.',
      'Points scale: Scores above 10 points (out of 15 or 16) qualify for high-tier university courses.',
      'Dedicated laboratory sessions are critical for science A’Level practicals.',
    ],
  },
  {
    id: 'ielts-band-score-ilorin',
    title: 'Achieving Band 7.5+ in IELTS: Strategies for Nigerian Students & Professionals',
    category: 'international',
    categoryLabel: 'International Exams',
    date: 'August 30, 2024',
    readTime: '6 min read',
    image: '/images/blog_intl.jpg',
    author: 'International Studies Desk',
    summary: 'Key techniques for mastering IELTS Academic Reading, Writing Task 2 coherence, and Speaking interviews for UK, Canadian, and European university admissions.',
    content: [
      'Nigerian candidates often excel in IELTS Listening and Reading but face score deductions in Academic Writing Task 2 due to formatting and grammatical precision, or in Speaking due to hesitation.',
      'In our coaching workshops, we emphasize thesis statement development, balanced argument paragraphing, and natural lexical variety rather than cramming obscure idioms.',
      'With individualized speaking practice sessions and timed essay corrections, University Pathway students routinely attain overall band scores of 7.5 and 8.0.',
    ],
    takeaways: [
      'Practice with authentic Cambridge English IELTS past exam audio and texts.',
      'Master Task 1 visual report structures (line graphs, bar charts, process diagrams).',
      'Record your speaking responses to identify grammatical slips and pacing issues.',
    ],
  },
  {
    id: 'exam-anxiety-management',
    title: 'Overcoming Examination Anxiety: A Practical Routine for High-Pressure Exams',
    category: 'counseling',
    categoryLabel: 'Study Strategies',
    date: 'August 14, 2024',
    readTime: '4 min read',
    image: '/images/blog_study.jpg',
    author: 'Student Well-being Desk',
    summary: 'How to manage exam day nerves, maintain sharp focus under time limits, and optimize recall during computerized CBT tests.',
    content: [
      'Examination anxiety is one of the most common reasons why well-prepared candidates freeze or make careless errors during high-stakes tests like JAMB and WAEC.',
      'At University Pathway, we address this directly through weekly mock tests that replicate the exact test center atmosphere: countdown clocks, timed pauses, and randomized question ordering.',
      'Candidates learn mental anchoring techniques, rapid time budgeting, and breath control routines to enter the examination room with calm self-assurance.',
    ],
    takeaways: [
      'Get 7-8 hours of sleep the night before your examination.',
      'Tackle questions you know first to build momentum and lock in early marks.',
      'Keep hydrated and avoid last-minute panic cramming outside the test center.',
    ],
  },
  {
    id: 'academic-counseling-course-selection',
    title: 'Choosing the Right University Course: Aligning Passion, Ability, and Industry Demand',
    category: 'counseling',
    categoryLabel: 'Academic Counseling',
    date: 'July 22, 2024',
    readTime: '5 min read',
    image: '/images/blog_counselling.jpg',
    author: 'Career Guidance Counselor',
    summary: 'Navigating parental expectations, personal interests, and emerging career opportunities in Nigeria and global markets.',
    content: [
      'Choosing a university degree is one of the most pivotal life decisions a young student faces. Too often, students pick courses based solely on peer influence or outdated notions of employability.',
      'Modern industry values transferable problem-solving, digital literacy, and practical analytical ability. Our counselors meet one-on-one with candidates and their guardians to evaluate strengths and long-term aspirations.',
      'Our holistic approach ensures that each student embarks on an academic pathway where they are naturally primed to excel.',
    ],
    takeaways: [
      'Conduct an honest evaluation of your academic strengths and subject affinities.',
      'Research future career growth and international recognition of your chosen degree.',
      'Schedule a personalized session with an educational consultant before registration.',
    ],
  },
];

export default function BlogPage({ onNavigate }: PageProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const filteredArticles = articlesData.filter((article) => {
    if (activeCategory === 'all') return true;
    return article.category === activeCategory;
  });

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterSubscribed(true);
    setTimeout(() => {
      setNewsletterSubscribed(false);
      setNewsletterEmail('');
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
            src="/images/blog_hero.jpg"
            alt="University Pathway Students Reading and Studying"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/50" />
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
            <span className="text-[#f0bb5b]">Blog &amp; News</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              News, Insights &amp; Academic Tips
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Stay ahead with verified examination news, university cutoff analyses, study methodologies, and career guidance directly from our experienced faculty.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FEATURED LEAD STORY
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden grid lg:grid-cols-12 gap-0">
          <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-full">
            <img
              src="/images/blog_jamb.jpg"
              alt="JAMB UTME Preparation Guide"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full bg-[#c62839] text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                Featured Article
              </span>
            </div>
          </div>
          <div className="lg:col-span-6 p-7 sm:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-3">
                <span className="text-[#c62839] font-bold">JAMB (UTME)</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar size={13} /> October 10, 2024
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} /> 6 min read
                </span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0b1a42] leading-tight">
                JAMB 2025/2026 Registration: Complete Guide to Subject Combinations &amp; Cut-Off Marks
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-3.5 leading-relaxed">
                Selecting incorrect subject combinations is the leading cause of admission disqualification across Nigerian federal and state universities. Learn how to verify your combinations before portal lock.
              </p>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">By Academic Advisory Board</span>
              <button
                type="button"
                onClick={() => setSelectedArticle(articlesData[0])}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold transition-all hover:scale-[1.02]"
              >
                <span>Read Full Article</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          FILTER TABS & ARTICLES GRID
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 mb-10 pb-4 border-b border-slate-200">
          {[
            { id: 'all', label: 'All Articles' },
            { id: 'jamb', label: 'JAMB (UTME)' },
            { id: 'olevel', label: 'O’Level (WAEC/NECO)' },
            { id: 'alevel', label: 'A’Level & Direct Entry' },
            { id: 'international', label: 'International (IELTS/SAT)' },
            { id: 'counseling', label: 'Study & Counseling' },
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#0b1a42]/90 backdrop-blur-xs text-white text-[10px] font-extrabold uppercase tracking-wider">
                      {article.categoryLabel}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold mb-2.5">
                    <span>{article.date}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-[#0b1a42] group-hover:text-[#c62839] transition-colors leading-snug line-clamp-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed line-clamp-3">
                    {article.summary}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium truncate max-w-[150px]">
                  {article.author}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedArticle(article)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c62839] hover:text-[#b01f30] transition-colors group-hover:translate-x-0.5"
                >
                  <span>Read more</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* =========================================================================
          NEWSLETTER SUBSCRIPTION SECTION
          ========================================================================= */}
      <section className="bg-[#08163b] text-white py-16 border-t border-[#101d44]">
        <div className="max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <span className="text-[#f0bb5b] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
            <Sparkles size={14} /> ADMISSION &amp; EXAM ALERTS
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-white mt-2">
            Never Miss Important Educational Deadlines
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 max-w-xl mx-auto leading-relaxed">
            Get official notifications on JAMB registration commencement, WAEC/NECO release dates, university direct entry cut-offs, and free coaching webinars.
          </p>

          {newsletterSubscribed ? (
            <div className="mt-8 p-4 bg-emerald-500/20 border border-emerald-400 rounded-xl max-w-md mx-auto text-emerald-300 text-xs font-semibold">
              <CheckCircle2 size={20} className="inline mr-2 text-emerald-400" />
              Thank you! You are subscribed to University Pathway admission bulletins.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full sm:w-80 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f0bb5b]"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold transition-all shrink-0 shadow-md"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* =========================================================================
          ARTICLE READER MODAL
          ========================================================================= */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-6 sm:p-8 shadow-2xl relative border border-slate-100 max-h-[90vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedArticle(null)}
              className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 z-10"
            >
              <X size={20} />
            </button>

            <div className="relative h-56 rounded-xl overflow-hidden mb-6 -mt-2 -mx-2 sm:-mx-4">
              <img
                src={selectedArticle.image}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-6">
                <span className="px-2.5 py-1 rounded-md bg-[#c62839] text-white text-[11px] font-extrabold uppercase">
                  {selectedArticle.categoryLabel}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-400 font-semibold mb-2">
              <span>{selectedArticle.date}</span>
              <span>•</span>
              <span>{selectedArticle.readTime}</span>
              <span>•</span>
              <span className="text-[#0b1a42] font-bold">By {selectedArticle.author}</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0b1a42] leading-tight">
              {selectedArticle.title}
            </h2>

            <div className="my-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedArticle.content.map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>

            {/* Key takeaways box */}
            <div className="my-6 p-5 bg-amber-50 rounded-xl border border-amber-200">
              <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#d5a75b]" />
                Key Strategic Takeaways
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-900">
                {selectedArticle.takeaways.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="text-emerald-700 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500">
                Questions about this article? <a href="mailto:unipathway2020@gmail.com" className="text-[#c62839] font-semibold underline">Contact our desk</a>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setSelectedArticle(null)}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedArticle(null);
                    onNavigate('/apply');
                  }}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors"
                >
                  Enrol in Coaching
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
