import React, { useState } from 'react';
import {
  Target,
  Lightbulb,
  ShieldCheck,
  Users,
  GraduationCap,
  BookOpen,
  Award,
  ArrowRight,
  ChevronRight,
  CheckCircle2,
  MapPin,
  Clock,
  Building2,
  Sparkles,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function AboutPage({ onNavigate }: PageProps) {
  const [activeTab, setActiveTab] = useState<'mission' | 'vision' | 'values'>('mission');

  return (
    <main className="w-full bg-white text-[#0b1a42] selection:bg-[#c62839] selection:text-white">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/about_hero.jpg"
            alt="University Pathway Students"
            className="w-full h-full object-cover object-[75%_center] opacity-35 lg:opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-6">
            <button
              type="button"
              onClick={() => onNavigate('/')}
              className="hover:text-white transition-colors"
            >
              Home
            </button>
            <ChevronRight size={13} className="text-slate-400" />
            <span className="text-[#f0bb5b]">About Us</span>
          </nav>

          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#f0bb5b] text-xs font-extrabold tracking-wider uppercase mb-4 border border-white/10">
              <Sparkles size={14} /> Institutional Profile
            </span>
            <h1 className="font-serif text-4xl sm:text-6xl font-black text-white leading-tight">
              About University Pathway
            </h1>
            <p className="mt-4 text-base sm:text-xl text-slate-200 font-normal leading-relaxed">
              Founded on the bedrock of academic integrity and rigorous preparation, we are dedicated to guiding students in Ilorin and across Nigeria toward successful university admissions.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: WHO WE ARE & OUR IDENTITY
          ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              WHO WE ARE
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1a42] leading-tight">
              Dedicated to Guiding Students Toward Academic Excellence
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              University Pathway Educational Consult is a premier educational consultancy and preparatory coaching centre located at <strong>23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria</strong>.
            </p>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              We bridge the critical gap between secondary school education and tertiary success. Through structured coaching for national examinations (JAMB UTME, WAEC, NECO, NABTEB), advanced qualifications (JUPEB, IJMB), and international pathways, we equip students with the knowledge, discipline, and test-taking competence required to secure admission into competitive degree courses.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center shrink-0 font-bold">
                  01
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#0b1a42] text-sm">Rigorous Tutoring</h4>
                  <p className="text-slate-600 text-xs mt-1">Comprehensive syllabus mastery with seasoned educators.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#d5a75b] flex items-center justify-center shrink-0 font-bold">
                  02
                </div>
                <div>
                  <h4 className="font-serif font-bold text-[#0b1a42] text-sm">Strategic Guidance</h4>
                  <p className="text-slate-600 text-xs mt-1">Expert counseling on subject combinations and university choices.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/programmes')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-md transition-all"
              >
                Explore Our Programmes <ArrowRight size={16} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-slate-300 hover:border-[#0b1a42] text-[#0b1a42] text-sm font-bold transition-colors"
              >
                Visit Our Centre in Ilorin
              </button>
            </div>
          </div>

          {/* Right Building / Campus Graphic */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 bg-slate-100 aspect-[4/3] group">
              <img
                src="/images/centre_building.svg"
                alt="University Pathway Educational Consult premises in Ilorin"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08163b]/80 via-transparent to-transparent opacity-90" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#08163b] text-[#f0bb5b] flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c62839]">Main Campus Location</span>
                  <p className="text-xs sm:text-sm font-bold text-[#0b1a42]">23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MISSION, VISION, CORE VALUES (TABS & CARDS)
          ========================================================================= */}
      <section className="py-20 bg-[#f8fafd] border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              FOUNDATIONAL PRINCIPLES
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Mission, Vision & Core Values
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              The ethical compass and academic benchmarks that drive our daily commitment to every student.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Our Mission */}
            <ScrollReveal from="up" delay={50}>
              <article className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#c62839] flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform">
                  <Target size={32} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Mission
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed flex-1">
                  To provide learners with structured academic coaching, strategic pathway counselling, and the confidence needed to gain direct and merit admission into their desired tertiary institutions.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#c62839]">
                  “The Fastest Route to University”
                </div>
              </article>
            </ScrollReveal>

            {/* Card 2: Our Vision */}
            <ScrollReveal from="up" delay={150}>
              <article className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-[#d5a75b] flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform">
                  <Lightbulb size={32} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Vision
                </h3>
                <p className="text-slate-600 text-sm sm:text-base leading-relaxed flex-1">
                  To be Nigeria’s premier educational preparatory consult, recognized for ethical academic standards, outstanding examination success rates, and nurturing lifelong scholars.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#d5a75b]">
                  Empowering Future Leaders
                </div>
              </article>
            </ScrollReveal>

            {/* Card 3: Our Core Values */}
            <ScrollReveal from="up" delay={250}>
              <article className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full group">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0b1a42] flex items-center justify-center mb-6 shadow-xs group-hover:scale-110 transition-transform">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Core Values
                </h3>
                <div className="text-slate-600 text-sm sm:text-base leading-relaxed flex-1 space-y-2">
                  <p><strong>Integrity:</strong> Honest guidance and transparent counselling at every stage.</p>
                  <p><strong>Excellence:</strong> Uncompromising academic standards and thorough syllabus coverage.</p>
                  <p><strong>Diligence:</strong> Cultivating disciplined study habits for lifelong success.</p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0b1a42]">
                  Guiding with Integrity Always
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: OUR PEDAGOGICAL APPROACH & METHODOLOGY
          ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            METHODOLOGY
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1a42] mt-2">
            Our Approach to Student Success
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
            We combine rigorous academic tutoring with modern computer-based examination (CBT) simulations and individual mentorship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              title: 'Expert Educators',
              desc: 'Passionate tutors with proven track records in subject mastery, interactive teaching, and complete syllabus coverage.',
              icon: GraduationCap,
              color: 'text-[#c62839] bg-red-50 border-red-100',
            },
            {
              title: 'Personalised Learning',
              desc: 'Structured cohort sessions supplemented by dedicated one-on-one attention for challenging concepts.',
              icon: Users,
              color: 'text-[#0b1a42] bg-blue-50 border-blue-100',
            },
            {
              title: 'Exam-Focused Training',
              desc: 'Timed CBT practice simulators, past question dissections, and speed drills to eliminate examination anxiety.',
              icon: BookOpen,
              color: 'text-[#d5a75b] bg-amber-50 border-amber-100',
            },
            {
              title: 'Supportive Environment',
              desc: 'A disciplined, safe, and motivating community where learners inspire one another to achieve top scores.',
              icon: Award,
              color: 'text-[#c62839] bg-red-50 border-red-100',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-8 rounded-3xl border border-slate-200/90 bg-white shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col">
                <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-6 ${item.color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="font-serif text-xl font-bold text-[#0b1a42] mb-3">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed flex-1">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: OUR LEARNING ENVIRONMENT & FACILITIES
          ========================================================================= */}
      <section className="py-24 bg-[#08163b] text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <p className="text-[#f0bb5b] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#f0bb5b] inline-block" />
              CAMPUS & FACILITIES
              <span className="w-6 h-0.5 bg-[#f0bb5b] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mt-2">
              Our Learning Environment
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mt-4 leading-relaxed">
              Designed to foster absolute concentration, collaborative study, and high academic achievement in Ilorin, Kwara State.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Modern Classrooms',
                desc: 'Comfortable, well-ventilated learning halls equipped for focused tutorials and multimedia lectures.',
                image: '/images/classroom.jpg',
              },
              {
                title: 'Resource Centre',
                desc: 'Extensive library of verified past question compilations, syllabus breakdowns, and revision texts.',
                image: '/images/resource_centre.jpg',
              },
              {
                title: 'Conducive Atmosphere',
                desc: 'A calm, dedicated academic space in Ilorin, Kwara State that eliminates outside distractions.',
                image: '/images/campus_atmosphere.jpg',
              },
            ].map((facility) => (
              <div key={facility.title} className="bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col group hover:border-[#f0bb5b]/50 transition-all">
                <div className="h-60 overflow-hidden bg-slate-900">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90"
                    loading="lazy"
                  />
                </div>
                <div className="p-8 flex-1 flex flex-col">
                  <h3 className="font-serif text-2xl font-bold text-white mb-3">{facility.title}</h3>
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">{facility.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR ACADEMIC LEADERSHIP
          ========================================================================= */}
      <section className="py-24 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            ADMINISTRATION
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0b1a42] mt-2">
            Our Academic Leadership
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
            Experienced educational consultants and administrators steering student outcomes with integrity and dedication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Academic Director',
              role: 'Director of Studies & Administration',
              image: '/images/director.jpg',
              desc: 'Oversees curriculum standards, tutor appointments, and institutional operations across all preparatory divisions.',
            },
            {
              name: 'Head of Programmes',
              role: 'Admissions & Academic Planning',
              image: '/images/head_programmes.jpg',
              desc: 'Coordinates examination syllabi, student allocations, and lesson schedules for UTME, JUPEB, and O-Level success.',
            },
            {
              name: 'Student Support Lead',
              role: 'Counselling & Student Affairs',
              image: '/images/student_support.jpg',
              desc: 'Provides career pathway guidance, university application advisory, and pastoral care for every enrolled scholar.',
            },
          ].map((leader) => (
            <div key={leader.role} className="bg-white rounded-3xl p-8 border border-slate-200/90 text-center shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-slate-100 shadow-lg mb-6">
                <img src={leader.image} alt={leader.role} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-serif text-xl font-extrabold text-[#0b1a42]">{leader.name}</h3>
              <p className="text-xs font-bold text-[#c62839] uppercase tracking-wider mt-1">{leader.role}</p>
              <p className="text-slate-600 text-sm mt-4 leading-relaxed">{leader.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: WHY PARENTS & STUDENTS CHOOSE UPEC
          ========================================================================= */}
      <section className="py-20 bg-[#f8fafd] border-y border-slate-200/60">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
              <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
                <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
                THE UPEC ADVANTAGE
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] leading-tight">
                Why Choose University Pathway?
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                We take pride in our transparent counselling, proven methodology, and constant focus on each student's unique academic trajectory.
              </p>
              <ul className="space-y-3 text-sm text-slate-700 font-medium">
                {[
                  'Located conveniently in Ilorin, Kwara State',
                  'Dedicated CBT practice centre for UTME simulation',
                  'Proven track record in university admissions support',
                  'Transparent parent-consultancy communication channels',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={14} />
                    </div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7 bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl">
              <h3 className="font-serif text-2xl font-bold text-[#0b1a42] mb-6">Our Commitment to Excellence</h3>
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#c62839] flex items-center justify-center shrink-0 font-bold">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#0b1a42] text-base">Physical Centre in Ilorin</h4>
                    <p className="text-slate-600 text-sm mt-1">Visit our well-equipped campus at 23 Olaiya Street, Sawmill Garage, Ilorin for personal consultation and registration.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0b1a42] flex items-center justify-center shrink-0 font-bold">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-[#0b1a42] text-base">Structured Academic Calendar</h4>
                    <p className="text-slate-600 text-sm mt-1">Well-paced terms ensuring complete syllabus coverage, revision weeks, and mock examinations before official test dates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA
          ========================================================================= */}
      <section className="bg-[#08163b] text-white py-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[#f0bb5b] text-xs font-extrabold uppercase tracking-widest block mb-2">START YOUR JOURNEY</span>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold">
              Ready to Secure Your University Admission?
            </h2>
            <p className="text-slate-300 text-base mt-2">
              Enroll for our upcoming preparatory cohort or visit our consultancy centre in Ilorin today.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/admissions')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-colors"
            >
              Apply for Admission <ArrowRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/contact')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-bold transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
