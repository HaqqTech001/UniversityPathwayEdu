import React, { useState, useEffect } from 'react';
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {renderActivePage()}
    </AdminLayout>
  );
}
