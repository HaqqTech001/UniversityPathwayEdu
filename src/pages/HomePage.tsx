import React, { useState } from 'react';
import {
  ArrowRight,
  GraduationCap,
  TrendingUp,
  Users,
  ShieldCheck,
  Check,
  Play,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Landmark,
  FileText,
  Award,
  Settings,
  Heart,
} from 'lucide-react';
import ExamLogosStrip from '../components/ExamLogosStrip';
import UniversityPathwayLogo from '../components/UniversityPathwayLogo';
import ScrollReveal from '../components/ScrollReveal';

interface HomePageProps {
  onNavigate?: (path: string) => void;
}


export default function HomePage({ onNavigate }: HomePageProps) {
  const [activeTestimonialIndex, setActiveTestimonialIndex] = useState(0);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const testimonials = [
    {
      quote:
        '“University Pathway gave me the right guidance and support I needed to excel in my JAMB. I’m now in my dream course!”',
      name: 'Amina Yusuf',
      programme: 'JAMB Student',
      avatar: '/images/avatar_amina.jpg',
    },
    {
      quote:
        '“The tutors are amazing and the learning environment is very conducive. I highly recommend University Pathway!”',
      name: 'Tunde Adeyemi',
      programme: 'WAEC Student',
      avatar: '/images/avatar_tunde.jpg',
    },
    {
      quote:
        '“Their counselling helped me choose the best pathway for my future. I’m grateful for their support.”',
      name: 'Fatima Alao',
      programme: 'JUPEB Student',
      avatar: '/images/avatar_fatima.jpg',
    },
  ];

  const nextTestimonial = () => {
    setActiveTestimonialIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonialIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <main className="w-full overflow-hidden bg-white">
      {/* =========================================================================
          SECTION C: HERO SECTION
          ========================================================================= */}
      <section className="relative isolate min-h-[620px] lg:min-h-[670px] bg-[#08163b] text-white overflow-hidden">
        {/* Background Student Photo on right with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/african_students_hero.jpg"
            alt="University Pathway Students"
            className="w-full h-full object-cover object-[70%_25%] lg:object-[80%_center] opacity-45 lg:opacity-75"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/hero_students.jpg';
            }}
          />
          {/* Deep Navy overlay tailored so text is crystal clear */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/25 lg:via-[#08163b]/85" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08163b] via-transparent to-transparent lg:hidden" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 pt-10 pb-28 lg:pt-14 lg:pb-32 flex flex-col justify-between min-h-[620px] lg:min-h-[670px]">
          {/* Upper Hero Grid */}
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-7">
              {/* Crimson Welcome Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#c62839] text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                WELCOME TO UNIVERSITY PATHWAY
              </div>

              {/* Main Serif Headline */}
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.08] tracking-tight text-white mb-5">
                Your Ambition.<br />
                Our Guidance.<br />
                <span className="text-[#f0bb5b]">Your Future.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-200 text-sm sm:text-[15px] leading-relaxed max-w-xl mb-8">
                From examination preparation to university admission pathways, University Pathway helps
                learners achieve their academic goals with expert guidance, quality teaching, and a proven
                track record in Nigeria and abroad.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  type="button"
                  onClick={() => handleNav('/apply')}
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg shadow-[#c62839]/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Apply / Register Now <ArrowRight size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => handleNav('/programmes')}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 text-[#0b1a42] text-sm font-bold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Explore Programmes <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Right Visual Accents (Top script + Floating badge) */}
            <div className="lg:col-span-5 xl:col-span-5 relative hidden lg:flex flex-col justify-between h-[420px]">
              {/* Handwritten script at upper right */}
              <div className="self-end text-right pr-4">
                <p className="font-script text-3xl xl:text-4xl text-[#f0bb5b] tracking-wide rotate-[-3deg] drop-shadow-md">
                  The Fastest Route<br />
                  <span className="text-white text-2xl xl:text-3xl">to University</span>
                </p>
                <svg className="w-32 h-3 ml-auto mt-1 text-[#f0bb5b]" viewBox="0 0 120 12" fill="none">
                  <path d="M2 9 C40 2, 80 12, 118 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>

              {/* Floating "Students First Always" Badge */}
              <div className="self-end mr-6 mb-4 bg-white/95 backdrop-blur rounded-2xl p-3.5 shadow-2xl border border-white/40 flex items-center gap-3 max-w-[210px]">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#d5a75b] shrink-0 shadow-sm">
                  <Award size={22} className="text-[#d5a75b]" />
                </div>
                <div>
                  <p className="text-[12px] font-black text-[#0b1a42] leading-tight">Students First</p>
                  <p className="text-[10px] font-bold text-[#c62839] uppercase tracking-wider">Always</p>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Lower Hero Features in horizontal row */}
          <div className="border-t border-white/15 pt-6 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs sm:text-[13px]">
            <button
              type="button"
              onClick={() => handleNav('/about')}
              className="flex items-center gap-3 text-slate-200 text-left hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-[#c62839] transition-colors">
                <GraduationCap size={18} />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-[#f0bb5b] transition-colors">Expert Tutors</p>
                <p className="text-[11px] text-slate-300">&amp; Academic Support</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/about')}
              className="flex items-center gap-3 text-slate-200 text-left hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-[#c62839] transition-colors">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-[#f0bb5b] transition-colors">Proven Results</p>
                <p className="text-[11px] text-slate-300">&amp; Success Stories</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/admissions')}
              className="flex items-center gap-3 text-slate-200 text-left hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-[#c62839] transition-colors">
                <Users size={18} />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-[#f0bb5b] transition-colors">Personalised</p>
                <p className="text-[11px] text-slate-300">Guidance &amp; Counselling</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/about')}
              className="flex items-center gap-3 text-slate-200 text-left hover:text-white transition-colors cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white shrink-0 group-hover:bg-[#c62839] transition-colors">
                <ShieldCheck size={18} />
              </div>
              <div>
                <p className="font-bold text-white group-hover:text-[#f0bb5b] transition-colors">Safe, Conducive</p>
                <p className="text-[11px] text-slate-300">Learning Environment</p>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION D: OVERLAPPING INFORMATION STRIP (STATS / METRICS BAR)
          ========================================================================= */}
      <section className="relative z-20 -mt-10 sm:-mt-14 max-w-6xl mx-auto px-5 sm:px-8">
        <ScrollReveal from="up" delay={100}>
          <div className="bg-white rounded-2xl shadow-[0_15px_45px_rgba(11,26,66,0.12)] border border-slate-100 p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-0 lg:divide-x divide-slate-100">
          {/* Stat 1: Thousands */}
          <button
            type="button"
            onClick={() => handleNav('/about')}
            className="flex items-center gap-4 lg:px-6 first:pl-2 text-left hover:bg-slate-50/80 rounded-xl p-2 transition-colors cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-full bg-[#fbebee] flex items-center justify-center text-[#c62839] shrink-0 group-hover:bg-[#c62839] group-hover:text-white transition-colors">
              <Users size={24} />
            </div>
            <div>
              <p className="font-serif text-2xl font-black text-[#0b1a42] leading-none group-hover:text-[#c62839] transition-colors">Thousands</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">of Students Guided</p>
            </div>
          </button>

          {/* Stat 2: High Success Rate */}
          <button
            type="button"
            onClick={() => handleNav('/programmes')}
            className="flex items-center gap-4 lg:px-6 text-left hover:bg-slate-50/80 rounded-xl p-2 transition-colors cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-full bg-amber-50 flex items-center justify-center text-[#d5a75b] shrink-0 group-hover:bg-[#d5a75b] group-hover:text-white transition-colors">
              <Award size={24} />
            </div>
            <div>
              <p className="font-serif text-2xl font-black text-[#0b1a42] leading-none group-hover:text-[#c62839] transition-colors">High Success Rate</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">in National &amp; Int’l Exams</p>
            </div>
          </button>

          {/* Stat 3: Multiple Academic Pathways */}
          <button
            type="button"
            onClick={() => handleNav('/programmes')}
            className="flex items-center gap-4 lg:px-6 text-left hover:bg-slate-50/80 rounded-xl p-2 transition-colors cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-full bg-amber-50/80 flex items-center justify-center text-[#d5a75b] shrink-0 group-hover:bg-[#d5a75b] group-hover:text-white transition-colors">
              <Landmark size={24} />
            </div>
            <div>
              <p className="font-serif text-2xl font-black text-[#0b1a42] leading-none group-hover:text-[#c62839] transition-colors">Multiple</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Academic Pathways</p>
            </div>
          </button>

          {/* Stat 4: Trusted Educational Partner */}
          <button
            type="button"
            onClick={() => handleNav('/contact')}
            className="flex items-center gap-4 lg:px-6 last:pr-2 text-left hover:bg-slate-50/80 rounded-xl p-2 transition-colors cursor-pointer group"
          >
            <div className="w-13 h-13 rounded-full bg-[#fbebee] flex items-center justify-center text-[#c62839] shrink-0 group-hover:bg-[#c62839] group-hover:text-white transition-colors">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-serif text-2xl font-black text-[#0b1a42] leading-none group-hover:text-[#c62839] transition-colors">Trusted</p>
              <p className="text-xs text-slate-500 font-semibold mt-1">Educational Partner</p>
            </div>
          </button>
        </div>
      </ScrollReveal>
    </section>

      {/* =========================================================================
          SECTION E: OUR PROGRAMMES SECTION
          ========================================================================= */}
      <section id="programmes" className="py-20 lg:py-24 max-w-7xl mx-auto px-5 sm:px-8">
        {/* Section Header */}
        <ScrollReveal from="up">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
                OUR PROGRAMMES
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1a42] mt-2">
                Academic Pathways for a <span className="text-[#c62839]">Brighter Future</span>
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mt-3 max-w-2xl leading-relaxed">
                We offer comprehensive coaching and consultation services for various examinations and academic pathways in Nigeria and abroad.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleNav('/programmes')}
              className="self-start md:self-end shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#c62839] text-[#c62839] hover:bg-[#c62839] hover:text-white text-sm font-bold transition-colors cursor-pointer"
            >
              View All Programmes <ArrowRight size={15} />
            </button>
          </div>
        </ScrollReveal>

        {/* 4 Cards Grid matching mockup */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: JAMB (UTME) */}
          <ScrollReveal from="up" delay={50}>
            <article
              onClick={() => handleNav('/programmes#jamb')}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer h-full relative"
            >
              {/* Image Region (clipped to rounded top) */}
              <div className="relative h-44 rounded-t-2xl overflow-hidden bg-slate-100">
                <img
                  src="/images/programme_utme.jpg"
                  alt="JAMB UTME Preparation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {/* Overlapping Round Badge in Red (Full circle visible, zero clipping) */}
              <div className="absolute top-44 -translate-y-1/2 left-6 z-20 w-12 h-12 rounded-full bg-[#c62839] text-white flex items-center justify-center shadow-lg border-[3px] border-white">
                <GraduationCap size={22} />
              </div>
              <div className="pt-8 p-6 flex flex-col flex-1">
                <h3 className="font-serif text-[18px] font-extrabold text-[#0b1a42] mb-2 group-hover:text-[#c62839] transition-colors">
                  JAMB (UTME)
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 flex-1">
                  Comprehensive coaching for UTME with experienced tutors and proven strategies.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#c62839] group-hover:gap-2 transition-all text-left">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 2: O'Level Programmes */}
          <ScrollReveal from="up" delay={100}>
            <article
              onClick={() => handleNav('/programmes#olevel')}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer h-full relative"
            >
              {/* Image Region (clipped to rounded top) */}
              <div className="relative h-44 rounded-t-2xl overflow-hidden bg-slate-100">
                <img
                  src="/images/programme_olevel.jpg"
                  alt="O'Level Preparation"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {/* Overlapping Round Badge in Navy (Full circle visible, zero clipping) */}
              <div className="absolute top-44 -translate-y-1/2 left-6 z-20 w-12 h-12 rounded-full bg-[#0b1a42] text-white flex items-center justify-center shadow-lg border-[3px] border-white">
                <FileText size={20} />
              </div>
              <div className="pt-8 p-6 flex flex-col flex-1">
                <h3 className="font-serif text-[18px] font-extrabold text-[#0b1a42] mb-2 group-hover:text-[#c62839] transition-colors">
                  O’Level Programmes
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 flex-1">
                  • WAEC, NECO, NABTEB preparation with excellent learning support.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#c62839] group-hover:gap-2 transition-all text-left">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 3: A'Level Programmes */}
          <ScrollReveal from="up" delay={150}>
            <article
              onClick={() => handleNav('/programmes#alevel')}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer h-full relative"
            >
              {/* Image Region (clipped to rounded top) */}
              <div className="relative h-44 rounded-t-2xl overflow-hidden bg-slate-100">
                <img
                  src="/images/programme_alevel.jpg"
                  alt="A'Level Programmes"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {/* Overlapping Round Badge in Gold (Full circle visible, zero clipping) */}
              <div className="absolute top-44 -translate-y-1/2 left-6 z-20 w-12 h-12 rounded-full bg-[#d5a75b] text-white flex items-center justify-center shadow-lg border-[3px] border-white">
                <Landmark size={20} />
              </div>
              <div className="pt-8 p-6 flex flex-col flex-1">
                <h3 className="font-serif text-[18px] font-extrabold text-[#0b1a42] mb-2 group-hover:text-[#c62839] transition-colors">
                  A’Level Programmes
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 flex-1">
                  • JUPEB, IJMB, NABTEB A’Level, Cambridge and other advanced level programmes.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#c62839] group-hover:gap-2 transition-all text-left">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </ScrollReveal>

          {/* Card 4: International Exams */}
          <ScrollReveal from="up" delay={200}>
            <article
              onClick={() => handleNav('/programmes#international')}
              className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col cursor-pointer h-full relative"
            >
              {/* Image Region (clipped to rounded top) */}
              <div className="relative h-44 rounded-t-2xl overflow-hidden bg-slate-100">
                <img
                  src="/images/programme_international.jpg"
                  alt="International Examinations"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
              {/* Overlapping Round Badge in Red (Full circle visible, zero clipping) */}
              <div className="absolute top-44 -translate-y-1/2 left-6 z-20 w-12 h-12 rounded-full bg-[#c62839] text-white flex items-center justify-center shadow-lg border-[3px] border-white">
                <Globe2 size={20} />
              </div>
              <div className="pt-8 p-6 flex flex-col flex-1">
                <h3 className="font-serif text-[18px] font-extrabold text-[#0b1a42] mb-2 group-hover:text-[#c62839] transition-colors">
                  International Exams
                </h3>
                <p className="text-slate-600 text-[13px] leading-relaxed mb-6 flex-1">
                  • IELTS, TOEFL, GRE, GMAT, SAT and other international examinations.
                </p>
                <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#c62839] group-hover:gap-2 transition-all text-left">
                  Learn More <ArrowRight size={14} />
                </div>
              </div>
            </article>
          </ScrollReveal>
        </div>
      </section>


      {/* =========================================================================
          SECTION F: ABOUT US SECTION (SPLIT WITH FACADE & CHECKLIST)
          ========================================================================= */}
      <section id="about" className="py-20 bg-[#fafbfe] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Centre Building Facade + Tour Button */}
          <div className="lg:col-span-6 relative">
            <ScrollReveal from="left">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3] bg-slate-100 group">
                <img
                  src="/images/centre_building.svg"
                  alt="University Pathway Educational Consult building facade"
                  className="w-full h-full object-cover object-center"
                />
                {/* Play Overlay Button */}
                <button
                  type="button"
                  onClick={() => setIsVideoModalOpen(true)}
                  className="absolute bottom-5 left-5 bg-white/95 backdrop-blur-md rounded-full pl-2 pr-5 py-2 flex items-center gap-3 shadow-lg hover:bg-white transition-all hover:scale-105 text-[#0b1a42] cursor-pointer"
                >
                  <span className="w-9 h-9 rounded-full bg-[#c62839] text-white flex items-center justify-center shadow-sm">
                    <Play size={16} fill="white" className="ml-0.5" />
                  </span>
                  <span className="text-xs font-extrabold">Take a quick tour of our centre</span>
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Narrative, Checkmarks, Button & Mission Card */}
          <div className="lg:col-span-6 relative">
            <ScrollReveal from="right">
              {/* Subtle Crest Watermark */}
              <div className="absolute right-0 top-0 w-64 h-64 pointer-events-none -z-0 opacity-15">
                <UniversityPathwayLogo variant="watermark" />
              </div>

              <div className="relative z-10">
                <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
                  ABOUT US
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2 leading-tight">
                  Guiding Students Towards <br />
                  <span className="text-[#c62839]">Greater Opportunities</span>
                </h2>

                <p className="text-slate-600 text-sm leading-relaxed mt-4">
                  University Pathway Educational Consult is a leading educational consultancy and coaching centre in Ilorin, dedicated to helping students achieve their academic goals through quality teaching, professional guidance, and a supportive learning environment.
                </p>

                {/* 4 Checkmarks */}
                <div className="mt-6 space-y-3">
                  {[
                    'Experienced and dedicated tutors',
                    'Conducive learning environment',
                    'Personalised counselling and guidance',
                    'Multiple academic pathways (local and international)',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#c62839] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="text-sm font-bold text-[#0b1a42]">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button & Mission Quote Card */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
                  <button
                    type="button"
                    onClick={() => handleNav('/about')}
                    className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-md transition-colors cursor-pointer"
                  >
                    Learn More About Us <ArrowRight size={16} />
                  </button>

                  {/* Mission Callout Card - Clickable to About page */}
                  <div
                    onClick={() => handleNav('/about')}
                    className="border-l-4 border-amber-400 bg-white p-4 rounded-r-xl shadow-sm max-w-xs cursor-pointer hover:shadow-md transition-shadow group"
                    title="Click to learn more about our mission"
                  >
                    <p className="font-serif text-sm font-black text-[#0b1a42] leading-snug group-hover:text-[#c62839] transition-colors">
                      “The Fastest Route to University”
                    </p>
                    <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                      — Our Mission
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION G: ADMISSIONS PROMOTIONAL BANNER
          ========================================================================= */}
      <section className="bg-[#08163b] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 items-center">
          {/* Left Student Image */}
          <div className="md:col-span-4 h-56 md:h-64 relative overflow-hidden">
            <img
              src="/images/student_writing_banner.jpg"
              alt="Student focused on study"
              className="w-full h-full object-cover object-center"
              loading="lazy"
            />
            {/* Smooth gradient blend into navy */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#08163b]/30 to-[#08163b] hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08163b] to-transparent md:hidden" />
          </div>

          {/* Center Heading & Subtitle */}
          <div className="md:col-span-5 px-6 py-8 md:py-10">
            <p className="text-[#f0bb5b] text-[11px] font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-5 h-0.5 bg-[#f0bb5b] inline-block" />
              GET STARTED TODAY
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold leading-tight mt-2 text-white">
              Begin Your Academic Journey with Confidence
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
              Join thousands of successful students who have achieved their dreams with University Pathway Educational Consult.
            </p>
          </div>

          {/* Right Action Button & Subtext */}
          <div className="md:col-span-3 px-6 pb-8 md:py-10 flex flex-col items-start md:items-end justify-center">
            <button
              type="button"
              onClick={() => handleNav('/apply')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-lg bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-colors w-full sm:w-auto cursor-pointer"
            >
              Apply / Register Now <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => handleNav('/admissions')}
              className="text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1.5 mt-2.5 transition-colors cursor-pointer text-left"
            >
              <ShieldCheck size={14} className="text-[#f0bb5b] shrink-0" />
              <span>Quick, Easy &amp; Secure Registration</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION H: WHY CHOOSE US SECTION (4 HORIZONTAL ITEMS)
          ========================================================================= */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <ScrollReveal from="up">
          {/* Section Title */}
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              WHY CHOOSE US
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              More Than Just a <span className="text-[#c62839]">Coaching Centre</span>
            </h2>
          </div>
        </ScrollReveal>

          {/* 4 Items in Row matching mockup */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Item 1 */}
            <ScrollReveal from="up" delay={50}>
              <div
                onClick={() => handleNav('/about')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group h-full"
              >
                <div className="w-13 h-13 rounded-full bg-[#c62839] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-[#0b1a42] text-base leading-tight group-hover:text-[#c62839] transition-colors">
                    Expert Academic Guidance
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Get personalised support from experienced educators.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 2 */}
            <ScrollReveal from="up" delay={100}>
              <div
                onClick={() => handleNav('/about')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group h-full"
              >
                <div className="w-13 h-13 rounded-full bg-[#0b1a42] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-[#0b1a42] text-base leading-tight group-hover:text-[#c62839] transition-colors">
                    Proven Success Record
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Our students consistently achieve excellent results.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 3 */}
            <ScrollReveal from="up" delay={150}>
              <div
                onClick={() => handleNav('/programmes')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group h-full"
              >
                <div className="w-13 h-13 rounded-full bg-[#d5a75b] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Settings size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-[#0b1a42] text-base leading-tight group-hover:text-[#c62839] transition-colors">
                    Wide Range of Programmes
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    From O’Level to international exams, we’ve got you covered.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Item 4 */}
            <ScrollReveal from="up" delay={200}>
              <div
                onClick={() => handleNav('/admissions')}
                className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group h-full"
              >
                <div className="w-13 h-13 rounded-full bg-[#c62839] text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                  <Heart size={24} />
                </div>
                <div>
                  <h3 className="font-serif font-black text-[#0b1a42] text-base leading-tight group-hover:text-[#c62839] transition-colors">
                    Student-Centred Approach
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    Your goals, our priority.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION I: TESTIMONIALS SECTION
          ========================================================================= */}
      <section className="py-20 bg-[#fafbfe] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Header with Navigation Arrows */}
          <ScrollReveal from="up">
            <div className="flex items-end justify-between gap-6 mb-12">
              <div>
                <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
                  TESTIMONIALS
                </p>
                <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
                  What Our <span className="text-[#c62839]">Students Say</span>
                </h2>
              </div>
              {/* Arrows */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  aria-label="Previous testimonial"
                  className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#c62839] hover:text-[#c62839] flex items-center justify-center transition-colors bg-white shadow-sm cursor-pointer"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                  className="w-10 h-10 rounded-full border border-slate-300 hover:border-[#c62839] hover:text-[#c62839] flex items-center justify-center transition-colors bg-white shadow-sm cursor-pointer"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* 3 Clean Testimonial Cards matching mockup */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((item, idx) => (
              <ScrollReveal key={item.name} from="up" delay={idx * 100}>
                <article
                  className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full"
                >
                  <p className="text-slate-600 text-[14px] leading-relaxed mb-6 font-normal">
                    {item.quote}
                  </p>
                  <div className="flex items-center gap-3.5 pt-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div>
                      <h3 className="font-serif font-black text-[15px] text-[#0b1a42] leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{item.programme}</p>
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION J: PARTNERS AND EXAMINATION LOGOS
          ========================================================================= */}
      <ExamLogosStrip onNavigate={onNavigate} />

      {/* Tour Video Modal */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full text-center shadow-2xl">
            <h3 className="font-serif text-xl font-bold text-[#0b1a42] mb-3">
              Virtual Centre Tour
            </h3>
            <p className="text-slate-600 text-sm mb-6">
              Our full virtual video walkthrough of the Ilorin centre facilities is being finalized. In the meantime, you are warmly invited to visit us at <strong>23 Olaiya Street, Sawmill Garage, Ilorin</strong>.
            </p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsVideoModalOpen(false);
                  handleNav('/contact');
                }}
                className="px-6 py-2.5 rounded-lg bg-[#0b1a42] text-white font-bold text-sm hover:bg-[#08163b] cursor-pointer"
              >
                Contact &amp; Directions
              </button>
              <button
                type="button"
                onClick={() => setIsVideoModalOpen(false)}
                className="px-6 py-2.5 rounded-lg bg-[#c62839] text-white font-bold text-sm hover:bg-[#b01f30] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
