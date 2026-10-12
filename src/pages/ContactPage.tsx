import React, { useState } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
  MessageSquare,
  HelpCircle,
  Compass,
  ArrowRight,
  Building2,
  Navigation,
  ExternalLink,
  Copy,
  Check,
  Car,
  Bus,
  ShieldCheck,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import InteractiveCampusMap from '../components/InteractiveCampusMap';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function ContactPage({ onNavigate }: PageProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    programme: 'JAMB (UTME) Coaching',
    inquiryType: 'Admission & Registration',
    message: '',
  });

  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopyAddress = () => {
    const address = '23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.message) return;
    const ticketId = `UPEC-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicket(ticketId);
  };

  return (
    <main className="w-full bg-white text-[#0b1a42]">
      {/* =========================================================================
          HERO BANNER
          ========================================================================= */}
      <section className="relative isolate bg-[#08163b] text-white overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 z-0">
          <img
            src="/images/contact_hero.jpg"
            alt="University Pathway Educational Consult Reception Desk"
            className="w-full h-full object-cover object-center opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#08163b] via-[#08163b]/95 to-[#08163b]/60" />
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
            <span className="text-[#f0bb5b]">Contact Us</span>
          </nav>

          <div className="max-w-3xl">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight">
              Get in Touch with Our Advisors
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
              Whether you are preparing for UTME, O’Level makeup, Direct Entry A’Levels, or international exams, our academic counseling desk in Ilorin is ready to guide you.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTACT CARDS GRID
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 -mt-8 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Physical Address */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#0b1a42]">Visit Our Center</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State, Nigeria.
              </p>
            </div>
            <p className="text-[11px] font-semibold text-[#d5a75b] mt-4 pt-3 border-t border-slate-100">
              Easily accessible via Sawmill Garage transit hub
            </p>
          </div>

          {/* Official Phone Lines */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#0b1a42]">Call Admissions</h3>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <p><a href="tel:09133903600" className="hover:text-[#c62839] font-medium">09133903600</a></p>
                <p><a href="tel:09166664266" className="hover:text-[#c62839] font-medium">09166664266</a></p>
                <p><a href="tel:08088387657" className="hover:text-[#c62839] font-medium">08088387657</a></p>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-4 pt-3 border-t border-slate-100">
              Phone lines active Mon – Sat
            </p>
          </div>

          {/* Official Email */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center mb-4">
                <Mail size={24} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#0b1a42]">Email Inquiries</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Send your official questions, verification slips, and requests to:
              </p>
              <a
                href="mailto:unipathway2020@gmail.com"
                className="mt-2 block text-xs font-bold text-[#0b1a42] hover:text-[#c62839] break-all underline"
              >
                unipathway2020@gmail.com
              </a>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-4 pt-3 border-t border-slate-100">
              Response within 24 working hours
            </p>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#c62839] flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h3 className="font-serif text-base font-bold text-[#0b1a42]">Office Hours</h3>
              <div className="text-xs text-slate-600 mt-2 space-y-1">
                <p><strong>Mon – Fri:</strong> 8:00 AM – 6:00 PM</p>
                <p><strong>Saturday:</strong> 9:00 AM – 4:00 PM</p>
                <p><strong>Sunday:</strong> Closed</p>
              </div>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-4 pt-3 border-t border-slate-100">
              Sunday sessions by prior appointment
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE INQUIRY FORM & LOCATION GUIDE
          ========================================================================= */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-lg">
            <span className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839]" />
              ONLINE INQUIRY DESK
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#0b1a42] mt-2 leading-tight">
              Send an Inquiry or Book a Counseling Session
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
              Fill in your details below and an academic advisor from University Pathway will reach out with complete batch timetables and curriculum requirements.
            </p>

            {submittedTicket ? (
              <div className="mt-8 p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center animate-in fade-in">
                <CheckCircle2 size={48} className="mx-auto text-emerald-600 mb-3" />
                <h3 className="text-lg font-serif font-bold text-emerald-950">
                  Inquiry Successfully Submitted!
                </h3>
                <p className="text-xs text-emerald-800 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.fullName}</strong>. Your inquiry reference ticket is{' '}
                  <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                    {submittedTicket}
                  </span>
                  . Our admissions officer will contact you on <strong>{formData.phone}</strong> shortly.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicket(null);
                      setFormData({
                        fullName: '',
                        email: '',
                        phone: '',
                        programme: 'JAMB (UTME) Coaching',
                        inquiryType: 'Admission & Registration',
                        message: '',
                      });
                    }}
                    className="px-5 py-2.5 rounded-xl border border-emerald-300 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
                  >
                    Submit Another Inquiry
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('/apply')}
                    className="px-5 py-2.5 rounded-xl bg-[#c62839] text-white text-xs font-bold shadow-md hover:bg-[#b01f30] transition-colors"
                  >
                    Proceed to Registration Form
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Amina Bello"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 09133903600"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. amina@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                      Programme of Interest
                    </label>
                    <select
                      value={formData.programme}
                      onChange={(e) => setFormData({ ...formData, programme: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                    >
                      <option value="JAMB (UTME) Coaching">JAMB (UTME) Coaching</option>
                      <option value="O’Level (WAEC / NECO / NABTEB)">O’Level (WAEC / NECO / NABTEB)</option>
                      <option value="A’Level (JUPEB / IJMB / Cambridge)">A’Level (JUPEB / IJMB / Cambridge)</option>
                      <option value="International (IELTS / TOEFL / SAT)">International (IELTS / TOEFL / SAT)</option>
                      <option value="Private Home Tutoring">Private / One-on-One Tutoring</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                    Nature of Inquiry
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => setFormData({ ...formData, inquiryType: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none bg-white"
                  >
                    <option value="Admission & Registration">Admission &amp; Registration Guidance</option>
                    <option value="Batch Timetable & Class Hours">Batch Timetable &amp; Class Hours</option>
                    <option value="Subject Combination Verification">Subject Combination Verification</option>
                    <option value="CBT Practice Test Enrollment">CBT Practice Test Enrollment</option>
                    <option value="Other Educational Consulting">Other Educational Consulting</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0b1a42] mb-1.5">
                    Your Message / Questions <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your current academic standing, target university, or specific questions..."
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-[#0b1a42] outline-none resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-2"
                >
                  <Send size={15} />
                  <span>Send Inquiry to Admissions Desk</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Information & Location Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Location & Directions Card */}
            <div className="bg-[#08163b] text-white rounded-2xl p-7 sm:p-8 shadow-xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#c62839] flex items-center justify-center shrink-0">
                  <Compass size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold">Directions to Our Center</h3>
                  <p className="text-xs text-[#f0bb5b]">Ilorin, Kwara State</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <p>
                  <strong>Physical Landmark:</strong> Located at 23, Olaiya Street, directly off the prominent Sawmill Garage axis in Ilorin.
                </p>
                <p>
                  <strong>By Public Transport:</strong> Board any vehicle or tricycle heading to Sawmill Garage / Olaiya junction. Our center is within short walking distance with clear University Pathway signage.
                </p>
                <p>
                  <strong>Parking:</strong> On-street and designated visitor parking is available for parents and candidates visiting for counseling.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-slate-400">Need live assistance on route?</span>
                <a
                  href="tel:09133903600"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white text-[#0b1a42] text-xs font-bold hover:bg-[#f0bb5b] transition-colors"
                >
                  <Phone size={12} />
                  <span>Call Us</span>
                </a>
              </div>
            </div>

            {/* Direct Application Prompt */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 shadow-sm">
              <h4 className="font-serif text-base font-bold text-[#0b1a42]">
                Ready to Begin Your Registration?
              </h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                You do not have to wait for physical office consultation to begin. Complete our 4-step registration wizard online and secure your seat in the upcoming cohort.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('/apply')}
                className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0b1a42] hover:bg-[#c62839] text-white text-xs font-bold transition-colors shadow-sm"
              >
                <span>Go to Online Application</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CAMPUS & STUDY CENTER LOCATION MAP
          ========================================================================= */}
      <section className="bg-slate-50 border-t border-slate-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="mb-8">
            <span className="text-[#c62839] text-xs font-extrabold uppercase tracking-widest flex items-center gap-2">
              <span className="w-6 h-0.5 bg-[#c62839]" />
              CAMPUS &amp; STUDY CENTER LOCATION
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0b1a42] mt-2">
              Find Our Center in Ilorin
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
              Centrally located at 23 Olaiya Street near Sawmill Garage transit terminal. Easily accessible by road from any part of Ilorin, Offa, Ogbomoso, and neighboring areas.
            </p>
          </div>

          <InteractiveCampusMap />
        </div>
      </section>
    </main>
  );
}
