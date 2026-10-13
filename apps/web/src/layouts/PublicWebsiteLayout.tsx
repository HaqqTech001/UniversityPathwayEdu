import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface PublicWebsiteLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

/**
 * PublicWebsiteLayout
 * Used only for public-facing pages: Home, About, Programmes, Admissions,
 * Resources, Blog, Contact, Apply / Register information.
 * Renders the original approved public navbar, top utility bar, and footer.
 */
export default function PublicWebsiteLayout({
  currentPath,
  onNavigate,
  children,
}: PublicWebsiteLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0b1a42]">
      <Header currentPath={currentPath} onNavigate={onNavigate} />
      <div className="flex-1">{children}</div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
