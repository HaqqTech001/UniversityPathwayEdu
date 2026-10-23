import React, { useEffect, useRef } from 'react';
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
  const mainRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const root=mainRef.current;
    if(!root||!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const sections=Array.from(root.querySelectorAll<HTMLElement>('section'));
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(entry.isIntersecting){
          (entry.target as HTMLElement).classList.add('pathway-section-visible');
          observer.unobserve(entry.target);
        }
      }
    },{threshold:0.06,rootMargin:'0px 0px -28px 0px'});
    sections.forEach((section,index)=>{
      if(index===0)return; // Hero content should be visible immediately.
      section.classList.add('pathway-section-reveal');
      section.dataset.revealDirection=index%3===1?'left':index%3===2?'right':'up';
      observer.observe(section);
    });
    return()=>{observer.disconnect();sections.forEach(section=>{section.classList.remove('pathway-section-reveal','pathway-section-visible');delete section.dataset.revealDirection;});};
  },[currentPath]);
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0b1a42]">
      <Header currentPath={currentPath} onNavigate={onNavigate} />
      <div ref={mainRef} className="flex-1">{children}</div>
      <Footer onNavigate={onNavigate} />
    </div>
  );
}
