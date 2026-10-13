import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  User,
  FileText,
  FileCheck,
  Bell,
  Settings,
  BookOpenCheck,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  ExternalLink,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import UniversityPathwayLogo from '../components/UniversityPathwayLogo';

export interface PortalNavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: string;
}

export const STUDENT_PORTAL_NAV_ITEMS: PortalNavItem[] = [
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'profile', label: 'My Profile', icon: User },
  { id: 'applications', label: 'My Applications', icon: FileCheck },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'cbt', label: 'CBT Practice', icon: BookOpenCheck },
  { id: 'notices', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface StudentPortalLayoutProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export default function StudentPortalLayout({
  activeTab,
  onTabChange,
  onNavigate,
  children,
}: StudentPortalLayoutProps) {
  const { currentUser, logout } = useAuth();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // Keyboard Escape listener & body scroll lock for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileDrawerOpen) {
        setIsMobileDrawerOpen(false);
      }
    };

    if (isMobileDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileDrawerOpen]);

  const handleSelectTab = (tabId: string) => {
    onTabChange(tabId);
    if (isMobileDrawerOpen) {
      setIsMobileDrawerOpen(false);
    }
  };

  const handleSignOut = () => {
    logout();
    onNavigate('/student/login');
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-[#0b1a42] flex flex-col font-sans">
      {/* =========================================================================
          COMPACT PORTAL TOP BAR
          ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#08163b] text-white border-b border-[#0f2150] shadow-sm">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Hamburger & Institution Branding */}
          <div className="flex items-center gap-3">
            {/* Hamburger button for Drawer */}
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth < 1024) {
                  setIsMobileDrawerOpen(!isMobileDrawerOpen);
                } else {
                  setIsDesktopCollapsed(!isDesktopCollapsed);
                }
              }}
              aria-label="Toggle student portal navigation drawer"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/15"
            >
              <Menu size={20} />
            </button>

            {/* University Pathway Institutional Branding */}
            <div className="flex items-center gap-2">
              <UniversityPathwayLogo variant="footer" className="scale-90 origin-left" />
              <div className="hidden sm:block pl-2 border-l border-white/15 leading-tight">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#f0bb5b] block">
                  STUDENT PORTAL
                </span>
                <span className="text-[10px] text-slate-300 font-medium">
                  Verified Candidate Desk
                </span>
              </div>
            </div>

          </div>

          {/* Right: Notifications, Identity Card & Logout */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => handleSelectTab('notices')}
              className="relative p-2 rounded-xl bg-white/5 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />

            </button>

            {/* Student Identity Pill */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-white/15">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#c62839] to-[#e84d60] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-inner">
                {currentUser?.biodata.firstName?.[0] || 'U'}
                {currentUser?.biodata.surname?.[0] || 'P'}
              </div>
              <div className="hidden sm:block text-left text-xs leading-tight">
                <p className="font-bold text-white truncate max-w-[130px]">
                  {currentUser?.fullName || 'Student'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentUser?.regNumber || 'Registration pending'}
                </p>
              </div>
            </div>

            {/* Logout Action */}
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-bold transition-colors cursor-pointer ml-1"
              title="Sign Out of Portal"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          PORTAL SHELL: LEFT SIDEBAR / DRAWER + MAIN CONTENT AREA
          ========================================================================= */}
      <div className="flex-1 flex relative">
        {/* DESKTOP LEFT SIDEBAR */}
        <aside
          className={`hidden lg:flex flex-col bg-[#0b1a42] text-white transition-all duration-300 border-r border-[#152a5e] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] ${
            isDesktopCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Collapse/Expand Toggle Header */}
          <div className="p-3 border-b border-white/10 flex items-center justify-between text-xs text-slate-400">
            {!isDesktopCollapsed && (
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#f0bb5b]">
                PORTAL NAVIGATION
              </span>
            )}
            <button
              type="button"
              onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 transition-colors mx-auto"
              title={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
            {STUDENT_PORTAL_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  title={item.label}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c62839] text-white shadow-md shadow-[#c62839]/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} className="shrink-0" />
                  {!isDesktopCollapsed && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                            isActive
                              ? 'bg-white text-[#c62839]'
                              : 'bg-white/10 text-[#f0bb5b]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer info */}
          {!isDesktopCollapsed && (
            <div className="p-4 border-t border-white/10 bg-[#071333] text-[11px] text-slate-400">
              <p className="font-semibold text-white">Student workspace</p>
              <p className="text-[10px] text-slate-500 mt-0.5">University Pathway</p>
            </div>
          )}
        </aside>

        {/* MOBILE / TABLET OVERLAY LEFT DRAWER */}
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Semi-transparent backdrop */}
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileDrawerOpen(false)}
            />

            {/* Left Drawer Panel */}
            <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-[#0b1a42] text-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UniversityPathwayLogo variant="footer" className="scale-85 origin-left" />
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Close drawer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Student info strip */}
              <div className="px-4 py-3 bg-[#071333] border-b border-white/10 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#c62839] to-[#e84d60] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser?.biodata.firstName?.[0] || 'U'}
                  {currentUser?.biodata.surname?.[0] || 'P'}
                </div>
                <div className="text-xs leading-tight">
                  <p className="font-bold text-white truncate max-w-[170px]">
                    {currentUser?.fullName || 'Student'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {currentUser?.regNumber || 'Registration pending'}
                  </p>
                </div>
              </div>

              {/* Drawer Links */}
              <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                {STUDENT_PORTAL_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#c62839] text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon size={18} className="shrink-0" />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isActive
                              ? 'bg-white text-[#c62839]'
                              : 'bg-white/10 text-[#f0bb5b]'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Drawer Bottom Actions */}
              <div className="p-4 border-t border-white/10 bg-[#071333] space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center justify-center gap-2"
                >
                  <ExternalLink size={14} />
                  <span>Return to Public Website</span>
                </button>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 text-xs font-bold flex items-center justify-center gap-2"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
