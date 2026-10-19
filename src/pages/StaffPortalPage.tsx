import React from 'react';
import { Lock, ShieldCheck, ArrowLeft } from 'lucide-react';

interface PageProps {
  onNavigate: (path: string) => void;
}

export default function StaffPortalPage({ onNavigate }: PageProps) {
  return (
    <main className="min-h-screen bg-[#f5f7fc] px-4 py-12 text-[#0b1a42] sm:px-6 lg:py-20">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-12">
        <div className="mb-6 inline-flex rounded-2xl bg-[#08163b] p-4 text-white">
          <ShieldCheck size={28} aria-hidden="true" />
        </div>
        <h1 className="font-serif text-2xl font-bold">UPEC Staff Desk</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Staff access is currently restricted while authenticated staff accounts, permissions and administrative workflows are being configured.
        </p>
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          <Lock size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>No staff sign-in or application approval is available on this page yet. Contact the centre administrator for access information.</p>
        </div>
        <button type="button" onClick={() => onNavigate('/')} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#08163b] px-5 py-3 text-sm font-bold text-white hover:bg-[#152959]">
          <ArrowLeft size={16} aria-hidden="true" /> Return to website
        </button>
      </div>
    </main>
  );
}
