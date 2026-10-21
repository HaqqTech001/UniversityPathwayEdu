import React from 'react';
import { MapPin, Phone, Mail, ArrowRight } from 'lucide-react';
import UniversityPathwayLogo from './UniversityPathwayLogo';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const handleNav = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = path;
    }
  };

  return (
    <footer className="bg-[#060f26] text-white pt-16 pb-8 border-t border-[#101d44]">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-14 border-b border-white/10">
          {/* Column 1: Institutional Identity & Description (4 cols) */}
          <div className="lg:col-span-4">
            <button
              type="button"
              onClick={() => handleNav('/')}
              className="text-left"
            >
              <UniversityPathwayLogo variant="footer" />
            </button>
            <p className="mt-5 text-slate-300 text-xs sm:text-[13px] leading-relaxed max-w-sm">
              A premier educational consultancy and coaching centre empowering candidates to achieve their dream university admissions in Nigeria and internationally.
            </p>

            {/* Circular Social Icons */}
            <div className="mt-6 flex items-center gap-2.5">
              {[
                {
                  name: 'Facebook',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.18 22 12z" />
                    </svg>
                  ),
                },
                {
                  name: 'Twitter',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
                {
                  name: 'Instagram',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  ),
                },
                {
                  name: 'TikTok',
                  icon: (
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  ),
                },
              ].map((s) => (
                <a
                  key={s.name}
                  href={s.name === 'TikTok' ? 'https://www.tiktok.com/' : '#social'}
                  aria-label={s.name}
                  className="w-8 h-8 rounded-full border border-white/20 hover:border-[#d5a75b] hover:text-[#d5a75b] flex items-center justify-center transition-colors text-slate-300"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (2.5 cols) */}
          <div className="lg:col-span-2">
            <h3 className="font-serif text-base font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {[
                { label: 'Home', path: '/' },
                { label: 'About Us', path: '/about' },
                { label: 'Programmes', path: '/programmes' },
                { label: 'Admissions', path: '/admissions' },
                { label: 'Resources', path: '/resources' },
                { label: 'Blog & News', path: '/blog' },
                { label: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => handleNav(link.path)}
                    className="hover:text-[#efbc63] transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Our Programmes (3 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-base font-bold text-white mb-4">Our Programmes</h3>
            <ul className="space-y-2.5 text-xs text-slate-300 font-medium">
              {[
                { label: 'JAMB (UTME) Coaching', path: '/programmes#jamb' },
                { label: 'O’Level (WAEC, NECO, NABTEB)', path: '/programmes#olevel' },
                { label: 'A’Level (JUPEB, IJMB, Cambridge)', path: '/programmes#alevel' },
                { label: 'International (IELTS, TOEFL, GRE, SAT)', path: '/programmes#international' },
                { label: 'Computerized CBT Simulator', path: '/student' },
                { label: 'Holiday & Weekend Revision', path: '/programmes' },
              ].map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => handleNav(item.path)}
                    className="hover:text-[#efbc63] transition-colors text-left"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us (2.5 cols) */}
          <div className="lg:col-span-3">
            <h3 className="font-serif text-base font-bold text-white mb-4">Contact Us</h3>
            <div className="space-y-3 text-xs text-slate-300">
              <p className="flex items-start gap-2.5 leading-relaxed">
                <MapPin size={16} className="text-[#efbc63] shrink-0 mt-0.5" />
                <span>23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State</span>
              </p>
              <div className="flex items-start gap-2.5">
                <Phone size={15} className="text-[#efbc63] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p><a href="tel:09133903600" className="hover:text-white">09133903600</a></p>
                  <p><a href="tel:09166664266" className="hover:text-white">09166664266</a></p>
                  <p><a href="tel:08088387657" className="hover:text-white">08088387657</a></p>
                </div>
              </div>
              <p className="flex items-center gap-2.5 pt-1">
                <Mail size={15} className="text-[#efbc63] shrink-0" />
                <a href="mailto:unipathway2020@gmail.com" className="hover:text-white break-all">
                  unipathway2020@gmail.com
                </a>
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleNav('/apply')}
                  className="w-full py-2 px-4 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Register / Apply Online</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright and Policy Strip */}
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} University Pathway Educational Consult. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <a href="#privacy" className="hover:text-slate-200 transition-colors">Privacy Policy</a>
            <span>|</span>
            <a href="#terms" className="hover:text-slate-200 transition-colors">Terms of Service</a>
            <span>|</span>
            <span className="text-slate-400">
              Designed by <a href="https://wa.me/2349124448745?text=Hello%20HaqqTech%2C%20I%27d%20like%20to%20enquire%20about%20your%20web%20development%20and%20software%20services." target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-200 underline-offset-4 hover:text-[#d5a75b] hover:underline">HaqqTech</a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
