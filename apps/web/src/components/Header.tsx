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
  const [newsItems,setNewsItems] = useState<Array<{title:string;url:string}>>([]);
  useEffect(()=>{const controller=new AbortController();const base=(import.meta.env.VITE_API_URL||'http://localhost:4000').replace(/\/$/,'');fetch(base+'/api/news/education',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error('News unavailable');return r.json();}).then(data=>setNewsItems(Array.isArray(data.articles)?data.articles.filter((a:unknown):a is {title:string;url:string}=>Boolean(a)&&typeof a==='object'&&typeof (a as {title?:unknown}).title==='string'&&typeof (a as {url?:unknown}).url==='string'&&/^https:\/\//.test((a as {url:string}).url)).slice(0,10):[])).catch(()=>{});return()=>controller.abort();},[]);
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
      {/* Social-only utility strip. Profile links can be enabled when approved URLs are supplied. */}
      <div className="border-b border-[#182753] bg-[#081436] px-4 py-1.5 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-end gap-3" aria-label="Social media platforms">
          {[
            {label:'Facebook',glyph:'f'},
            {label:'X',glyph:'𝕏'},
            {label:'Instagram',glyph:'◎'},
            {label:'TikTok',glyph:'♪'},
          ].map(social=><span key={social.label} title={social.label+' — official profile link pending'} aria-label={social.label+' profile link pending'} className="flex h-6 w-6 items-center justify-center rounded-full border border-white/25 text-sm font-bold text-slate-200" >{social.glyph}</span>)}
        </div>
      </div>
      {/* Separate education-headlines ticker — not address/contact information. */}
      <div className="flex min-h-9 items-center overflow-hidden border-b border-[#24355f] bg-[#111A43] px-3 text-white" aria-label="Education news headlines">
        <span className="relative z-10 shrink-0 bg-[#C62839] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide sm:text-xs">Latest News</span>
        <div className="ml-3 min-w-0 flex-1 overflow-hidden">
          {newsItems.length > 0 ? (
            <div className="upec-utility-ticker" aria-label="Headlines scroll continuously right to left">
              {[0,1].map(copy=><div className="upec-utility-ticker__group" key={copy} aria-hidden={copy===1}>
                {newsItems.map(item=><a key={item.url} href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 items-center gap-2 text-xs text-slate-100 hover:text-[#f2ca7b] focus-visible:text-[#f2ca7b]"><span className="text-[#f2ca7b]">●</span>{item.title}</a>)}
              </div>)}
            </div>
          ) : <span className="block truncate py-1 text-xs text-slate-300">Education headlines are temporarily unavailable.</span>}
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

