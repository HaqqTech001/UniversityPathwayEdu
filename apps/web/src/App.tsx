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
import NewsPage from './pages/NewsPage';
import ContactPage from './pages/ContactPage';
import StudentCodeOfConduct from './components/StudentCodeOfConduct';
import ApplyPage from './pages/ApplyPage';
import StudentPortalPage from './pages/StudentPortalPage';
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

  // Staff and administration routes belong to the independent apps/admin build.
  // Never render an admin interface inside the public/student application.
  if (currentPath === '/staff' || currentPath.startsWith('/staff/') ||
      currentPath === '/admin' || currentPath.startsWith('/admin/')) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7f8fc] px-5 py-12">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#c62839]">Separate Administration Application</p>
          <h1 className="mt-3 font-serif text-2xl font-bold text-[#08163b]">Administration has moved</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">Staff administration is not available inside the student website. Authorised staff will use the separately deployed University Pathway administration application once secure access is configured.</p>
          <button type="button" onClick={() => navigate('/')} className="mt-6 rounded-xl bg-[#08163b] px-5 py-3 text-sm font-semibold text-white hover:bg-[#142c65]">Return to website</button>
        </section>
      </main>
    );
  }

  // System A: PublicWebsiteLayout for public-facing website pages
  const renderPublicContent = () => {
    if (currentPath.startsWith('/blog/')) {
      return <BlogPage onNavigate={navigate} />;
    }
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

      case '/news':
        return <NewsPage onNavigate={navigate} />;

      case '/code-of-conduct':
        return <StudentCodeOfConduct />;

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
