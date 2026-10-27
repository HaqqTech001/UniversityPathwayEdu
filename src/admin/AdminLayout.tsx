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
  const [currentDate, setCurrentDate] = useState('Monday, 14 July 2025');

  // Real-time clock update (with fallback to mock display date matching reference)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setCurrentTime(timeStr);
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
    <div className="min-h-screen bg-[#F4F7FC] text-[#111A43] flex flex-col font-sans antialiased">
      {/* =========================================================================
          TOP BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#08163B] text-white border-b border-[#14234C] shadow-md">
        <div className="flex h-16 items-center justify-between px-3 sm:px-5 lg:px-6">
          {/* Left: Mobile hamburger & Institutional Identity */}
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors lg:hidden cursor-pointer"
              aria-label="Toggle Navigation Drawer"
            >
              {mobileDrawerOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Logo in top header (visible on desktop or mobile) */}
            <div className="flex items-center gap-3">
              {/* Official Crest SVG */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F2358] to-[#163378] border border-white/20 flex items-center justify-center p-1 shadow-inner shrink-0">
                <svg viewBox="0 0 100 100" className="w-8 h-8" fill="none">
                  {/* Winged Emblem Silhouette */}
                  <path
                    d="M50 15 C65 15 72 25 72 45 C72 65 50 80 50 80 C50 80 28 65 28 45 C28 25 35 15 50 15 Z"
                    fill="#111A43"
                    stroke="#D5A75B"
                    strokeWidth="3"
                  />
                  {/* Open Book */}
                  <path
                    d="M36 45 C42 42 48 44 50 47 C52 44 58 42 64 45 L64 62 C58 59 52 61 50 64 C48 61 42 59 36 62 Z"
                    fill="#FFFFFF"
                    stroke="#D5A75B"
                    strokeWidth="2"
                  />
                  {/* Gold Star / Torch */}
                  <circle cx="50" cy="30" r="4" fill="#D5A75B" />
                </svg>
              </div>

              <div className="leading-tight">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white uppercase font-sans">
                    UNIVERSITY PATHWAY
                  </span>
                </div>
                <div className="text-[10px] tracking-widest text-[#D5A75B] font-bold uppercase">
                  EDUCATIONAL CONSULT
                </div>
                <div className="text-[9px] text-slate-300 italic hidden sm:block">
                  Pathway to a Brighter Future
                </div>
              </div>
            </div>
          </div>

          {/* Center Search Input */}
          <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
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
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell with Badge */}
            <button
              type="button"
              onClick={() => onTabChange('notifications')}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-[#C62839] px-1 text-[10px] font-black text-white ring-2 ring-[#08163B]">
                5
              </span>
            </button>

            {/* Direct Messages Icon */}
            <button
              type="button"
              onClick={() => onTabChange('messages')}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
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
                    <p className="text-[11px] text-slate-500 truncate">admin@universitypathway.edu.ng</p>
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
      <div className="flex-1 flex relative">
        {/* DESKTOP SIDEBAR */}
        <aside className="hidden lg:flex flex-col bg-[#08163B] text-white w-64 xl:w-72 border-r border-[#14234C] shrink-0 sticky top-16 h-[calc(100vh-64px)] justify-between overflow-y-auto">
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

          {/* Bottom Sidebar Photo Card Banner (Matching Screenshot) */}
          <div className="p-3 m-3 rounded-2xl relative overflow-hidden border border-white/10 shadow-lg text-white">
            {/* Background Campus Atmosphere Image with Dark Overlay */}
            <div className="absolute inset-0 z-0">
              <img
                src="/images/campus_atmosphere.jpg"
                alt="University Pathway Campus"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#08163B] via-[#08163B]/85 to-transparent" />
            </div>

            <div className="relative z-10 p-2">
              <h4 className="font-extrabold text-xs text-white leading-tight">
                Your Pathway to Higher Opportunities
              </h4>
              <p className="text-[11px] text-slate-200 mt-1">
                Quality Education • Guidance
              </p>
              <p className="text-[11px] text-slate-200">
                Support • Results
              </p>
              <div className="h-0.5 w-10 bg-[#C62839] mt-2 rounded-full" />
            </div>
          </div>
        </aside>

        {/* MOBILE OVERLAY DRAWER */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-4/5 max-w-xs bg-[#08163B] text-white flex flex-col z-50 shadow-2xl h-full justify-between overflow-y-auto site-drawer-enter">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-white uppercase block">
                    University Pathway
                  </span>
                  <span className="text-[10px] text-[#D5A75B] font-bold uppercase tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-3 space-y-1 flex-1">
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

              <div className="p-4 border-t border-white/10 space-y-2">
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
        <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-7 xl:p-8 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
