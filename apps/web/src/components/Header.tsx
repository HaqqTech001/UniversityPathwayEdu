import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  BookOpen,
  GraduationCap,
  Globe2,
  Landmark,
  FileCheck,
  CreditCard,
  UserCheck,
  Monitor,
  FileText,
  Lock,
} from 'lucide-react';
import UniversityPathwayLogo from './UniversityPathwayLogo';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export default function Header({ currentPath, onNavigate }: HeaderProps) {
  const { currentUser, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileDropdown, setOpenMobileDropdown] = useState<string | null>(null);
  const [activeDesktopDropdown, setActiveDesktopDropdown] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const triggerButtonRef = useRef<HTMLButtonElement>(null);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    {
      label: 'Programmes',
      path: '/programmes',
      hasDropdown: true,
      dropdown: [
        { label: 'All Programmes Overview', path: '/programmes', desc: 'Browse all coaching & pathway options', icon: BookOpen },
        { label: 'JAMB (UTME)', path: '/programmes#jamb', desc: 'UTME preparation & exam strategies', icon: GraduationCap },
        { label: 'O’Level Programmes', path: '/programmes#olevel', desc: 'WAEC, NECO & NABTEB coaching', icon: BookOpen },
        { label: 'A’Level Programmes', path: '/programmes#alevel', desc: 'JUPEB, IJMB & Cambridge pathways', icon: Landmark },
        { label: 'International Exams', path: '/programmes#international', desc: 'IELTS, TOEFL, GRE, GMAT & SAT', icon: Globe2 },
      ],
    },
    {
      label: 'Admissions',
      path: '/admissions',
      hasDropdown: true,
      dropdown: [
        { label: 'Admissions Overview', path: '/admissions', desc: 'Admission criteria & step-by-step guidance', icon: FileCheck },
        { label: 'How to Apply', path: '/admissions#process', desc: 'Step-by-step application guidance', icon: CreditCard },
      ],
    },
    {
      label: 'Resources',
      path: '/resources',
      hasDropdown: true,
      dropdown: [
        { label: 'Resource Library', path: '/resources', desc: 'Approved subject syllabuses & past questions', icon: FileText },
        { label: 'Study Guidelines', path: '/resources#guidelines', desc: 'Curriculum & exam preparation notes', icon: BookOpen },
      ],
    },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  // Lock body scroll and handle keyboard events when left drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
          triggerButtonRef.current?.focus();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const handleLinkClick = (path: string) => {
    setIsMobileMenuOpen(false);
    setOpenMobileDropdown(null);
    setActiveDesktopDropdown(null);

    if (path.includes('#')) {
      const [basePath, hash] = path.split('#');
      const targetBase = basePath || '/';
      if (currentPath !== targetBase) {
        onNavigate(targetBase);
        setTimeout(() => {
          const el = document.getElementById(hash);
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 200);
      } else {
        const el = document.getElementById(hash);
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onNavigate(path);
    }
  };

  const toggleMobileDropdown = (label: string) => {
    setOpenMobileDropdown(openMobileDropdown === label ? null : label);
  };

  const isLinkActive = (path: string) => {
    if (path === '/') {
      return currentPath === '/';
    }
    return currentPath === path || currentPath.startsWith(path + '/');
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white">
      {/* =========================================================================
          SECTION A: TOP UTILITY CONTACT BAR
          ========================================================================= */}
      <div className="bg-[#081436] text-white py-1.5 px-3 sm:px-6 md:px-8 border-b border-[#0f2150] h-9 flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] sm:text-[12px] text-slate-200">
          {/* Continuous, clipped headline-style ticker on all viewport sizes. */}
          <div className="relative mr-4 min-w-0 flex-1 overflow-hidden" aria-label="UPEC contact information">
            <div className="overflow-hidden">
              <div className="upec-utility-ticker">
                {[0,1].map(copy=><div key={copy} aria-hidden={copy===1} className="upec-utility-ticker__group">
                  <span className="inline-flex shrink-0 items-center gap-1.5"><MapPin size={12} className="text-[#e5b05c]"/>23, Olaiya Street, Sawmill Garage, Ilorin, Kwara State</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5"><Phone size={12} className="text-[#e5b05c]"/>09133903600 | 09166664266</span>
                  <span className="inline-flex shrink-0 items-center gap-1.5"><Mail size={12} className="text-[#e5b05c]"/>unipathway2020@gmail.com</span>
                </div>)}
              </div>
            </div>

          </div>

          {/* Right Social Media Icons (Mockup arrangement: Facebook, Twitter/X, Instagram, LinkedIn) */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {[
              {
                name: 'Facebook',
                href: '#',
                icon: (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95C18.05 21.45 22 17.18 22 12z" />
                  </svg>
                ),
              },
              {
                name: 'Twitter',
                href: '#',
                icon: (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                ),
              },
              {
                name: 'Instagram',
                href: '#',
                icon: (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                ),
              },
              {
                name: 'LinkedIn',
                href: '#',
                icon: (
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                ),
              },
            ].map((social) => (
              <a
                key={social.name}
                href={social.href}
                onClick={(e) => {
                  if (social.href === '#') {
                    e.preventDefault();
                  }
                }}
                aria-label={social.name}
                className="w-6 h-6 rounded-full border border-white/20 hover:border-[#e5b05c] hover:text-[#e5b05c] flex items-center justify-center transition-colors text-slate-300"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION B: MAIN NAVIGATION BAR
          ========================================================================= */}
      <nav className="border-b border-slate-100 shadow-[0_2px_15px_rgba(11,26,66,0.06)] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo on Left */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              handleLinkClick('/');
            }}
            className="shrink-0 transition-opacity hover:opacity-95 w-65 "
          >
            {/* <UniversityPathwayLogo variant="header" /> */}
            <img src="./images/pathway-logos/pathway-header.png" alt="" width="100%" height="100%" />

            
          </a>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path);
              const hasDropdown = Boolean(link.hasDropdown);

              return (
                <div
                  key={link.label}
                  className="relative group py-2"
                  onMouseEnter={() => hasDropdown && setActiveDesktopDropdown(link.label)}
                  onMouseLeave={() => setActiveDesktopDropdown(null)}
                >
                  <button
                    type="button"
                    onClick={() => handleLinkClick(link.path)}
                    className={`relative inline-flex items-center gap-1 text-[14px] font-bold transition-colors ${
                      active
                        ? 'text-[#c62839]'
                        : 'text-[#0b1a42] hover:text-[#c62839]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {hasDropdown && (
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 text-slate-400 group-hover:text-[#c62839] ${
                          activeDesktopDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                    {/* Active Red Underline Indicator */}
                    {active && (
                      <span className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] bg-[#c62839] rounded-full" />
                    )}
                  </button>

                  {/* Desktop Dropdown Card Menu */}
                  {hasDropdown && activeDesktopDropdown === link.label && (
                    <div className="absolute top-full left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in fade-in slide-in-from-top-1">
                      {link.dropdown?.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => handleLinkClick(item.path)}
                            className="w-full text-left p-2.5 rounded-xl flex items-start gap-3 hover:bg-slate-50 transition-colors group/item"
                          >
                            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#c62839] flex items-center justify-center shrink-0 group-hover/item:bg-[#c62839] group-hover/item:text-white transition-colors">
                              <Icon size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#0b1a42] group-hover/item:text-[#c62839] transition-colors">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                {item.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Action: Apply / Register Button (Matching Mockup, desktop only) */}
          <div className="hidden lg:flex items-center shrink-0">
            <button
              type="button"
              onClick={() => handleLinkClick('/apply')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#c62839] hover:bg-[#b01f30] text-white text-[13px] font-bold shadow-md shadow-[#c62839]/25 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Apply / Register</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {/* Mobile & Tablet Hamburger Button (< lg) */}
          <div className="flex items-center lg:hidden shrink-0">
            <button
              ref={triggerButtonRef}
              type="button"
              aria-label="Open navigation menu drawer"
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-[#0b1a42] hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================================================
          LEFT-SIDE NAVIGATION DRAWER & BACKDROP OVERLAY
          ========================================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50  flex lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          {/* Dark Semi-Transparent Backdrop */}
          <div
            className="fixed inset-0 bg-[#060f26]/70 backdrop-blur-xs transition-opacity animate-backdrop-fade-in"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Left-side Drawer Panel */}
          <div
            ref={drawerRef}
            className="relative w-[85%] max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-drawer-slide-in overflow-hidden"
          >
            {/* Drawer Top Header with Logo and Close Button */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  handleLinkClick('/');
                }}
              >
                <UniversityPathwayLogo variant="compact" />
              </a>
              <button
                type="button"
                aria-label="Close navigation drawer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl text-slate-500 hover:text-[#0b1a42] hover:bg-slate-200/60 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
              {navLinks.map((link) => {
                const active = isLinkActive(link.path);
                const hasDropdown = Boolean(link.hasDropdown);
                const isExpanded = openMobileDropdown === link.label;

                return (
                  <div key={link.label} className="rounded-xl overflow-hidden">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          if (hasDropdown) {
                            toggleMobileDropdown(link.label);
                          } else {
                            handleLinkClick(link.path);
                          }
                        }}
                        className={`flex-1 text-left py-2.5 px-3 text-sm font-bold rounded-xl flex items-center justify-between transition-colors ${
                          active
                            ? 'bg-red-50 text-[#c62839]'
                            : 'text-[#0b1a42] hover:bg-slate-50'
                        }`}
                      >
                        <span>{link.label}</span>
                        {hasDropdown && (
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${
                              isExpanded ? 'bg-red-50 text-[#c62839] rotate-180' : 'text-slate-400'
                            }`}
                          >
                            <ChevronDown size={16} />
                          </div>
                        )}
                      </button>
                    </div>

                    {/* Accordion Dropdown Submenu */}
                    {hasDropdown && isExpanded && (
                      <div className="mx-1 mb-2 p-1.5 bg-[#f8fafd] rounded-xl border border-slate-200/70 space-y-1">
                        {link.dropdown?.map((sub) => {
                          const Icon = sub.icon;
                          return (
                            <button
                              key={sub.label}
                              type="button"
                              onClick={() => handleLinkClick(sub.path)}
                              className="w-full text-left p-2 rounded-lg bg-white border border-slate-100 hover:border-red-200 shadow-xs flex items-center gap-2.5 transition-all group"
                            >
                              <div className="w-7 h-7 rounded-md bg-red-50 text-[#c62839] flex items-center justify-center shrink-0 group-hover:bg-[#c62839] group-hover:text-white transition-colors">
                                <Icon size={14} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#0b1a42] group-hover:text-[#c62839] transition-colors truncate">
                                  {sub.label}
                                </p>
                                <p className="text-[10px] text-slate-500 leading-tight truncate">
                                  {sub.desc}
                                </p>
                              </div>
                              <ArrowRight size={13} className="text-slate-300 group-hover:text-[#c62839] shrink-0" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drawer Bottom Actions & Contacts */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2.5">
              <button
                type="button"
                onClick={() => handleLinkClick('/apply')}
                className="w-full py-3 rounded-xl bg-[#c62839] hover:bg-[#b01f30] text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <span>Apply / Register Now</span>
                <ArrowRight size={14} />
              </button>

              <div className="flex items-center justify-around text-[10.5px] text-slate-500 pt-1 font-medium">
                <a href="tel:09133903600" className="flex items-center gap-1 hover:text-[#0b1a42]">
                  <Phone size={11} className="text-[#c62839]" /> 09133903600
                </a>
                <span>•</span>
                <a href="mailto:unipathway2020@gmail.com" className="flex items-center gap-1 hover:text-[#0b1a42]">
                  <Mail size={11} className="text-[#c62839]" /> Email support
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

