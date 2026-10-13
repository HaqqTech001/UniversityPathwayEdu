import React from 'react';
import { ShieldCheck, LockKeyhole, ArrowLeft, LayoutDashboard, Users, ClipboardList, Settings } from 'lucide-react';

export default function AdminApp() {
  return <main className="min-h-screen bg-[#f7f8fc]">
    <header className="bg-[#08163b] px-5 py-5 text-white sm:px-10">
      <div className="mx-auto flex max-w-6xl items-center gap-3">
        <span className="rounded-xl bg-white/10 p-3 text-[#d5a75b]"><ShieldCheck size={26}/></span>
        <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d5a75b]">University Pathway</p><h1 className="text-xl font-bold">Administration Workspace</h1></div>
      </div>
    </header>
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-8 lg:grid-cols-[230px_1fr] lg:py-12">
      <aside aria-label="Administration modules" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">Workspace modules</p>
        {[[LayoutDashboard,'Overview'],[Users,'Students'],[ClipboardList,'Applications'],[Settings,'Settings']].map(([Icon,label]) => {
          const Glyph = Icon as typeof LayoutDashboard;
          return <div key={label as string} className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-400"><Glyph size={18}/>{label as string}<span className="ml-auto text-[10px]">Soon</span></div>;
        })}
      </aside>
      <section className="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-6 inline-flex rounded-2xl bg-amber-50 p-4 text-[#9a681b]"><LockKeyhole size={30}/></div>
        <h2 className="text-2xl font-bold sm:text-3xl">Secure staff access is being prepared</h2>
        <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600">This is the independent UPEC administration application. Student records, staff sign-in, approvals and operational data are not available until server-verified role-based authentication is implemented.</p>
        <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Frontend foundation only. No demo credentials or simulated administrator permissions are accepted.</p>
        <a href="/" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[#c62839]"><ArrowLeft size={16}/> Application root</a>
      </section>
    </div>
  </main>;
}
