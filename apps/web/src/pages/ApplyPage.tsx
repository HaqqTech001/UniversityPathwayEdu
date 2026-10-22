import React, {useState} from 'react';
import {
  GraduationCap,
  BookOpen,
  Landmark,
  Globe2,
  FileCheck,
  UserCheck,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Info,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface ApplyPageProps {
  onNavigate?: (path: string) => void;
}

export default function ApplyPage({ onNavigate }: ApplyPageProps) {
  const [selectedProgramme] = useState(() => typeof window === 'undefined' ? '' : window.sessionStorage.getItem('upec_selected_programme') || '');
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = path;
    }
  };

  const programmes = [
    {
      title: 'JAMB (UTME) Coaching',
      badge: 'National Examination',
      icon: GraduationCap,
      description:
        'Intensive preparatory classes covering syllabus modules, computer-based testing (CBT) drill techniques, and strategic scoring guidance for prospective university candidates.',
      features: [
        'Full syllabus coverage with experienced subject tutors',
        'Weekly computer-based test (CBT) simulated practice',
        'Subject combination counselling for desired degree courses',
      ],
      tagColor: 'bg-red-50 text-[#c62839] border-red-200',
    },
    {
      title: 'O’Level Programmes',
      badge: 'Secondary Certificate',
      icon: BookOpen,
      description:
        'Comprehensive revision and coaching for WAEC (SSCE), NECO, and NABTEB examinations. Designed for remedial candidates and fresh secondary school leavers.',
      features: [
        'Intensive coaching in core Science, Commercial, and Art subjects',
        'Past question analytical solutions and examiner insights',
        'Morning and afternoon cohort flexibility',
      ],
      tagColor: 'bg-blue-50 text-[#0b1a42] border-blue-200',
    },
    {
      title: 'A’Level Direct Entry',
      badge: '200 Level Direct Entry',
      icon: Landmark,
      description:
        'Accredited preparatory coaching for JUPEB, IJMB, and NABTEB A’Level programmes, offering direct 200-level university admission without UTME requirements.',
      features: [
        'Interim Joint Matriculation Board (IJMB) preparation',
        'Joint Universities Preliminary Examinations Board (JUPEB)',
        'Qualifying route to federal, state, and private universities',
      ],
      tagColor: 'bg-amber-50 text-[#966b1a] border-amber-200',
    },
    {
      title: 'International Examinations',
      badge: 'Study Abroad Pathways',
      icon: Globe2,
      description:
        'Specialised coaching for candidates seeking study opportunities abroad or direct foreign university placement via IELTS, TOEFL, SAT, GRE, and GMAT.',
      features: [
        'English proficiency preparation (IELTS & TOEFL)',
        'Standardised testing strategy (SAT, GRE & GMAT)',
        'Overseas admissions advisory and document review support',
      ],
      tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
  ];

  return (
    <main className="w-full bg-[#f8fafd] text-[#0b1a42]">
      {/* =========================================================================
          SECTION A: ADMISSIONS INTRODUCTION HERO
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white py-16 sm:py-20 overflow-hidden border-b border-[#0f2150]">
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-[#c62839] blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-[#f0bb5b] blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#f0bb5b]">Apply / Register</span>
          </nav>

          <div className="max-w-3xl">
            {selectedProgramme && <p className="mb-4 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white" role="status">Selected programme: <strong>{selectedProgramme}</strong>. Your selection will be kept while you sign in or register. Confirm the programme when starting your application inside the portal.</p>}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#f0bb5b] text-xs font-extrabold uppercase tracking-widest mb-4 border border-white/10">
              <Sparkles size={14} />
              <span>Admissions Entry Portal</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Begin Your Journey with University Pathway
            </h1>
            <p className="mt-4 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
              University Pathway Educational Consult welcomes prospective candidates to our structured coaching programmes and university pathway preparatory cohorts. Review the available educational pathways, create your account, and complete your application in the student portal.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION C: ACCOUNT ENTRY ACTIONS (Create Account & Sign In)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <ScrollReveal from="up">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10">
            <div className="grid md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#c62839] block mb-1">
                  Applicant Account Access
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0b1a42]">
                  Manage Your Application &amp; Registration
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                  Every applicant is provisioned a dedicated student account. New candidates set up their credentials to register their student profile, while registered applicants can sign in to view their status, practice CBT simulations, and retrieve institutional updates.
                </p>
              </div>

              <div className="md:col-span-5 flex flex-col sm:flex-row md:flex-col gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleNav('/student/register')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#c62839]/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <FileCheck size={16} />
                  <span>Create Account</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => handleNav('/student/login')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-[#0b1a42] text-[#0b1a42] hover:bg-[#0b1a42] hover:text-white text-xs sm:text-sm font-bold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <UserCheck size={16} />
                  <span>Already Registered? Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* =========================================================================
          SECTION B: AVAILABLE PROGRAMME GUIDANCE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <ScrollReveal from="up">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              CONFIRMED STUDY PATHWAYS
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Available Educational Programmes
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
              Explore our verified coaching streams. Candidates receive guidance tailored to their career aspirations and target university criteria.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {programmes.map((prog, idx) => {
            const Icon = prog.icon;
            return (
              <ScrollReveal key={prog.title} from="up" delay={idx * 80}>
                <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 text-[#0b1a42] flex items-center justify-center border border-slate-100 shadow-xs">
                        <Icon size={24} className="text-[#c62839]" />
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${prog.tagColor}`}>
                        {prog.badge}
                      </span>
                    </div>

                    <h3 className="font-serif text-xl font-bold text-[#0b1a42]">
                      {prog.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm mt-2 leading-relaxed">
                      {prog.description}
                    </p>

                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      {prog.features.map((feat, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => handleNav('/programmes')}
                      className="text-xs font-bold text-[#c62839] hover:text-[#0b1a42] inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>Learn Programme Details</span>
                      <ArrowRight size={13} />
                    </button>
                    <span className="text-[11px] text-slate-400 font-medium">Sawmill Center, Ilorin</span>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION D: APPLICATION GUIDANCE
          ========================================================================= */}
      <section className="bg-white border-y border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <ScrollReveal from="up">
            <div className="max-w-3xl mb-12">
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#c62839] block mb-2">
                APPLICATION PROCESS &amp; GUIDANCE
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42]">
                How the Registration System Operates
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-3 leading-relaxed">
                To guarantee transparency, data integrity, and personalised educational planning, prospective students follow a clear 3-step application workflow.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal from="up" delay={50}>
              <div className="bg-[#f8fafd] rounded-2xl p-6 sm:p-7 border border-slate-200/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#0b1a42] text-white flex items-center justify-center font-bold text-sm mb-4">
                    01
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0b1a42] mb-2">
                    Create Your Account
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Applicants provide basic identification (name, phone number, and email) to create their authenticated student credentials.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-[#c62839]" />
                  <span>Secure student profile</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal from="up" delay={100}>
              <div className="bg-[#f8fafd] rounded-2xl p-6 sm:p-7 border border-slate-200/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#c62839] text-white flex items-center justify-center font-bold text-sm mb-4">
                    02
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0b1a42] mb-2">
                    Submit Biodata &amp; Subjects
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    Sign in to your authenticated account to enter required biodata, guardian emergency contacts, target degree course, and examination subject combination.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <Clock size={14} className="text-[#c62839]" />
                  <span>Completed at your own pace</span>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal from="up" delay={150}>
              <div className="bg-[#f8fafd] rounded-2xl p-6 sm:p-7 border border-slate-200/80 h-full flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-[#d5a75b] text-[#0b1a42] flex items-center justify-center font-bold text-sm mb-4">
                    03
                  </div>
                  <h3 className="font-serif text-lg font-bold text-[#0b1a42] mb-2">
                    Admissions Verification
                  </h3>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    The admissions team reviews candidate submissions, assigns the official student registration number, and clears the candidate for classroom lectures and CBT sessions.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Official institutional record</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Notice for prospective applicants:</strong> Official tuition fees and payment verification policies are settled directly through verified institutional channels upon admission counselling. Do not send payments to personal or unverified third-party accounts.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION E: HELP AND ENQUIRIES (Official Contact Information)
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <ScrollReveal from="up">
          <div className="bg-[#0b1a42] rounded-3xl text-white p-7 sm:p-12 border border-[#14285e] shadow-xl">
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#f0bb5b] block mb-2">
                  NEED ASSISTANCE WITH YOUR APPLICATION?
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  Admissions Help Desk &amp; Consultation
                </h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed max-w-xl">
                  Our admissions coordinators and educational counsellors are available on-site and by telephone to guide parents and prospective students through programme selection, O’Level remedial requirements, and JAMB registration.
                </p>

                <div className="mt-6 grid sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <MapPin size={18} className="text-[#f0bb5b] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Centre Location</p>
                      <p className="text-slate-300 text-[11px] mt-0.5 leading-snug">
                        23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <Phone size={18} className="text-[#f0bb5b] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Telephone Helplines</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        <a href="tel:09133903600" className="hover:text-white">09133903600</a> | <a href="tel:09166664266" className="hover:text-white">09166664266</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <Mail size={18} className="text-[#f0bb5b] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Official Email</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        <a href="mailto:unipathway2020@gmail.com" className="hover:text-white">unipathway2020@gmail.com</a>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white/5 p-3.5 rounded-xl border border-white/10">
                    <Clock size={18} className="text-[#f0bb5b] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Admissions Desk Hours</p>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        Mon – Fri: 8:00 AM – 5:00 PM<br />Sat: 9:00 AM – 3:00 PM
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 flex flex-col gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleNav('/contact')}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-slate-100 text-[#0b1a42] text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer"
                >
                  <MapPin size={16} className="text-[#c62839]" />
                  <span>View Location Map &amp; Office Details</span>
                  <ArrowRight size={15} />
                </button>

                <a
                  href="tel:09133903600"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-white/20 hover:bg-white/10 text-white text-xs sm:text-sm font-bold transition-all cursor-pointer text-center"
                >
                  <Phone size={16} className="text-[#f0bb5b]" />
                  <span>Call Admissions: 09133903600</span>
                </a>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
