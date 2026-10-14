import React, { useState } from 'react';
import { ShieldCheck, LockKeyhole, LayoutDashboard, Users, ClipboardList, Settings, Menu, X, Bell, ChevronRight } from 'lucide-react';

const modules = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Operations summary and pending work' },
  { id: 'students', label: 'Students', icon: Users, description: 'Candidate directory and student profiles' },
  { id: 'applications', label: 'Applications', icon: ClipboardList, description: 'Application reviews and decision queue' },
  { id: 'settings', label: 'Settings', icon: Settings, description: 'Staff access and institution configuration' },
] as const;
type ModuleId = typeof modules[number]['id'];

export default function AdminApp() {
  const [active, setActive] = useState<ModuleId>('overview');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const selected = modules.find(item => item.id === active)!;
  const Icon = selected.icon;
  return (
    <div className="min-h-screen bg-[#f6f8fc] text-[#08163b]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08163b] px-4 py-4 text-white sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" onClick={() => setDrawerOpen(!drawerOpen)} aria-label="Toggle admin navigation" aria-expanded={drawerOpen} className="rounded-xl border border-white/20 p-2 lg:hidden">{drawerOpen ? <X size={20}/> : <Menu size={20}/>}</button>
            <span className="rounded-xl bg-white/10 p-2.5 text-[#d5a75b]"><ShieldCheck size={23}/></span>
            <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d5a75b]">University Pathway</p><h1 className="truncate text-sm font-bold sm:text-lg">Administration Workspace</h1></div>
          </div>
          <span className="hidden rounded-full border border-amber-300/25 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-200 sm:inline-flex">Frontend preview · Access disabled</span>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-0 lg:gap-8">
        {drawerOpen && <button type="button" aria-label="Close navigation" onClick={() => setDrawerOpen(false)} className="fixed inset-0 z-30 bg-slate-950/60 lg:hidden"/>}
        <aside className={`${drawerOpen ? 'fixed inset-y-0 left-0 z-40 flex w-[min(85vw,320px)] shadow-2xl' : 'hidden'} flex-col border-r border-slate-200 bg-white p-4 lg:sticky lg:top-[73px] lg:flex lg:h-[calc(100vh-73px)] lg:w-64 lg:shrink-0 lg:border-r-0 lg:bg-transparent lg:pt-8`}>
          <div className="mb-5 flex items-center justify-between px-3 lg:hidden"><strong>Admin navigation</strong><button type="button" aria-label="Close menu" onClick={() => setDrawerOpen(false)} className="rounded-lg p-2"><X size={20}/></button></div>
          <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">Workspace</p>
          <nav aria-label="Admin modules" className="space-y-1">
            {modules.map(item => { const Glyph = item.icon; return <button key={item.id} type="button" onClick={() => {setActive(item.id);setDrawerOpen(false);}} aria-current={active===item.id ? 'page' : undefined} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-4 text-left text-sm font-semibold transition-colors ${active===item.id ? 'bg-[#08163b] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}><Glyph size={19}/><span className="flex-1">{item.label}</span><ChevronRight size={15} className="opacity-50"/></button>; })}
          </nav>
          <p className="mt-auto border-t border-slate-200 px-3 pt-5 text-xs leading-6 text-slate-500">Independent administration frontend. No student data is loaded in preview mode.</p>
        </aside>
        <main className="min-w-0 flex-1 px-4 py-7 sm:px-7 lg:py-10">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#c62839]">Operations / {selected.label}</p><h2 className="mt-2 text-2xl font-black sm:text-3xl">{selected.label}</h2><p className="mt-2 text-sm text-slate-500">{selected.description}</p></div>
            <span className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600">Preview only</span>
          </div>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <span className="inline-flex self-start rounded-2xl bg-amber-50 p-4 text-amber-800">{active === 'overview' ? <LockKeyhole size={28}/> : <Icon size={28}/>}</span>
              <div className="max-w-2xl"><h3 className="text-xl font-bold">{active === 'overview' ? 'Operations dashboard foundation' : `${selected.label} workspace`}</h3><p className="mt-3 text-sm leading-7 text-slate-600">This screen establishes the responsive administration layout and navigation. Real records, approval controls, reporting and staff permissions will only become available after secure backend authentication and role checks are implemented.</p></div>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Data source</p><p className="mt-2 font-semibold">Not connected</p><p className="mt-1 text-xs text-slate-500">No fabricated records or statistics</p></div>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Staff authorisation</p><p className="mt-2 font-semibold">Not enabled</p><p className="mt-1 text-xs text-slate-500">Server-side permissions required</p></div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
