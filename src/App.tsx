/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import PublicWebsiteLayout from './layouts/PublicWebsiteLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ProgrammesPage from './pages/ProgrammesPage';
import AdmissionsPage from './pages/AdmissionsPage';
import ResourcesPage from './pages/ResourcesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import ApplyPage from './pages/ApplyPage';
import StudentPortalPage from './pages/StudentPortalPage';
import StaffPortalPage from './pages/StaffPortalPage';
import AuthPage from './pages/AuthPage';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const rawPath = window.location.pathname.replace(/\/$/, '') || '/';
      return rawPath;
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const rawPath = window.location.pathname.replace(/\/$/, '') || '/';
      setCurrentPath(rawPath);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      const [basePath, hash] = path.split('#');
      const cleanPath = basePath.replace(/\/$/, '') || '/';
      window.history.pushState({}, '', path);
      setCurrentPath(cleanPath);

      if (hash) {
        setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }, 150);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  // ROUTING WITH THREE COMPLETELY DISTINCT LAYOUT SYSTEMS (Directive 1)
  // System B: AuthLayout / AuthPage for student authentication flows
  if (currentPath === '/student/login') {
    return <AuthPage key={currentPath} initialMode="signin" onNavigate={navigate} />;
  }
  if (currentPath === '/student/register') {
    return <AuthPage key={currentPath} initialMode="register" onNavigate={navigate} />;
  }
  if (currentPath === '/student/forgot-password') {
    return <AuthPage key={currentPath} initialMode="forgot-password" onNavigate={navigate} />;
  }
  if (currentPath === '/student/reset-password') {
    return <AuthPage key={currentPath} initialMode="reset-password" onNavigate={navigate} />;
  }
  if (currentPath === '/student/verify-email') {
    return <AuthPage key={currentPath} initialMode="email-verify" onNavigate={navigate} />;
  }
  if (currentPath === '/student/verify-otp') {
    return <AuthPage key={currentPath} initialMode="otp-verify" onNavigate={navigate} />;
  }
  if (currentPath === '/auth') {
    return <AuthPage initialMode="signin" onNavigate={navigate} />;
  }

  // System C: StudentPortalLayout for authenticated student workspace
  if (currentPath === '/student' || currentPath === '/student/portal') {
    return <StudentPortalPage onNavigate={navigate} />;
  }

  // System D: StaffPortalPage for protected staff administration desk
  if (currentPath === '/staff' || currentPath === '/staff/login' || currentPath === '/staff/portal') {
    return <StaffPortalPage onNavigate={navigate} />;
  }

  // System A: PublicWebsiteLayout for public-facing website pages
  const renderPublicContent = () => {
    switch (currentPath) {
      case '/about':
        return <AboutPage onNavigate={navigate} />;

      case '/programmes':
        return <ProgrammesPage onNavigate={navigate} />;

      case '/admissions':
        return <AdmissionsPage onNavigate={navigate} />;

      case '/resources':
        return <ResourcesPage onNavigate={navigate} />;

      case '/blog':
        return <BlogPage onNavigate={navigate} />;

      case '/contact':
        return <ContactPage onNavigate={navigate} />;

      case '/apply':
        return <ApplyPage onNavigate={navigate} />;

      case '/':
      default:
        return <HomePage onNavigate={navigate} />;
    }
  };

  return (
    <PublicWebsiteLayout currentPath={currentPath} onNavigate={navigate}>
      {renderPublicContent()}
    </PublicWebsiteLayout>
  );
}
