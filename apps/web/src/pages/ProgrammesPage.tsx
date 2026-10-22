import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpen,
  Landmark,
  Globe2,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Clock,
  Sparkles,
  Award,
  Users,
  FileCheck,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function ProgrammesPage({ onNavigate }: PageProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'jamb' | 'olevel' | 'alevel' | 'international'>('all');

  const programmes = [
    {
      id: 'jamb',
      category: 'jamb',
      title: 'JAMB (UTME) Coaching',
      badge: 'Examination Preparation',
      icon: GraduationCap,
      badgeColor: 'bg-[#c62839]',
      image: '/images/programme_utme.jpg',
      description: 'Comprehensive coaching for the Unified Tertiary Matriculation Examination with experienced tutors, extensive past questions analysis, and computerized mock testing.',
      highlights: [
        'Complete UTME syllabus breakdown and mastery',
        'Weekly computerized CBT simulations with instant timing analysis',
        'Use of English drills & subject combinations (Sciences, Arts, Commercial)',
        'Morning, afternoon and evening sessions advertised Monday–Saturday; confirm current availability with the centre',
      ],
      duration: '1 Month, 3 Months, or Full Session (up to exam date)',
      feeInfo: 'Current fees are provided by the admissions office.',
    },
    {
      id: 'olevel',
      category: 'olevel',
      title: 'O’Level Programmes (WAEC, NECO, NABTEB)',
      badge: 'Secondary Examinations',
      icon: BookOpen,
      badgeColor: 'bg-[#0b1a42]',
      image: '/images/programme_olevel.jpg',
      description: 'Intensive academic preparation for Senior Secondary Certificate Examinations (SSCE) across WAEC (May/June & Nov/Dec GCE), NECO, and technical NABTEB exams.',
      highlights: [
        'WAEC, NECO and NABTEB preparation for SSCE and GCE candidates',
        'Practical laboratory science demonstrations & theory workshops',
        'Continuous assessment and mock exam conditions',
        'Morning (9 AM–1 PM) and evening (4 PM–7 PM) coaching times advertised; confirm the current timetable',
      ],
      duration: '3 Months, 6 Months, or Full Academic Year',
      feeInfo: 'Current fees are provided by the admissions office.',
    },
    {
      id: 'alevel',
      category: 'alevel',
      title: 'A’Level Programmes (JUPEB & IJMB)',
      badge: 'Advanced Pathways',
      icon: Landmark,
      badgeColor: 'bg-[#d5a75b]',
      image: '/images/programme_alevel.jpg',
      description: 'Prestigious advanced-level interim joint matriculation programmes that qualify successful candidates for Direct Entry (200 Level) admission into Nigerian universities without JAMB UTME.',
      highlights: [
        'Accredited curriculum for JUPEB and IJMB syllabi',
        '3 advanced subject combinations tailored to university faculty requirements',
        'Experienced university-level lecturers and examiners',
        'Direct Entry (DE) university admission counselling and processing guidance',
      ],
      duration: '9 to 10 Months (Full Academic Session)',
      feeInfo: 'Current fees are provided by the admissions office.',
    },
    {
      id: 'international',
      category: 'international',
      title: 'International Examinations (IELTS, TOEFL, SAT, GRE)',
      badge: 'Global Opportunities',
      icon: Globe2,
      badgeColor: 'bg-[#c62839]',
      image: '/images/programme_international.jpg',
      description: 'Specialised tutorial courses for international study, scholarship testing, English proficiency certifications, and postgraduate admissions in North America, UK, Europe, and beyond.',
      highlights: [
        'IELTS (Academic & General Training) 4-skill mastery (Listening, Reading, Writing, Speaking)',
        'TOEFL iBT computerized testing strategy drills',
        'SAT Math & Evidence-Based Reading score maximisation',
        'GRE & GMAT quantitative reasoning and analytical writing tutorials',
      ],
      duration: '4 to 8 Weeks intensive modular bootcamps',
      feeInfo: 'Current fees are provided by the admissions office.',
    },
  ];

  const filtered = activeTab === 'all'
    ? programmes
    : programmes.filter((p) => p.category === activeTab);

  return (
    <main className="w-full bg-white text-[#0b1a42]">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/programmes_hero.jpg"
            alt="University Pathway Programmes"
            className="w-full h-full object-cover object-[80%_center] opacity-35 lg:opacity-50"
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
            <span className="text-[#f0bb5b]">Programmes</span>
          </nav>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            Our Programmes
          </h1>
          <p className="mt-3 text-base sm:text-xl text-[#f0bb5b] font-medium tracking-wide">
            Academic Pathways for Every Goal
          </p>
        </div>
      </section>

      {/* =========================================================================
          FILTER BAR & PROGRAMMES
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="mb-12">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              EXPLORE OUR PROGRAMMES
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Choose the Pathway Suited to Your Ambition
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {[
              { id: 'all', label: 'All Programmes' },
              { id: 'jamb', label: 'JAMB (UTME)' },
              { id: 'olevel', label: 'O’Level' },
              { id: 'alevel', label: 'A’Level' },
              { id: 'international', label: 'International Exams' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs ${
                  activeTab === tab.id
                    ? 'bg-[#c62839] text-white shadow-md shadow-[#c62839]/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-[#0b1a42]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Programme Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((item, idx) => {
            const Icon = item.icon;
            return (
              <ScrollReveal key={item.id} from="up" delay={(idx % 2) * 120}>
                <article
                  id={item.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col scroll-mt-28 h-full relative"
                >
                  {/* Header Photo */}
                  <div className="relative h-56 rounded-t-2xl overflow-hidden bg-slate-100">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full text-[11px] font-extrabold text-[#c62839] shadow-sm uppercase tracking-wider">
                      {item.badge}
                    </div>
                  </div>

                  {/* Floating Icon (Out of image overflow, fully visible badge) */}
                  <div className={`absolute top-56 -translate-y-1/2 right-6 z-20 w-14 h-14 rounded-2xl ${item.badgeColor} text-white flex items-center justify-center shadow-lg border-4 border-white`}>
                    <Icon size={26} />
                  </div>

                  {/* Content */}
                  <div className="pt-8 p-7 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {item.description}
                      </p>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#0b1a42] mb-3">
                        Key Highlights:
                      </h4>
                      <ul className="space-y-2 mb-6">
                        {item.highlights.map((highlight) => (
                          <li key={highlight} className="flex items-start gap-2.5 text-xs sm:text-[13px] text-slate-700">
                            <CheckCircle2 size={16} className="text-[#c62839] shrink-0 mt-0.5" />
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                      <div className="text-xs">
                        <span className="text-slate-400 block font-medium">Duration:</span>
                        <strong className="text-[#0b1a42]">{item.duration}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => { window.sessionStorage.setItem('upec_selected_programme', item.title); onNavigate('/apply'); }}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs sm:text-sm font-bold shadow-md transition-all"
                      >
                        Apply Now <ArrowRight size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-[#f7f8fc] py-14" aria-labelledby="extra-coaching-title">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-widest text-[#c62839]">Beyond examination programmes</p>
          <h2 id="extra-coaching-title" className="mt-2 font-serif text-3xl font-extrabold text-[#111A43]">Intensive Extramural &amp; Special Coaching</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">UPEC also advertises flexible academic support outside its formal programme applications. These lessons are requested as a service, not as an examination registration.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {['Post-JAMB coaching','Holiday & after-school coaching','School of Nursing entrance examination preparation','Private / home lessons','Undergraduate special coaching','Adult education','Computer training'].map(service=>(
              <div key={service} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-[#111A43] shadow-sm">
                <CheckCircle2 className="shrink-0 text-[#c62839]" size={19}/>{service}
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <a href="tel:09133903600" className="rounded-xl border border-[#111A43] px-5 py-3 text-sm font-bold text-[#111A43] hover:bg-white">Call 09133903600</a>
            <a href="tel:09134308893" className="rounded-xl border border-[#111A43] px-5 py-3 text-sm font-bold text-[#111A43] hover:bg-white">Call 09134308893</a>
            <p className="text-xs text-slate-500">Session times, fees and availability require confirmation.</p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION: WHY OUR PROGRAMMES STAND OUT
          ========================================================================= */}
      <section className="py-20 bg-[#f8fafd] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              ADVANTAGE
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Why Our Programmes Stand Out
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Experienced Tutors',
                desc: 'Subject tutors with deep familiarity with JAMB, WAEC & university testing patterns.',
                icon: Users,
                color: 'bg-red-50 text-[#c62839]',
              },
              {
                title: 'Updated Materials',
                desc: 'Current syllabi, past question compilations, and contemporary mock exams.',
                icon: BookOpen,
                color: 'bg-blue-50 text-[#0b1a42]',
              },
              {
                title: 'Regular Assessments',
                desc: 'Weekly performance tracking and CBT simulations to build speed and accuracy.',
                icon: FileCheck,
                color: 'bg-amber-50 text-[#d5a75b]',
              },
              {
                title: 'Personalised Support',
                desc: 'One-on-one consultation on subject combinations, course eligibility, and cut-offs.',
                icon: Award,
                color: 'bg-red-50 text-[#c62839]',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="p-6 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                  <div className={`w-13 h-13 mx-auto rounded-2xl flex items-center justify-center mb-4 ${feature.color}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#0b1a42] mb-1.5">{feature.title}</h3>
                  <p className="text-slate-600 text-xs leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CTA BANNER
          ========================================================================= */}
      <section className="bg-[#08163b] text-white py-16">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-5">
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">
            Not Sure Which Programme is Right for You?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Speak with our experienced academic advisors for free guidance on subject combinations, direct entry eligibility, and admission requirements.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-all"
            >
              Get a Free Consultation <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
