import React, { useState } from 'react';
import {
  Compass,
  UserPlus,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ChevronRight,
  Info,
  FileText,
  ShieldCheck,
  LogIn,
  LayoutDashboard,
  UserCheck,
  Send,
  Clock,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function AdmissionsPage({ onNavigate }: PageProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const steps = [
    {
      step: '1',
      title: 'Create Account',
      desc: 'Register on the student portal with your email address and secure password to begin your onboarding journey.',
      icon: UserPlus,
    },
    {
      step: '2',
      title: 'Verify Account',
      desc: 'Confirm your credentials and activate your student portal credentials securely.',
      icon: UserCheck,
    },
    {
      step: '3',
      title: 'Sign In',
      desc: 'Log in to your newly created student account using your verified credentials.',
      icon: LogIn,
    },
    {
      step: '4',
      title: 'Access Student Dashboard',
      desc: 'Arrive at your personal dashboard overview prior to initiating profile data entry.',
      icon: LayoutDashboard,
    },
    {
      step: '5',
      title: 'Complete Student Profile',
      desc: 'Provide your personal details, guardian contacts, and educational background information in your profile section.',
      icon: FileText,
    },
    {
      step: '6',
      title: 'Start Application',
      desc: 'Select your preferred preparatory programme and begin your official institutional application workflow.',
      icon: Compass,
    },
    {
      step: '7',
      title: 'Review and Submit',
      desc: 'Carefully verify your application entries, review supporting details, and submit your application for institutional review.',
      icon: Send,
    },
    {
      step: '8',
      title: 'Track Application Status',
      desc: 'Monitor the status of your application directly from your student portal dashboard in real time.',
      icon: Clock,
    },
  ];

  const faqs = [
    {
      q: 'When do application periods open?',
      a: 'Information regarding application cycles and preparatory cohort intake periods is available upon enquiry through our admissions office.',
    },
    {
      q: 'What programmes are available for application?',
      a: 'Prospective students may apply for JAMB UTME coaching, O’Level preparatory classes, and academic advisory services offered at our Ilorin study centre.',
    },
    {
      q: 'What are the tuition and administrative fees?',
      a: 'Fee structures, billing schedules, and administrative requirements are confirmed directly with applicants upon official enquiry and consultation.',
    },
    {
      q: 'How are payments processed?',
      a: 'Official payment guidelines and verified institutional channels are provided directly by our administrative and accounts personnel upon application review.',
    },
    {
      q: 'How long does application review take?',
      a: 'Applications submitted through the student portal are reviewed by our administrative admissions team in due course.',
    },
    {
      q: 'Can I apply for multiple programmes simultaneously?',
      a: 'Candidates seeking guidance on combining preparatory programmes can consult with our academic advisors during the enrollment process.',
    },
  ];

  return (
    <main className="w-full bg-white text-[#0b1a42]">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/admissions_hero.jpg"
            alt="University Pathway Admissions"
            className="w-full h-full object-cover object-[70%_center] opacity-35 lg:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/40" />
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
            <span className="text-[#f0bb5b]">Admissions</span>
          </nav>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Admissions
          </h1>
          <p className="mt-3 text-base sm:text-xl text-[#f0bb5b] font-medium tracking-wide">
            Start Your Journey to Academic Excellence
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: ADMISSIONS ROADMAP (8 STAGES)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            STUDENT JOURNEY ROADMAP
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
            Admissions Process
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Follow our structured eight-stage student journey from initial registration to application tracking on your dashboard.
          </p>
        </div>

        {/* 8 Step Grid / Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.step} from="up" delay={(idx % 4) * 80}>
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between h-full relative group">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center font-black">
                        <Icon size={20} />
                      </div>
                      <span className="font-serif text-2xl font-black text-slate-300 group-hover:text-[#c62839] transition-colors">
                        0{item.step}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#0b1a42] mb-2">
                      {item.step}. {item.title}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: ADMISSION REQUIREMENTS & GUIDELINES
          ========================================================================= */}
      <section className="py-16 bg-[#f8fafd] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Box 1: Admission Requirements */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0b1a42]">
                  Admission Requirements
                </h3>
              </div>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-700">
                {[
                  'Relevant academic credentials or educational history records',
                  'Completed student profile information on the portal dashboard',
                  'Valid identification document (birth certificate, NIN slip, or student ID)',
                  'Completed official student application form',
                  'Adherence to centre rules and student code of conduct',
                  'Two recent passport-sized photographs for student records',
                ].map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="text-[#c62839] shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Important Information */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#d5a75b] flex items-center justify-center">
                  <Info size={20} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#0b1a42]">
                  Administrative Guidelines
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  <strong>Dashboard Access:</strong> Upon signing in, students arrive at their personal dashboard overview before proceeding to profile completion and application submission.
                </p>
                <p>
                  <strong>Policy Confirmation:</strong> Specific session dates, eligibility criteria, and administrative arrangements are subject to official verification by the consult.
                </p>
                <p>
                  <strong>Enquiries:</strong> Prospective applicants and parents are encouraged to contact our admissions desk at 23 Olaiya Street, Sawmill Garage, Ilorin, for detailed guidance.
                </p>
                <p>
                  <strong>Orientation:</strong> Admitted candidates participate in an introductory orientation session prior to lecture commencement.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: FAQS (ACCORDION)
          ========================================================================= */}
      <section className="py-20 max-w-4xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-12">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            HAVE QUESTIONS?
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-all shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-serif font-bold text-[#0b1a42] text-base hover:text-[#c62839] transition-colors"
                >
                  <span>{faq.q}</span>
                  <div
                    className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 bg-red-50 text-[#c62839]' : 'text-slate-400'
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>
                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: READY TO APPLY BANNER
          ========================================================================= */}
      <section className="bg-[#08163b] text-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">
            Begin Your Application Today
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Register on our student portal to start your educational journey with University Pathway Educational Consult in Ilorin, Kwara State.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/student/register')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-all"
            >
              Register / Create Account <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full border border-white/30 hover:bg-white/10 text-white text-sm font-bold transition-all"
            >
              Contact Admissions
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
