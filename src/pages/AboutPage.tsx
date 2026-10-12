import React from 'react';
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
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface PageProps {
  onNavigate: (path: string) => void;
}


export default function AboutPage({ onNavigate }: PageProps) {
  return (
    <main className="w-full bg-white text-[#0b1a42]">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/about_hero.jpg"
            alt="University Pathway Students"
            className="w-full h-full object-cover object-[75%_center] opacity-35 lg:opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/40" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4">
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

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
            About Us
          </h1>
          <p className="mt-3 text-base sm:text-xl text-[#f0bb5b] font-medium tracking-wide">
            Our Story, Our Mission, Our Future
          </p>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: WHO WE ARE
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-5">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              WHO WE ARE
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] leading-tight">
              Dedicated to Guiding Students Toward Academic Excellence
            </h2>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              University Pathway Educational Consult is an established educational consultancy and preparatory coaching centre based at <strong>23 Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria</strong>.
            </p>
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              Founded on the belief that purposeful guidance and structured preparation unlock every student's potential, we bridge the gap between secondary school education and university admission. We prepare candidates for national examinations (JAMB UTME, WAEC, NECO, NABTEB) and advanced entry qualifications (JUPEB, IJMB), as well as international examinations.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('/programmes')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-md transition-all"
              >
                Explore Programmes <ArrowRight size={15} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('/contact')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 hover:border-[#0b1a42] text-[#0b1a42] text-sm font-bold transition-colors"
              >
                Visit Our Centre
              </button>
            </div>
          </div>

          {/* Right Building Image */}
          <div className="lg:col-span-6">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 aspect-[4/3] bg-slate-100 group">
              <img
                src="/images/centre_building.svg"
                alt="University Pathway Educational Consult premises in Ilorin"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-4 py-2 rounded-xl text-xs font-bold text-[#0b1a42] shadow-md">
                📍 23 Olaiya Street, Sawmill Garage, Ilorin
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: MISSION, VISION, CORE VALUES
          ========================================================================= */}
      <section className="py-16 bg-[#f8fafd] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Card 1: Our Mission */}
            <ScrollReveal from="up" delay={50}>
              <article className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-red-50 text-[#c62839] flex items-center justify-center mb-6 shadow-xs">
                  <Target size={28} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Mission
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  To provide learners with structured academic coaching, strategic pathway counselling, and the confidence needed to gain direct and merit admission into their desired tertiary institutions.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#c62839]">
                  “The Fastest Route to University”
                </div>
              </article>
            </ScrollReveal>

            {/* Card 2: Our Vision */}
            <ScrollReveal from="up" delay={150}>
              <article className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-[#d5a75b] flex items-center justify-center mb-6 shadow-xs">
                  <Lightbulb size={28} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Vision
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  To be Nigeria’s premier educational preparatory consult, recognized for ethical academic standards, outstanding examination success rates, and nurturing lifelong scholars.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#d5a75b]">
                  Empowering Future Leaders
                </div>
              </article>
            </ScrollReveal>

            {/* Card 3: Our Core Values */}
            <ScrollReveal from="up" delay={250}>
              <article className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0b1a42] flex items-center justify-center mb-6 shadow-xs">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="font-serif text-2xl font-extrabold text-[#0b1a42] mb-3">
                  Our Core Values
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed flex-1">
                  <strong>Integrity</strong> in guidance, <strong>Excellence</strong> in teaching, <strong>Student-Centred</strong> focus, <strong>Diligence</strong> in study, and absolute commitment to transparent support.
                </p>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-[#0b1a42]">
                  Guiding with Integrity Always
                </div>
              </article>
            </ScrollReveal>
          </div>
        </div>
      </section>


      {/* =========================================================================
          SECTION 3: OUR APPROACH
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            METHODOLOGY
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
            Our Approach to Student Success
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            We combine rigorous academic tutoring with modern computer-based examination testing strategies.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Expert Educators',
              desc: 'Passionate tutors with proven track records in subject mastery and syllabus completion.',
              icon: GraduationCap,
              color: 'text-[#c62839] bg-red-50',
            },
            {
              title: 'Personalised Learning',
              desc: 'Structured cohort sessions with dedicated one-on-one attention for challenging topics.',
              icon: Users,
              color: 'text-[#0b1a42] bg-blue-50',
            },
            {
              title: 'Exam-Focused Training',
              desc: 'Timed CBT practice simulator, past question dissections, and speed drills.',
              icon: BookOpen,
              color: 'text-[#d5a75b] bg-amber-50',
            },
            {
              title: 'Supportive Environment',
              desc: 'A disciplined, safe, and motivating community where learners encourage one another.',
              icon: Award,
              color: 'text-[#c62839] bg-red-50',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-xs hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${item.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#0b1a42] mb-2">{item.title}</h3>
                <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: OUR LEARNING ENVIRONMENT
          ========================================================================= */}
      <section className="py-20 bg-[#f8fafd] border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
              FACILITIES
              <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Our Learning Environment
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
              Designed to foster concentration, collaboration, and high academic achievement.
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
              <div key={facility.title} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col group hover:shadow-xl transition-all">
                <div className="h-52 overflow-hidden bg-slate-100">
                  <img
                    src={facility.image}
                    alt={facility.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif text-xl font-bold text-[#0b1a42] mb-2">{facility.title}</h3>
                  <p className="text-slate-600 text-xs sm:text-[13px] leading-relaxed flex-1">{facility.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: OUR LEADERSHIP
          ========================================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-2">
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
            ADMINISTRATION
            <span className="w-6 h-0.5 bg-[#c62839] inline-block" />
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#0b1a42] mt-2">
            Our Academic Leadership
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Experienced educational consultants and administrators steering student outcomes with integrity.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: 'Academic Director',
              role: 'Director of Studies & Administration',
              image: '/images/director.jpg',
              desc: 'Oversees curriculum standards, tutor appointments, and institutional operations.',
            },
            {
              name: 'Head of Programmes',
              role: 'Admissions & Academic Planning',
              image: '/images/head_programmes.jpg',
              desc: 'Coordinates examination syllabi, student allocations, and lesson schedules.',
            },
            {
              name: 'Student Support Lead',
              role: 'Counselling & Student Affairs',
              image: '/images/student_support.jpg',
              desc: 'Provides career pathway guidance, university application advisory, and pastoral care.',
            },
          ].map((leader) => (
            <div key={leader.role} className="bg-white rounded-2xl p-6 border border-slate-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden border-4 border-slate-100 shadow-md mb-5">
                <img src={leader.image} alt={leader.role} className="w-full h-full object-cover" />
              </div>
              <h3 className="font-serif text-lg font-extrabold text-[#0b1a42]">{leader.name}</h3>
              <p className="text-xs font-bold text-[#c62839] uppercase tracking-wider mt-1">{leader.role}</p>
              <p className="text-slate-600 text-xs mt-3 leading-relaxed">{leader.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          BOTTOM CTA
          ========================================================================= */}
      <section className="bg-[#08163b] text-white py-14">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold">
              Ready to Begin Your Educational Journey?
            </h2>
            <p className="text-slate-300 text-sm mt-1">
              Enroll for the upcoming session or contact our advisory office in Ilorin.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admissions')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-sm font-bold shadow-lg transition-colors shrink-0"
          >
            Apply for Admission <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}
