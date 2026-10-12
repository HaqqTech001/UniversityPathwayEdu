import React, { useState } from 'react';
import {
  Compass,
  UserPlus,
  FileText,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  ChevronRight,
  Info,
  Calendar,
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
      title: 'Explore Programmes',
      desc: 'Find the right academic pathway for your educational goals, whether JAMB, O’Level, A’Level, or International exams.',
      icon: Compass,
    },
    {
      step: '2',
      title: 'Create an Account',
      desc: 'Register or sign in to the student portal to begin your official application workflow securely.',
      icon: UserPlus,
    },
    {
      step: '3',
      title: 'Complete Application',
      desc: 'Provide your biodata, guardian and emergency details, subject choices, and educational background.',
      icon: FileText,
    },
    {
      step: '4',
      title: 'Make Payment',
      desc: 'Transfer the confirmed ₦15,000 application fee to the institution’s verified First Bank account.',
      icon: CreditCard,
    },
    {
      step: '5',
      title: 'Verification',
      desc: 'Our accounts and admissions team reviews your application documents and confirms bank credit.',
      icon: ShieldCheck,
    },
    {
      step: '6',
      title: 'Confirmation',
      desc: 'Receive your admission clearance, official registration slip, and full portal study access.',
      icon: CheckCircle2,
    },
  ];

  const faqs = [
    {
      q: 'When do applications open?',
      a: 'Applications for our preparatory cohorts are open year-round with rolling admissions. Specific crash courses and full-session cohorts commence in line with the national examination calendar (JAMB UTME, WAEC May/June, and GCE).',
    },
    {
      q: 'What programmes can I apply for?',
      a: 'You can apply for JAMB (UTME) coaching, O’Level preparations (WAEC, NECO, NABTEB), A’Level Direct Entry programmes (JUPEB, IJMB), and International examinations (IELTS, TOEFL, SAT, GRE, GMAT).',
    },
    {
      q: 'What are the tuition fees?',
      a: 'The application and registration processing fee is ₦15,000 (owner-confirmed). Tuition fees depend on the selected programme and study duration (1 month, 3 months, or full academic session). Contact our admissions office for fee schedules.',
    },
    {
      q: 'How do I make payment?',
      a: 'Payments are made via direct bank transfer to University Pathway Educational Consult’s designated bank account. The accounts office verifies actual bank credits before issuing official digital and paper receipts.',
    },
    {
      q: 'When will I receive my registration number?',
      a: 'Permanent institutional student registration numbers are issued transactionally upon successful document review and accounts verification by our administrative staff.',
    },
    {
      q: 'Can I apply for more than one programme?',
      a: 'Yes. Candidates frequently combine JAMB (UTME) coaching with O’Level or A’Level direct entry preparatory classes to maximize university admission opportunities.',
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
            Start Your Journey to a Brighter Future
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: YOUR ADMISSION JOURNEY (6 STEPS)
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            STEP-BY-STEP PROCESS
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
            Your Admission Journey
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Follow these six clear steps to complete your registration and secure your place.
          </p>
        </div>

        {/* 6 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.step} from="up" delay={(idx % 3) * 100}>
                <div
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center font-black">
                        <Icon size={22} />
                      </div>
                      <span className="font-serif text-3xl font-black text-slate-200">
                        0{item.step}
                      </span>
                    </div>
                    <h3 className="font-serif text-lg font-bold text-[#0b1a42] mb-2">
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
          SECTION 2: ADMISSION REQUIREMENTS & IMPORTANT INFORMATION
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
                  'Relevant academic qualification results (WAEC, NECO, or Primary/Junior school certificate)',
                  'Awaiting results are accepted for preparatory UTME and interim A-Level cohorts',
                  'Valid identification document (NIN slip, birth certificate, or student ID)',
                  'Completed official student application form (online or paper-based)',
                  'Payment of the non-refundable ₦15,000 application registration fee',
                  'Two recent passport-sized photographs for student dossier',
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
                  Important Information
                </h3>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  <strong>Session Availability:</strong> Morning cohorts run from 9:00 AM to 1:00 PM; Afternoon cohorts run from 2:00 PM to 6:00 PM. Weekend sessions are available upon enquiry.
                </p>
                <p>
                  <strong>Fee Policy:</strong> The ₦15,000 application fee covers enrollment processing, initial learning diagnostics, and placement review. Tuition fee plans are settled per programme.
                </p>
                <p>
                  <strong>Payment Verification:</strong> Bank transfers are reconciled manually against official bank credits before permanent admission numbers are generated.
                </p>
                <p>
                  <strong>Orientation:</strong> Admitted students must attend the mandatory orientation on centre rules and the code of conduct before lectures begin.
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
            Ready to Apply?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Start your student application online now or visit our educational consult centre in Ilorin, Kwara State.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => onNavigate('/apply')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-all"
            >
              Apply / Register Now <ArrowRight size={16} />
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
