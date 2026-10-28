import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { AdminTabId } from './types';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminStudentsPage from './pages/AdminStudentsPage';
import AdminAcademicPage from './pages/AdminAcademicPage';
import AdminCbtPage from './pages/AdminCbtPage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminFinancePage from './pages/AdminFinancePage';
import AdminNoticeBoardPage from './pages/AdminNoticeBoardPage';
import AdminMessagesPage from './pages/AdminMessagesPage';
import AdminNotificationsPage from './pages/AdminNotificationsPage';
import AdminStaffPage from './pages/AdminStaffPage';

interface AdminPortalAppProps {
  onNavigate?: (path: string) => void;
  initialTab?: AdminTabId;
}

export default function AdminPortalApp({ onNavigate = () => {}, initialTab = 'dashboard' }: AdminPortalAppProps) {
  const [activeTab, setActiveTab] = useState<AdminTabId>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs: AdminTabId[] = [
        'dashboard',
        'students',
        'academic',
        'cbt',
        'resources',
        'finance',
        'notices',
        'messages',
        'notifications',
        'staff',
      ];
      if (validTabs.includes(hash as AdminTabId)) {
        return hash as AdminTabId;
      }
    }
    return initialTab;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<{id:number;message:string;kind:'error'|'success'|'info'}|null>(null);
  useEffect(()=>{
    const onToast=(event:Event)=>{
      const detail=(event as CustomEvent<{message:string;kind?:'error'|'success'|'info'}>).detail;
      if(detail?.message)setToast({id:Date.now(),message:detail.message,kind:detail.kind||'info'});
    };
    window.addEventListener('upec-admin-toast',onToast);
    return()=>window.removeEventListener('upec-admin-toast',onToast);
  },[]);
  useEffect(()=>{
    if(!toast)return;
    const timeout=window.setTimeout(()=>setToast(current=>current?.id===toast.id?null:current),5000);
    return()=>window.clearTimeout(timeout);
  },[toast]);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validTabs: AdminTabId[] = [
        'dashboard',
        'students',
        'academic',
        'cbt',
        'resources',
        'finance',
        'notices',
        'messages',
        'notifications',
        'staff',
      ];
      if (validTabs.includes(hash as AdminTabId)) {
        setActiveTab(hash as AdminTabId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: AdminTabId) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      window.location.hash = tab;
      document.querySelector('main')?.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const renderActivePage = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboardPage onNavigateTab={handleTabChange} />;
      case 'students':
        return <AdminStudentsPage />;
      case 'academic':
        return <AdminAcademicPage />;
      case 'cbt':
        return <AdminCbtPage />;
      case 'resources':
        return <AdminResourcesPage />;
      case 'finance':
        return <AdminFinancePage />;
      case 'notices':
        return <AdminNoticeBoardPage />;
      case 'messages':
        return <AdminMessagesPage />;
      case 'notifications':
        return <AdminNotificationsPage />;
      case 'staff':
        return <AdminStaffPage />;
      default:
        return <AdminDashboardPage onNavigateTab={handleTabChange} />;
    }
  };

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onNavigate={onNavigate}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
    >
      <div key={activeTab} className={`site-page-enter min-w-0 w-full ${activeTab === "students" ? "h-full min-h-0" : ""}`}>{renderActivePage()}</div>
      {toast&&<div role={toast.kind==='error'?'alert':'status'} aria-live={toast.kind==='error'?'assertive':'polite'} className={`fixed right-3 top-3 z-[100] flex max-w-[min(420px,calc(100vw-24px))] items-start gap-3 rounded-xl border bg-white p-4 shadow-xl sm:right-6 sm:top-6 ${toast.kind==='error'?'border-rose-300 text-rose-800':toast.kind==='success'?'border-emerald-300 text-emerald-800':'border-slate-200 text-[#111A43]'}`}>
        <span className="min-w-0 flex-1 text-sm font-medium">{toast.message}</span>
        <button type="button" onClick={()=>setToast(null)} aria-label="Dismiss notification" className="shrink-0 rounded p-1 hover:bg-slate-100"><X size={16}/></button>
      </div>}
    </AdminLayout>
  );
}
