import React, { useState, useEffect } from 'react';
import {
  Home,
  User,
  Layers,
  FileCheck,
  BookOpen,
  CreditCard,
  Megaphone,
  MessageSquare,
  Bell,
  Users,
  ChevronRight,
  ChevronDown,
  Search,
  Mail,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  ExternalLink,
  Settings,
  Lock,
  Calendar,
  Clock,
  Sun,
  UserCheck,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { AdminTabId, ADMIN_NAV_ITEMS } from './types';

interface AdminLayoutProps {
  activeTab: AdminTabId;
  onTabChange: (tab: AdminTabId) => void;
  onNavigate: (path: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  children: React.ReactNode;
}

export default function AdminLayout({
  activeTab,
  onTabChange,
  onNavigate,
  searchQuery,
  onSearchChange,
  children,
}: AdminLayoutProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState('2025/2026');
  const [currentTime, setCurrentTime] = useState('10:24 AM');
  const [currentDate, setCurrentDate] = useState(() => new Date().toLocaleDateString(undefined, {weekday:'long',day:'numeric',month:'long',year:'numeric'}));

  useEffect(() => {
    setMobileDrawerOpen(false);
    setProfileDropdownOpen(false);
  }, [activeTab]);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileDrawerOpen(false);
    };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [mobileDrawerOpen]);

  // Real-time clock update (with fallback to mock display date matching reference)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(timeStr);
      setCurrentDate(now.toLocaleDateString(undefined, {weekday:'long',day:'numeric',month:'long',year:'numeric'}));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const getIcon = (name: string, size = 18) => {
    switch (name) {
      case 'Home':
        return <Home size={size} />;
      case 'User':
        return <User size={size} />;
      case 'Layers':
        return <Layers size={size} />;
      case 'FileCheck':
        return <FileCheck size={size} />;
      case 'BookOpen':
        return <BookOpen size={size} />;
      case 'CreditCard':
        return <CreditCard size={size} />;
      case 'Megaphone':
        return <Megaphone size={size} />;
      case 'MessageSquare':
        return <MessageSquare size={size} />;
      case 'Bell':
        return <Bell size={size} />;
      case 'Users':
        return <Users size={size} />;
      default:
        return <Home size={size} />;
    }
  };

  return (
    <div className="h-dvh min-h-0 overflow-hidden bg-[#F4F7FC] text-[#111A43] flex flex-col font-sans antialiased">
      {/* =========================================================================
          TOP BAR
          ========================================================================= */}
      <header className="relative shrink-0 z-40 bg-[#08163B] text-white border-b border-[#14234C] shadow-md">
        <div className="flex h-16 min-w-0 items-center justify-between gap-2 px-3 sm:px-5 lg:px-6">
          {/* Left: Mobile hamburger & Institutional Identity */}
          <div className="flex min-w-0 items-center gap-2 lg:gap-4">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors lg:hidden cursor-pointer"
              aria-label={mobileDrawerOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileDrawerOpen}
              aria-controls="admin-mobile-navigation"
            >
              {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Official artwork already contains the institutional name. */}
            <img src="/logo/pathway-footer.png" alt="University Pathway Educational Consult" className="block h-9 sm:h-10 lg:h-11 w-auto max-w-[142px] sm:max-w-[190px] lg:max-w-[220px] object-contain shrink-0" />
          </div>

          {/* Center Search Input */}
          <div className="hidden xl:flex min-w-0 items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search students, applications, payments, notices, staff..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white text-white focus:text-[#111A43] placeholder-slate-400 border border-white/15 focus:border-[#C62839] text-xs font-medium focus:outline-none transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Right: Notifications, Mail & Administrator Profile */}
          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={() => onTabChange('notifications')}
              className="relative hidden sm:inline-flex p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="hidden">
                5
              </span>
            </button>

            {/* Direct Messages Icon */}
            <button
              type="button"
              onClick={() => onTabChange('messages')}
              className="relative hidden md:inline-flex p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              title="Messages"
            >
              <Mail size={19} />
            </button>

            {/* Admin Profile Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#C62839] to-[#D5A75B] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-white/20">
                  AU
                </div>
                <div className="text-left hidden sm:block leading-tight">
                  <p className="text-xs font-bold text-white truncate max-w-[120px]">
                    Admin User
                  </p>
                  <p className="text-[10px] text-slate-300 font-medium">
                    Administrator
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white text-[#111A43] shadow-2xl border border-slate-200 py-2 z-50 site-dropdown-enter">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-xs font-bold text-[#111A43]">Administrator Account</p>
                    <p className="text-[11px] text-slate-500 truncate">unipathway2020@gmail.com</p>
                    <span className="mt-1.5 inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      Super Admin Role
                    </span>
                  </div>

                  <div className="py-1 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onTabChange('staff');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-[#111A43]"
                    >
                      <UserCheck size={15} className="text-[#C62839]" />
                      <span>Administrator Profile</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onTabChange('staff');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-[#111A43]"
                    >
                      <Sliders size={15} className="text-[#2563EB]" />
                      <span>System Settings &amp; Security</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/student');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-[#111A43]"
                    >
                      <ExternalLink size={15} className="text-[#D5A75B]" />
                      <span>Switch to Student Portal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/');
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700 hover:text-[#111A43]"
                    >
                      <Home size={15} className="text-slate-500" />
                      <span>Return to Public Website</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        onNavigate('/');
                      }}
                      className="w-full px-4 py-2 text-left text-xs font-bold text-[#C62839] hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN SHELL: SIDEBAR + CONTENT OUTLET
          ========================================================================= */}
      <div className="flex min-h-0 min-w-0 flex-1 relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col bg-[#08163B] text-white w-56 xl:w-64 border-r border-[#14234C] shrink-0 h-full min-h-0 justify-between overflow-y-auto">
          {/* Navigation Items (Exactly 10 Primary Links) */}
          <div className="py-4 space-y-1">
            <p className="px-5 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#D5A75B]/80">
              Navigation Menu
            </p>
            {ADMIN_NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`w-[calc(100%-1rem)] mx-2 flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C62839] text-white shadow-md shadow-[#C62839]/30'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>
                      {getIcon(item.iconName)}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`shrink-0 transition-transform ${
                      isActive ? 'text-white translate-x-0.5' : 'text-slate-500'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="m-3 rounded-2xl border border-white/10 bg-[#112552] p-4 text-white">
            <h4 className="text-xs font-bold leading-snug">Your Pathway to Higher Opportunities</h4>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-300">Quality Education · Guidance · Support · Results</p>
            <div className="mt-3 h-0.5 w-10 rounded-full bg-[#C62839]" />
          </div>
        </aside>

        {/* MOBILE OVERLAY DRAWER */}
        {mobileDrawerOpen && (
          <div id="admin-mobile-navigation" className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Admin navigation">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-[min(85vw,320px)] min-w-0 bg-[#08163B] text-white flex flex-col z-50 shadow-2xl h-dvh min-h-0 overflow-hidden site-drawer-enter">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <img src="/logo/pathway-footer.png" alt="University Pathway Educational Consult" className="h-10 w-auto max-w-[190px] object-contain" />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                  aria-label="Close navigation menu"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 space-y-1">
                {ADMIN_NAV_ITEMS.map((item) => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onTabChange(item.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-[#C62839] text-white'
                          : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {getIcon(item.iconName)}
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                  );
                })}
              </div>

              <div className="shrink-0 p-4 border-t border-white/10 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileDrawerOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <Home size={14} />
                  <span>Public Website</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT OUTLET */}
        <main className="flex-1 min-h-0 min-w-0 max-w-full overflow-y-auto overflow-x-hidden p-3 sm:p-5 lg:p-6 2xl:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
